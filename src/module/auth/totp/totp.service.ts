import { BadRequestException, Injectable } from '@nestjs/common'
import { randomBytes } from 'crypto'
import { encode } from 'hi-base32'
import { TOTP } from 'otpauth'
import * as QRCode from 'qrcode'

import { PrismaService } from '../../../core/module/prisma/prisma.service'
import { UserModel } from '../../../shared/model/user.model'

import { TOTPInput } from './input/totp.input'

@Injectable()
export class TotpService {
	constructor(private readonly prismaService: PrismaService) {}

	async enableTOTP(user: UserModel, input: TOTPInput) {
		if (user.isTotpEnabled)
			throw new BadRequestException('TOTP is already in use')

		if (!this._verifyTOTP(input, user.username))
			throw new BadRequestException('Cannot enable TOTP: wrong pincode')

		await this.prismaService.user.update({
			where: {
				id: user.id
			},
			data: {
				isTotpEnabled: true,
				totpSecret: input.secret
			}
		})
	}

	async disableTOTP(user: UserModel, input: TOTPInput) {
		if (!user.isTotpEnabled)
			throw new BadRequestException('TOTP is already disabled')

		if (!this._verifyTOTP(input, user.username))
			throw new BadRequestException('Cannot enable TOTP: wrong pincode')

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

	private _verifyTOTP(totpInput: TOTPInput, username: string) {
		const { pincode, secret } = totpInput
		const totp = new TOTP({
			issuer: 'YuiiStream',
			secret,
			algorithm: 'SHA1',
			label: username,
			digits: 6
		})

		const delta = totp.validate({ token: pincode })
		return delta !== null
	}
}
