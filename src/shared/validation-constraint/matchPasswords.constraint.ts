import {
	ValidationArguments,
	ValidatorConstraint,
	ValidatorConstraintInterface
} from 'class-validator'

import { ResetPasswordInput } from '../../module/recovery/input/reset-password.input'

@ValidatorConstraint()
export class MatchPasswordsConstraint implements ValidatorConstraintInterface {
	validate(
		passwordRepeat: string,
		validationArguments: ValidationArguments
	): boolean {
		const input = validationArguments.object as ResetPasswordInput
		return passwordRepeat === input.newPassword
	}
	defaultMessage(): string {
		return 'Passwords do not match'
	}
}
