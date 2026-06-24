import { Module } from '@nestjs/common'

import { TotpModule } from '../../auth/totp/totp.module'
import { TotpService } from '../../auth/totp/totp.service'
import { TokenModule } from '../../service/token/token.module'
import { TokenService } from '../../service/token/token.service'

import { DeactivateAccountResolver } from './deactivate-account.resolver'
import { DeactivateAccountService } from './deactivate-account.service'

@Module({
	imports: [TokenModule, TotpModule],
	providers: [
		DeactivateAccountResolver,
		DeactivateAccountService,
		TokenService,
		TotpService
	]
})
export class DeactivateModule {}
