import { Args, Mutation, Resolver } from '@nestjs/graphql'

import {
	SendVerifyEmailTokenInput,
	VerifyEmailInput
} from './input/verify-email.input'
import { VerifyService } from './verify.service'

@Resolver()
export class VerifyResolver {
	public constructor(private readonly verifyService: VerifyService) {}

	@Mutation(() => Boolean)
	public async sendVerifyEmailToken(
		@Args('sendVerifyEmailTokenInput') input: SendVerifyEmailTokenInput
	): Promise<boolean> {
		await this.verifyService.sendVerifyEmailToken(input)

		return true
	}

	@Mutation(() => Boolean)
	public async verifyEmail(
		@Args('verifyEmailInput') input: VerifyEmailInput
	): Promise<boolean> {
		await this.verifyService.verifyEmail(input)

		return true
	}
}
