export interface CredentialsServiceInterface {
	validateCredentials(userId: string, input: CredentialsInput): Promise<boolean>
}

export interface CredentialsInput {
	password: string
	pincode?: string
}
