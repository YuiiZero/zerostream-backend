import { Field, InputType } from '@nestjs/graphql'
import { IsString, Length, MaxLength } from 'class-validator'

@InputType()
export class TOTPInput {
	@Field()
	@IsString()
	@MaxLength(24)
	secret!: string

	@IsString()
	@Length(6, 6)
	@Field()
	pincode!: string
}
