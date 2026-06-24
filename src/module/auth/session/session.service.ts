import {
	BadRequestException,
	Injectable,
	NotFoundException
} from '@nestjs/common'
import { InternalServerErrorException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { RedisClientType } from '@redis/client'
import { Request, Response } from 'express'
import type { SessionData } from 'express-session'

import { PrismaService } from '../../../core/module/prisma/prisma.service'
import { RedisService } from '../../../core/module/redis/redis.service'
import { SessionModel } from '../../../shared/model/session.model'
import { PublicUserModel } from '../../../shared/model/user.model'
import { HttpHeader } from '../../../shared/types/type'
import { SessionUser } from '../../../shared/types/user.type'
import { addSessionPrefix } from '../../../shared/util/addPrefix.util'
import { getSessionMetadata } from '../../../shared/util/getSessionMetadata'
import { toSessionModel } from '../../../shared/util/toSessionModel.util'

@Injectable()
export class SessionService {
	private readonly sessionCookieName: string
	private readonly redisClient: RedisClientType

	public constructor(
		private readonly configService: ConfigService,
		private readonly prismaService: PrismaService,
		private readonly redisService: RedisService
	) {
		this.sessionCookieName = configService.getOrThrow<string>('SESSION_NAME')
		this.redisClient = redisService.client
	}

	public async getAllUserSessions(userId: string): Promise<SessionModel[]> {
		const found = await this.prismaService.user.findFirst({
			where: { id: userId },
			select: { sessionIDs: true }
		})

		if (!found)
			throw new NotFoundException('Cannot fetch non-existent user sessions')

		const { sessionIDs } = found
		const prefix = this.configService.getOrThrow<string>('REDIS_PREFIX')
		const sessions: SessionData[] = await Promise.all(
			sessionIDs.map(async sessionID => {
				const sessionKey = prefix + sessionID
				const sessionJson = await this.redisClient.GET(sessionKey)

				if (sessionJson === null) {
					throw new InternalServerErrorException(
						`Cannot fetch user sessions due to wrong key ${sessionKey}`
					)
				}

				const session: SessionData = JSON.parse(sessionJson)
				return session
			})
		)
		const models: SessionModel[] = sessions.map(s => toSessionModel(s))
		return models
	}

	public async saveCurrentSession(
		req: Request,
		publicUser: PublicUserModel
	): Promise<void> {
		const userAgent = req.headers[HttpHeader.USER_AGENT]
		const ip = req.ip

		if (!userAgent)
			throw new InternalServerErrorException('User-Agent is undefined')
		if (!ip) throw new InternalServerErrorException('IP is undefined')

		const sessionUser = await this._addSession(publicUser, req.sessionID)

		req.session.sessID = req.sessionID
		req.session.user = sessionUser
		req.session.metadata = await getSessionMetadata(
			this.configService,
			userAgent,
			ip
		)
	}

	public async deleteCurrentSession(
		req: Request,
		res: Response
	): Promise<void> {
		const session = req.session

		await this._deleteSession(req.sessionID)

		await new Promise<void>((resolve, reject) => {
			session.destroy((err: Error) => {
				if (err)
					reject(
						new InternalServerErrorException(
							`Cannot destroy session: ${err.message}`,
							{ cause: err }
						)
					)

				res.clearCookie(this.sessionCookieName)

				resolve()
			})
		})
	}

	public async deleteSession(req: Request, sessionID: string): Promise<void> {
		if (req.sessionID === sessionID)
			throw new BadRequestException('Use logout to delete current session')
		await this._deleteSession(sessionID)
	}

	public async deleteAllSessions(userId: string): Promise<void> {
		const found = await this.prismaService.user.findUnique({
			where: { id: userId },
			select: {
				sessionIDs: true,
				email: true
			}
		})

		if (!found) throw new NotFoundException('Wrong user id')

		const { email } = found
		const { sessionIDs } = found

		if (sessionIDs.length === 0) return

		const sessionKeys = sessionIDs.map((sID: string) =>
			addSessionPrefix(sID, this.configService)
		)

		await this.redisClient.DEL(sessionKeys)
		await this.prismaService.user.update({
			where: { email },
			data: { sessionIDs: [] }
		})
	}

	async deleteAllSessionsExceptCurrent(
		currentSessionID: string,
		{ id }: SessionUser
	): Promise<void> {
		const found = await this.prismaService.user.findFirst({
			where: { id },
			select: { sessionIDs: true }
		})
		if (!found)
			throw new NotFoundException('Cannot delete sessions: wrong user id')

		let { sessionIDs } = found
		sessionIDs = sessionIDs.filter(sID => sID !== currentSessionID)

		if (sessionIDs.length === 0) return

		const sessionKeys = sessionIDs.map((sID: string) =>
			addSessionPrefix(sID, this.configService)
		)

		await this.redisClient.DEL(sessionKeys)
		await this.prismaService.user.update({
			where: { id },
			data: { sessionIDs: [currentSessionID] }
		})
	}

	private async _addSession(
		user: PublicUserModel,
		sessionID: string
	): Promise<SessionUser> {
		const { username } = user
		const current = await this.prismaService.user.findUnique({
			where: { username }
		})

		if (!current)
			throw new NotFoundException(
				`Cannot add session: user not found by username ${username}`
			)

		const updated = await this.prismaService.user.update({
			where: { username },
			data: { sessionIDs: [...current.sessionIDs, sessionID] },
			select: {
				id: true
			}
		})

		return updated
	}

	private async _deleteSession(sessionID: string): Promise<void> {
		const user = await this.prismaService.user.findFirst({
			where: {
				sessionIDs: {
					has: sessionID
				}
			}
		})

		if (!user)
			throw new NotFoundException(
				'Cannot revoke non-existent session from database'
			)

		await this.prismaService.user.update({
			where: {
				id: user.id
			},
			data: {
				sessionIDs: user.sessionIDs.filter(id => id !== sessionID)
			}
		})

		await this.redisClient.DEL(addSessionPrefix(sessionID, this.configService))
	}
}
