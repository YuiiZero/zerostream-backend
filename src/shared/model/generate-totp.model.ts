import { Field, ObjectType } from '@nestjs/graphql'
import { IsNotEmpty, IsString, IsUrl } from 'class-validator'

@ObjectType()
export class GenerateTOTPModel {
	@Field()
	@IsUrl()
	@IsNotEmpty()
	qrCodeUrl!: string

	@Field()
	@IsString()
	secret!: string
}
