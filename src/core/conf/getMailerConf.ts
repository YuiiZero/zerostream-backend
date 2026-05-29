import { MailerOptions } from '@nestjs-modules/mailer'
import { ConfigService } from '@nestjs/config'

export function getMailerConf(configService: ConfigService): MailerOptions {
	return {
		transport: {
			host: configService.getOrThrow('MAIL_HOST'),
			port: configService.getOrThrow('MAIL_PORT'),
			secure: false,
			auth: {
				user: configService.getOrThrow('MAIL_LOGIN'),
				pass: configService.getOrThrow('MAIL_PASSWORD')
			}
		},
		defaults: {
			from: configService.getOrThrow<string>('EMAIL_FROM')
		}
	}
}
