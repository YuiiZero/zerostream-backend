import { Module } from '@nestjs/common'

import { TokenModule } from '../../global/token/token.module'
import { TokenService } from '../../global/token/token.service'

import { RecoveryResolver } from './recovery.resolver'
import { RecoveryService } from './recovery.service'

@Module({
	imports: [TokenModule],
	providers: [RecoveryResolver, RecoveryService, TokenService]
})
export class RecoveryModule {}
