import { Field, GraphQLISODateTime, ObjectType } from '@nestjs/graphql'

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
	nickname!: string | null

	@Field(() => String, { nullable: true })
	bio!: string | null

	@Field(() => String, { nullable: true })
	avatar!: string | null
}

@ObjectType()
export class UserModel extends SessionUserModel {
	@Field()
	email!: string

	@Field(() => [String])
	sessionIDs!: string[]
}
