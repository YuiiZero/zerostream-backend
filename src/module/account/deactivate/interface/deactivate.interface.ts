import { User } from '../../../../../prisma/generated/prisma/client'
import { SessionMetadata } from '../../../../shared/types/metadata.type'
import { Ctx } from '../../../../shared/types/type'

export interface DeactivateAccountServiceInterface {
	sendAccountDeactivationToken(
		userId: string,
		metadata: SessionMetadata,
		input: SendAccountDeactivationTokenInputInterface
	): Promise<void>

	deactivateAccount(
		input: DeactivateAccountInputInterface,
		context: Ctx
	): Promise<DeactivatedUserModelInterface>
}

export interface SendAccountDeactivationTokenInputInterface {
	password: string
	pincode?: string
}

export interface DeactivateAccountInputInterface {
	token: string
}

export interface DeactivateAccountOptions {
	userId: string
	deactivateInput: DeactivateAccountInputInterface
}

export type DeactivatedUserModelInterface = Pick<
	User,
	'isDeactivated' | 'deactivatedAt'
>
