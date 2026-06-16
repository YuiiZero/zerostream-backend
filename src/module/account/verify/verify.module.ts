import { Module } from '@nestjs/common'

import { TokenModule } from '../../service/token/token.module'
import { TokenService } from '../../service/token/token.service'

import { VerifyResolver } from './verify.resolver'
import { VerifyService } from './verify.service'

@Module({
	imports: [TokenModule],
	providers: [VerifyResolver, VerifyService, TokenService]
})
export class VerifyModule {}
