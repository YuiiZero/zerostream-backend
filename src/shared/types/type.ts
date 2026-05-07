import type { Request, Response } from 'express'
import session from 'express-session'

export type BooleanString = 'true' | 'false'
export type ExpressSession = typeof session
export type Ctx = { req: Request; res: Response }
export enum HTTP_HEADERS {
	SET_COOKIE = 'Set-Cookie'
}
