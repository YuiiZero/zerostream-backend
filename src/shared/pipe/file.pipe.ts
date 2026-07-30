import {
	ArgumentMetadata,
	BadRequestException,
	Injectable,
	PipeTransform
} from '@nestjs/common'
import { FileUpload } from 'graphql-upload-ts'

import { checkFileSize, checkMimeType } from '../util/file.util'

@Injectable()
export class FilePipe implements PipeTransform<FileUpload> {
	private readonly MAX_FILE_SIZE?: number
	private readonly ALLOWED_MIME_TYPES?: readonly string[]

	public constructor(options: FileValidationOptions) {
		this.ALLOWED_MIME_TYPES = options.allowedMimeTypes
		this.MAX_FILE_SIZE = options.maxFileSize
	}

	public async transform(
		file: FileUpload,
		_metadata: ArgumentMetadata
	): Promise<FileUpload> {
		const { mimetype, createReadStream } = file

		if (this.ALLOWED_MIME_TYPES) {
			const isMimeTypeAllowed = checkMimeType(mimetype, this.ALLOWED_MIME_TYPES)

			if (!isMimeTypeAllowed) throw new BadRequestException('Bad file format')
		}

		if (this.MAX_FILE_SIZE) {
			const isFileSizeAllowed = await checkFileSize(
				createReadStream(),
				this.MAX_FILE_SIZE
			)

			if (!isFileSizeAllowed) throw new BadRequestException('File too large')
		}

		return file
	}
}

export interface FileValidationOptions {
	readonly maxFileSize: number
	readonly allowedMimeTypes: readonly string[]
}

export const IMAGE_MIME_TYPES = [
	'image/jpeg',
	'image/png',
	'image/gif',
	'image/webp'
] as const
