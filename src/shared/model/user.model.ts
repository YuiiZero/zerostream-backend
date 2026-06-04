import { Field, GraphQLISODateTime, ObjectType } from '@nestjs/graphql'

import { Nullable } from '../types/type'

@ObjectType()
export class SessionUserModel {
	@Field()
	id!: string

	@Field(() => GraphQLISODateTime)
	createdAt!: Date

	@Field(() => GraphQLISODateTime)
	updatedAt!: Date

	@Field()
	username!: string

	@Field(() => String, { nullable: true })
	nickname?: string | Nullable

	@Field(() => String, { nullable: true })
	bio?: string | Nullable

	@Field(() => String, { nullable: true })
	avatar?: string | Nullable

	@Field()
	isVerified!: boolean

	@Field()
	isEmailVerified!: boolean

	@Field()
	isTotpEnabled!: boolean
}

@ObjectType()
export class UserModel extends SessionUserModel {
	@Field()
	email!: string

	@Field(() => [String])
	sessionIDs!: string[]

	@Field(() => String, { nullable: true })
	totpSecret?: string | Nullable
}
