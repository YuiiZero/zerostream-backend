import { ConfigService } from '@nestjs/config'
import { CookieOptions, SessionOptions, Store } from 'express-session'

import { isDev as isDevEnv } from '../../shared/util/isDev.util'

export function getSessionConfig(
	configService: ConfigService,
	store: Store
): SessionOptions {
	const isDev = isDevEnv(configService)
	const cookieOpts: CookieOptions = {
		httpOnly: !isDev,
		secure: !isDev,
		maxAge: configService.getOrThrow<number>('SESSION_TTL_S'),
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
