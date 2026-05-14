import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { RedisStore } from 'connect-redis'
import { createClient, RedisClientType } from 'redis'

@Injectable()
export class RedisService {
	client: RedisClientType
	store?: RedisStore

	constructor(private configService: ConfigService) {
		this.client = createClient({
			socket: {
				host: configService.getOrThrow<string>('REDIS_HOST'),
				port: configService.getOrThrow<number>('REDIS_PORT')
			}
		})

		this.client.connect()

		this.client.on('error', e => {
			console.error(e)
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
			client: this.client,
			prefix: this.configService.getOrThrow<string>('REDIS_PREFIX')
		})

		return this.store
	}
}
