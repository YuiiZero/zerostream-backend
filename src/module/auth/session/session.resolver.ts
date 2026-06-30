import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql'
import { SessionData } from 'express-session'

import { Authorization } from '../../../shared/decorator/authorization.decorator'
import { CurrentUserId } from '../../../shared/decorator/current-user-id.decorator'
import { SessionModel } from '../../../shared/model/session.model'
import { Ctx } from '../../../shared/types/type'
import { toSessionModel } from '../../../shared/util/toSessionModel.util'

import { SessionService } from './session.service'

@Resolver()
export class SessionResolver {
	public constructor(private readonly sessionService: SessionService) {}

	@Authorization()
	@Query(() => SessionModel)
	public getCurrentSession(@Context() { req }: Ctx): SessionModel {
		const sessionData = req.session as SessionData

		return toSessionModel(sessionData)
	}

	@Authorization()
	@Query(() => [SessionModel])
	public async getUserSessions(
		@CurrentUserId() userId: string
	): Promise<SessionModel[]> {
		const sessionData = await this.sessionService.getSessions(userId)

		return sessionData.map(sData => toSessionModel(sData))
	}

	@Authorization()
	@Mutation(() => Boolean)
	public async deleteSession(
		@Args('sessionId') sessionId: string,
		@Context() context: Ctx
	): Promise<boolean> {
		await this.sessionService.deleteSession(sessionId, context)

		return true
	}
}
