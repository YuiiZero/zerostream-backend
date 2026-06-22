import {
	BadRequestException,
	Injectable,
	NotFoundException
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { randomUUID } from 'crypto'
import ms, { StringValue } from 'ms'

import { TokenType } from '../../../../prisma/generated/prisma/enums'
import { PrismaService } from '../../../core/module/prisma/prisma.service'
import { Token } from '../../../shared/types/token.type'
import { SessionUser } from '../../../shared/types/user.type'
import { generateCode } from '../../../shared/util/generateCode.util'

@Injectable()
export class TokenService {
	VERIFICATION_TOKEN_TTL: StringValue
	DEACTIVATION_TOKEN_TTL: StringValue
	RECOVERY_TOKEN_TTL: StringValue

	constructor(
		private readonly prismaService: PrismaService,
		private readonly configService: ConfigService
	) {
		this.DEACTIVATION_TOKEN_TTL = configService.getOrThrow<StringValue>(
			'DEACTIVATION_TOKEN_TTL'
		)
		this.VERIFICATION_TOKEN_TTL = configService.getOrThrow<StringValue>(
			'VERIFICATION_TOKEN_TTL'
		)
		this.RECOVERY_TOKEN_TTL =
			configService.getOrThrow<StringValue>('RECOVERY_TOKEN_TTL')
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
			user,
			ttl: this.VERIFICATION_TOKEN_TTL
		})
	}

	async generatePasswordRecoveryToken(user: SessionUser) {
		return this._generateToken({
			type: TokenType.RESET_PASSWORD,
			user,
			ttl: this.RECOVERY_TOKEN_TTL
		})
	}

	async generateAccountDeactivationToken(user: SessionUser) {
		return this._generateToken({
			type: TokenType.DEACTIVATE_ACCOUNT,
			user,
			isUUID: false,
			ttl: this.DEACTIVATION_TOKEN_TTL
		})
	}

	private async _generateToken({
		isUUID = true,
		type,
		user,
		ttl
	}: GenerateTokenOptions) {
		const token = isUUID ? randomUUID() : generateCode(6)
		const expires = new Date(Date.now() + ms(ttl))
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
	ttl: StringValue
}

interface VerifyTokenOptions {
	token: string
	tokenType: TokenType
}
