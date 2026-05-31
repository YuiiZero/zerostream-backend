import { Module } from '@nestjs/common'

import { VerifyResolver } from './verify.resolver'
import { VerifyService } from './verify.service'

@Module({
	providers: [VerifyService, VerifyResolver]
})
export class VerifyModule {}
