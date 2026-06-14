import { Module } from '@nestjs/common'

import { TokenModule } from '../service/token/token.module'
import { TokenService } from '../service/token/token.service'

import { DeactivateResolver } from './deactivate.resolver'
import { DeactivateService } from './deactivate.service'

@Module({
	imports: [TokenModule],
	providers: [DeactivateResolver, DeactivateService, TokenService]
})
export class DeactivateModule {}
