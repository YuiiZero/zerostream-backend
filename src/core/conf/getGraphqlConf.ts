import { ApolloDriverConfig } from '@nestjs/apollo'
import { ConfigService } from '@nestjs/config'
import { join } from 'node:path'

import { Ctx } from '../../shared/types/type'

export function getGraphqlConf(
	configService: ConfigService
): Omit<ApolloDriverConfig, 'driver'> {
	return {
		playground: false,
		autoSchemaFile: join(process.cwd(), 'gql', 'schema.gql'),
		sortSchema: true,
		context: ({ req, res }: Ctx) => ({ req, res }),
		path: configService.getOrThrow<string>('GRAPHQL_PREFIX')
	}
}
