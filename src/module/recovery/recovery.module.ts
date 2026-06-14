import { Module } from '@nestjs/common'

import { TokenModule } from '../service/token/token.module'
import { TokenService } from '../service/token/token.service'

import { RecoveryResolver } from './recovery.resolver'
import { RecoveryService } from './recovery.service'

@Module({
	imports: [TokenModule],
	providers: [RecoveryResolver, RecoveryService, TokenService]
})
export class RecoveryModule {}
