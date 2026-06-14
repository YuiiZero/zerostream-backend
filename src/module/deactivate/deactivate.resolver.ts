import { Args, Mutation, Resolver } from '@nestjs/graphql'

import { PublicUserModel } from '../../shared/model/user.model'

import { DeactivateService } from './deactivate.service'
import { DeactivateAccountInput } from './input/deactivate-account.input'

@Resolver()
export class DeactivateResolver {
	constructor(private readonly deactivateService: DeactivateService) {}

	@Mutation(() => PublicUserModel, { name: 'deactivateAccount' })
	async deactivate(
		@Args('deactivateAccountInput') { token }: DeactivateAccountInput
	) {
		return this.deactivateService.deactivate(token)
	}
}
