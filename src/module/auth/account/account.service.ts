import {
	ConflictException,
	Injectable,
	UnauthorizedException
} from '@nestjs/common'
import { hash, verify } from 'argon2'

import { User } from '../../../../prisma/generated/prisma/client'
import { PrismaService } from '../../../core/module/prisma/prisma.service'
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

	async login(userLoginData: LoginInput): Promise<UserModel> {
		const { password } = userLoginData
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

		const isPasswordVerified = await verify(found.password, password)

		if (!isPasswordVerified)
			throw new UnauthorizedException('Invalid credentials')

		const { password: _password, ...returned } = found

		return returned
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
