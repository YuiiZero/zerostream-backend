import { Injectable, NotFoundException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import sharp, { ResizeOptions } from 'sharp'

import { PrismaService } from '../../core/module/prisma/prisma.service'
import { StorageService } from '../../core/module/storage/storage.service'
import { checkImageResolution } from '../../shared/util/checkImageResolution'
import { UserService } from '../global/user/user.service'

import {
	UploadType,
	UploadWebpImageArguments
} from './interface/upload.interface'

@Injectable()
export class UploadService {
	private readonly AVATAR_WIDTH: number
	private readonly AVATAR_HEIGHT: number

	private readonly THUMBNAIL_WIDTH: number
	private readonly THUMBNAIL_HEIGHT: number

	public constructor(
		private readonly prismaService: PrismaService,
		private readonly storageService: StorageService,
		private readonly userService: UserService,
		private readonly configService: ConfigService
	) {
		this.AVATAR_WIDTH = parseInt(this.configService.getOrThrow('AVATAR_WIDTH'))
		this.AVATAR_HEIGHT = parseInt(
			this.configService.getOrThrow('AVATAR_HEIGHT')
		)

		this.THUMBNAIL_WIDTH = parseInt(
			this.configService.getOrThrow('THUMBNAIL_WIDTH')
		)
		this.THUMBNAIL_HEIGHT = parseInt(
			this.configService.getOrThrow('THUMBNAIL_HEIGHT')
		)
	}

	public async uploadWebpImage({
		userId,
		file,
		uploadType
	}: UploadWebpImageArguments): Promise<void> {
		const user = await this.userService.getUnique('id', userId)

		const chunks: Buffer[] = []

		for await (const chunk of file.createReadStream()) {
			chunks.push(chunk)
		}

		const resizeOptions: ResizeOptions = {
			fit: 'cover',
			position: 'centre'
		}

		let path: string
		let width: number
		let height: number
		let oldFile: string | null = null
		let updateEntity: () => Promise<void>

		switch (uploadType) {
			case UploadType.AVATAR: {
				path = `avatars/${user.id}.webp`
				width = this.AVATAR_WIDTH
				height = this.AVATAR_HEIGHT
				oldFile = user.avatar

				updateEntity = async () => {
					await this.prismaService.user.update({
						where: { id: user.id },
						data: {
							avatar: path
						}
					})
				}

				break
			}

			case UploadType.THUMBNAIL: {
				const stream = await this.prismaService.stream.findUnique({
					where: { userId }
				})

				if (!stream) {
					throw new NotFoundException('Stream not found')
				}

				path = `thumbnails/${user.id}.webp`
				width = this.THUMBNAIL_WIDTH
				height = this.THUMBNAIL_HEIGHT
				oldFile = stream.thumbnailUrl

				updateEntity = async () => {
					await this.prismaService.stream.update({
						where: { userId },
						data: {
							thumbnailUrl: path
						}
					})
				}

				break
			}

			default:
				throw new Error('Unknown upload type')
		}

		const i = sharp(Buffer.concat(chunks), {
			animated: file.mimetype === 'image/gif'
		})

		checkImageResolution(await i.metadata())

		const buffer = await i
			.resize(width, height, resizeOptions)
			.webp()
			.toBuffer()

		try {
			await this.storageService.upload({
				payload: buffer,
				key: path,
				mimetype: 'image/webp'
			})

			await updateEntity()
		} catch (error) {
			await this.storageService.remove(path).catch(() => {})

			throw error
		}

		if (oldFile) {
			await this.storageService.remove(oldFile).catch(() => {})
		}
	}

	public async removeUploaded(
		userId: string,
		uploadType: UploadType
	): Promise<void> {
		const filePath = this.getFilePath(userId, uploadType)
		let updateEntity: () => Promise<void>

		switch (uploadType) {
			case UploadType.AVATAR: {
				updateEntity = async () => {
					await this.prismaService.user.update({
						where: { id: userId },
						data: { avatar: null }
					})
				}

				break
			}
			case UploadType.THUMBNAIL: {
				updateEntity = async () => {
					await this.prismaService.stream.update({
						where: { userId },
						data: { thumbnailUrl: null }
					})
				}

				break
			}
			default: {
				throw new Error('Unknown upload type')
			}
		}

		await updateEntity()
		await this.storageService.remove(filePath)
	}

	private getFilePath(userId: string, uploadType: UploadType): string {
		if (uploadType === UploadType.AVATAR) return `avatars/${userId}.webp`
		if (uploadType === UploadType.THUMBNAIL) return `thumbnails/${userId}.webp`

		throw new Error('Unknown upload type')
	}
}
