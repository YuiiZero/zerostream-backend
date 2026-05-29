import 'express-session'

import { SessionUserModel } from '../model/user.model'

declare module 'express-session' {
	interface SessionData {
		user: SessionUserModel
		metadata: SessionMetadata
	}
}
