import { Args, Mutation, Resolver } from '@nestjs/graphql'

import { Authorization } from '../../../shared/decorator/authorization.decorator'
import { CurrentUserId } from '../../../shared/decorator/current-user-id.decorator'
import { GenerateTOTPModel } from '../../../shared/model/generate-totp.model'

import { AddTotpInput } from './input/totp.input'
import { AddTotpOutputModel } from './model/AddTotpOutputModel'
import { TotpService } from './totp.service'

@Resolver()
export class TotpResolver {
	constructor(private readonly totpService: TotpService) {}

	@Authorization()
	@Mutation(() => GenerateTOTPModel)
	public async generateTotp(
		@CurrentUserId() userId: string
	): Promise<GenerateTOTPModel> {
		return await this.totpService.generateTotp(userId)
	}

	@Authorization()
	@Mutation(() => AddTotpOutputModel)
	public async addTotp(
		@CurrentUserId() userId: string,
		@Args('addTotpInput') input: AddTotpInput
	): Promise<AddTotpOutputModel> {
		const { pincode } = input
		const recoveryCodes = await this.totpService.addTotp(userId, pincode)
		const output: AddTotpOutputModel = { isTotpEnabled: true }

		if (recoveryCodes.length) output.recoveryCodes = recoveryCodes

		return output
	}

	@Authorization()
	@Mutation(() => Boolean)
	public async removeTotpByPincode(
		@CurrentUserId() userId: string,
		@Args('pincode') pincode: string
	) {
		await this.totpService.removeTotp(userId, { pincode })
		return true
	}

	@Authorization()
	@Mutation(() => Boolean)
	public async removeTotpByRecoveryCode(
		@CurrentUserId() userId: string,
		@Args('recoveryCode') recoveryCode: string
	) {
		await this.totpService.removeTotp(userId, { recoveryCode })
		return true
	}

	@Authorization()
	@Mutation(() => [String])
	public generateRecoveryCodes(
		@CurrentUserId() userId: string,
		@Args('pincode') pincode: string
	) {
		return this.totpService.generateRecoveryCodes(userId, pincode)
	}
}
