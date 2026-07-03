import { User } from '../../../../../prisma/generated/prisma/client'
import { SessionMetadata } from '../../../../shared/types/metadata.type'
import { Ctx } from '../../../../shared/types/type'

export interface DeactivateAccountServiceInterface {
	sendAccountDeactivationToken(
		userId: string,
		metadata: SessionMetadata,
		credentials: CredentialsInputInterface
	): Promise<void>

	deactivateAccount(
		userId: string,
		token: string,
		context: Ctx
	): Promise<DeactivatedUserModelInterface>
}

export interface CredentialsInputInterface {
	password: string
	pincode?: string
}

export type DeactivatedUserModelInterface = Pick<
	User,
	'isDeactivated' | 'deactivatedAt'
>
