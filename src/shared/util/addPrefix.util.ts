import { ConfigService } from '@nestjs/config'

export function addSessionPrefix(
	sessionId: string,
	configService: ConfigService
) {
	const prefix = configService.getOrThrow<string>('REDIS_PREFIX')
	return prefix + sessionId
}
