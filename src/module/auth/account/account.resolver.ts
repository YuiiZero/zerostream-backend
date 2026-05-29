import { ConfigService } from '@nestjs/config'
import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql'

import { Authorization } from '../../../shared/decorator/authorization.decorator'
import { CurrentUser } from '../../../shared/decorator/current-user.decorator'
import { Unauthorized } from '../../../shared/decorator/unauthorized.decorator'
import { UserModel } from '../../../shared/model/user.model'
import { LoginPipe } from '../../../shared/pipe/login.pipe'
import { Ctx } from '../../../shared/types/type'
import { VerifyService } from '../../verify/verify.service'
import { SessionService } from '../session/session.service'

import { AccountService } from './account.service'
import { LoginInput } from './input/Login.input'
import { RegisterInput } from './input/Register.input'

@Resolver()
export class AccountResolver {
	sessionCookieName: string

	constructor(
		private readonly accountService: AccountService,
		private readonly configService: ConfigService,
		private readonly sessionService: SessionService,
		private readonly verifyService: VerifyService
	) {
		this.sessionCookieName = configService.getOrThrow<string>('SESSION_NAME')
	}

	@Unauthorized()
	@Mutation(() => Boolean)
	async register(
		@Args('registerCredentials')
		registerInput: RegisterInput
	) {
		const user = await this.accountService.register(registerInput)
		await this.verifyService.sendEmailVerificationLink(user.email)

		return true
	}

	@Unauthorized()
	@Mutation(() => Boolean)
	async login(
		@Context() { req }: Ctx,
		@Args('loginCredentials', LoginPipe)
		loginInput: LoginInput
	) {
		const user = await this.accountService.login(loginInput)
		await this.sessionService.saveCurrentSession(req, user)

		return true
	}

	@Authorization()
	@Mutation(() => Boolean)
	async logout(@Context() { req, res }: Ctx) {
		await this.sessionService.deleteCurrentSession(req, res)
		return true
	}

	@Authorization()
	@Mutation(() => Boolean)
	async deleteSession(
		@Context() { req }: Ctx,
		@Args('sessionID') sessionID: string
	) {
		await this.sessionService.deleteSession(req, sessionID)
		return true
	}

	@Authorization()
	@Query(() => UserModel)
	async me(@CurrentUser() user: UserModel) {
		return user
	}
}
