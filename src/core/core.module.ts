import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo'
import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { GraphQLModule } from '@nestjs/graphql'

import { AccountResolver } from '../module/auth/account/account.resolver'
import { AccountService } from '../module/auth/account/account.service'
import { AuthController } from '../module/auth/auth.controller'
import { SessionResolver } from '../module/auth/session/session.resolver'
import { SessionService } from '../module/auth/session/session.service'
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
		MailModule
	],
	providers: [
		AccountResolver,
		AccountService,
		TimeConverter,
		SessionResolver,
		SessionService,
		VerifyService,
		MailResolver
	],
	controllers: [AuthController]
})
export class CoreModule {}
