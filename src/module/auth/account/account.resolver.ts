import { InternalServerErrorException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql'
import { Response } from 'express'
import type { Session, SessionData } from 'express-session'

import { User } from '../../../../prisma/generated/prisma/client'
import { Authorization } from '../../../shared/decorator/authorization.decorator'
import { UserModel } from '../../../shared/model/user.model'
import { LoginPipe } from '../../../shared/pipe/login.pipe'
import { Ctx } from '../../../shared/types/type'

import { AccountService } from './account.service'
import { LoginInput } from './input/Login.input'
import { RegisterInput } from './input/Register.input'

@Resolver()
export class AccountResolver {
	sessionCookieName: string

	constructor(
		private readonly accountService: AccountService,
		private readonly configService: ConfigService
	) {
		this.sessionCookieName = configService.getOrThrow<string>('SESSION_NAME')
	}

	@Mutation(() => UserModel)
	async register(
		@Context() { req }: Ctx,
		@Args('registerCredentials')
		registerInput: RegisterInput
	) {
		const user = await this.accountService.register(registerInput)
		return await this.saveSession(req.session, user)
	}

	@Mutation(() => UserModel)
	async login(
		@Context() { req }: Ctx,
		@Args('loginCredentials', LoginPipe)
		loginInput: LoginInput
	) {
		const user = await this.accountService.login(loginInput)
		return await this.saveSession(req.session, user)
	}

	@Authorization()
	@Mutation(() => Boolean)
	async logout(@Context() { req, res }: Ctx) {
		const response = await this.destroySession(req.session, res)
		return response
	}

	@Authorization()
	@Query(() => UserModel, { nullable: true })
	me(@Context() { req }: Ctx) {
		return req.session.user
	}

	private saveSession(
		session: Session & Partial<SessionData>,
		user: UserModel
	): Promise<Omit<User, 'password'>> {
		return new Promise((resolve, reject) => {
			session.user = user

			session.save(err => {
				if (err) {
					console.error(err)
					return reject(
						new InternalServerErrorException('Could not save session', {
							cause: err
						})
					)
				}

				if (!session.user)
					return reject(
						new InternalServerErrorException(`session.user is ${session.user}`)
					)

				resolve(session.user)
			})
		})
	}

	private destroySession(
		session: Session & Partial<SessionData>,
		res: Response
	): Promise<boolean> {
		return new Promise((resolve, reject) => {
			session.user = null

			session.destroy((err: unknown) => {
				if (err)
					return reject(
						new InternalServerErrorException('Could not destroy session', {
							cause: err
						})
					)

				res.clearCookie(this.sessionCookieName)
				resolve(true)
			})
		})
	}
}
