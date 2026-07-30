import {
	BadRequestException,
	Injectable,
	NotFoundException
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/client'
import { FileUpload } from 'graphql-upload-ts'
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino'

import { PrismaService } from '../../../core/module/prisma/prisma.service'
import { handleException } from '../../../shared/util/handleException.util'
import { UserService } from '../../global/user/user.service'
import { UploadType } from '../../upload/interface/upload.interface'
import { UploadService } from '../../upload/upload.service'

import { UpdateProfileInfoInput } from './input/update-profile-info.input'

@Injectable()
export class ProfileService {
	public constructor(
		private readonly prismaService: PrismaService,
		private readonly userService: UserService,
		@InjectPinoLogger(ProfileService.name)
		private readonly logger: PinoLogger,
		private readonly configService: ConfigService,
		private readonly uploadService: UploadService
	) {}

	public async updateAvatar(userId: string, file: FileUpload): Promise<void> {
		this.logger.info({ userId }, 'Started updating avatar')

		try {
			await this.uploadService.uploadWebpImage({
				userId,
				file,
				uploadType: UploadType.AVATAR
			})

			this.logger.info({ userId }, 'Avatar updated')
		} catch (error) {
			handleException(this.logger, error, 'Failed updating avatar')
		}
	}

	public async deleteAvatar(userId: string): Promise<void> {
		this.logger.info({ userId }, 'Started deleting avatar')

		try {
			const { avatar } = await this.userService.getUnique('id', userId)

			if (!avatar) return

			await this.uploadService.removeUploaded(userId, UploadType.AVATAR)

			this.logger.info({ userId }, 'Avatar deleted')
		} catch (error) {
			handleException(this.logger, error, 'Failed deleting avatar')
		}
	}

	public async updateProfileInfo(
		userId: string,
		input: UpdateProfileInfoInput
	) {
		this.logger.info({ userId }, 'Started updating profile info')

		try {
			const { bio, nickname, socialLinks } = input
			const data: UpdateProfileInfoInput = {}

			if (bio !== undefined) data.bio = bio
			if (nickname !== undefined) data.nickname = nickname
			if (socialLinks !== undefined) {
				if (
					socialLinks.length >
					this.configService.getOrThrow<number>('MAX_SOCIAL_LINKS')
				)
					throw new BadRequestException('Too many social links')

				data.socialLinks = socialLinks
			}

			if (Object.keys(data).length === 0) return

			await this.prismaService.user.update({
				where: { id: userId },
				data
			})

			this.logger.info({ userId }, 'Profile info updated')
		} catch (error) {
			if (
				error instanceof PrismaClientKnownRequestError &&
				error.code === 'P2025'
			) {
				this.logger.error('User not found')

				throw new NotFoundException('User not found')
			}
			handleException(this.logger, error, 'Failed updating profile info')
		}
	}
}
