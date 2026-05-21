import { ConfigService } from '@nestjs/config'
import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql'

import { Authorization } from '../../../shared/decorator/authorization.decorator'
import { CurrentUser } from '../../../shared/decorator/current-user.decorator'
import { Ip } from '../../../shared/decorator/ip.decorator'
import { Unauthorized } from '../../../shared/decorator/unauthorized.decorator'
import { UserAgent } from '../../../shared/decorator/user-agent.decorator'
import { UserModel } from '../../../shared/model/user.model'
import { LoginPipe } from '../../../shared/pipe/login.pipe'
import { Ctx } from '../../../shared/types/type'
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
		private readonly sessionService: SessionService
	) {
		this.sessionCookieName = configService.getOrThrow<string>('SESSION_NAME')
	}

	@Unauthorized()
	@Mutation(() => UserModel)
	async register(
		@Context() { req }: Ctx,
		@Args('registerCredentials')
		registerInput: RegisterInput,
		@UserAgent() userAgent: string,
		@Ip() userIp: string
	) {
		const user = await this.accountService.register(registerInput)
		return await this.sessionService.saveCurrentSession(
			req,
			req.session,
			user,
			userAgent,
			userIp
		)
	}

	@Unauthorized()
	@Mutation(() => UserModel)
	async login(
		@Context() { req }: Ctx,
		@Args('loginCredentials', LoginPipe)
		loginInput: LoginInput,
		@UserAgent() userAgent: string,
		@Ip() userIp: string
	) {
		const user = await this.accountService.login(loginInput)
		return await this.sessionService.saveCurrentSession(
			req,
			req.session,
			user,
			userAgent,
			userIp
		)
	}

	@Authorization()
	@Mutation(() => Boolean)
	async logout(@Context() { req, res }: Ctx, @CurrentUser() user: UserModel) {
		const response = await this.sessionService.deleteCurrentSession(
			req,
			req.session,
			res,
			user
		)
		return response
	}

	@Authorization()
	@Query(() => UserModel, { nullable: true })
	async me(@CurrentUser() user: UserModel) {
		return user
	}
}
