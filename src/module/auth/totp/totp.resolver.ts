import { Args, Mutation, Resolver } from '@nestjs/graphql'

import { Authorization } from '../../../shared/decorator/authorization.decorator'
import { CurrentUserId } from '../../../shared/decorator/current-user-id.decorator'
import { GenerateTOTPModel } from '../../../shared/model/generate-totp.model'

import { TOTPInput } from './input/totp.input'
import { TotpService } from './totp.service'

@Resolver()
export class TotpResolver {
	constructor(private readonly totpService: TotpService) {}

	@Authorization()
	@Mutation(() => GenerateTOTPModel)
	public async generateTOTPSecret(
		@CurrentUserId() userId: string
	): Promise<GenerateTOTPModel> {
		return await this.totpService.generate(userId)
	}

	@Authorization()
	@Mutation(() => Boolean)
	public async enableTOTP(
		@CurrentUserId() userId: string,
		@Args('enableTotpInput') input: TOTPInput
	) {
		await this.totpService.enableTOTP(userId, input)

		return true
	}

	@Authorization()
	@Mutation(() => Boolean)
	public async disableTOTP(
		@CurrentUserId() userId: string,
		@Args('disableTotpInput') input: TOTPInput
	) {
		await this.totpService.disableTOTP(userId, input)
		return true
	}
}
