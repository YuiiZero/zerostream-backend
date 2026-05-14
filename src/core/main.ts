import { ValidationPipe } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { NestFactory } from '@nestjs/core'
import cookieParser from 'cookie-parser'
import session from 'express-session'

import { TimeConverter } from '../shared/util/TimeConverter.util'

import { getCorsConfig } from './conf/getCorsConf'
import { getSessionConfig } from './conf/getSessionConfig'
import { CoreModule } from './core.module'
import { RedisService } from './module/redis/redis.service'

async function bootstrap() {
	const app = await NestFactory.create(CoreModule)
	const config = app.get(ConfigService)
	const redis = app.get(RedisService)
	const timeConverter = app.get(TimeConverter)

	app.use(
		cookieParser(config.getOrThrow<string>('SESSION_SECRET')),
		session(getSessionConfig(config, timeConverter, redis.getStore()))
	)

	app.useGlobalPipes(new ValidationPipe())

	app.enableCors(getCorsConfig(config))

	await app.listen(config.getOrThrow<number>('APPLICATION_PORT'))
}
bootstrap()
