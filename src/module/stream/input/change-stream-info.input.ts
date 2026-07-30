import { Field, InputType } from '@nestjs/graphql'
import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator'

@InputType()
export class ChangeStreamInfoInput {
	@Field()
	@IsOptional()
	@IsString()
	@IsNotEmpty()
	public title?: string

	@Field()
	@IsUUID()
	public categoryId!: string
}
