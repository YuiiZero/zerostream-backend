import { Args, Mutation, Resolver } from '@nestjs/graphql'
import { FileUpload, GraphQLUpload } from 'graphql-upload-ts'

import { Authorization } from '../../../shared/decorator/authorization.decorator'
import { CurrentUserId } from '../../../shared/decorator/current-user-id.decorator'
import { FilePipe, IMAGE_MIME_TYPES } from '../../../shared/pipe/file.pipe'

import { UpdateProfileInfoInput } from './input/update-profile-info.input'
import { ProfileService } from './profile.service'

@Resolver()
export class ProfileResolver {
	public constructor(private readonly profileService: ProfileService) {}

	@Authorization()
	@Mutation(() => Boolean)
	public async updateAvatar(
		@CurrentUserId() userId: string,
		@Args(
			'avatar',
			{ type: () => GraphQLUpload },
			new FilePipe({
				allowedMimeTypes: IMAGE_MIME_TYPES,
				maxFileSize: parseInt(process.env['MAX_AVATAR_SIZE'] ?? '5242880')
			})
		)
		avatar: FileUpload
	): Promise<boolean> {
		await this.profileService.updateAvatar(userId, avatar)

		return true
	}

	@Authorization()
	@Mutation(() => Boolean)
	public async deleteAvatar(@CurrentUserId() userId: string): Promise<boolean> {
		await this.profileService.deleteAvatar(userId)

		return true
	}

	@Authorization()
	@Mutation(() => Boolean)
	public async updateProfileInfo(
		@CurrentUserId() userId: string,
		@Args('input') input: UpdateProfileInfoInput
	): Promise<boolean> {
		await this.profileService.updateProfileInfo(userId, input)

		return true
	}
}
