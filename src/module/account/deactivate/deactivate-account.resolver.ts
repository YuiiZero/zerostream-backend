import { Args, Context, Mutation, Resolver } from '@nestjs/graphql'

import { Authorization } from '../../../shared/decorator/authorization.decorator'
import { CurrentUserId } from '../../../shared/decorator/current-user-id.decorator'
import { SessionMetadata } from '../../../shared/decorator/session-metadata.decorator'
import { SessionMetadata as SessionMetadataType } from '../../../shared/types/metadata.type'
import { Ctx } from '../../../shared/types/type'

import { DeactivateAccountService } from './deactivate-account.service'
import { CredentialsInput } from './input/Credentials.input'
import { TokenInput } from './input/Token.input'
import { DeactivatedUserModelInterface } from './interface/deactivate.interface'
import { DeactivatedUserModel } from './model/deactivated-user.model'

@Resolver()
export class DeactivateAccountResolver {
	public constructor(
		private readonly deactivateAccountService: DeactivateAccountService
	) {}

	@Mutation(() => Boolean)
	@Authorization()
	public async sendAccountDeactivationToken(
		@CurrentUserId() userId: string,
		@SessionMetadata() metadata: SessionMetadataType,
		@Args('sendAccountDeactivationTokenInput')
		input: CredentialsInput
	): Promise<boolean> {
		await this.deactivateAccountService.sendAccountDeactivationToken(
			userId,
			metadata,
			input
		)

		return true
	}

	@Mutation(() => DeactivatedUserModel)
	public async deactivateAccount(
		@Args('deactivateAccountInput')
		input: TokenInput,
		@Context() context: Ctx
	): Promise<DeactivatedUserModelInterface> {
		const { token } = input
		const deactivatedUser =
			await this.deactivateAccountService.deactivateAccount(token, context)

		return deactivatedUser
	}
}
