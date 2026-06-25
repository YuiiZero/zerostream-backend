import { Injectable, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { hash } from 'argon2'

import { User } from '../../../../prisma/generated/prisma/client'
import { TokenType } from '../../../../prisma/generated/prisma/enums'
import { PrismaService } from '../../../core/module/prisma/prisma.service'
import { SessionMetadata } from '../../../shared/types/metadata.type'
import { handleException } from '../../../shared/util/handleException.util'
import { SessionService } from '../../auth/session/session.service'
import { TotpService } from '../../auth/totp/totp.service'
import { TokenService } from '../../global/token/token.service'
import { UserService } from '../../global/user/user.service'
import { MailService } from '../../mail/mail.service'

import {
	RecoveryServiceInterface,
	ResetPasswordInputInterface,
	SendResetPasswordTokenAuthorizedInputInterface,
	SendResetPasswordTokenUnauthorizedInputInterface
} from './interface/recovery.interface'

@Injectable()
export class RecoveryService implements RecoveryServiceInterface {
	private readonly ALLOWED_ORIGIN: string

	public constructor(
		private readonly prismaService: PrismaService,
		private readonly tokenService: TokenService,
		private readonly sessionService: SessionService,
		private readonly userService: UserService,
		private readonly totpService: TotpService,
		private readonly mailService: MailService,
		private readonly configService: ConfigService
	) {
		this.ALLOWED_ORIGIN = this.configService.getOrThrow('ALLOWED_ORIGIN')
	}

	public async sendResetPasswordToken(
		metadata: SessionMetadata,
		userId: string,
		input: SendResetPasswordTokenAuthorizedInputInterface
	): Promise<void>
	public async sendResetPasswordToken(
		metadata: SessionMetadata,
		input: SendResetPasswordTokenUnauthorizedInputInterface
	): Promise<void>
	public async sendResetPasswordToken(
		metadata: SessionMetadata,
		userIdOrInput: string | SendResetPasswordTokenUnauthorizedInputInterface,
		input?: SendResetPasswordTokenAuthorizedInputInterface
	): Promise<void> {
		try {
			let user: User
			let pincode: string | undefined
			let email: string

			if (typeof userIdOrInput === 'string' && input) {
				const userId = userIdOrInput

				user = await this.userService.getUnique('id', userId)
				email = user.email
				pincode = input.pincode
			} else if (typeof userIdOrInput !== 'string' && input === undefined) {
				email = userIdOrInput.userEmail
				pincode = userIdOrInput.pincode
				user = await this.userService.getUnique('email', email)
			} else {
				throw new TypeError('Invalid arguments')
			}

			const { isTotpEnabled, totpSecret } = user

			if (isTotpEnabled) {
				if (!pincode) throw new UnauthorizedException('Pincode not provided')

				const isTotpVerified = this.totpService.verifyTOTP(pincode, totpSecret)
				if (!isTotpVerified) throw new UnauthorizedException('Wrong pincode')
			}

			const { token } =
				await this.tokenService.generatePasswordRecoveryToken(user)

			await this.mailService.sendPasswordRecoveryEmail({
				to: email,
				token,
				metadata,
				domain: this.ALLOWED_ORIGIN
			})
		} catch (error) {
			handleException(error, 'Cannot send reset password token')
		}
	}

	public async resetPassword(
		input: ResetPasswordInputInterface,
		sessionID?: string
	): Promise<void> {
		try {
			const { token, newPassword } = input
			const { userId } = await this.tokenService.verifyToken({
				token,
				tokenType: TokenType.RESET_PASSWORD
			})
			const hashedPassword = await hash(newPassword)

			await this.prismaService.user.update({
				where: { id: userId },
				data: {
					password: hashedPassword
				}
			})

			if (sessionID) {
				const user = await this.userService.getUnique('id', userId)

				await this.sessionService.deleteAllSessionsExceptCurrent(
					sessionID,
					user
				)
			} else {
				await this.sessionService.deleteAllSessions(userId)
			}
		} catch (error) {
			handleException(error, 'Cannot reset password')
		}
	}
}
