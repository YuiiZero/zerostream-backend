import { Injectable } from '@nestjs/common'

import { TokenType } from '../../../prisma/generated/prisma/enums'
import { PrismaService } from '../../core/module/prisma/prisma.service'
import { TokenService } from '../service/token/token.service'

@Injectable()
export class DeactivateService {
	constructor(
		private readonly prismaService: PrismaService,
		private readonly tokenService: TokenService
	) {}

	async deactivate(token: string) {
		const { userId } = await this.tokenService.verifyToken({
			token,
			tokenType: TokenType.DEACTIVATE_ACCOUNT
		})

		await this.prismaService.token.delete({ where: { token } })
		return this.prismaService.user.update({
			where: { id: userId },
			data: {
				isDeactivated: true,
				deactivatedAt: new Date()
			}
		})
	}
}
