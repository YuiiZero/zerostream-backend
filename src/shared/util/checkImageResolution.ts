import { BadRequestException } from '@nestjs/common'

export function checkImageResolution(metadata: ImageSize) {
	if (metadata.width >= 8000 || metadata.height >= 8000)
		throw new BadRequestException('Image resolution too high')
}

interface ImageSize {
	width: number
	height: number
}
