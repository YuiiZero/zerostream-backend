import { ConfigService } from '@nestjs/config'
import { CookieOptions, SessionOptions, Store } from 'express-session'
import ms, { StringValue } from 'ms'

import { isDev as isDevEnv } from '../../shared/util/isDev.util'

export function getSessionConfig(
	configService: ConfigService,
	store: Store
): SessionOptions {
	const isDev = isDevEnv(configService)
	const cookieOpts: CookieOptions = {
		httpOnly: isDev,
		secure: !isDev,
		maxAge: ms(configService.getOrThrow<StringValue>('SESSION_TTL')),
		sameSite: 'lax'
	}

	return {
		secret: isDev
			? 'sampleSecret'
			: configService.getOrThrow<string>('SESSION_SECRET'),
		saveUninitialized: false,
		resave: false,
		name: configService.getOrThrow<string>('SESSION_NAME'),
		cookie: cookieOpts,
		store
	}
}
