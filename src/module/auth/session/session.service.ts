import {
	BadRequestException,
	Injectable,
	NotFoundException
} from '@nestjs/common'
import { InternalServerErrorException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { RedisClientType } from '@redis/client'
import { Request, Response } from 'express'
import type { Session, SessionData } from 'express-session'

import { PrismaService } from '../../../core/module/prisma/prisma.service'
import { RedisService } from '../../../core/module/redis/redis.service'
import { UserModel } from '../../../shared/model/user.model'
import { addSessionPrefix } from '../../../shared/util/addPrefix.util'
import { getSessionMetadata } from '../../../shared/util/getSessionMetadata'

@Injectable()
export class SessionService {
	sessionCookieName: string
	redisClient: RedisClientType

	constructor(
		private readonly configService: ConfigService,
		private readonly prismaService: PrismaService,
		private readonly redisService: RedisService
	) {
		this.sessionCookieName = configService.getOrThrow<string>('SESSION_NAME')
		this.redisClient = redisService.getClient()
	}

	async getAllUserSessions(user: UserModel) {
		const found = await this.prismaService.user.findFirst({
			where: { id: user.id },
			select: { sessionIDs: true }
		})

		if (!found)
			throw new NotFoundException('Cannot fetch non-existent user sessions')

		const { sessionIDs } = found
		const prefix = this.configService.getOrThrow<string>('REDIS_PREFIX')
		const sessions: (Session & Partial<SessionData>)[] = await Promise.all(
			sessionIDs.map(async sessionID => {
				const sessionKey = prefix + sessionID
				const sessionJson = await this.redisClient.GET(sessionKey)

				if (sessionJson === null) {
					throw new InternalServerErrorException(
						`Cannot fetch user sessions due to wrong key ${sessionKey}`
					)
				}

				const session: Session & Partial<SessionData> = JSON.parse(sessionJson)
				return session
			})
		)

		return sessions
	}

	async saveCurrentSession(req: Request, user: UserModel) {
		const userAgent = req.headers['user-agent']
		const ip = req.ip

		if (!userAgent)
			throw new InternalServerErrorException('User-Agent is undefined')
		if (!ip) throw new InternalServerErrorException('IP is undefined')

		const sessionUser = await this._addSession(user, req.sessionID)

		req.session.user = sessionUser
		req.session.metadata = await getSessionMetadata(
			this.configService,
			userAgent,
			ip
		)
	}

	deleteCurrentSession(req: Request, res: Response): Promise<void> {
		const session = req.session

		return this._deleteSession(req.sessionID).then(
			() =>
				new Promise((resolve, reject) => {
					session.destroy((err: unknown) => {
						if (err)
							return reject(
								new InternalServerErrorException('Could not destroy session', {
									cause: err
								})
							)

						res.clearCookie(this.sessionCookieName)

						resolve()
					})
				})
		)
	}

	async deleteSession(req: Request, sessionID: string) {
		if (req.sessionID === sessionID)
			throw new BadRequestException('Use logout to delete current session')
		await this._deleteSession(sessionID)
	}

	private async _addSession(user: UserModel, sessionID: string) {
		const updated = await this.prismaService.user.update({
			where: { id: user.id },
			data: { sessionIDs: [...user.sessionIDs, sessionID] }
		})

		const { email: _e, password: _p, ...returned } = updated
		return returned
	}

	private async _deleteSession(sessionID: string) {
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
