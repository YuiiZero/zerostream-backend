import 'express-session'

import { UserModel } from '../model/user.model'

declare module 'express-session' {
	interface SessionData {
		user: UserModel | null
	}
}
