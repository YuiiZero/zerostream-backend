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

	// public async getAllUserSessions(userId: string): Promise<SessionModel[]> {
	// 	const found = await this.prismaService.user.findFirst({
	// 		where: { id: userId },
	// 		select: { sessionIDs: true }
	// 	})

	// 	if (!found)
	// 		throw new NotFoundException('Cannot fetch non-existent user sessions')

	// 	const { sessionIDs } = found
	// 	const prefix = this.configService.getOrThrow<string>('REDIS_PREFIX')
	// 	const sessions: SessionData[] = await Promise.all(
	// 		sessionIDs.map(async sessionID => {
	// 			const sessionKey = prefix + sessionID
	// 			const sessionJson = await this.redisClient.GET(sessionKey)

	// 			if (sessionJson === null) {
	// 				throw new InternalServerErrorException(
	// 					`Cannot fetch user sessions due to wrong key ${sessionKey}`
	// 				)
	// 			}

	// 			const session: SessionData = JSON.parse(sessionJson)
	// 			return session
	// 		})
	// 	)
	// 	const models: SessionModel[] = sessions.map(s => toSessionModel(s))
	// 	return models
	// }

	// public async saveCurrentSession(
	// 	req: Request,
	// 	publicUser: PublicUserModel
	// ): Promise<void> {
	// 	const userAgent = req.headers[HttpHeader.USER_AGENT]
	// 	const ip = req.ip

	// 	if (!userAgent)
	// 		throw new InternalServerErrorException('User-Agent is undefined')
	// 	if (!ip) throw new InternalServerErrorException('IP is undefined')

	// 	const sessionUser = await this._addSession(publicUser, req.sessionID)

	// 	req.session.sessID = req.sessionID
	// 	req.session.user = sessionUser
	// 	req.session.metadata = await getSessionMetadata(
	// 		this.configService,
	// 		userAgent,
	// 		ip
	// 	)
	// }

	// public async deleteCurrentSession(
	// 	req: Request,
	// 	res: Response
	// ): Promise<void> {
	// 	const session = req.session

	// 	await this._deleteSession(req.sessionID)

	// 	await new Promise<void>((resolve, reject) => {
	// 		session.destroy((err: Error) => {
	// 			if (err)
	// 				reject(
	// 					new InternalServerErrorException(
	// 						`Cannot destroy session: ${err.message}`,
	// 						{ cause: err }
	// 					)
	// 				)

	// 			res.clearCookie(this.sessionCookieName)

	// 			resolve()
	// 		})
	// 	})
	// }

	// public async deleteSession(req: Request, sessionID: string): Promise<void> {
	// 	if (req.sessionID === sessionID)
	// 		throw new BadRequestException('Use logout to delete current session')
	// 	await this._deleteSession(sessionID)
	// }

	// public async deleteAllSessions(userId: string): Promise<void> {
	// 	const found = await this.prismaService.user.findUnique({
	// 		where: { id: userId },
	// 		select: {
	// 			sessionIDs: true,
	// 			email: true
	// 		}
	// 	})

	// 	if (!found) throw new NotFoundException('Wrong user id')

	// 	const { email } = found
	// 	const { sessionIDs } = found

	// 	if (sessionIDs.length === 0) return

	// 	const sessionKeys = sessionIDs.map((sID: string) =>
	// 		addSessionPrefix(sID, this.configService)
	// 	)

	// 	await this.redisClient.DEL(sessionKeys)
	// 	await this.prismaService.user.update({
	// 		where: { email },
	// 		data: { sessionIDs: [] }
	// 	})
	// }

	// async deleteAllSessionsExceptCurrent(
	// 	currentSessionID: string,
	// 	{ id }: SessionUser
	// ): Promise<void> {
	// 	const found = await this.prismaService.user.findFirst({
	// 		where: { id },
	// 		select: { sessionIDs: true }
	// 	})
	// 	if (!found)
	// 		throw new NotFoundException('Cannot delete sessions: wrong user id')

	// 	let { sessionIDs } = found
	// 	sessionIDs = sessionIDs.filter(sID => sID !== currentSessionID)

	// 	if (sessionIDs.length === 0) return

	// 	const sessionKeys = sessionIDs.map((sID: string) =>
	// 		addSessionPrefix(sID, this.configService)
	// 	)

	// 	await this.redisClient.DEL(sessionKeys)
	// 	await this.prismaService.user.update({
	// 		where: { id },
	// 		data: { sessionIDs: [currentSessionID] }
	// 	})
	// }

	// private async _addSession(
	// 	user: PublicUserModel,
	// 	sessionID: string
	// ): Promise<SessionUser> {
	// 	const { username } = user
	// 	const current = await this.prismaService.user.findUnique({
	// 		where: { username }
	// 	})

	// 	if (!current)
	// 		throw new NotFoundException(
	// 			`Cannot add session: user not found by username ${username}`
	// 		)

	// 	const updated = await this.prismaService.user.update({
	// 		where: { username },
	// 		data: { sessionIDs: [...current.sessionIDs, sessionID] },
	// 		select: {
	// 			id: true
	// 		}
	// 	})

	// 	return updated
	// }

	// private async _deleteSession(sessionID: string): Promise<void> {
	// 	const user = await this.prismaService.user.findFirst({
	// 		where: {
	// 			sessionIDs: {
	// 				has: sessionID
	// 			}
	// 		}
	// 	})

	// 	if (!user)
	// 		throw new NotFoundException(
	// 			'Cannot revoke non-existent session from database'
	// 		)

	// 	await this.prismaService.user.update({
	// 		where: {
	// 			id: user.id
	// 		},
	// 		data: {
	// 			sessionIDs: user.sessionIDs.filter(id => id !== sessionID)
	// 		}
	// 	})

	// 	await this.redisClient.DEL(addSessionPrefix(sessionID, this.configService))
	// }
}
