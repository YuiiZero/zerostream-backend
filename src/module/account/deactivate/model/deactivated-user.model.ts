import { Field, GraphQLISODateTime, ObjectType } from '@nestjs/graphql'

import { DeactivatedUserModelInterface } from '../interface/deactivate.interface'

@ObjectType()
export class DeactivatedUserModel implements DeactivatedUserModelInterface {
	@Field(() => GraphQLISODateTime, { nullable: true })
	public deactivatedAt!: Date | null

	@Field()
	public isDeactivated!: boolean
}
