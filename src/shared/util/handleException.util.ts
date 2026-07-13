import { HttpException, InternalServerErrorException } from '@nestjs/common'
import { PinoLogger } from 'nestjs-pino'

export function handleException(
	logger: PinoLogger,
	e: unknown,
	message?: string
): never {
	if (e instanceof HttpException && e.getStatus() < 500) {
		logger.warn(e, message)
		throw e
	}

	logger.error(e, message)

	throw new InternalServerErrorException('Internal server error', { cause: e })
}
