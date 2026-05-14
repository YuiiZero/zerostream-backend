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
	email!: string

	@Field()
	@IsString()
	@Length(4, 16)
	@Matches(/^[a-zA-Z0-9_]+$/, {
		message: 'Username can only contain letters, numbers, and underscores'
	})
	username!: string

	@Field()
	@IsString()
	@MinLength(6)
	password!: string

	@Field({ nullable: true })
	@IsOptional()
	@IsString()
	@IsNotEmpty()
	nickname?: string

	@Field({ nullable: true })
	@IsOptional()
	@IsString()
	@IsNotEmpty()
	bio?: string

	@Field({ nullable: true })
	@IsOptional()
	@IsString()
	@IsNotEmpty()
	avatar?: string
}
