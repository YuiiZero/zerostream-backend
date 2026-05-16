import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo'
import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { GraphQLModule } from '@nestjs/graphql'

import { AccountResolver } from '../module/auth/account/account.resolver'
import { AccountService } from '../module/auth/account/account.service'
import { SessionResolver } from '../module/auth/session/session.resolver'
import { SessionService } from '../module/auth/session/session.service'
import { TimeConverter } from '../shared/util/TimeConverter.util'

import { getGraphqlConf } from './conf/getGraphqlConf'
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
		})
	],
	providers: [
		AccountResolver,
		AccountService,
		TimeConverter,
		SessionResolver,
		SessionService
	]
})
export class CoreModule {}
