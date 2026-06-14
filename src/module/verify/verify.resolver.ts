import { Args, Context, Mutation, Resolver } from '@nestjs/graphql'

import { Ctx } from '../../shared/types/type'
import { SessionService } from '../auth/session/session.service'

import { VerifyEmailInput } from './input/verify-email.input'
import { VerifyService } from './verify.service'

@Resolver()
export class VerifyResolver {
	constructor(
		private readonly verifyService: VerifyService,
		private readonly sessionService: SessionService
	) {}

	@Mutation(() => Boolean)
	async verifyEmail(
		@Context() { req }: Ctx,
		@Args('verifyEmailInput') { token }: VerifyEmailInput
	): Promise<boolean> {
		const user = await this.verifyService.verifyEmail(token)

		await this.sessionService.saveCurrentSession(req, user)

		return true
	}
}
