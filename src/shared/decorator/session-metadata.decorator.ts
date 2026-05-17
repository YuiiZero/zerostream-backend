import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import { GqlExecutionContext } from '@nestjs/graphql'

import { Ctx, SessionMetadata as SessionMetadataType } from '../types/type'

export const SessionMetadata = createParamDecorator(
	(data: keyof SessionMetadataType | null, context: ExecutionContext) => {
		const { req }: Ctx = GqlExecutionContext.create(context).getContext()
		const metadata: SessionMetadataType | null = req.session.metadata
		return metadata
	}
)
