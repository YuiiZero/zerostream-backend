import {
	CanActivate,
	ExecutionContext,
	UnauthorizedException
} from '@nestjs/common'
import { GqlExecutionContext } from '@nestjs/graphql'

import { Ctx } from '../types/type'

export class AuthGuard implements CanActivate {
	canActivate(context: ExecutionContext): boolean {
		const { req }: Ctx = GqlExecutionContext.create(context).getContext()

		if (!req.session.user) {
			throw new UnauthorizedException('User is not authorized')
		}

		return true
	}
}
