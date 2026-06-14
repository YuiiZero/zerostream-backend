import { Nullable } from './type'

export interface PublicUser {
	username: string

	isVerified: boolean

	nickname?: string | Nullable
	bio?: string | Nullable
	avatar?: string | Nullable
}

export interface PrivateUser extends PublicUser {
	id: string
	email: string

	isEmailVerified: boolean
	isTotpEnabled: boolean

	createdAt: Date
}

export interface SessionUser {
	id: string
}
