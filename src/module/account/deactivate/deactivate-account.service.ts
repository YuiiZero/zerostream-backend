import { BadRequestException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { StringValue } from 'ms'

import { TokenType } from '../../../../prisma/generated/prisma/enums'
import { PrismaService } from '../../../core/module/prisma/prisma.service'
import { SessionMetadata } from '../../../shared/types/metadata.type'
import { Ctx } from '../../../shared/types/type'
import { handleException } from '../../../shared/util/handleException.util'
import { SessionService } from '../../auth/session/session.service'
import { CredentialsService } from '../../global/credentials/credentials.service'
import { TokenService } from '../../global/token/token.service'
import { UserService } from '../../global/user/user.service'
import { MailService } from '../../mail/mail.service'

import {
	DeactivateAccountInputInterface,
	DeactivateAccountServiceInterface,
	DeactivatedUserModelInterface,
	SendAccountDeactivationTokenInputInterface
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
		input: SendAccountDeactivationTokenInputInterface
	): Promise<void> {
		try {
			const user = await this.userService.getUnique('id', userId)

			if (user.isDeactivated)
				throw new BadRequestException('User is already deactivated')

			await this.credentialsService.validateCredentials(userId, input)

			const sessionUser = await this.userService.toSessionUser(user)
			const tokenObject =
				await this.tokenService.generateAccountDeactivationToken(sessionUser)

			await this.mailService.sendAccountDeactivationEmail({
				metadata,
				to: user.email,
				token: tokenObject.token,
				pincodeTTL: this.DEACTIVATION_TOKEN_TTL
			})
		} catch (error) {
			handleException(error, 'Cannot send account deactivation token')
		}
	}

	public async deactivateAccount(
		input: DeactivateAccountInputInterface,
		context: Ctx
	): Promise<DeactivatedUserModelInterface> {
		try {
			const { userId } = await this.tokenService.verifyToken({
				token: input.token,
				tokenType: TokenType.DEACTIVATE_ACCOUNT
			})

			await this.sessionService.deleteCurrentSession(context.req, context.res)

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
		} catch (error) {
			handleException(error, 'Cannot deactivate account')
		}
	}
}
