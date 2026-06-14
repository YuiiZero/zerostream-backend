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
import { PublicUserModel } from '../../../shared/model/user.model'

import { LoginInput } from './input/Login.input'
import { RegisterInput } from './input/Register.input'

@Injectable()
export class AccountService {
	constructor(private prismaService: PrismaService) {}

	async me(id: string) {
		return this.prismaService.user.findUnique({ where: { id } })
	}

	async register(userRegisterData: RegisterInput): Promise<PublicUserModel> {
		const { password } = userRegisterData

		await this._checkCredentialsUnique(userRegisterData)

		const user = await this.prismaService.user.create({
			data: { ...userRegisterData, password: await hash(password) }
		})
		const { password: _, ...returned } = user

		return returned
	}

	async login(userLoginData: LoginInput): Promise<PublicUserModel> {
		const { password, pincode, email, username } = userLoginData
		const found: User | null = email
			? await this.prismaService.user.findUnique({ where: { email } })
			: await this.prismaService.user.findUnique({ where: { username } })

		if (!found) throw new UnauthorizedException('Invalid credentials')

		const isPasswordVerified = await verify(found.password, password)

		if (!isPasswordVerified)
			throw new UnauthorizedException('Invalid credentials')

		if (!found.isEmailVerified)
			throw new ForbiddenException('Email is not verified')

		if (found.isTotpEnabled) {
			if (!pincode)
				throw new UnauthorizedException(
					'Provide pincode to finish authorization'
				)
			if (!found.totpSecret)
				throw new InternalServerErrorException('TOTP secret is null')

			const totp = new TOTP({ secret: found.totpSecret })
			const delta = totp.validate({ token: pincode })

			if (delta === null) throw new UnauthorizedException('Wrong pincode')
		}

		const { password: _, ...returned } = found

		return returned
	}

	private async _checkCredentialsUnique(credentials: {
		email: User['email']
		username: User['username']
	}) {
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
