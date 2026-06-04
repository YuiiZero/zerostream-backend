import { Field, InputType } from '@nestjs/graphql'
import { IsEmail, IsOptional, IsString, Length } from 'class-validator'

@InputType()
export class LoginInput {
	@Field({ nullable: true })
	@IsEmail()
	@IsOptional()
	email?: string

	@Field({ nullable: true })
	@IsString()
	@IsOptional()
	username?: string

	@Field()
	@IsString()
	password!: string

	@Field({ nullable: true })
	@IsOptional()
	@IsString()
	@Length(6, 6)
	pincode?: string
}
