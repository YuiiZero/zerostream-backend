import { Field, InputType } from '@nestjs/graphql'
import { IsString, Length } from 'class-validator'

@InputType()
export class TOTPInput {
	@IsString()
	@Length(6, 6)
	@Field()
	pincode!: string
}
