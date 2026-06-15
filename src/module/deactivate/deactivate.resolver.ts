import { Args, Context, Mutation, Resolver } from '@nestjs/graphql'

import { Authorization } from '../../shared/decorator/authorization.decorator'
import { CurrentUserId } from '../../shared/decorator/current-user-id.decorator'
import { DeactivatedModel } from '../../shared/model/deactivated.model'
import { Ctx } from '../../shared/types/type'
import { SessionService } from '../auth/session/session.service'

import { DeactivateService } from './deactivate.service'
import { DeactivateAccountInput } from './input/deactivate-account.input'

@Resolver()
export class DeactivateResolver {
	constructor(
		private readonly deactivateService: DeactivateService,
		private readonly sessionService: SessionService
	) {}

	@Authorization()
	@Mutation(() => DeactivatedModel, { name: 'deactivateAccount' })
	async deactivate(
		@Args('deactivateAccountInput')
		{ token, password, pincode }: DeactivateAccountInput,
		@CurrentUserId() userId: string,
		@Context() { req, res }: Ctx
	): Promise<DeactivatedModel> {
		await this.deactivateService.validateCredentials({
			password,
			pincode,
			userId
		})

		const result = await this.deactivateService.deactivate(token)

		await this.sessionService.deleteCurrentSession(req, res)

		return result
	}
}
