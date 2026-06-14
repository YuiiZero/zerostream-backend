import { NotFoundException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Args, Mutation, Resolver } from '@nestjs/graphql'
import { StringValue } from 'ms'

import { TokenService } from '../../../module/service/token/token.service'
import { Authorization } from '../../../shared/decorator/authorization.decorator'
import { CurrentUserId } from '../../../shared/decorator/current-user-id.decorator'
import { SessionMetadata } from '../../../shared/decorator/session-metadata.decorator'
import { SessionMetadata as SessionMetadataType } from '../../../shared/types/metadata.type'
import { PrismaService } from '../prisma/prisma.service'

import { MailService } from './mail.service'

@Resolver()
export class MailResolver {
	allowedOrigin: string
	constructor(
		private readonly mailService: MailService,
		private readonly configService: ConfigService,
		private readonly prismaService: PrismaService,
		private readonly tokenService: TokenService
	) {
		this.allowedOrigin = this.configService.getOrThrow('ALLOWED_ORIGIN')
	}

	@Mutation(() => Boolean)
	async sendEmailVerifiationEmail(@Args('to') to: string): Promise<boolean> {
		const user = await this._getCurrentUserByEmail(to)
		const tokenObject =
			await this.tokenService.generateEmailVerificationToken(user)
		const { token } = tokenObject

		this.mailService.sendEmailVerificationEmail({
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
		const user = await this._getCurrentUserByEmail(to)
		const tokenObject =
			await this.tokenService.generatePasswordRecoveryToken(user)
		const { token } = tokenObject

		this.mailService.sendPasswordRecoveryEmail({
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
		@CurrentUserId() userId: string,
		@SessionMetadata() metadata: SessionMetadataType
	): Promise<boolean> {
		const user = await this._getCurrentUserById(userId)
		const tokenObject =
			await this.tokenService.generateAccountDeactivationToken(user)
		const { token } = tokenObject
		const pincodeTTL = this.configService.getOrThrow<StringValue>(
			'DEACTIVATION_TOKEN_TTL'
		)

		this.mailService.sendAccountDeactivationEmail({
			to: user.email,
			token,
			metadata,
			pincodeTTL
		})

		return true
	}

	private async _getCurrentUserByEmail(email: string) {
		const user = await this.prismaService.user.findFirst({
			where: { email }
		})

		if (!user) throw new NotFoundException('Cannot send email: user not found')

		return user
	}

	private async _getCurrentUserById(id: string) {
		const user = await this.prismaService.user.findFirst({
			where: { id }
		})

		if (!user) throw new NotFoundException('Cannot send email: user not found')

		return user
	}
}
