import type { Request, Response } from 'express'
import session from 'express-session'

export type Nullable = null | undefined
export type BooleanString = 'true' | 'false'
export type ExpressSession = typeof session
export type Ctx = { req: Request; res: Response }

export enum HttpHeader {
	SET_COOKIE = 'set-cookie',
	USER_AGENT = 'user-agent'
}
