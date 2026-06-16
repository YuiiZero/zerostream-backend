import { Injectable } from '@nestjs/common'
import { hash } from 'argon2'

import { TokenType } from '../../../../prisma/generated/prisma/enums'
import { PrismaService } from '../../../core/module/prisma/prisma.service'
import { TokenService } from '../../service/token/token.service'

export interface ResetPasswordOpts {
	email: string
	newPassword: string
	recoveryToken: string
}

@Injectable()
export class RecoveryService {
	constructor(
		private readonly prismaService: PrismaService,
		private readonly tokenService: TokenService
	) {}

	async resetPassword({ recoveryToken, newPassword }: ResetPasswordOptions) {
		const foundToken = await this.tokenService.verifyToken({
			token: recoveryToken,
			tokenType: TokenType.RESET_PASSWORD
		})
		const { email } = await this.tokenService.getRelatedUser(foundToken)

		await this.prismaService.token.delete({ where: { id: foundToken.id } })

		const hashed = await hash(newPassword)

		return this.prismaService.user.update({
			where: { email },
			data: { password: hashed }
		})
	}
}

interface ResetPasswordOptions {
	newPassword: string
	recoveryToken: string
}
