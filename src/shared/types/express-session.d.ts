import 'express-session'
import { TOTP } from 'otpauth'

import { SessionUserModel } from '../model/user.model'

declare module 'express-session' {
	interface SessionData {
		user: SessionUserModel
		metadata: SessionMetadata
		totp?: TOTP
	}
}
