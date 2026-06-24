import { BadRequestException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

import { TokenType } from '../../../../prisma/generated/prisma/enums'
import { PrismaService } from '../../../core/module/prisma/prisma.service'
import { handleException } from '../../../shared/util/handleException.util'
import { MailService } from '../../mail/mail.service'
import { TokenService } from '../../service/token/token.service'
import { UserService } from '../../service/user/user.service'

import { VerifyEmailInput } from './input/verify-email.input'
import {
	SendVerifyEmailTokenInputInterface,
	VerifyServiceInterface
} from './interface/verify.interface'

@Injectable()
export class VerifyService implements VerifyServiceInterface {
	private readonly ALLOWED_ORIGIN: string

	public constructor(
		private readonly prismaService: PrismaService,
		private readonly tokenService: TokenService,
		private readonly userService: UserService,
		private readonly mailService: MailService,
		private readonly configService: ConfigService
	) {
		this.ALLOWED_ORIGIN = configService.getOrThrow('ALLOWED_ORIGIN')
	}

	public async sendVerifyEmailToken(
		input: SendVerifyEmailTokenInputInterface
	): Promise<void> {
		try {
			const { email } = input
			const user = await this.userService.getUnique('email', email)
			const { isEmailVerified } = user

			if (isEmailVerified)
				throw new BadRequestException('Email is already verified')

			const tokenObject =
				await this.tokenService.generateEmailVerificationToken(user)
			const { token } = tokenObject

			await this.mailService.sendEmailVerificationEmail({
				to: email,
				token,
				domain: this.ALLOWED_ORIGIN
			})
		} catch (error) {
			handleException(error, 'Cannot verify email')
		}
	}

	public async verifyEmail(input: VerifyEmailInput): Promise<void> {
		const { token } = input
		const tokenObject = await this.tokenService.verifyToken({
			token,
			tokenType: TokenType.VERIFY_EMAIL
		})

		const { userId: id } = tokenObject

		await this.prismaService.user.update({
			where: {
				id
			},
			data: {
				isEmailVerified: true
			}
		})
	}
}
