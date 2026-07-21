import { Field, InputType } from '@nestjs/graphql'
import {
	IsNotEmpty,
	IsOptional,
	IsString,
	IsUrl,
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

	@Field(() => [String], { nullable: true })
	@IsOptional()
	@IsUrl(
		{
			protocols: ['https'],
			require_protocol: true,
			allow_query_components: false
		},
		{
			each: true,
			message: 'Bad social link'
		}
	)
	socialLinks?: string[]
}
