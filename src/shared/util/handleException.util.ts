import { HttpException, InternalServerErrorException } from '@nestjs/common'

export function handleException(e: unknown, message?: string): never {
	if (e instanceof HttpException)
		throw new HttpException(
			message ? `${message}: ${e.message}` : e.message,
			400,
			{ cause: e }
		)
	throw new InternalServerErrorException(e)
}
