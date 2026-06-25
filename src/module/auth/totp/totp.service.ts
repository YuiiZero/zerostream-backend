import {
	BadRequestException,
	Injectable,
	InternalServerErrorException,
	NotFoundException,
	UnauthorizedException
} from '@nestjs/common'
import { randomBytes } from 'crypto'
import { encode } from 'hi-base32'
import { TOTP } from 'otpauth'
import * as QRCode from 'qrcode'

import { PrismaService } from '../../../core/module/prisma/prisma.service'
import { GenerateTOTPModel } from '../../../shared/model/generate-totp.model'

import { TOTPInput } from './input/totp.input'

@Injectable()
export class TotpService {
	constructor(private readonly prismaService: PrismaService) {}

	async enableTOTP(userId: string, input: TOTPInput) {
		const user = await this._getUserById(userId)

		if (user.isTotpEnabled)
			throw new BadRequestException('TOTP is already in use')

		const { pincode } = input
		const { totpSecret } = (await this.prismaService.user.findFirst({
			where: { id: user.id }
		}))!

		if (totpSecret === null)
			throw new InternalServerErrorException(
				'Cannot enable TOTP: secret is null'
			)

		if (!this.verifyTOTP(pincode, totpSecret))
			throw new BadRequestException('Cannot enable TOTP: wrong pincode')

		await this.prismaService.user.update({
			where: {
				id: user.id
			},
			data: {
				isTotpEnabled: true
			}
		})
	}

	async disableTOTP(userId: string, input: TOTPInput) {
		const user = await this._getUserById(userId)

		if (!user.isTotpEnabled)
			throw new BadRequestException('TOTP is already disabled')

		const { pincode } = input
		const { totpSecret } = (await this.prismaService.user.findFirst({
			where: { id: user.id }
		}))!

		if (totpSecret === null)
			throw new InternalServerErrorException(
				'Cannot disable TOTP: secret is null'
			)

		if (!this.verifyTOTP(pincode, totpSecret))
			throw new BadRequestException('Cannot disable TOTP: wrong pincode')

		await this.prismaService.user.update({
			where: {
				id: user.id
			},
			data: {
				isTotpEnabled: false,
				totpSecret: null
			}
		})
	}

	async generate(userId: string): Promise<GenerateTOTPModel> {
		const user = await this._getUserById(userId)
		const { username } = user
		const secret = encode(randomBytes(15)).replace(/=/g, '').substring(0, 25)

		await this.prismaService.user.update({
			where: { username },
			data: { totpSecret: secret }
		})

		const totp = new TOTP({
			issuer: 'YuiiStream',
			secret,
			algorithm: 'SHA1',
			label: username,
			digits: 6
		})

		const otpAuthUrl = totp.toString()
		const qrCodeUrl = await QRCode.toDataURL(otpAuthUrl)

		return { qrCodeUrl, secret }
	}

	public verifyTOTP(
		pincode: string | undefined,
		totpSecret: string | null
	): boolean {
		if (!totpSecret)
			throw new InternalServerErrorException('TOTP secret is null')
		if (!pincode) throw new UnauthorizedException('Pincode not provided')

		const totp = new TOTP({
			secret: totpSecret,
			algorithm: 'SHA1'
		})
		const delta = totp.validate({ token: pincode })

		return delta !== null
	}

	private async _getUserById(userId: string) {
		const user = await this.prismaService.user.findUnique({
			where: { id: userId }
		})

		if (!user) {
			throw new NotFoundException('User not found')
		}
		return user
	}
}
