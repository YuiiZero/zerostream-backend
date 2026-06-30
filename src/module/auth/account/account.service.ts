import {
	ConflictException,
	Injectable,
	UnauthorizedException
} from '@nestjs/common'
import { hash, verify } from 'argon2'

import { User } from '../../../../prisma/generated/prisma/client'
import { PrismaService } from '../../../core/module/prisma/prisma.service'
import { PrivateUserModel } from '../../../shared/model/user.model'
import { handleException } from '../../../shared/util/handleException.util'
import { VerifyService } from '../../account/verify/verify.service'
import { UserService } from '../../global/user/user.service'
import { TotpService } from '../totp/totp.service'

import { LoginInput } from './input/Login.input'
import { RegisterInput } from './input/Register.input'
import { AccountServiceInterface } from './interface/account.interface'
import { RegisterMessageModel } from './model/RegisterUser.model'

@Injectable()
export class AccountService implements AccountServiceInterface {
	public constructor(
		private readonly prismaService: PrismaService,
		private readonly userService: UserService,
		private readonly verifyService: VerifyService,
		private readonly totpService: TotpService
	) {}

	public me(userId: string): Promise<PrivateUserModel> {
		return this.userService.getUnique('id', userId)
	}

	public async register(input: RegisterInput): Promise<RegisterMessageModel> {
		try {
			const { password, email } = input

			await this._checkCredentialsUnique(input)

			await this.prismaService.user.create({
				data: { ...input, password: await hash(password) }
			})

			await this.verifyService.sendVerifyEmailToken({ email })

			return { message: 'Verify your email to finish registration' }
		} catch (error) {
			handleException(error, 'Cannot register user')
		}
	}

	public async getLoginUser(userLoginData: LoginInput): Promise<User> {
		try {
			const { password, pincode, email, username } = userLoginData
			const found: User | null = email
				? await this.prismaService.user.findUnique({ where: { email } })
				: await this.prismaService.user.findUnique({ where: { username } })

			if (!found) throw new UnauthorizedException('Invalid credentials')

			const isPasswordVerified = await verify(found.password, password)

			if (!isPasswordVerified)
				throw new UnauthorizedException('Invalid credentials')
			if (!found.isEmailVerified)
				throw new UnauthorizedException('Email is not verified')
			if (found.isTotpEnabled) {
				const isTotpVerified = this.totpService.verifyTOTP(
					pincode,
					found.totpSecret
				)
				if (!isTotpVerified) throw new UnauthorizedException('Wrong pincode')
			}

			return found
		} catch (error) {
			handleException(error, 'Cannot login')
		}
	}

	private async _checkCredentialsUnique(credentials: {
		email: User['email']
		username: User['username']
	}): Promise<void> {
		const { email, username } = credentials
		const found = await this.prismaService.user.findFirst({
			where: { OR: [{ email }, { username }] }
		})

		if (!found) return

		if (found.email === email)
			throw new ConflictException('This email is taken')
		if (found.username === username)
			throw new ConflictException('This username is taken')
	}
}
