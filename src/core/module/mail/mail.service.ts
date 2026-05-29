import { MailerService } from '@nestjs-modules/mailer'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

import { SendMailOptions } from '../../../shared/types/type'

@Injectable()
export class MailService {
	constructor(
		private readonly mailerService: MailerService,
		private readonly configService: ConfigService
	) {}

	sendEmail(options: SendMailOptions) {
		const { to, html, subject } = options

		this.mailerService.sendMail({
			from: this.configService.getOrThrow<string>('EMAIL_FROM'),
			to,
			subject,
			html
		})
	}
}
