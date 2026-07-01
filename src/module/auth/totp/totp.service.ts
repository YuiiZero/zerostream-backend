import {
	BadRequestException,
	ConflictException,
	Injectable,
	NotFoundException,
	UnauthorizedException
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { hash, verify } from 'argon2'
import { randomBytes } from 'crypto'
import { encode } from 'hi-base32'
import { TOTP } from 'otpauth'
import * as QRCode from 'qrcode'

import { User } from '../../../../prisma/generated/prisma/client'
import { PrismaService } from '../../../core/module/prisma/prisma.service'
import { handleException } from '../../../shared/util/handleException.util'
import { EncryptionService } from '../../global/encryption/encryption.service'

import { RemoveTotpInput } from './input/totp.input'
import { GeneratedTotp, TotpServiceInterface } from './interface/totp.interface'

@Injectable()
export class TotpService implements TotpServiceInterface {
	private readonly TOTP_PINCODE_LENGTH: number
	private readonly RECOVERY_CODE_COUNT: number

	public constructor(
		private readonly prismaService: PrismaService,
		private readonly configService: ConfigService,
		private readonly encryptionService: EncryptionService
	) {
		this.TOTP_PINCODE_LENGTH = +configService.getOrThrow('TOTP_PINCODE_LENGTH')
		this.RECOVERY_CODE_COUNT = +configService.getOrThrow('RECOVERY_CODE_COUNT')
	}

	public async generateTotp(userId: string): Promise<GeneratedTotp> {
		try {
			const user = await this._getUserByIdOrThrow(userId)
			const { isTotpEnabled } = user

			if (isTotpEnabled)
				throw new BadRequestException('TOTP is already enabled')

			const secret = encode(randomBytes(20))
			const encryptedSecret = this.encryptionService.encrypt(secret)

			await this.prismaService.user.update({
				where: { id: userId },
				data: {
					totpPendingSecret: encryptedSecret,
					totpSecret: null
				}
			})

			const totpKey = this._createTotp(secret, user.username).toString()
			const qrCodeUrl = await QRCode.toDataURL(totpKey)

			return {
				secret,
				qrCodeUrl
			}
		} catch (error) {
			handleException(error, 'Cannot generate TOTP')
		}
	}

	public async verifyTotp(userId: string, pincode: string): Promise<void>
	public async verifyTotp(user: User, pincode: string): Promise<void>
	public async verifyTotp(
		userIdOrUser: string | User,
		pincode: string
	): Promise<void> {
		const user =
			typeof userIdOrUser === 'string'
				? await this._getUserByIdOrThrow(userIdOrUser)
				: userIdOrUser
		const { totpSecret, totpPendingSecret, isTotpEnabled } = user
		const secret = totpSecret
			? this.encryptionService.decrypt(totpSecret)
			: totpPendingSecret
				? this.encryptionService.decrypt(totpPendingSecret)
				: null

		if (secret === null && !isTotpEnabled)
			throw new NotFoundException('TOTP is disabled')
		if (secret === null) throw new NotFoundException('TOTP secret not found')

		const totp = this._createTotp(secret)
		const delta = totp.validate({ token: pincode })

		if (delta === null) throw new BadRequestException('Wrong pincode')
	}

	public async addTotp(userId: string, pincode: string): Promise<string[]> {
		try {
			const user = await this._getUserByIdOrThrow(userId)

			if (user.isTotpEnabled)
				throw new ConflictException('TOTP is already in use')

			await this.verifyTotp(user, pincode)

			const { recoveryCodes } = user
			const isRecoveryCodesExist = !!recoveryCodes.length

			let newRecoveryCodes: string[] | null = null
			let newRecoveryCodesHashed: string[] | null = null

			if (!isRecoveryCodesExist) {
				newRecoveryCodes = this._generateRecoveryCodes()
				newRecoveryCodesHashed = await Promise.all(
					newRecoveryCodes.map(code => hash(code))
				)
			}

			await this.prismaService.user.update({
				where: { id: user.id },
				data: {
					isTotpEnabled: true,
					totpSecret: user.totpPendingSecret,
					totpPendingSecret: null,
					recoveryCodes: newRecoveryCodesHashed ?? recoveryCodes
				}
			})

			return newRecoveryCodes ?? []
		} catch (error) {
			handleException(error, 'Cannot add TOTP')
		}
	}

	public async removeTotp(
		userId: string,
		input: RemoveTotpInput
	): Promise<void> {
		try {
			const { pincode, recoveryCode } = input
			const user = await this._getUserByIdOrThrow(userId)
			const { isTotpEnabled, totpSecret, recoveryCodes } = user
			let filtered: string[] | null = null

			if (isTotpEnabled === false && totpSecret === null)
				throw new BadRequestException('TOTP is already disabled')
			if (!totpSecret) throw new NotFoundException('TOTP secret not found')

			if (pincode) await this.verifyTotp(user, pincode)
			else if (recoveryCode) {
				const correspondingCodeHashed =
					await this._getCorrespondingRecoveryCode(recoveryCode, recoveryCodes)

				if (correspondingCodeHashed === null)
					throw new UnauthorizedException('Wrong recovery code')

				filtered = recoveryCodes.filter(
					code => code !== correspondingCodeHashed
				)
			} else throw new BadRequestException('Provide pincode or secret')

			await this.prismaService.user.update({
				where: { id: user.id },
				data: {
					isTotpEnabled: false,
					totpSecret: null,
					recoveryCodes: filtered ?? recoveryCodes
				}
			})
		} catch (error) {
			handleException(error, 'Cannot remove TOTP')
		}
	}

	public async generateRecoveryCodes(
		userId: string,
		pincode: string
	): Promise<string[]> {
		const user = await this._getUserByIdOrThrow(userId)

		await this.verifyTotp(user, pincode)

		const { id } = user
		const newCodes = this._generateRecoveryCodes()
		const newCodesHashed = await Promise.all(newCodes.map(code => hash(code)))

		await this.prismaService.user.update({
			where: { id },
			data: { recoveryCodes: newCodesHashed }
		})

		return newCodes
	}
	private async _getCorrespondingRecoveryCode(
		recoveryCode: string,
		userRecoveryCodes: string[]
	): Promise<string | null> {
		for (const code of userRecoveryCodes) {
			if (await verify(code, recoveryCode)) {
				return code
			}
		}

		return null
	}

	private async _getUserByIdOrThrow(userId: string) {
		const user = await this.prismaService.user.findUnique({
			where: { id: userId }
		})

		if (!user) throw new NotFoundException('User not found')

		return user
	}

	private _createTotp(secret: string, username?: string) {
		const totp = new TOTP({
			algorithm: 'SHA-1',
			digits: this.TOTP_PINCODE_LENGTH,
			issuer: 'YuiiStream',
			secret
		})

		if (username) totp.label = username

		return totp
	}

	private _generateRecoveryCodes() {
		return Array.from({ length: this.RECOVERY_CODE_COUNT }, () =>
			[
				randomBytes(4).toString('hex').toUpperCase(),
				randomBytes(4).toString('hex').toUpperCase()
			].join('-')
		)
	}
}
