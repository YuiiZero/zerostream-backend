import { Field, InputType } from '@nestjs/graphql'
import { IsEmail, IsOptional, IsString, Length } from 'class-validator'

@InputType()
export class LoginInput {
	@Field({ nullable: true })
	@IsEmail()
	@IsOptional()
	public email?: string

	@Field({ nullable: true })
	@IsString()
	@IsOptional()
	public username?: string

	@Field()
	@IsString()
	public password!: string

	@Field({ nullable: true })
	@IsOptional()
	@IsString()
	@Length(6, 6)
	public pincode?: string
}
