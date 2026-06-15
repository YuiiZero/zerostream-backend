import { Module } from '@nestjs/common'

import { TotpModule } from '../auth/totp/totp.module'
import { TotpService } from '../auth/totp/totp.service'
import { TokenModule } from '../service/token/token.module'
import { TokenService } from '../service/token/token.service'

import { DeactivateResolver } from './deactivate.resolver'
import { DeactivateService } from './deactivate.service'

@Module({
	imports: [TokenModule, TotpModule],
	providers: [DeactivateResolver, DeactivateService, TokenService, TotpService]
})
export class DeactivateModule {}
