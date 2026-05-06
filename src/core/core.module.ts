import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'

import { UserController } from '../module/user/user.controller'
import { UserService } from '../module/user/user.service'

import { PrismaModule } from './module/prisma/prisma.module'

@Module({
	imports: [
		PrismaModule,
		ConfigModule.forRoot({
			isGlobal: true
		})
	],
	controllers: [UserController],
	providers: [UserService]
})
export class CoreModule {}
