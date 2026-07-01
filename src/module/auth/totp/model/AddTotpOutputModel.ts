import { Field, ObjectType } from '@nestjs/graphql'

@ObjectType()
export class AddTotpOutputModel {
	@Field()
	isTotpEnabled!: boolean

	@Field(() => [String], { nullable: true })
	recoveryCodes?: string[]
}
