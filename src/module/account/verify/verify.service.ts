import { Injectable } from '@nestjs/common'

import { TokenType } from '../../../../prisma/generated/prisma/enums'
import { PrismaService } from '../../../core/module/prisma/prisma.service'
import { TokenService } from '../../service/token/token.service'

@Injectable()
export class VerifyService {
	constructor(
		private readonly prismaService: PrismaService,
		private readonly tokenService: TokenService
	) {}

	async verifyEmail(token: string) {
		const foundToken = await this.tokenService.verifyToken({
			token,
			tokenType: TokenType.VERIFY_EMAIL
		})

		const { userId: id } = foundToken

		return this.prismaService.user.update({
			where: {
				id
			},
			data: {
				isEmailVerified: true
			}
		})
	}
}
