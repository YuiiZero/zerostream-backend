import {
	ConflictException,
	Injectable,
	UnauthorizedException
} from '@nestjs/common'
import { hash, verify } from 'argon2'
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino'

import { User } from '../../../../prisma/generated/prisma/client'
import { PrismaService } from '../../../core/module/prisma/prisma.service'
import { handleException } from '../../../shared/util/handleException.util'
import { VerifyService } from '../../account/verify/verify.service'
import { UserService } from '../../global/user/user.service'
import { TotpService } from '../totp/totp.service'

import { LoginInput } from './input/Login.input'
import { RegisterInput } from './input/Register.input'
import { RegisterMessageModel } from './model/RegisterUser.model'

@Injectable()
export class AccountService {
	public constructor(
		private readonly prismaService: PrismaService,
		private readonly userService: UserService,
		private readonly verifyService: VerifyService,
		private readonly totpService: TotpService,
		@InjectPinoLogger(AccountService.name)
		private readonly logger: PinoLogger
	) {}

	public me(userId: string): Promise<User> {
		return this.userService.getUnique('id', userId)
	}

	public async register(input: RegisterInput): Promise<RegisterMessageModel> {
		this.logger.info({ email: input.email }, 'Register request')

		try {
			const { password, email } = input

			await this._checkCredentialsUnique(input)

			const { password: _, ...inputWithoutPassword } = input

			const user = await this.prismaService.user.create({
				data: { ...inputWithoutPassword, hashPassword: await hash(password) }
			})

			await this.verifyService.sendVerifyEmailToken({ email })

			this.logger.info(
				{ userId: user.id, email: user.email, username: user.username },
				'User registered'
			)

			return { message: 'Verify your email to finish registration' }
		} catch (error) {
			handleException(this.logger, error, 'Register failed')
		}
	}

	public async getLoginUser(userLoginData: LoginInput): Promise<User> {
		this.logger.info(
			{
				login: userLoginData.email ?? userLoginData.username
			},
			'Login attempt'
		)
		try {
			const { password, pincode, email, username } = userLoginData
			const found: User | null = email
				? await this.prismaService.user.findUnique({ where: { email } })
				: await this.prismaService.user.findUnique({ where: { username } })

			if (!found) throw new UnauthorizedException('Invalid credentials')

			const isPasswordVerified = await verify(found.hashPassword, password)

			if (!isPasswordVerified)
				throw new UnauthorizedException('Invalid credentials')
			if (!found.isEmailVerified)
				throw new UnauthorizedException('Email is not verified')
			if (found.isTotpEnabled) {
				if (!pincode) throw new UnauthorizedException('Pincode not provided')

				const isTotpVerified = this.totpService.verifyTotp(found, pincode)

				if (!isTotpVerified) throw new UnauthorizedException('Wrong pincode')
			}

			this.logger.info({ userId: found.id }, 'Successful login')

			return found
		} catch (error) {
			handleException(this.logger, error, 'Login failed')
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
