import { Field, InputType } from '@nestjs/graphql'
import { IsOptional, IsString, Length } from 'class-validator'

@InputType()
export class DeactivateAccountInput {
	@Field()
	@Length(6, 6, { message: 'Code must be 6 digits long' })
	token!: string

	@Field()
	@IsString()
	password!: string

	@Field(() => String, { nullable: true })
	@IsString()
	@IsOptional()
	pincode!: string | null
}
