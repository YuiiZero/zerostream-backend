import { Args, Mutation, Query, Resolver } from '@nestjs/graphql'
import { FileUpload, GraphQLUpload } from 'graphql-upload-ts'

import { Authorization } from '../../shared/decorator/authorization.decorator'
import { CurrentUserId } from '../../shared/decorator/current-user-id.decorator'
import { FilePipe, IMAGE_MIME_TYPES } from '../../shared/pipe/file.pipe'

import { ChangeStreamInfoInput } from './input/change-stream-info.input'
import { FilterInput } from './input/filter.input'
import { StreamModel } from './model/stream.model'
import { StreamService } from './stream.service'

@Resolver()
export class StreamResolver {
	constructor(private readonly streamService: StreamService) {}

	@Query(() => [StreamModel])
	public findAllStreams(@Args('filterInput') input: FilterInput) {
		return this.streamService.findAll(input)
	}

	@Query(() => [StreamModel])
	public findTopStreams(@Args('count') count: number) {
		return this.streamService.pickTopStreams(count)
	}

	@Authorization()
	@Mutation(() => Boolean)
	public async changeStreamInfo(
		@CurrentUserId() userId: string,
		@Args('changeStreamInfoInput') input: ChangeStreamInfoInput
	) {
		await this.streamService.changeStreamInfo(userId, input)

		return true
	}

	@Authorization()
	@Mutation(() => Boolean)
	public async updateStreamThumbnail(
		@CurrentUserId() userId: string,
		@Args(
			'thumbnail',
			{ type: () => GraphQLUpload },
			new FilePipe({
				allowedMimeTypes: IMAGE_MIME_TYPES,
				maxFileSize: parseInt(process.env['MAX_THUMBNAIL_SIZE'] ?? '10485760')
			})
		)
		file: FileUpload
	) {
		await this.streamService.updateStreamThumbnail(userId, file)

		return true
	}

	@Authorization()
	@Mutation(() => Boolean)
	public async deleteStreamThumbnail(@CurrentUserId() userId: string) {
		await this.streamService.deleteStreamThumbnail(userId)

		return true
	}
}
