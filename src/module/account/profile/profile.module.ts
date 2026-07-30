import { Module } from '@nestjs/common'

import { UploadModule } from '../../upload/upload.module'
import { UploadService } from '../../upload/upload.service'

import { ProfileResolver } from './profile.resolver'
import { ProfileService } from './profile.service'

@Module({
	imports: [UploadModule],
	providers: [ProfileResolver, ProfileService, UploadService]
})
export class ProfileModule {}
