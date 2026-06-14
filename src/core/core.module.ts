import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo'
import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { GraphQLModule } from '@nestjs/graphql'

import { AccountResolver } from '../module/auth/account/account.resolver'
import { AccountService } from '../module/auth/account/account.service'
import { SessionResolver } from '../module/auth/session/session.resolver'
import { SessionService } from '../module/auth/session/session.service'
import { TotpResolver } from '../module/auth/totp/totp.resolver'
import { TotpService } from '../module/auth/totp/totp.service'
import { DeactivateResolver } from '../module/deactivate/deactivate.resolver'
import { DeactivateService } from '../module/deactivate/deactivate.service'
import { RecoveryResolver } from '../module/recovery/recovery.resolver'
import { RecoveryService } from '../module/recovery/recovery.service'
import { TokenModule } from '../module/service/token/token.module'
import { TokenService } from '../module/service/token/token.service'
import { UserModule } from '../module/service/user/user.module'
import { UserService } from '../module/service/user/user.service'
import { VerifyResolver } from '../module/verify/verify.resolver'
import { VerifyService } from '../module/verify/verify.service'
import { TimeConverter } from '../shared/util/TimeConverter.util'

import { getGraphqlConf } from './conf/getGraphqlConf'
import { MailModule } from './module/mail/mail.module'
import { MailResolver } from './module/mail/mail.resolver'
import { PrismaModule } from './module/prisma/prisma.module'
import { RedisModule } from './module/redis/redis.module'

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
		UserModule
	],
	providers: [
		AccountResolver,
		AccountService,
		TimeConverter,
		SessionResolver,
		SessionService,
		VerifyService,
		VerifyResolver,
		MailResolver,
		RecoveryResolver,
		RecoveryService,
		TotpResolver,
		TotpService,
		DeactivateResolver,
		DeactivateService,
		TokenService,
		UserService
	]
})
export class CoreModule {}
