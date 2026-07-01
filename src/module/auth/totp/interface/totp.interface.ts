import { User } from '../../../../../prisma/generated/prisma/client'

export interface TotpServiceInterface {
	generateTotp(userId: string): Promise<GeneratedTotp>
	generateRecoveryCodes(userId: string, pincode: string): Promise<string[]>

	addTotp(userId: string, pincode: string): Promise<string[]>
	removeTotp(userId: string, input: RemoveTotpInputInterface): Promise<void>

	verifyTotp(userIdOrUser: string | User, pincode: string): Promise<void>
}

export interface GeneratedTotp {
	secret: string
	qrCodeUrl: string
}

export interface AddTotpInputInterface {
	pincode: string
}

export interface RemoveTotpInputInterface {
	pincode?: string
	recoveryCode?: string
}
