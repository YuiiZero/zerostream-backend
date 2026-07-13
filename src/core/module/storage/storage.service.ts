import {
	DeleteObjectCommand,
	PutObjectCommand,
	S3Client
} from '@aws-sdk/client-s3'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino'

import { handleException } from '../../../shared/util/handleException.util'

@Injectable()
export class StorageService {
	private readonly client: S3Client

	private readonly S3_ENDPOINT: string
	private readonly S3_REGION: string
	private readonly S3_ACCESS_KEY: string
	private readonly S3_SECRET_KEY: string
	private readonly S3_BUCKET: string

	public constructor(
		private readonly configService: ConfigService,
		@InjectPinoLogger(StorageService.name)
		private readonly logger: PinoLogger
	) {
		this.S3_ENDPOINT = configService.getOrThrow('S3_ENDPOINT')
		this.S3_REGION = configService.getOrThrow('S3_REGION')
		this.S3_ACCESS_KEY = configService.getOrThrow('S3_ACCESS_KEY')
		this.S3_SECRET_KEY = configService.getOrThrow('S3_SECRET_KEY')
		this.S3_BUCKET = configService.getOrThrow('S3_BUCKET')

		this.client = new S3Client({
			endpoint: this.S3_ENDPOINT,
			region: this.S3_REGION,
			credentials: {
				accessKeyId: this.S3_ACCESS_KEY,
				secretAccessKey: this.S3_SECRET_KEY
			}
		})
	}

	public async upload(upload: StorageUploadInterface) {
		try {
			const { payload, key, mimetype } = upload
			const command = new PutObjectCommand({
				Bucket: this.S3_BUCKET,
				Key: key,
				Body: payload,
				ContentType: mimetype
			})

			await this.client.send(command)
		} catch (error) {
			handleException(this.logger, error, 'Upload failed')
		}
	}

	public async remove(key: string) {
		try {
			const command = new DeleteObjectCommand({
				Key: key,
				Bucket: this.S3_BUCKET
			})

			await this.client.send(command)
		} catch (error) {
			handleException(this.logger, error, 'Removal failed')
		}
	}
}

interface StorageUploadInterface {
	payload: Buffer
	key: string
	mimetype: string
}
