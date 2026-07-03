import {
	BadRequestException,
	Injectable,
	NotFoundException
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { hash } from 'argon2'
import { randomUUID } from 'crypto'
import ms, { StringValue } from 'ms'

import { TokenType } from '../../../../prisma/generated/prisma/enums'
import { PrismaService } from '../../../core/module/prisma/prisma.service'
import { Token, TokenPair } from '../../../shared/types/token.type'
import { SessionUser } from '../../../shared/types/user.type'
import { generateCode } from '../../../shared/util/generateCode.util'
import { hashSHA256 } from '../../../shared/util/hash-sha-256.util'

@Injectable()
export class TokenService {
	private readonly VERIFICATION_TOKEN_TTL: StringValue
	private readonly DEACTIVATION_TOKEN_TTL: StringValue
	private readonly RECOVERY_TOKEN_TTL: StringValue
	private readonly DEACTIVATION_TOKEN_LENGTH: number

	public constructor(
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
		this.DEACTIVATION_TOKEN_LENGTH = +configService.getOrThrow(
			'DEACTIVATION_TOKEN_LENGTH'
		)
	}

	public async verifyUUIDToken(
		token: string,
		tokenType: TokenType
	): Promise<Token> {
		const hashToken = hashSHA256(token)
		const foundToken = await this.prismaService.token.findUnique({
			where: { hashToken, type: tokenType }
		})

		if (!foundToken) throw new NotFoundException('Token not found')

		const isExpired = Date.now() > foundToken.expires.getTime()

		if (isExpired) throw new BadRequestException('Token has expired')

		return foundToken
	}

	public async getRelatedUser(token: Token) {
		const relatedUser = await this.prismaService.user.findFirst({
			where: { id: token.userId }
		})

		if (!relatedUser) throw new NotFoundException('Related user not found')

		return relatedUser
	}

	public generateEmailVerificationToken(user: SessionUser): Promise<TokenPair> {
		return this._generateUUIDToken({
			type: TokenType.VERIFY_EMAIL,
			user,
			ttl: this.VERIFICATION_TOKEN_TTL
		})
	}

	public generatePasswordRecoveryToken(user: SessionUser): Promise<TokenPair> {
		return this._generateUUIDToken({
			type: TokenType.RESET_PASSWORD,
			user,
			ttl: this.RECOVERY_TOKEN_TTL
		})
	}

	public async generateAccountDeactivationToken(sessionUser: SessionUser) {
		const { id: userId } = sessionUser
		const token = generateCode(this.DEACTIVATION_TOKEN_LENGTH)
		const hashToken = await hash(token)
		const expires = new Date(Date.now() + ms(this.DEACTIVATION_TOKEN_TTL))
		const deactivated = await this.prismaService.user.update({
			where: { id: userId },
			data: {
				deactivationCodeExpiresAt: expires,
				hashDeactivationCode: hashToken
			},
			select: {
				hashDeactivationCode: true,
				deactivationCodeExpiresAt: true
			}
		})

		if (!deactivated) throw new NotFoundException('User not found')

		return {
			token,
			expires: deactivated.deactivationCodeExpiresAt
		}
	}

	private async _generateUUIDToken({
		type,
		user,
		ttl
	}: GenerateTokenOptions): Promise<TokenPair> {
		const token = randomUUID()
		const hashToken = hashSHA256(token)
		const expires = new Date(Date.now() + ms(ttl))
		const existingToken = await this.prismaService.token.findFirst({
			where: { userId: user.id, type }
		})

		if (existingToken)
			await this.prismaService.token.delete({ where: { id: existingToken.id } })

		await this.prismaService.token.create({
			data: { expires, hashToken, type, user: { connect: { id: user.id } } },
			select: { hashToken: true }
		})

		return { token, hashToken }
	}
}

interface GenerateTokenOptions {
	type: TokenType
	user: SessionUser
	ttl: StringValue
}
