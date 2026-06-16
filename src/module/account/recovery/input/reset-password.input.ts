import { Field, InputType } from '@nestjs/graphql'
import { IsNotEmpty, IsString, MinLength, Validate } from 'class-validator'

import { MatchPasswordsConstraint } from '../../../../shared/validation-constraint/matchPasswords.constraint'

@InputType()
export class ResetPasswordInput {
	@Field()
	@IsString()
	@MinLength(6)
	newPassword!: string

	@Field()
	@IsString()
	@IsNotEmpty()
	@Validate(MatchPasswordsConstraint)
	passwordRepeat!: string

	@Field()
	@IsString()
	@IsNotEmpty()
	recoveryToken!: string
}
