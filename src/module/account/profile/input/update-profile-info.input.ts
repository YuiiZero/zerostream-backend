import { Field, InputType } from '@nestjs/graphql'
import {
	IsNotEmpty,
	IsOptional,
	IsString,
	Length,
	MaxLength
} from 'class-validator'

@InputType()
export class UpdateProfileInfoInput {
	@Field({ nullable: true })
	@IsOptional()
	@IsString()
	@Length(4, 16)
	nickname?: string

	@Field({ nullable: true })
	@IsOptional()
	@IsString()
	@IsNotEmpty()
	@MaxLength(300)
	bio?: string
}
