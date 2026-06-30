import { Field, InputType } from '@nestjs/graphql'
import { IsOptional, IsString, Length } from 'class-validator'

import { CredentialsInputInterface } from '../interface/deactivate.interface'

@InputType()
export class CredentialsInput implements CredentialsInputInterface {
	@Field()
	@IsString()
	password!: string

	@Field(() => String, { nullable: true })
	@IsOptional()
	@IsString()
	@Length(6, 6)
	pincode?: string | undefined
}
