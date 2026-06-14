import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import { GqlExecutionContext } from '@nestjs/graphql'

import { SessionMetadata as SessionMetadataType } from '../types/metadata.type'
import { Ctx } from '../types/type'

export const SessionMetadata = createParamDecorator(
	(data: keyof SessionMetadataType | null, context: ExecutionContext) => {
		const { req }: Ctx = GqlExecutionContext.create(context).getContext()
		const metadata: SessionMetadataType | undefined = req.session.metadata
		return metadata
	}
)
