import {
	BadRequestException,
	Injectable,
	NotFoundException,
	UnauthorizedException
} from '@nestjs/common'
import { verify } from 'argon2'

import { TokenType } from '../../../../prisma/generated/prisma/enums'
import { PrismaService } from '../../../core/module/prisma/prisma.service'
import { handleException } from '../../../shared/util/handleException.util'
import { TotpService } from '../../auth/totp/totp.service'
import { TokenService } from '../../service/token/token.service'
import { UserService } from '../../service/user/user.service'

@Injectable()
export class DeactivateService {
	constructor(
		private readonly prismaService: PrismaService,
		private readonly tokenService: TokenService,
		private readonly totpService: TotpService,
		private readonly userService: UserService
	) {}

	async deactivate(token: string) {
		try {
			const { userId } = await this.tokenService.verifyToken({
				token,
				tokenType: TokenType.DEACTIVATE_ACCOUNT
			})
			const foundUser = await this.userService.getUnique('id', userId)

			if (foundUser.isDeactivated)
				throw new BadRequestException('User is already deactivated')

			await this.prismaService.token.delete({ where: { token } })

			return this.prismaService.user.update({
				where: { id: userId },
				data: {
					isDeactivated: true,
					deactivatedAt: new Date()
				},
				select: {
					isDeactivated: true,
					deactivatedAt: true
				}
			})
		} catch (e) {
			handleException(e, 'Cannot deactivate account')
		}
	}

	public async validateCredentials({
		password,
		pincode,
		userId
	}: ValidateCredentialsOptions): Promise<boolean> {
		try {
			const foundUser = await this.prismaService.user.findUnique({
				where: { id: userId }
			})

			if (!foundUser) throw new NotFoundException('User not found')

			const { password: hashedPassword, isTotpEnabled, totpSecret } = foundUser
			const isPasswordValid = await verify(hashedPassword, password)

			if (!isPasswordValid) throw new UnauthorizedException('Wrong credentials')

			if (isTotpEnabled && !this.totpService.verifyTOTP(pincode, totpSecret))
				throw new BadRequestException('Wrong pincode')

			return true
		} catch (e) {
			handleException(e, 'Cannot deactivate account')
		}
	}
}
interface ValidateCredentialsOptions {
	userId: string
	password: string
	pincode: string | null
}
