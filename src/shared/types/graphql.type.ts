import { Cookie } from 'express-session'

export interface CookieGql extends Cookie {
	secure?: boolean | undefined
	sameSite?: 'none' | 'lax' | 'strict' | undefined
}
