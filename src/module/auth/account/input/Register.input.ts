import { Field, InputType } from '@nestjs/graphql'
import {
	IsEmail,
	IsNotEmpty,
	IsOptional,
	IsString,
	Length,
	Matches,
	MinLength
} from 'class-validator'

@InputType()
export class RegisterInput {
	@Field()
	@IsEmail()
	public email!: string

	@Field()
	@IsString()
	@Length(4, 16)
	@Matches(/^[a-zA-Z0-9_]+$/, {
		message: 'Username can only contain letters, numbers, and underscores'
	})
	public username!: string

	@Field()
	@IsString()
	@MinLength(6)
	public password!: string

	@Field({ nullable: true })
	@IsOptional()
	@IsString()
	@IsNotEmpty()
	public nickname?: string

	@Field({ nullable: true })
	@IsOptional()
	@IsString()
	@IsNotEmpty()
	public bio?: string

	@Field({ nullable: true })
	@IsOptional()
	@IsString()
	@IsNotEmpty()
	public avatar?: string
}
