import { BadRequestException, PipeTransform } from '@nestjs/common'

import { LoginInput } from '../../module/auth/account/input/Login.input'

export class LoginPipe implements PipeTransform {
	transform(loginInput: LoginInput) {
		if (!loginInput.email && !loginInput.username) {
			throw new BadRequestException('Neither email nor username were provided')
		}
		return loginInput
	}
}
