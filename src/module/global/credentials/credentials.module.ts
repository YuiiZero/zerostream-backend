import { Global, Module } from '@nestjs/common'

import { TotpService } from '../../auth/totp/totp.service'

import { CredentialsService } from './credentials.service'

@Global()
@Module({
	providers: [CredentialsService, TotpService]
})
export class CredentialsModule {}
