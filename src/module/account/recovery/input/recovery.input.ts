import { Field, InputType } from '@nestjs/graphql'
import { IsEmail, IsString, MinLength, Validate } from 'class-validator'

import { MatchPasswordsConstraint } from '../../../../shared/validation-constraint/matchPasswords.constraint'
import {
	ResetPasswordInputInterface,
	SendResetPasswordTokenAuthorizedInputInterface,
	SendResetPasswordTokenUnauthorizedInputInterface
} from '../interface/recovery.interface'

@InputType()
export class ResetPasswordInput implements ResetPasswordInputInterface {
	@Field()
	@IsString()
	public token!: string

	@Field()
	@IsString()
	@MinLength(6)
	public newPassword!: string

	@Field()
	@IsString()
	@Validate(MatchPasswordsConstraint)
	public passwordRepeat!: string
}

@InputType()
export class SendResetPasswordTokenAuthorizedInput implements SendResetPasswordTokenAuthorizedInputInterface {
	@Field(() => String, { nullable: true })
	pincode?: string | undefined
}

@InputType()
export class SendResetPasswordTokenUnauthorizedInput implements SendResetPasswordTokenUnauthorizedInputInterface {
	@Field()
	@IsEmail()
	public userEmail!: string

	@Field(() => String, { nullable: true })
	public pincode?: string
}
