import { Field, InputType, Int } from '@nestjs/graphql'
import { IsBoolean, IsInt, IsOptional, Max } from 'class-validator'

@InputType()
export class GenerateUsersInput {
	@Field(() => Int)
	@IsInt()
	@Max(1000)
	count!: number

	@Field({ nullable: true })
	@IsOptional()
	@IsBoolean()
	isStreaming?: boolean
}
