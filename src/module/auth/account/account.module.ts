import { Module } from '@nestjs/common'

import { TokenModule } from '../../service/token/token.module'
import { TokenService } from '../../service/token/token.service'
import { UserModule } from '../../service/user/user.module'
import { UserService } from '../../service/user/user.service'
import { SessionModule } from '../session/session.module'
import { SessionService } from '../session/session.service'

import { AccountResolver } from './account.resolver'
import { AccountService } from './account.service'

@Module({
	imports: [SessionModule, TokenModule, UserModule],
	providers: [
		AccountResolver,
		AccountService,
		SessionService,
		TokenService,
		UserService
	]
})
export class AccountModule {}
