import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql'

import { Authorization } from '../../../shared/decorator/authorization.decorator'
import { CurrentUserId } from '../../../shared/decorator/current-user-id.decorator'
import { Unauthorized } from '../../../shared/decorator/unauthorized.decorator'
import { MessageModel } from '../../../shared/model/message.model'
import { PrivateUserModel } from '../../../shared/model/user.model'
import { LoginPipe } from '../../../shared/pipe/login.pipe'
import { Ctx } from '../../../shared/types/type'
import { SessionService } from '../session/session.service'

import { AccountService } from './account.service'
import { LoginInput } from './input/Login.input'
import { RegisterInput } from './input/Register.input'
import { RegisterMessageModel } from './model/RegisterUser.model'

@Resolver()
export class AccountResolver {
	public constructor(
		private readonly accountService: AccountService,
		private readonly sessionService: SessionService
	) {}

	@Unauthorized()
	@Mutation(() => RegisterMessageModel)
	public register(
		@Args('registerInput')
		registerInput: RegisterInput
	): Promise<MessageModel> {
		return this.accountService.register(registerInput)
	}

	@Unauthorized()
	@Mutation(() => Boolean)
	public async login(
		@Context() { req }: Ctx,
		@Args('loginInput', LoginPipe)
		loginInput: LoginInput
	): Promise<boolean> {
		const user = await this.accountService.getLoginUser(loginInput)
		await this.sessionService.createSession(user.id, req)

		return true
	}

	@Authorization()
	@Mutation(() => Boolean)
	public async logout(@Context() { req }: Ctx): Promise<boolean> {
		await this.sessionService.deleteSession(req.sessionID)

		return true
	}

	@Authorization()
	@Mutation(() => Boolean)
	public async deleteSession(
		@Context() context: Ctx,
		@Args('sessionId') sessionId: string
	): Promise<boolean> {
		await this.sessionService.deleteSession(sessionId, context)

		return true
	}

	@Authorization()
	@Query(() => PrivateUserModel)
	public async me(@CurrentUserId() id: string): Promise<PrivateUserModel> {
		return this.accountService.me(id)
	}
}
