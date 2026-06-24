import {
	BadRequestException,
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
import { TokenService } from '../../service/token/token.service'
import { UserService } from '../../service/user/user.service'

import { ChangePasswordInput } from './input/ChangePassword.input.ts'
import { LoginInput } from './input/Login.input'
import { RegisterInput } from './input/Register.input'

@Injectable()
export class AccountService {
	public constructor(
		private readonly prismaService: PrismaService,
		private readonly userService: UserService,
		private readonly tokenService: TokenService
	) {}

	public async me(id: string): Promise<User> {
		return this.userService.getUnique('id', id)
	}

	public async register(
		userRegisterData: RegisterInput
	): Promise<PublicUserModel> {
		const { password } = userRegisterData

		await this._checkCredentialsUnique(userRegisterData)

		const user = await this.prismaService.user.create({
			data: { ...userRegisterData, password: await hash(password) }
		})
		const { password: _, ...returned } = user

		return returned
	}

	public async login(userLoginData: LoginInput): Promise<PublicUserModel> {
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
		if (found.isTotpEnabled) this._checkPincode(found.totpSecret, pincode)

		const { password: _, ...returned } = found

		return returned
	}

	public async changePassword(
		userId: string,
		changePasswordInput: ChangePasswordInput
	): Promise<boolean> {
		const { password, isTotpEnabled, totpSecret } =
			await this.userService.getUnique('id', userId)
		const { password: oldPassword, newPassword, pincode } = changePasswordInput
		const isPasswordVerified = await verify(password, oldPassword)

		if (!isPasswordVerified) throw new BadRequestException('Wrong password')
		if (isTotpEnabled) this._checkPincode(totpSecret, pincode)

		const newPasswordHashed = await hash(newPassword)

		await this.prismaService.user.update({
			where: { id: userId },
			data: { password: newPasswordHashed }
		})

		return true
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

	private _checkPincode(
		totpSecret: string | null,
		pincode: string | undefined
	): void {
		if (!pincode) throw new BadRequestException('Pincode not provided')
		if (!totpSecret)
			throw new InternalServerErrorException('TOTP secret is null')

		const totp = new TOTP({ secret: totpSecret })
		const delta = totp.validate({ token: pincode })

		if (delta === null) throw new UnauthorizedException('Wrong pincode')
	}
}
