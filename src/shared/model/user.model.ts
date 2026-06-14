import { Field, GraphQLISODateTime, ObjectType } from '@nestjs/graphql'

import { Nullable } from '../types/type'

@ObjectType()
export class PublicUserModel {
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
}

@ObjectType()
export class PrivateUserModel extends PublicUserModel {
	@Field()
	id!: string

	@Field(() => GraphQLISODateTime)
	createdAt!: Date

	@Field()
	isEmailVerified!: boolean

	@Field()
	isTotpEnabled!: boolean

	@Field()
	email!: string
}

@ObjectType()
export class SessionUserModel {
	@Field()
	id!: string
}
