import type { Request, Response } from 'express'
import session from 'express-session'

import { User as UserPrisma } from '../../../prisma/generated/prisma/client'

export type BooleanString = 'true' | 'false'
export type ExpressSession = typeof session
export type Ctx = { req: Request; res: Response }
export enum HTTP_HEADERS {
	SET_COOKIE = 'Set-Cookie'
}
export type User = Omit<UserPrisma, 'createdAt' | 'updatedAt' | 'id'>
