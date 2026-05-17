import {
	createParamDecorator,
	ExecutionContext,
	InternalServerErrorException
} from '@nestjs/common'
import { GqlExecutionContext } from '@nestjs/graphql'

import { Ctx } from '../types/type'

export const Ip = createParamDecorator(
	(_data: unknown, context: ExecutionContext) => {
		const { req }: Ctx = GqlExecutionContext.create(context).getContext()
		const { ip } = req

		if (!ip) throw new InternalServerErrorException('Could not resolve user ip')

		return ip
	}
)
