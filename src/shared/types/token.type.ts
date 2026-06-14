import { TokenType } from '../../../prisma/generated/prisma/enums'

export interface Token {
	id: string

	token: string
	type: TokenType
	expires: Date

	userId: string

	createdAt: Date
	updatedAt: Date
}
