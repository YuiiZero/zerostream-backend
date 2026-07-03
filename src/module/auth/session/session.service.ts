import {
	BadRequestException,
	Injectable,
	NotFoundException
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { RedisClientType } from '@redis/client'
import { Request } from 'express'
import type { SessionData } from 'express-session'

import { PrismaService } from '../../../core/module/prisma/prisma.service'
import { RedisService } from '../../../core/module/redis/redis.service'
import { Ctx } from '../../../shared/types/type'
import { addSessionPrefix } from '../../../shared/util/addPrefix.util'
import { getSessionMetadata } from '../../../shared/util/getSessionMetadata'
import { handleException } from '../../../shared/util/handleException.util'
import { UserService } from '../../global/user/user.service'

import { SessionServiceInterface } from './interface/session.interface'

@Injectable()
export class SessionService implements SessionServiceInterface {
	private readonly sessionCookieName: string
	private readonly redisClient: RedisClientType

	public constructor(
		private readonly configService: ConfigService,
		private readonly prismaService: PrismaService,
		private readonly redisService: RedisService,
		private readonly userService: UserService
	) {
		this.sessionCookieName = configService.getOrThrow<string>('SESSION_NAME')
		this.redisClient = redisService.client
	}

	public async createSession(userId: string, req: Request): Promise<string> {
		try {
			const userAgent = req.headers['user-agent']
			const ip = req.ip

			if (userAgent === undefined)
				throw new BadRequestException('User agent is undefined')
			if (ip === undefined)
				throw new BadRequestException('User IP is undefined')

			const metadata = await getSessionMetadata(
				this.configService,
				userAgent,
				ip
			)

			req.session.sessID = req.sessionID
			req.session.user = { id: userId }
			req.session.metadata = metadata

			await this.prismaService.$transaction(async tx => {
				const user = await tx.user.findUnique({ where: { id: userId } })

				if (!user) throw new NotFoundException('User not found')

				const { sessionIDs } = user

				await tx.user.update({
					where: {
						id: user.id
					},
					data: {
						sessionIDs: [...sessionIDs, req.sessionID]
					}
				})
			})

			return req.sessionID
		} catch (error) {
			handleException(error, 'Cannot create session')
		}
	}

	public async getSessions(userId: string): Promise<SessionData[]> {
		try {
			const { sessionIDs } = await this.userService.getUnique('id', userId)
			const sessions: SessionData[] = await Promise.all(
				sessionIDs.map(async sessionID => {
					const redisKey = addSessionPrefix(sessionID, this.configService)
					const sessionJson = await this.redisClient.get(redisKey)

					if (!sessionJson) throw new NotFoundException(`Wrong key ${redisKey}`)

					const session = JSON.parse(sessionJson)
					return session
				})
			)

			return sessions
		} catch (error) {
			handleException(error, 'Cannot get sessions')
		}
	}

	public async deleteSession(sessionId: string): Promise<void>
	public async deleteSession(sessionId: string, context: Ctx): Promise<void>
	public async deleteSession(sessionId: string, context?: Ctx): Promise<void> {
		try {
			if (context && context.req.sessionID === sessionId)
				throw new BadRequestException('Use logout to delete current session')

			await this.prismaService.$transaction(async tx => {
				const sessionOwner = await tx.user.findFirst({
					where: {
						sessionIDs: {
							has: sessionId
						}
					}
				})

				if (!sessionOwner) throw new NotFoundException('Session does not exist')

				await tx.user.update({
					where: {
						id: sessionOwner.id
					},
					data: {
						sessionIDs: sessionOwner.sessionIDs.filter(sID => sID !== sessionId)
					}
				})
			})

			const redisKey = addSessionPrefix(sessionId, this.configService)
			const deleteCount = await this.redisClient.del(redisKey)

			if (deleteCount === 0)
				throw new NotFoundException(`Wrong key ${redisKey}`)

			if (context) {
				const { req, res } = context

				await new Promise<void>((resolve, reject) => {
					req.session.destroy(error => {
						if (error) reject(error)

						const sessionCookie = this.configService.getOrThrow('SESSION_NAME')
						res.clearCookie(sessionCookie)
						return resolve()
					})
				})
			}
		} catch (error) {
			handleException(error, 'Cannot delete session')
		}
	}

	public async deleteAllSessions(userId: string): Promise<void>
	public async deleteAllSessions(
		userId: string,
		currentSessionId: string
	): Promise<void>
	public async deleteAllSessions(
		userId: string,
		currentSessionId?: string
	): Promise<void> {
		try {
			let { sessionIDs } = await this.userService.getUnique('id', userId)

			sessionIDs = sessionIDs.map(sID =>
				addSessionPrefix(sID, this.configService)
			)

			if (currentSessionId) {
				sessionIDs = sessionIDs.filter(
					sID => sID !== addSessionPrefix(currentSessionId, this.configService)
				)
			}

			if (sessionIDs.length === 0) return

			await this.prismaService.user.update({
				where: { id: userId },
				data: {
					sessionIDs: currentSessionId ? [currentSessionId] : []
				}
			})

			await this.redisClient.del(sessionIDs)
		} catch (error) {
			handleException(error, 'Cannot delete all sessions')
		}
	}
}
