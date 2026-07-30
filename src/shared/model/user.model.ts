import { Field, GraphQLISODateTime, ObjectType } from '@nestjs/graphql'

import { StreamModel } from '../../module/stream/model/stream.model'

@ObjectType()
export class PublicUserModel {
	@Field()
	username!: string

	@Field(() => String, { nullable: true })
	public nickname?: string

	@Field(() => String, { nullable: true })
	public bio?: string

	@Field(() => String, { nullable: true })
	public avatar?: string

	@Field()
	public isVerified!: boolean

	@Field(() => StreamModel, { nullable: true })
	public stream?: StreamModel

	@Field(() => [String])
	public socialLinks!: string[]
}

@ObjectType()
export class PrivateUserModel extends PublicUserModel {
	@Field()
	public id!: string

	@Field(() => GraphQLISODateTime)
	public createdAt!: Date

	@Field()
	public isEmailVerified!: boolean

	@Field()
	public isTotpEnabled!: boolean

	@Field()
	public email!: string
}

@ObjectType()
export class SessionUserModel {
	@Field()
	public id!: string
}
