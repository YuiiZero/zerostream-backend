import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto'

import { EncryptionServiceInterface } from './interface/encryption.interface'

@Injectable()
export class EncryptionService implements EncryptionServiceInterface {
	private readonly algorithm = 'aes-256-gcm'
	private readonly key: Buffer<ArrayBuffer>

	public constructor(private readonly configService: ConfigService) {
		this.key = Buffer.from(
			configService.getOrThrow<string>('ENCRYPTION_KEY'),
			'hex'
		)

		if (this.key.length !== 32)
			throw new Error('ENCRYPTION_KEY must be 32 bytes')
	}

	public encrypt(string: string): string {
		const iv = randomBytes(12)
		const cipher = createCipheriv(this.algorithm, this.key, iv)
		const encrypted = Buffer.concat([
			cipher.update(string, 'utf-8'),
			cipher.final()
		])
		const authTag = cipher.getAuthTag()

		return [
			iv.toString('hex'),
			authTag.toString('hex'),
			encrypted.toString('hex')
		].join(':')
	}

	public decrypt(string: string): string {
		const [ivHex, authTagHex, encryptedHex] = string.split(':')
		const decipher = createDecipheriv(
			this.algorithm,
			this.key,
			Buffer.from(ivHex, 'hex')
		)

		decipher.setAuthTag(Buffer.from(authTagHex, 'hex'))

		const decrypted = Buffer.concat([
			decipher.update(Buffer.from(encryptedHex, 'hex')),
			decipher.final()
		])

		return decrypted.toString('utf-8')
	}
}
