import { Field, InputType } from '@nestjs/graphql'
import { IsEmail, IsOptional, IsString } from 'class-validator'

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
}
