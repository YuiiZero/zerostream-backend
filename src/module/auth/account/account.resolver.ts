import { ConfigService } from '@nestjs/config'
import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql'

import { Authorization } from '../../../shared/decorator/authorization.decorator'
import { CurrentUserId } from '../../../shared/decorator/current-user-id.decorator'
import { Unauthorized } from '../../../shared/decorator/unauthorized.decorator'
import { MessageModel } from '../../../shared/model/message.model'
import { PrivateUserModel } from '../../../shared/model/user.model'
import { LoginPipe } from '../../../shared/pipe/login.pipe'
import { Ctx } from '../../../shared/types/type'
import { MailService } from '../../mail/mail.service'
import { TokenService } from '../../service/token/token.service'
import { UserService } from '../../service/user/user.service'
import { SessionService } from '../session/session.service'

import { AccountService } from './account.service'
import { ChangePasswordInput } from './input/ChangePassword.input.ts'
import { LoginInput } from './input/Login.input'
import { RegisterInput } from './input/Register.input'

@Resolver()
export class AccountResolver {
	public readonly sessionCookieName: string

	public constructor(
		private readonly accountService: AccountService,
		private readonly configService: ConfigService,
		private readonly sessionService: SessionService,
		private readonly mailService: MailService,
		private readonly tokenService: TokenService,
		private readonly userService: UserService
	) {
		this.sessionCookieName = configService.getOrThrow<string>('SESSION_NAME')
	}

	@Unauthorized()
	@Mutation(() => MessageModel)
	public async register(
		@Args('registerCredentials')
		registerInput: RegisterInput
	): Promise<MessageModel> {
		const user = await this.accountService.register(registerInput)
		const sessionUser = await this.userService.toSessionUser(user)
		const { token } =
			await this.tokenService.generateEmailVerificationToken(sessionUser)
		const domain = this.configService.getOrThrow('ALLOWED_ORIGIN')

		await this.mailService.sendEmailVerificationEmail({
			domain,
			to: registerInput.email,
			token
		})

		return { message: 'Verify your email to finish registration' }
	}

	@Unauthorized()
	@Mutation(() => Boolean)
	public async login(
		@Context() { req }: Ctx,
		@Args('loginCredentials', LoginPipe)
		loginInput: LoginInput
	): Promise<boolean> {
		const publicUser = await this.accountService.login(loginInput)
		await this.sessionService.saveCurrentSession(req, publicUser)

		return true
	}

	@Authorization()
	@Mutation(() => Boolean)
	public async logout(@Context() { req, res }: Ctx): Promise<boolean> {
		await this.sessionService.deleteCurrentSession(req, res)

		return true
	}

	@Authorization()
	@Mutation(() => Boolean)
	public async deleteSession(
		@Context() { req }: Ctx,
		@Args('sessionID') sessionID: string
	): Promise<boolean> {
		await this.sessionService.deleteSession(req, sessionID)

		return true
	}

	@Authorization()
	@Query(() => PrivateUserModel)
	public async me(@CurrentUserId() id: string): Promise<PrivateUserModel> {
		return this.accountService.me(id)
	}

	@Authorization()
	@Mutation(() => Boolean)
	public async changePassword(
		@Args('changePasswordInput') input: ChangePasswordInput,
		@CurrentUserId() userId: string
	): Promise<boolean> {
		return this.accountService.changePassword(userId, input)
	}
}
