import { ConfigService } from '@nestjs/config'
import { CookieOptions, SessionOptions, Store } from 'express-session'
import ms, { StringValue } from 'ms'

import { isDev } from '../../shared/util/isDev.util'

export function getSessionConfig(
	configService: ConfigService,
	store: Store
): SessionOptions {
	const IS_DEV = isDev()
	const cookieOpts: CookieOptions = {
		httpOnly: IS_DEV,
		secure: !IS_DEV,
		maxAge: ms(configService.getOrThrow<StringValue>('SESSION_TTL')),
		sameSite: 'lax'
	}

	return {
		secret: IS_DEV
			? 'sampleSecret'
			: configService.getOrThrow<string>('SESSION_SECRET'),
		saveUninitialized: false,
		resave: false,
		name: configService.getOrThrow<string>('SESSION_NAME'),
		cookie: cookieOpts,
		store
	}
}
