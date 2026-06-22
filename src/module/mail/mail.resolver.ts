import { ConfigService } from '@nestjs/config'
import { Args, Mutation, Resolver } from '@nestjs/graphql'
import { StringValue } from 'ms'

import { Authorization } from '../../shared/decorator/authorization.decorator'
import { CurrentUserId } from '../../shared/decorator/current-user-id.decorator'
import { SessionMetadata } from '../../shared/decorator/session-metadata.decorator'
import { SessionMetadata as SessionMetadataType } from '../../shared/types/metadata.type'
import { TokenService } from '../service/token/token.service'
import { UserService } from '../service/user/user.service'

import { MailService } from './mail.service'

@Resolver()
export class MailResolver {
	allowedOrigin: string
	constructor(
		private readonly mailService: MailService,
		private readonly configService: ConfigService,
		private readonly tokenService: TokenService,
		private readonly userService: UserService
	) {
		this.allowedOrigin = this.configService.getOrThrow('ALLOWED_ORIGIN')
	}

	@Mutation(() => Boolean)
	async sendEmailVerificationEmail(@Args('to') to: string): Promise<boolean> {
		const user = await this.userService.getUnique('email', to)
		const tokenObject =
			await this.tokenService.generateEmailVerificationToken(user)
		const { token } = tokenObject

		await this.mailService.sendEmailVerificationEmail({
			domain: this.allowedOrigin,
			to,
			token
		})

		return true
	}

	@Mutation(() => Boolean)
	async sendPasswordRecoveryEmail(
		@Args('to') to: string,
		@SessionMetadata() metadata: SessionMetadataType
	): Promise<boolean> {
		const user = await this.userService.getUnique('email', to)
		const tokenObject =
			await this.tokenService.generatePasswordRecoveryToken(user)
		const { token } = tokenObject

		await this.mailService.sendPasswordRecoveryEmail({
			domain: this.allowedOrigin,
			to,
			token,
			metadata
		})

		return true
	}

	@Authorization()
	@Mutation(() => Boolean)
	async sendAccountDeactivationEmail(
		@CurrentUserId() id: string,
		@SessionMetadata() metadata: SessionMetadataType
	): Promise<boolean> {
		const user = await this.userService.getUnique('id', id)
		const tokenObject =
			await this.tokenService.generateAccountDeactivationToken(user)
		const { token } = tokenObject
		const pincodeTTL = this.configService.getOrThrow<StringValue>(
			'DEACTIVATION_TOKEN_TTL'
		)

		await this.mailService.sendAccountDeactivationEmail({
			token,
			to: user.email,
			metadata,
			pincodeTTL
		})

		return true
	}

	@Mutation(() => Boolean)
	async sendAccountDeletionEmail(@Args('to') to: string): Promise<boolean> {
		await this.mailService.sendAccountDeletionEmail({
			domain: this.allowedOrigin,
			to
		})

		return true
	}
}
