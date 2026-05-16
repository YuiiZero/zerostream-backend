import { Module } from '@nestjs/common'

import { SessionModule } from '../session/session.module'
import { SessionService } from '../session/session.service'

import { AccountResolver } from './account.resolver'
import { AccountService } from './account.service'

@Module({
	imports: [SessionModule],
	providers: [AccountResolver, AccountService, SessionService]
})
export class AccountModule {}
