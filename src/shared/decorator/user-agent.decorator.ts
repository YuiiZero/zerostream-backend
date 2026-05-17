import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import { GqlExecutionContext } from '@nestjs/graphql'

import { Ctx } from '../types/type'

export const UserAgent = createParamDecorator(
	(_data: unknown, context: ExecutionContext) => {
		const { req }: Ctx = GqlExecutionContext.create(context).getContext()
		return req.headers['user-agent']
	}
)
