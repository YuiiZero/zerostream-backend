import { Field, InputType } from '@nestjs/graphql'
import { IsOptional, IsString, Length } from 'class-validator'

import { SendAccountDeactivationTokenInputInterface } from '../interface/deactivate.interface'

@InputType()
export class SendAccountDeactivationTokenInputInput implements SendAccountDeactivationTokenInputInterface {
	@Field()
	@IsString()
	public password!: string

	@Field(() => String, { nullable: true })
	@IsOptional()
	@IsString()
	@Length(6, 6)
	public pincode?: string
}
