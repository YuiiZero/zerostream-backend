import { Field, InputType } from '@nestjs/graphql'
import {
	IsEmail,
	IsNotEmpty,
	IsOptional,
	IsString,
	Length,
	Matches,
	MaxLength,
	MinLength
} from 'class-validator'

import { RegisterInputInterface } from '../interface/account.interface'

@InputType()
export class RegisterInput implements RegisterInputInterface {
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
	@Length(4, 16)
	public nickname?: string

	@Field({ nullable: true })
	@IsOptional()
	@IsString()
	@IsNotEmpty()
	@MaxLength(300)
	public bio?: string

	@Field({ nullable: true })
	@IsOptional()
	@IsString()
	@IsNotEmpty()
	public avatar?: string
}
