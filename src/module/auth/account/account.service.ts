import {
	ConflictException,
	ForbiddenException,
	Injectable,
	InternalServerErrorException,
	UnauthorizedException
} from '@nestjs/common'
import { hash, verify } from 'argon2'
import { TOTP } from 'otpauth'

import { User } from '../../../../prisma/generated/prisma/client'
import { PrismaService } from '../../../core/module/prisma/prisma.service'
import { AuthModel } from '../../../shared/model/auth.model'
import { UserModel } from '../../../shared/model/user.model'

import { LoginInput } from './input/Login.input'
import { RegisterInput } from './input/Register.input'

@Injectable()
export class AccountService {
	constructor(private prismaService: PrismaService) {}

	async register(userRegisterData: RegisterInput): Promise<UserModel> {
		const { password } = userRegisterData
		await this.checkCredentialsUnique(userRegisterData)

		const created = await this.prismaService.user.create({
			data: { ...userRegisterData, password: await hash(password) }
		})

		const { password: _password, ...returned } = created

		return returned
	}

	async login(userLoginData: LoginInput): Promise<AuthModel> {
		const { password, pincode } = userLoginData
		let found: User | null = null

		if (userLoginData?.email) {
			found = await this.prismaService.user.findFirst({
				where: { email: userLoginData.email }
			})
		} else if (userLoginData?.username) {
			found = await this.prismaService.user.findFirst({
				where: { username: userLoginData.username }
			})
		}

		if (!found) throw new UnauthorizedException('Invalid credentials')

		if (!found.isEmailVerified)
			throw new ForbiddenException('Email is not verified')

		const isPasswordVerified = await verify(found.password, password)

		if (!isPasswordVerified)
			throw new UnauthorizedException('Invalid credentials')

		if (found.isTotpEnabled) {
			if (!pincode)
				return { message: 'Provide pincode to finish authorization' }
			if (!found.totpSecret)
				throw new InternalServerErrorException('TOTP secret is null')

			const totp = new TOTP({
				issuer: 'YuiiStream',
				secret: found.totpSecret,
				algorithm: 'SHA1',
				label: found.username,
				digits: 6
			})

			const delta = totp.validate({ token: pincode })
			if (delta === null) throw new UnauthorizedException('Wrong pincode')
		}

		return { user: found }
	}

	private async checkCredentialsUnique(credentials: {
		email: User['email']
		username: User['username']
	}) {
		const { email, username } = credentials
		if (await this.prismaService.user.findFirst({ where: { email } }))
			throw new ConflictException('This email is taken')
		if (await this.prismaService.user.findFirst({ where: { username } }))
			throw new ConflictException('This username is taken')
	}
}
