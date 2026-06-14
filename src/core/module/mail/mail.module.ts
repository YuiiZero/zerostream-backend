import { MailerModule } from '@nestjs-modules/mailer'
import { Global, Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'

import { TokenModule } from '../../../module/service/token/token.module'
import { TokenService } from '../../../module/service/token/token.service'
import { getMailerConf } from '../../conf/getMailerConf'

import { MailResolver } from './mail.resolver'
import { MailService } from './mail.service'

@Global()
@Module({
	imports: [
		MailerModule.forRootAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: getMailerConf
		}),
		TokenModule
	],
	providers: [MailService, MailResolver, TokenService],
	exports: [MailService, MailResolver]
})
export class MailModule {}
