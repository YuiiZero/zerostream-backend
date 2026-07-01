export interface EncryptionServiceInterface {
	encrypt(string: string): string
	decrypt(encryptedString: string): string
}
