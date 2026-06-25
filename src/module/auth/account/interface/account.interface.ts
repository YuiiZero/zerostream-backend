import { User } from '../../../../../prisma/generated/prisma/client'
import { PrivateUserModel } from '../../../../shared/model/user.model'

export interface AccountServiceInterface {
	getLoginUser(input: LoginInputInterface): Promise<User>

	register(
		input: RegisterInputInterface
	): Promise<RegisterMessageModelInterface>

	me(userId: string): Promise<PrivateUserModel>
}

export interface LoginInputInterface {
	username?: string
	email?: string

	password: string
	pincode?: string
}

export interface RegisterInputInterface {
	email: string
	username: string
	password: string

	bio?: string
	avatar?: string
	nickname?: string
}

export interface RegisterMessageModelInterface {
	message: string
}
