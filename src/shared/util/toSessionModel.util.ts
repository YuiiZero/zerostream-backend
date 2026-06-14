import { SessionData } from 'express-session'

import { SessionModel } from '../model/session.model'

export function toSessionModel(sessionData: SessionData): SessionModel {
	const secureFlag = sessionData.cookie.secure === 'auto'
	const sameSiteFlag =
		typeof sessionData.cookie.sameSite === 'boolean'
			? sessionData.cookie.sameSite
				? 'lax'
				: 'none'
			: sessionData.cookie.sameSite

	return {
		...sessionData,
		cookie: {
			...sessionData.cookie,
			secure: secureFlag,
			sameSite: sameSiteFlag
		}
	}
}
