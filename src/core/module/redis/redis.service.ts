import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { RedisStore } from 'connect-redis'
import { createClient, RedisClientType } from 'redis'

@Injectable()
export class RedisService {
	public readonly client: RedisClientType
	public readonly store: RedisStore

	public constructor(private readonly configService: ConfigService) {
		this.client = createClient({
			socket: {
				host: configService.getOrThrow('REDIS_HOST'),
				port: +configService.getOrThrow('REDIS_PORT')
			}
		})

		this.client.connect()

		this.client.on('error', e => {
			console.error(e)
		})

		this.store = new RedisStore({
			client: this.client,
			prefix: this.configService.getOrThrow<string>('REDIS_PREFIX')
		})
	}
}
