import { Field, InputType, Int } from '@nestjs/graphql'
import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator'

@InputType()
export class FilterInput {
	@Field(() => Int, { nullable: true })
	@IsOptional()
	@IsInt()
	public take?: number

	@Field(() => Int, { nullable: true })
	@IsOptional()
	@IsInt()
	public skip?: number

	@Field({ nullable: true })
	@IsOptional()
	@IsString()
	@IsNotEmpty()
	public searchTerm?: string
}
