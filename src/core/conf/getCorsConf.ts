import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface'
import { ConfigService } from '@nestjs/config'

import { HTTP_HEADERS } from '../../shared/types/type'

export const getCorsConfig = (config: ConfigService): CorsOptions => ({
	origin: config.getOrThrow<string>('ALLOWED_ORIGIN'),
	credentials: true,
	exposedHeaders: [HTTP_HEADERS.SET_COOKIE]
})
