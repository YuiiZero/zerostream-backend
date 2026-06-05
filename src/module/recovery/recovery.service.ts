import {
	BadRequestException,
	Injectable,
	NotFoundException
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { hash } from 'argon2'
import { render } from 'react-email'

import { TokenType } from '../../../prisma/generated/prisma/enums'
import { MailService } from '../../core/module/mail/mail.service'
import { PasswordRecoveryTemplate } from '../../core/module/mail/template/password-recovery.template'
import { PrismaService } from '../../core/module/prisma/prisma.service'
import { SessionMetadata } from '../../shared/types/type'
import { generateToken } from '../../shared/util/generateToken.util'

export interface ResetPasswordOpts {
	email: string
	newPassword: string
	recoveryToken: string
}

@Injectable()
export class RecoveryService {
	constructor(
		private readonly prismaService: PrismaService,
		private readonly configService: ConfigService,
		private readonly mailService: MailService
	) {}

	async sendPasswordRecoveryLink(email: string, metadata: SessionMetadata) {
		const user = await this.prismaService.user.findFirst({ where: { email } })

		if (!user) {
			throw new NotFoundException('User not found')
		}

		const { token } = await generateToken({
			type: TokenType.PASSWORD_RESET,
			configService: this.configService,
			prismaService: this.prismaService,
			user: user
		})
		const domain = this.configService.getOrThrow('ALLOWED_ORIGIN')
		const html = await render(
			PasswordRecoveryTemplate({ domain, token, metadata })
		)

		this.mailService.sendEmail({
			to: email,
			subject: 'Password reset',
			html
		})

		return true
	}

	async resetPassword({
		email,
		newPassword: password,
		recoveryToken
	}: ResetPasswordOpts) {
		const user = await this.prismaService.user.findFirst({
			where: { email }
		})

		if (!user) throw new NotFoundException('Cannot reset password: wrong email')

		const foundToken = await this.prismaService.token.findFirst({
			where: { token: recoveryToken, type: TokenType.PASSWORD_RESET }
		})

		if (!foundToken)
			throw new NotFoundException('Cannot reset password: bad token')

		const isTokenExpired = Date.now() > foundToken.expires.getTime()

		if (isTokenExpired) {
			await this.prismaService.token.delete({ where: { id: foundToken.id } })
			throw new BadRequestException('Cannot reset password: token has expired')
		}

		password = await hash(password)

		await this.prismaService.user.update({
			where: { email },
			data: { password }
		})

		await this.prismaService.token.delete({ where: { id: foundToken.id } })

		return user
	}
}
