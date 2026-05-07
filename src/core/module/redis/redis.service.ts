import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { RedisStore } from 'connect-redis'
import Redis from 'ioredis'

import { isDev } from '../../../shared/util/isDev.util'

@Injectable()
export class RedisService {
	client: Redis
	store?: RedisStore

	constructor(private configService: ConfigService) {
		this.client = new Redis({
			host: isDev(configService)
				? 'localhost'
				: configService.getOrThrow<string>('REDIS_HOST')
		})
	}

	getClient() {
		return this.client
	}

	getStore() {
		if (this.store) {
			return this.store
		}

		this.store = new RedisStore({
			client: this,
			prefix: this.configService.getOrThrow<string>('REDIS_PREFIX')
		})

		return this.store
	}
}
