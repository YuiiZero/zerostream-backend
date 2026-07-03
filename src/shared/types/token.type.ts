import { TokenType } from '../../../prisma/generated/prisma/enums'

export interface Token {
	id: string

	hashToken: string
	type: TokenType
	expires: Date

	userId: string

	createdAt: Date
	updatedAt: Date
}

export interface TokenPair {
	token: string
	hashToken: string
}
