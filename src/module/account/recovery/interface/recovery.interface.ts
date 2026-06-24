import { SessionMetadata } from '../../../../shared/types/metadata.type'

export interface RecoveryServiceInterface {
	sendResetPasswordToken(
		metadata: SessionMetadata,
		userIdOrInput: string | SendResetPasswordTokenUnauthorizedInputInterface,
		input?: SendResetPasswordTokenAuthorizedInputInterface
	): Promise<void>

	resetPassword(
		input: ResetPasswordInputInterface,
		sessionID?: string
	): Promise<void>
}

export interface SendResetPasswordTokenUnauthorizedInputInterface {
	userEmail: string
	pincode?: string
}

export interface SendResetPasswordTokenAuthorizedInputInterface {
	pincode?: string
}

export interface ResetPasswordInputInterface {
	token: string
	newPassword: string
	passwordRepeat: string
}
