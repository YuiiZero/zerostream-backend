import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PrismaPg } from '@prisma/adapter-pg'

import { PrismaClient } from '../../../../prisma/generated/prisma/client'

@Injectable()
export class PrismaService
	extends PrismaClient
	implements OnModuleInit, OnModuleDestroy
{
	constructor(private configService: ConfigService) {
		const adapter = new PrismaPg(
			configService.getOrThrow<string>('POSTGRES_URI')
		)
		super({ adapter })
	}

	onModuleInit() {
		this.$connect()
	}

	onModuleDestroy() {
		this.$disconnect()
	}
}
