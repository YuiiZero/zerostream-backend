import {
	BadRequestException,
	Injectable,
	NotFoundException
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { verify } from 'argon2'
import { StringValue } from 'ms'

import { PrismaService } from '../../../core/module/prisma/prisma.service'
import { SessionMetadata } from '../../../shared/types/metadata.type'
import { Ctx } from '../../../shared/types/type'
import { handleException } from '../../../shared/util/handleException.util'
import { SessionService } from '../../auth/session/session.service'
import { CredentialsService } from '../../global/credentials/credentials.service'
import { TokenService } from '../../global/token/token.service'
import { UserService } from '../../global/user/user.service'
import { MailService } from '../../mail/mail.service'

import { CredentialsInput } from './input/Credentials.input'
import {
	DeactivateAccountServiceInterface,
	DeactivatedUserModelInterface
} from './interface/deactivate.interface'

@Injectable()
export class DeactivateAccountService implements DeactivateAccountServiceInterface {
	private readonly DEACTIVATION_TOKEN_TTL: StringValue

	public constructor(
		private readonly prismaService: PrismaService,
		private readonly tokenService: TokenService,
		private readonly userService: UserService,
		private readonly credentialsService: CredentialsService,
		private readonly mailService: MailService,
		private readonly configService: ConfigService,
		private readonly sessionService: SessionService
	) {
		this.DEACTIVATION_TOKEN_TTL = configService.getOrThrow<StringValue>(
			'DEACTIVATION_TOKEN_TTL'
		)
	}

	public async sendAccountDeactivationToken(
		userId: string,
		metadata: SessionMetadata,
		credentials: CredentialsInput
	): Promise<void> {
		try {
			const user = await this.userService.getUnique('id', userId)

			if (user.isDeactivated)
				throw new BadRequestException('User is already deactivated')

			await this.credentialsService.validateCredentials(userId, credentials)

			const sessionUser = await this.userService.toSessionUser(user)
			const { token } =
				await this.tokenService.generateAccountDeactivationToken(sessionUser)

			await this.mailService.sendAccountDeactivationEmail({
				metadata,
				to: user.email,
				token,
				pincodeTTL: this.DEACTIVATION_TOKEN_TTL
			})
		} catch (error) {
			handleException(error, 'Cannot send account deactivation token')
		}
	}

	public async deactivateAccount(
		userId: string,
		token: string,
		context: Ctx
	): Promise<DeactivatedUserModelInterface> {
		try {
			await this._verifyDeactivationToken(userId, token)
			await this.sessionService.deleteSession(context.req.sessionID)

			const deactivated = await this.prismaService.user.update({
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

			// log here

			return deactivated
		} catch (error) {
			handleException(error, 'Cannot deactivate account')
		}
	}

	private async _verifyDeactivationToken(userId: string, token: string) {
		const user = await this.prismaService.user.findFirst({
			where: { id: userId }
		})

		if (!user) throw new NotFoundException('User not found')
		if (!user.hashDeactivationCode)
			throw new NotFoundException('Token not found')

		const isTokenVerified = await verify(user.hashDeactivationCode, token)

		if (!isTokenVerified) throw new BadRequestException('Wrong token')

		const { deactivationCodeExpiresAt: expires } = user

		if (!expires) throw new Error('Expires is null')

		const isTokenExpired = Date.now() > expires.getTime()

		if (isTokenExpired) throw new BadRequestException('Token has expired')
	}
}
