import { Args, Context, Mutation, Resolver } from '@nestjs/graphql'

import { Authorization } from '../../shared/decorator/authorization.decorator'
import { Unauthorized } from '../../shared/decorator/unauthorized.decorator'
import { PublicUserModel } from '../../shared/model/user.model'
import { Ctx } from '../../shared/types/type'
import { SessionService } from '../auth/session/session.service'

import { ResetPasswordInput } from './input/reset-password.input'
import { RecoveryService } from './recovery.service'

@Resolver()
export class RecoveryResolver {
	constructor(
		private readonly recoveryService: RecoveryService,
		private readonly sessionService: SessionService
	) {}

	@Unauthorized()
	@Mutation(() => PublicUserModel)
	async resetPasswordUnauthorized(
		@Context() { req }: Ctx,
		@Args('resetPasswordInput')
		{ newPassword, recoveryToken }: ResetPasswordInput
	) {
		const user = await this.recoveryService.resetPassword({
			newPassword,
			recoveryToken
		})

		await this.sessionService.deleteAllSessions(req, user.email)

		return user
	}

	@Authorization()
	@Mutation(() => PublicUserModel)
	async resetPasswordAuthorized(
		@Context() { req }: Ctx,
		@Args('resetPasswordInput')
		{ newPassword, recoveryToken }: ResetPasswordInput
	) {
		const user = await this.recoveryService.resetPassword({
			newPassword,
			recoveryToken
		})

		await this.sessionService.deleteAllSessionsExceptCurrent(req, user)

		return user
	}
}
