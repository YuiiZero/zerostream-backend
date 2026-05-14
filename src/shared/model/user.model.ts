import { Field, GraphQLISODateTime, ObjectType } from '@nestjs/graphql'

@ObjectType()
export class UserModel {
	@Field()
	id!: string

	@Field(() => GraphQLISODateTime)
	createdAt!: Date

	@Field(() => GraphQLISODateTime)
	updatedAt!: Date

	@Field()
	email!: string

	@Field()
	username!: string

	@Field(() => String, { nullable: true })
	nickname!: string | null

	@Field(() => String, { nullable: true })
	bio!: string | null

	@Field(() => String, { nullable: true })
	avatar!: string | null
}
