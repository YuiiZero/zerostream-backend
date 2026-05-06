import { ConfigService } from '@nestjs/config'

export function isDev(configService: ConfigService) {
	const environment = configService.getOrThrow<'production' | 'development'>(
		'NODE_ENV'
	)
	return environment === 'development'
}

export const IS_DEV = process.env['NODE_ENV'] === 'development'
