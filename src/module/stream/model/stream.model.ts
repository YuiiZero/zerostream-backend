import { Field, GraphQLISODateTime, ObjectType } from '@nestjs/graphql'

import { Stream } from '../../../../prisma/generated/prisma/client'
import { PublicUserModel } from '../../../shared/model/user.model'

@ObjectType()
export class StreamModel implements Stream {
	@Field()
	public id!: string

	@Field()
	public title!: string
	@Field(() => String, { nullable: true })
	public thumbnailUrl!: string | null

	@Field()
	public isLive!: boolean

	@Field(() => String, { nullable: true })
	public ingressId!: string | null
	@Field(() => String, { nullable: true })
	public serverUrl!: string | null
	@Field(() => String, { nullable: true })
	public streamKey!: string | null

	@Field()
	public userId!: string
	@Field(() => PublicUserModel)
	public user!: PublicUserModel

	@Field(() => GraphQLISODateTime)
	public createdAt!: Date
	@Field(() => GraphQLISODateTime)
	public updatedAt!: Date
}
