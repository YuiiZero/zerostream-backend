import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PrismaPg } from '@prisma/adapter-pg'

import { PrismaClient } from '../../../../prisma/generated/prisma/client'

@Injectable()
export class PrismaService
	extends PrismaClient
	implements OnModuleInit, OnModuleDestroy
{
	public constructor(private configService: ConfigService) {
		const adapter = new PrismaPg(
			configService.getOrThrow<string>('POSTGRES_URI')
		)
		super({ adapter })
	}

	public onModuleInit() {
		this.$connect()
	}

	public onModuleDestroy() {
		this.$disconnect()
	}
}
