import {
	createParamDecorator,
	ExecutionContext,
	UnauthorizedException
} from '@nestjs/common'
import { GqlExecutionContext } from '@nestjs/graphql'

import { Ctx } from '../types/type'
import { SessionUser } from '../types/user.type'

export const CurrentUserId = createParamDecorator(
	(data: null, context: ExecutionContext) => {
		const { req }: Ctx = GqlExecutionContext.create(context).getContext()
		const sessionUser: SessionUser | undefined = req.session.user

		if (!sessionUser) throw new UnauthorizedException('User is unauthorized')

		return sessionUser.id
	}
)
