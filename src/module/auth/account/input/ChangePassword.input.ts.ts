import { Optional } from '@nestjs/common'
import { Field, InputType } from '@nestjs/graphql'
import { IsString, MinLength } from 'class-validator'

@InputType()
export class ChangePasswordInput {
	@Field()
	@IsString()
	public password!: string

	@Field()
	@Optional()
	@IsString()
	public pincode?: string

	@Field()
	@IsString()
	@MinLength(6)
	public newPassword!: string
}
