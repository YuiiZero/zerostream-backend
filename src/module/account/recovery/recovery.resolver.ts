import { ConfigService } from '@nestjs/config'
import { Args, Context, Mutation, Resolver } from '@nestjs/graphql'

import { Authorization } from '../../../shared/decorator/authorization.decorator'
import { CurrentUserId } from '../../../shared/decorator/current-user-id.decorator'
import { Ip } from '../../../shared/decorator/ip.decorator'
import { Unauthorized } from '../../../shared/decorator/unauthorized.decorator'
import { UserAgent } from '../../../shared/decorator/user-agent.decorator'
import { Ctx } from '../../../shared/types/type'
import { getSessionMetadata } from '../../../shared/util/getSessionMetadata'

import {
	ResetPasswordInput,
	SendResetPasswordTokenAuthorizedInput,
	SendResetPasswordTokenUnauthorizedInput
} from './input/recovery.input'
import { RecoveryService } from './recovery.service'

@Resolver()
export class RecoveryResolver {
	public constructor(
		private readonly recoveryService: RecoveryService,
		private readonly configService: ConfigService
	) {}

	@Authorization()
	@Mutation(() => Boolean)
	public async sendResetPasswordTokenAuthorized(
		@UserAgent() userAgent: string,
		@Ip() ip: string,
		@CurrentUserId() userId: string,
		@Args('sendResetPasswordTokenAuthorizedInput')
		input: SendResetPasswordTokenAuthorizedInput
	): Promise<boolean> {
		const metadata = await getSessionMetadata(this.configService, userAgent, ip)
		await this.recoveryService.sendResetPasswordToken(metadata, userId, input)

		return true
	}

	@Unauthorized()
	@Mutation(() => Boolean)
	public async sendResetPasswordTokenUnauthorized(
		@UserAgent() userAgent: string,
		@Ip() ip: string,
		@Args('sendResetPasswordTokenUnauthorizedInput')
		input: SendResetPasswordTokenUnauthorizedInput
	): Promise<boolean> {
		const metadata = await getSessionMetadata(this.configService, userAgent, ip)

		await this.recoveryService.sendResetPasswordToken(metadata, input)

		return true
	}

	@Mutation(() => Boolean)
	public async resetPassword(
		@Args('resetPasswordInput') input: ResetPasswordInput,
		@Context() { req }: Ctx
	): Promise<boolean> {
		await this.recoveryService.resetPassword(input, req.sessionID)

		return true
	}
}
