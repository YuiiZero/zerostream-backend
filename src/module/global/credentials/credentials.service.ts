import { Injectable, UnauthorizedException } from '@nestjs/common'
import { verify } from 'argon2'

import { TotpService } from '../../auth/totp/totp.service'
import { UserService } from '../user/user.service'

import {
	CredentialsInput,
	CredentialsServiceInterface
} from './interface/credentials.interface'

@Injectable()
export class CredentialsService implements CredentialsServiceInterface {
	public constructor(
		private readonly userService: UserService,
		private readonly totpService: TotpService
	) {}

	public async validateCredentials(
		userId: string,
		input: CredentialsInput
	): Promise<boolean> {
		const { password: inputPassword, pincode } = input
		const user = await this.userService.getUnique('id', userId)
		const isPasswordValid = await verify(user.hashPassword, inputPassword)

		if (!isPasswordValid) throw new UnauthorizedException('Invalid credentials')
		if (user.isTotpEnabled) {
			if (!pincode) throw new UnauthorizedException('Pincode not provided')

			const isTotpVerified = this.totpService.verifyTotp(user, pincode)

			if (!isTotpVerified) throw new UnauthorizedException('Wrong pincode')
		}

		return true
	}
}
