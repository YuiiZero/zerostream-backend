import { ConfigService } from '@nestjs/config'
import { randomUUID } from 'crypto'

import { TokenType } from '../../../prisma/generated/prisma/enums'
import { PrismaService } from '../../core/module/prisma/prisma.service'
import { SessionUserModel } from '../model/user.model'

import { generateCode } from './generateCode.util'

export async function generateToken({
	prismaService,
	configService,
	isUUID = true,
	type,
	user
}: GenerateTokenOptions) {
	const token = isUUID ? randomUUID() : generateCode(6)
	const expires = new Date(
		Date.now() + +configService.getOrThrow('VERIFICATION_TOKEN_TTL')
	)
	const existingToken = await prismaService.token.findFirst({
		where: { userId: user.id, type }
	})

	if (existingToken)
		await prismaService.token.delete({ where: { id: existingToken.id } })

	const returned = await prismaService.token.create({
		data: { expires, token, type, user: { connect: { id: user.id } } }
	})

	return returned
}

export interface GenerateTokenOptions {
	prismaService: PrismaService
	configService: ConfigService
	isUUID?: boolean
	type: TokenType
	user: SessionUserModel
}
