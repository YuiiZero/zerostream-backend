import { Context, Query, Resolver } from '@nestjs/graphql'

import { Authorization } from '../../../shared/decorator/authorization.decorator'
import { CurrentUser } from '../../../shared/decorator/current-user.decorator'
import { SessionModel } from '../../../shared/model/session.model'
import { UserModel } from '../../../shared/model/user.model'
import { Ctx } from '../../../shared/types/type'

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
	getAllCurrentUserSessions(@CurrentUser() user: UserModel) {
		return this.sessionService.getAllCurrentUserSessions(user)
	}
}
