import {
	createParamDecorator,
	ExecutionContext,
	UnauthorizedException
} from '@nestjs/common'
import { GqlExecutionContext } from '@nestjs/graphql'

import { UserModel } from '../model/user.model'
import { Ctx } from '../types/type'

export const CurrentUser = createParamDecorator(
	(data: keyof UserModel, context: ExecutionContext) => {
		const { req }: Ctx = GqlExecutionContext.create(context).getContext()
		const user = req.session.user

		if (!user) throw new UnauthorizedException('User is unauthorized')

		return data ? user[data] : user
	}
)
