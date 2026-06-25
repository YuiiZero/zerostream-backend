import { Module } from '@nestjs/common'

import { VerifyModule } from '../../account/verify/verify.module'
import { VerifyService } from '../../account/verify/verify.service'
import { UserService } from '../../global/user/user.service'
import { SessionModule } from '../session/session.module'
import { SessionService } from '../session/session.service'
import { TotpModule } from '../totp/totp.module'
import { TotpService } from '../totp/totp.service'

import { AccountResolver } from './account.resolver'
import { AccountService } from './account.service'

@Module({
	imports: [VerifyModule, TotpModule, SessionModule],
	providers: [
		AccountResolver,
		AccountService,
		VerifyService,
		TotpService,
		UserService,
		SessionService
	]
})
export class AccountModule {}
