export interface VerifyServiceInterface {
	sendVerifyEmailToken(input: SendVerifyEmailTokenInputInterface): Promise<void>

	verifyEmail(input: VerifyEmailInputInterface): Promise<void>
}

export interface SendVerifyEmailTokenInputInterface {
	email: string
}

export interface VerifyEmailInputInterface {
	token: string
}
