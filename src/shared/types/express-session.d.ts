import 'express-session'
import { TOTP } from 'otpauth'

import { SessionMetadata } from './metadata.type'
import { SessionUser } from './user.type'

declare module 'express-session' {
	interface SessionData {
		sessID: string

		user: SessionUser
		metadata: SessionMetadata
		totp?: TOTP
	}
}
