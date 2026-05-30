import {
	BadRequestException,
	Injectable,
	NotFoundException
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

import { TokenType } from '../../../prisma/generated/prisma/enums'
import { MailService } from '../../core/module/mail/mail.service'
import { PrismaService } from '../../core/module/prisma/prisma.service'
import { generateToken } from '../../shared/util/generateToken.util'

@Injectable()
export class VerifyService {
	private tokenTTL

	constructor(
		private readonly prismaService: PrismaService,
		private readonly mailService: MailService,
		private readonly configService: ConfigService
	) {
		this.tokenTTL = +configService.getOrThrow('VERIFICATION_TOKEN_TTL')
	}

	async verifyEmail(token: string) {
		const foundToken = await this.prismaService.token.findFirst({
			where: {
				token,
				type: TokenType.EMAIL_VERIFY
			}
		})

		if (!foundToken) {
			throw new NotFoundException('Could not verify email: bad token')
		}

		const isTokenExpired = Date.now() > foundToken.expires.getTime()

		if (isTokenExpired) {
			throw new BadRequestException('Could not verify email: token has expired')
		}

		const { userId: id } = foundToken

		const user = await this.prismaService.user.update({
			where: {
				id
			},
			data: {
				isEmailVerified: true
			}
		})

		await this.prismaService.token.delete({
			where: {
				token
			}
		})

		return user
	}

	async sendEmailVerificationLink(email: string) {
		const user = await this.prismaService.user.findFirst({ where: { email } })

		if (!user) {
			throw new NotFoundException('User not found')
		}

		const token = await generateToken({
			type: TokenType.EMAIL_VERIFY,
			configService: this.configService,
			prismaService: this.prismaService,
			isUUID: true,
			user: user
		})
		const verificationUrl = `${this.configService.getOrThrow<string>('APPLICATION_URL')}/auth/verify-email?token=${token}`

		this.mailService.sendEmail({
			to: email,
			subject: 'Verify your email',
			html: `<div><a href=${verificationUrl}>Follow this link to verify your email address</a></div>`
		})

		return true
	}
}
