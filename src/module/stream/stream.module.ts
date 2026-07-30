import { Module } from '@nestjs/common'

import { UploadModule } from '../upload/upload.module'
import { UploadService } from '../upload/upload.service'

import { StreamResolver } from './stream.resolver'
import { StreamService } from './stream.service'

@Module({
	imports: [UploadModule],
	providers: [StreamResolver, StreamService, UploadService]
})
export class StreamModule {}
