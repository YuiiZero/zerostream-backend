import { Field, InputType } from '@nestjs/graphql'
import { IsUUID } from 'class-validator'

@InputType()
export class VerifyEmailInput {
	@Field()
	@IsUUID('4')
	token!: string
}
