import {
	BadRequestException,
	Injectable,
	InternalServerErrorException
} from '@nestjs/common'
import { randomBytes } from 'crypto'
import { encode } from 'hi-base32'
import { TOTP } from 'otpauth'
import * as QRCode from 'qrcode'

import { PrismaService } from '../../../core/module/prisma/prisma.service'
import { SessionUserModel, UserModel } from '../../../shared/model/user.model'

import { TOTPInput } from './input/totp.input'

@Injectable()
export class TotpService {
	constructor(private readonly prismaService: PrismaService) {}

	async enableTOTP(user: UserModel, input: TOTPInput) {
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

		if (!this._verifyTOTP(pincode, totpSecret, user))
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

	async disableTOTP(user: UserModel, input: TOTPInput) {
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

		if (!this._verifyTOTP(pincode, totpSecret, user))
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

	async generate(user: UserModel) {
		const { username } = user
		const secret = encode(randomBytes(15)).replace(/=/g, '').substring(0, 25)
		await this.prismaService.user.update({
			where: { id: user.id },
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

	private _verifyTOTP(
		pincode: string,
		totpSecret: string,
		user: SessionUserModel
	) {
		const totp = new TOTP({
			issuer: 'YuiiStream',
			secret: totpSecret,
			algorithm: 'SHA1',
			label: user.username,
			digits: 6
		})

		return totp.validate({ token: pincode }) !== null
	}
}
