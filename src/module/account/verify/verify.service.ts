import { BadRequestException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino'

import { TokenType } from '../../../../prisma/generated/prisma/enums'
import { PrismaService } from '../../../core/module/prisma/prisma.service'
import { handleException } from '../../../shared/util/handleException.util'
import { TokenService } from '../../global/token/token.service'
import { UserService } from '../../global/user/user.service'
import { MailService } from '../../mail/mail.service'

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
		private readonly configService: ConfigService,
		@InjectPinoLogger(VerifyService.name)
		private readonly logger: PinoLogger
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

			const { token } =
				await this.tokenService.generateEmailVerificationToken(user)

			await this.mailService.sendEmailVerificationEmail({
				to: email,
				token,
				domain: this.ALLOWED_ORIGIN
			})

			this.logger.info({ email: user.email }, 'Email verify token sent')
		} catch (error) {
			handleException(this.logger, error, 'Sending verify email token failed')
		}
	}

	public async verifyEmail(input: VerifyEmailInput): Promise<void> {
		try {
			const { token } = input
			const tokenObject = await this.tokenService.verifyUUIDToken(
				token,
				TokenType.VERIFY_EMAIL
			)
			const { userId: id } = tokenObject

			const updated = await this.prismaService.user.update({
				where: {
					id
				},
				data: {
					isEmailVerified: true
				}
			})

			this.logger.info(
				{
					userId: updated.id,
					email: updated.email,
					isEmailVerified: updated.isEmailVerified
				},
				'Email verified'
			)
		} catch (error) {
			handleException(this.logger, error, 'Email verification failed')
		}
	}
}
