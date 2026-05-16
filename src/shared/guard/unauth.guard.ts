import {
	CanActivate,
	ConflictException,
	ExecutionContext
} from '@nestjs/common'
import { GqlExecutionContext } from '@nestjs/graphql'

import { Ctx } from '../types/type'

export class UnauthorizedGuard implements CanActivate {
	canActivate(context: ExecutionContext): boolean {
		const { req }: Ctx = GqlExecutionContext.create(context).getContext()

		if (req.session.user) {
			throw new ConflictException('User is already authorized')
		}
		return true
	}
}
