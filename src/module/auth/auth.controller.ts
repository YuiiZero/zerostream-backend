import { Controller, Get, HttpCode, HttpStatus, Query } from '@nestjs/common'

import { Unauthorized } from '../../shared/decorator/unauthorized.decorator'
import { VerifyService } from '../verify/verify.service'

@Controller('auth')
export class AuthController {
	constructor(private readonly verifyService: VerifyService) {}

	@Get('verify-email')
	@Unauthorized()
	@HttpCode(HttpStatus.NO_CONTENT)
	async verifyEmail(@Query('token') token: string) {
		await this.verifyService.verifyEmail(token)
	}
}
