import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql'

import { Authorization } from '../../../shared/decorator/authorization.decorator'
import { CurrentUser } from '../../../shared/decorator/current-user.decorator'
import { SessionMetadata } from '../../../shared/decorator/session-metadata.decorator'
import {
	SessionMetadataModel,
	SessionModel
} from '../../../shared/model/session.model'
import { UserModel } from '../../../shared/model/user.model'
import { Ctx } from '../../../shared/types/type'
import { SessionMetadata as SessionMetadataType } from '../../../shared/types/type'

import { SessionService } from './session.service'

@Resolver()
export class SessionResolver {
	constructor(private readonly sessionService: SessionService) {}

	@Authorization()
	@Query(() => SessionModel)
	getCurrentSession(@Context() { req }: Ctx) {
		return req.session
	}

	@Authorization()
	@Query(() => [SessionModel])
	getAllCurrentUserSessions(
		@CurrentUser() user: UserModel,
		@Context() { req }: Ctx
	) {
		return this.sessionService.getAllCurrentUserSessions(user, req.session)
	}

	@Authorization()
	@Query(() => SessionMetadataModel)
	getSessionMetadata(@SessionMetadata() metadata: SessionMetadataType) {
		return metadata
	}

	@Authorization()
	@Mutation(() => Boolean)
	deleteSessionById(
		@Context() { req }: Ctx,
		@CurrentUser() user: UserModel,
		@Args('sessionID') sessionID: string
	) {
		this.sessionService.deleteSessionById(req, user, sessionID)
		return true
	}
}
