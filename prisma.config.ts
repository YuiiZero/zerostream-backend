import dotenv from 'dotenv'
import { dirname, join } from 'path'
import { defineConfig, env } from 'prisma/config'

dotenv.config({
	path:
		process.env['NODE_ENV'] === 'production'
			? join(dirname(__dirname), '.env.prod')
			: join(dirname(__dirname), '.env.dev')
})

export default defineConfig({
	schema: 'prisma/schema.prisma',
	migrations: {
		path: 'prisma/migrations'
	},
	datasource: {
		url: env('POSTGRES_URI')
	}
})
