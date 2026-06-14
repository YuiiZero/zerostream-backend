import { MailerService } from '@nestjs-modules/mailer'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { StringValue } from 'ms'
import { render } from 'react-email'

import { SessionMetadata } from '../../../shared/types/metadata.type'

import { DeactivationTemplate } from './template/deactivation.template'
import { PasswordRecoveryTemplate } from './template/password-recovery.template'
import { VerificationTemplate } from './template/verification.template'

@Injectable()
export class MailService {
	constructor(
		private readonly mailerService: MailerService,
		private readonly configService: ConfigService
	) {}

	async sendAccountDeactivationEmail(options: SendDeactivationEmailOptions) {
		const subject = 'Account deactivation'
		const { token, metadata, pincodeTTL, to } = options
		const html = await render(
			DeactivationTemplate({ token, metadata, pincodeTTL })
		)

		this._sendEmail({ html, subject, to })
	}

	async sendEmailVerificationEmail(options: SendVerificationEmailOptions) {
		const subject = 'Email verification'
		const { token, to, domain } = options
		const html = await render(VerificationTemplate({ token, domain }))

		this._sendEmail({ html, subject, to })
	}

	async sendPasswordRecoveryEmail(options: SendPasswordRecoveryOptions) {
		const subject = 'Password verification'
		const { token, metadata, domain, to } = options
		const html = await render(
			PasswordRecoveryTemplate({ token, metadata, domain })
		)

		this._sendEmail({ html, subject, to })
	}

	private _sendEmail(options: SendEmailOptions) {
		const { to, html, subject } = options

		this.mailerService.sendMail({
			from: this.configService.getOrThrow<string>('EMAIL_FROM'),
			to,
			subject,
			html
		})
	}
}

interface EmailHeader {
	to: string
}

interface SendEmailOptions extends EmailHeader {
	html: string
	subject: string
}

interface EmailTokenHeader extends EmailHeader {
	token: string
}
interface SendDeactivationEmailOptions extends EmailTokenHeader {
	metadata: SessionMetadata
	pincodeTTL: StringValue
}

interface SendVerificationEmailOptions extends EmailTokenHeader {
	domain: string
}

interface SendPasswordRecoveryOptions extends EmailTokenHeader {
	metadata: SessionMetadata
	domain: string
}
