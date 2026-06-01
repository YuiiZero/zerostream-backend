import { ConfigService } from '@nestjs/config'
import { Args, Context, Mutation, Resolver } from '@nestjs/graphql'

import { Authorization } from '../../shared/decorator/authorization.decorator'
import { Ip } from '../../shared/decorator/ip.decorator'
import { Unauthorized } from '../../shared/decorator/unauthorized.decorator'
import { UserAgent } from '../../shared/decorator/user-agent.decorator'
import { Ctx } from '../../shared/types/type'
import { getSessionMetadata } from '../../shared/util/getSessionMetadata'
import { SessionService } from '../auth/session/session.service'

import { ResetPasswordInput } from './input/reset-password.input'
import { RecoveryService } from './recovery.service'

@Resolver()
export class RecoveryResolver {
	constructor(
		private readonly recoveryService: RecoveryService,
		private readonly configService: ConfigService,
		private readonly sessionService: SessionService
	) {}

	@Mutation(() => Boolean)
	async sendPasswordRecoveryLink(
		@Args('email') email: string,
		@UserAgent() userAgent: string,
		@Ip() ip: string
	) {
		const metadata = await getSessionMetadata(this.configService, userAgent, ip)

		await this.recoveryService.sendPasswordRecoveryLink(email, metadata)

		return true
	}

	@Unauthorized()
	@Mutation(() => Boolean)
	async resetPasswordUnauthorized(
		@Context() { req }: Ctx,
		@Args('resetPasswordInput')
		{ email, newPassword, recoveryToken }: ResetPasswordInput
	) {
		const user = await this.recoveryService.resetPassword({
			email,
			newPassword,
			recoveryToken
		})

		await this.sessionService.deleteAllSessions(req, user)
		return true
	}

	@Authorization()
	@Mutation(() => Boolean)
	async resetPasswordAuthorized(
		@Context() { req }: Ctx,
		@Args('resetPasswordInput')
		{ email, newPassword, recoveryToken }: ResetPasswordInput
	) {
		const user = await this.recoveryService.resetPassword({
			email,
			newPassword,
			recoveryToken
		})

		await this.sessionService.deleteAllSessionsExceptCurrent(req, user)
		return true
	}
}
