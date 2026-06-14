import { Field, ObjectType } from '@nestjs/graphql'

@ObjectType()
export class MessageModel {
	@Field()
	message!: string
}
