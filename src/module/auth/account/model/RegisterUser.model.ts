import { Field, ObjectType } from '@nestjs/graphql'

@ObjectType()
export class RegisterMessageModel {
	@Field()
	message!: string
}
