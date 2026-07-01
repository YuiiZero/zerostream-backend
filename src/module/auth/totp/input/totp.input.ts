import { Field, InputType } from '@nestjs/graphql'
import { IsNumberString, IsOptional, IsString, Length } from 'class-validator'

import {
	AddTotpInputInterface,
	RemoveTotpInputInterface
} from '../interface/totp.interface'

@InputType()
export class AddTotpInput implements AddTotpInputInterface {
	@Field()
	@IsNumberString()
	@Length(6, 6)
	pincode!: string
}

@InputType()
export class RemoveTotpInput implements RemoveTotpInputInterface {
	@Field({ nullable: true })
	@IsOptional()
	@IsString()
	recoveryCode?: string

	@Field({ nullable: true })
	@IsOptional()
	@IsNumberString()
	@Length(6, 6)
	pincode?: string
}
