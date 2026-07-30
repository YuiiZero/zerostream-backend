import { Injectable } from '@nestjs/common'
import { FileUpload } from 'graphql-upload-ts'
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino'

import { Stream } from '../../../prisma/generated/prisma/client'
import { StreamWhereInput } from '../../../prisma/generated/prisma/models'
import { PrismaService } from '../../core/module/prisma/prisma.service'
import { handleException } from '../../shared/util/handleException.util'
import { UploadType } from '../upload/interface/upload.interface'
import { UploadService } from '../upload/upload.service'

import { ChangeStreamInfoInput } from './input/change-stream-info.input'
import { FilterInput } from './input/filter.input'

@Injectable()
export class StreamService {
	public constructor(
		private readonly prismaService: PrismaService,
		@InjectPinoLogger(StreamService.name)
		private readonly logger: PinoLogger,
		private readonly uploadService: UploadService
	) {}

	public findAll(input: FilterInput) {
		const { searchTerm, skip, take } = input

		return this.prismaService.stream.findMany({
			where: {
				user: {
					isDeactivated: false
				},
				...this._findWhereSearchTerm(searchTerm)
			},
			take: take ?? 10,
			skip: skip ?? 0,
			include: {
				user: true
			},
			orderBy: {
				createdAt: 'asc'
			}
		})
	}

	// TODO: Picks count most viewed streams in descending order
	public pickTopStreams(count: number): Promise<Stream[]> {
		return this.prismaService.stream.findMany({
			take: count,
			orderBy: {
				userId: 'desc'
			},
			include: {
				user: true
			}
		})
	}

	public async changeStreamInfo(
		userId: string,
		input: ChangeStreamInfoInput
	): Promise<void> {
		this.logger.info({ userId, ...input }, 'Started changing stream info')

		try {
			// const { title, categoryId } = input
			const { title } = input

			await this.prismaService.stream.update({
				where: { userId },
				data: { title }
			})

			this.logger.info({ userId }, 'Stream info changed')
		} catch (error) {
			handleException(this.logger, error, 'Failed changing stream info')
		}
	}

	public async updateStreamThumbnail(
		userId: string,
		thumbnailFile: FileUpload
	) {
		this.logger.info({ userId }, 'Started updating stream thumbnail')

		try {
			await this.uploadService.uploadWebpImage({
				userId,
				file: thumbnailFile,
				uploadType: UploadType.THUMBNAIL
			})

			this.logger.info({ userId }, 'Stream thumbnail updated')
		} catch (error) {
			handleException(this.logger, error, 'Failed updating stream thumbnail')
		}
	}

	public async deleteStreamThumbnail(userId: string): Promise<void> {
		this.logger.info({ userId }, 'Started deleting stream thumbnail')

		try {
			await this.uploadService.removeUploaded(userId, UploadType.THUMBNAIL)

			this.logger.info({ userId }, 'Stream thumbnail deleted')
		} catch (error) {
			handleException(this.logger, error, 'Failed deleting stream thumbnail')
		}
	}

	private _findWhereSearchTerm(searchTerm?: string): StreamWhereInput {
		return searchTerm
			? {
					OR: [
						{
							title: {
								contains: searchTerm,
								mode: 'insensitive'
							}
						},
						{
							user: {
								OR: [
									{
										username: {
											contains: searchTerm,
											mode: 'insensitive'
										}
									},
									{
										nickname: {
											contains: searchTerm,
											mode: 'insensitive'
										}
									}
								]
							}
						}
					]
				}
			: {}
	}
}
