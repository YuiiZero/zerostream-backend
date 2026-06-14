import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql'
import { SessionData } from 'express-session'

import { Authorization } from '../../../shared/decorator/authorization.decorator'
import { CurrentUserId } from '../../../shared/decorator/current-user-id.decorator'
import { SessionMetadata } from '../../../shared/decorator/session-metadata.decorator'
import {
	SessionMetadataModel,
	SessionModel
} from '../../../shared/model/session.model'
import { SessionMetadata as SessionMetadataType } from '../../../shared/types/metadata.type'
import { Ctx } from '../../../shared/types/type'
import { toSessionModel } from '../../../shared/util/toSessionModel.util'

import { SessionService } from './session.service'

@Resolver()
export class SessionResolver {
	constructor(private readonly sessionService: SessionService) {}

	@Authorization()
	@Query(() => SessionModel)
	public getCurrentSession(@Context() { req }: Ctx): SessionModel {
		const sessionData = req.session as SessionData
		return toSessionModel(sessionData)
	}

	@Authorization()
	@Query(() => [SessionModel])
	public getAllCurrentUserSessions(
		@CurrentUserId() userId: string
	): Promise<SessionModel[]> {
		return this.sessionService.getAllUserSessions(userId)
	}

	@Authorization()
	@Query(() => SessionMetadataModel)
	public getSessionMetadata(@SessionMetadata() metadata: SessionMetadataType) {
		return metadata
	}

	@Authorization()
	@Mutation(() => Boolean)
	public async revokeSession(
		@Args('sessionID') sessID: string,
		@Context() { req }: Ctx
	) {
		await this.sessionService.deleteSession(req, sessID)
		return true
	}
}
