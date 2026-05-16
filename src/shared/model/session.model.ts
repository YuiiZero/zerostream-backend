import { Field, Int, ObjectType } from '@nestjs/graphql'

import { UserModel } from './user.model'

@ObjectType()
class CookieModel {
	@Field(() => Int)
	originalMaxAge!: number
	@Field()
	expires!: string
	@Field()
	secure!: boolean
	@Field()
	httpOnly!: boolean
	@Field()
	path!: string
	@Field(() => String)
	sameSite!: 'lax' | 'strict' | 'none'
}

@ObjectType()
export class SessionModel {
	@Field(() => CookieModel)
	cookie!: CookieModel
	@Field(() => UserModel)
	user!: UserModel
}

//TODO add session.metadata field
