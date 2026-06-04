import { Args, Mutation, Resolver } from '@nestjs/graphql'
import { Query } from '@nestjs/graphql'

import { Authorization } from '../../../shared/decorator/authorization.decorator'
import { CurrentUser } from '../../../shared/decorator/current-user.decorator'
import { GenerateTOTPModel } from '../../../shared/model/generate-totp.model'
import { UserModel } from '../../../shared/model/user.model'

import { TOTPInput } from './input/totp.input'
import { TotpService } from './totp.service'

@Resolver()
export class TotpResolver {
	constructor(private readonly totpService: TotpService) {}

	@Authorization()
	@Query(() => GenerateTOTPModel)
	generateTotpSecret(@CurrentUser() user: UserModel) {
		return this.totpService.generate(user)
	}

	@Authorization()
	@Mutation(() => Boolean, { name: 'enableTotp' })
	async enableTOTP(
		@CurrentUser() user: UserModel,
		@Args('enableTotpInput') input: TOTPInput
	) {
		await this.totpService.enableTOTP(user, input)
		return true
	}

	@Authorization()
	@Mutation(() => Boolean, { name: 'disableTotp' })
	async disableTOTP(
		@CurrentUser() user: UserModel,
		@Args('disableTotpInput') input: TOTPInput
	) {
		await this.totpService.disableTOTP(user, input)
		return true
	}
}
