import { Field, GraphQLISODateTime, ObjectType } from '@nestjs/graphql'

@ObjectType()
export class DeactivatedModel {
	@Field()
	isDeactivated!: boolean
	@Field(() => GraphQLISODateTime, { nullable: true })
	deactivatedAt!: Date | null
}
