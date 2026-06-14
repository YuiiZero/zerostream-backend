import { Field, ObjectType } from '@nestjs/graphql'

import { TokenType } from '../../../prisma/generated/prisma/enums'

@ObjectType()
export class TokenModel {
	@Field()
	id!: string

	@Field()
	token!: string
	@Field(() => String)
	type!: TokenType
	@Field(() => Date)
	expires!: Date

	@Field()
	userId!: string

	@Field(() => Date)
	createdAt!: Date
	@Field(() => Date)
	updatedAt!: Date
}
