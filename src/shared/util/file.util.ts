import { Readable } from 'node:stream'

export function checkMimeType(
	mimetype: string,
	allowedMimeTypes: readonly string[]
): boolean {
	return allowedMimeTypes.includes(mimetype.toLowerCase())
}

export function checkFileSize(
	file: Readable,
	maxFileSize: number
): Promise<boolean> {
	return new Promise<boolean>((resolve, reject) => {
		let currentFileSize: number = 0

		file
			.on('data', (chunk: Uint8Array) => {
				currentFileSize += chunk.byteLength

				if (currentFileSize > maxFileSize) {
					file.destroy()
					return resolve(false)
				}
			})
			.on('end', () => {
				return resolve(true)
			})
			.on('error', error => {
				return reject(error)
			})
	})
}
