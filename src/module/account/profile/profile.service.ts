import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/client'
import { FileUpload } from 'graphql-upload-ts'
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino'
import sharp from 'sharp'

import { PrismaService } from '../../../core/module/prisma/prisma.service'
import { StorageService } from '../../../core/module/storage/storage.service'
import { handleException } from '../../../shared/util/handleException.util'
import { UserService } from '../../global/user/user.service'

import { UpdateProfileInfoInput } from './input/update-profile-info.input'

@Injectable()
export class ProfileService {
	public constructor(
		private readonly storageService: StorageService,
		private readonly prismaService: PrismaService,
		private readonly userService: UserService,
		@InjectPinoLogger(ProfileService.name)
		private readonly logger: PinoLogger
	) {}

	public async updateAvatar(userId: string, file: FileUpload): Promise<void> {
		try {
			const { avatar, id } = await this.userService.getUnique('id', userId)

			if (!file) throw new Error('Avatar file is required')

			const chunks: Buffer[] = []

			for await (const chunk of file.createReadStream()) chunks.push(chunk)

			const buffer = await sharp(Buffer.concat(chunks), {
				animated: file.mimetype === 'image/gif'
			})
				.resize(512, 512, {
					fit: 'cover',
					position: 'centre'
				})
				.webp()
				.toBuffer()
			const path = `avatars/${id}.webp`

			await this.prismaService.user.update({
				where: { id },
				data: {
					avatar: path
				}
			})

			if (avatar) await this.storageService.remove(avatar)

			await this.storageService.upload({
				payload: buffer,
				key: path,
				mimetype: 'image/webp'
			})
		} catch (error) {
			handleException(this.logger, error, 'Failed to execute updateAvatar')
		}
	}

	public async deleteAvatar(userId: string): Promise<void> {
		try {
			const { id, avatar } = await this.userService.getUnique('id', userId)

			if (!avatar) return

			await this.storageService.remove(avatar)
			await this.prismaService.user.update({
				where: { id },
				data: { avatar: null }
			})
		} catch (error) {
			handleException(this.logger, error, 'Failed to execute deleteAvatar')
		}
	}

	public async updateProfileInfo(
		userId: string,
		input: UpdateProfileInfoInput
	) {
		this.logger.info({ userId })
		try {
			const { bio, nickname } = input
			const data: UpdateProfileInfoInput = {}

			if (bio !== undefined) data.bio = bio
			if (nickname !== undefined) data.nickname = nickname
			if (Object.keys(data).length === 0) return

			await this.prismaService.user.update({
				where: { id: userId },
				data
			})
		} catch (error) {
			if (
				error instanceof PrismaClientKnownRequestError &&
				error.code === 'P2025'
			) {
				this.logger.error('User not found')
				throw new NotFoundException('User not found')
			}
			handleException(this.logger, error, 'Failed executing changeInfo')
		}
	}
}
