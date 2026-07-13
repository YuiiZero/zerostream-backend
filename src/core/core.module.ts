import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo'
import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { GraphQLModule } from '@nestjs/graphql'
import { ScheduleModule } from '@nestjs/schedule'
import { LoggerModule } from 'nestjs-pino'

import { DeactivateAccountResolver } from '../module/account/deactivate/deactivate-account.resolver'
import { DeactivateAccountService } from '../module/account/deactivate/deactivate-account.service'
import { RecoveryResolver } from '../module/account/recovery/recovery.resolver'
import { RecoveryService } from '../module/account/recovery/recovery.service'
import { VerifyResolver } from '../module/account/verify/verify.resolver'
import { VerifyService } from '../module/account/verify/verify.service'
import { AccountResolver } from '../module/auth/account/account.resolver'
import { AccountService } from '../module/auth/account/account.service'
import { SessionResolver } from '../module/auth/session/session.resolver'
import { SessionService } from '../module/auth/session/session.service'
import { TotpResolver } from '../module/auth/totp/totp.resolver'
import { TotpService } from '../module/auth/totp/totp.service'
import { CronModule } from '../module/cron/cron.module'
import { CronService } from '../module/cron/cron.service'
import { CredentialsModule } from '../module/global/credentials/credentials.module'
import { CredentialsService } from '../module/global/credentials/credentials.service'
import { EncryptionModule } from '../module/global/encryption/encryption.module'
import { EncryptionService } from '../module/global/encryption/encryption.service'
import { TokenModule } from '../module/global/token/token.module'
import { TokenService } from '../module/global/token/token.service'
import { UserModule } from '../module/global/user/user.module'
import { UserService } from '../module/global/user/user.service'
import { MailModule } from '../module/mail/mail.module'
import { MailResolver } from '../module/mail/mail.resolver'

import { getGraphqlConf } from './conf/getGraphqlConf'
import { getPinoHttpConfig } from './conf/getPinoHttpConf'
import { PrismaModule } from './module/prisma/prisma.module'
import { RedisModule } from './module/redis/redis.module'
import { StorageModule } from './module/storage/storage.module';

@Module({
	imports: [
		PrismaModule,
		ConfigModule.forRoot({
			isGlobal: true,
			// ignoreEnvFile: !IS_DEV,
			envFilePath: '.env'
		}),
		RedisModule,
		GraphQLModule.forRootAsync<ApolloDriverConfig>({
			driver: ApolloDriver,
			imports: [ConfigModule],
			useFactory: getGraphqlConf,
			inject: [ConfigService]
		}),
		MailModule,
		TokenModule,
		UserModule,
		ScheduleModule.forRoot(),
		CronModule,
		CredentialsModule,
		EncryptionModule,
		LoggerModule.forRoot({
			pinoHttp: getPinoHttpConfig()
		}),
		StorageModule
	],
	providers: [
		AccountResolver,
		AccountService,
		SessionResolver,
		SessionService,
		VerifyService,
		VerifyResolver,
		MailResolver,
		RecoveryResolver,
		RecoveryService,
		TotpResolver,
		TotpService,
		DeactivateAccountResolver,
		DeactivateAccountService,
		TokenService,
		UserService,
		CronService,
		CredentialsService,
		EncryptionService
	]
})
export class CoreModule {}
