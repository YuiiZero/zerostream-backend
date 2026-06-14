import { Field, InputType } from '@nestjs/graphql'
import { IsUUID } from 'class-validator'

@InputType()
export class DeactivateAccountInput {
	@Field()
	@IsUUID('4')
	token!: string
}
