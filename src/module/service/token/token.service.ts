import {
	BadRequestException,
	Injectable,
	NotFoundException
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { randomUUID } from 'crypto'

import { TokenType } from '../../../../prisma/generated/prisma/enums'
import { PrismaService } from '../../../core/module/prisma/prisma.service'
import { Token } from '../../../shared/types/token.type'
import { SessionUser } from '../../../shared/types/user.type'
import { generateCode } from '../../../shared/util/generateCode.util'

@Injectable()
export class TokenService {
	VERIFICATION_TOKEN_TTL: number
	DEACTIVATION_TOKEN_TTL: number

	constructor(
		private readonly prismaService: PrismaService,
		private readonly configService: ConfigService
	) {
		this.DEACTIVATION_TOKEN_TTL = +configService.getOrThrow(
			'DEACTIVATION_TOKEN_TTL'
		)
		this.VERIFICATION_TOKEN_TTL = +configService.getOrThrow(
			'VERIFICATION_TOKEN_TTL'
		)
	}

	async verifyToken(options: VerifyTokenOptions): Promise<Token> {
		const { token, tokenType } = options
		const foundToken = await this.prismaService.token.findUnique({
			where: { token, type: tokenType }
		})

		if (!foundToken) throw new NotFoundException('Token not found')

		const isExpired = Date.now() > foundToken.expires.getTime()

		if (isExpired) throw new BadRequestException('Token has expired')

		return foundToken
	}

	async getRelatedUser(token: Token) {
		const relatedUser = await this.prismaService.user.findFirst({
			where: { id: token.userId }
		})

		if (!relatedUser) throw new NotFoundException('Related user not found')

		return relatedUser
	}

	async generateEmailVerificationToken(user: SessionUser) {
		return this._generateToken({
			type: TokenType.VERIFY_EMAIL,
			user
		})
	}

	async generatePasswordRecoveryToken(user: SessionUser) {
		return this._generateToken({
			type: TokenType.RESET_PASSWORD,
			user
		})
	}

	async generateAccountDeactivationToken(user: SessionUser) {
		return this._generateToken({
			type: TokenType.DEACTIVATE_ACCOUNT,
			user,
			isUUID: false
		})
	}

	private async _generateToken({
		isUUID = true,
		type,
		user
	}: GenerateTokenOptions) {
		const token = isUUID ? randomUUID() : generateCode(6)
		const expires = new Date(Date.now() + this.DEACTIVATION_TOKEN_TTL)
		const existingToken = await this.prismaService.token.findFirst({
			where: { userId: user.id, type }
		})

		if (existingToken)
			await this.prismaService.token.delete({ where: { id: existingToken.id } })

		return this.prismaService.token.create({
			data: { expires, token, type, user: { connect: { id: user.id } } }
		})
	}
}

interface GenerateTokenOptions {
	isUUID?: boolean
	type: TokenType
	user: SessionUser
}

interface VerifyTokenOptions {
	token: string
	tokenType: TokenType
}
