import { Request } from 'express'
import { SessionData } from 'express-session'

import { Ctx } from '../../../../shared/types/type'

export interface SessionServiceInterface {
	createSession(userId: string, req: Request): Promise<string>

	getSessions(userId: string): Promise<SessionData[]>

	deleteSession(sessionId: string, context?: Ctx): Promise<void>
	deleteAllSessions(userId: string, currentSessionId?: string): Promise<void>
}
