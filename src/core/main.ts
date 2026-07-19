import { ValidationPipe } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { NestFactory } from '@nestjs/core'
import cookieParser from 'cookie-parser'
import session from 'express-session'
import { graphqlUploadExpress } from 'graphql-upload-ts'
import { Logger } from 'nestjs-pino'

import { getCorsConfig } from './conf/getCorsConf'
import { getSessionConfig } from './conf/getSessionConfig'
import { CoreModule } from './core.module'
import { RedisService } from './module/redis/redis.service'

async function bootstrap() {
	const app = await NestFactory.create(CoreModule)
	const config = app.get(ConfigService)
	const redis = app.get(RedisService)
	const logger = app.get(Logger)
	const port = config.getOrThrow<number>('APPLICATION_PORT')

	app.use('/graphql', graphqlUploadExpress({ maxFileSize: 3_000_000 }))
	app.use(
		cookieParser(config.getOrThrow<string>('SESSION_SECRET')),
		session(getSessionConfig(config, redis.store))
	)

	app.useGlobalPipes(new ValidationPipe())
	app.useLogger(logger)

	app.enableCors(getCorsConfig(config))
	await app.listen(port, () => {
		logger.log(`App is listening on port ${port}`)
	})
}
bootstrap()
