import {
	ConflictException,
	Injectable,
	UnauthorizedException
} from '@nestjs/common'
import { InternalServerErrorException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { RedisClientType } from '@redis/client'
import { Request, Response } from 'express'
import type { Session, SessionData } from 'express-session'

import { User } from '../../../../prisma/generated/prisma/client'
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

	async getAllCurrentUserSessions(
		user: UserModel,
		session: Session & Partial<SessionData>
	) {
		let { sessionIDs } = session
		if (!sessionIDs) sessionIDs = await this._dbFetchUserSessions(user)

		const prefix = this.configService.getOrThrow<string>('REDIS_PREFIX')
		const sessions: (Session & Partial<SessionData>)[] = await Promise.all(
			sessionIDs.map(async sessionID => {
				const sessionKey = prefix + sessionID
				const sessionJson = await this.redisClient.GET(sessionKey)

				if (sessionJson === null) {
					throw new InternalServerErrorException(
						`Could not fetch user sessions: wrong key ${sessionKey}`
					)
				}

				const session: Session & Partial<SessionData> = JSON.parse(sessionJson)
				return session
			})
		)

		return sessions
	}

	saveCurrentSession(
		req: Request,
		session: Session & Partial<SessionData>,
		user: UserModel,
		userAgent: string,
		ip: string
	): Promise<Omit<User, 'password'>> {
		return this._pushCurrentSession(req, session, user, userAgent, ip).then(
			() =>
				new Promise((resolve, reject) => {
					session.save(err => {
						if (err) {
							console.error(err)
							return reject(
								new InternalServerErrorException('Could not save session', {
									cause: err
								})
							)
						}

						if (!session.user)
							return reject(
								new InternalServerErrorException(
									`session.user is ${session.user}`
								)
							)

						resolve(session.user)
					})
				})
		)
	}

	deleteCurrentSession(
		req: Request,
		session: Session & Partial<SessionData>,
		res: Response,
		user: UserModel
	): Promise<boolean> {
		return this._revokeSession(req.sessionID, user).then(
			() =>
				new Promise((resolve, reject) => {
					session.user = null
					session.metadata = null

					session.destroy((err: unknown) => {
						if (err)
							return reject(
								new InternalServerErrorException('Could not destroy session', {
									cause: err
								})
							)

						res.clearCookie(this.sessionCookieName)

						resolve(true)
					})
				})
		)
	}

	async deleteSessionById(req: Request, user: UserModel, sessionID: string) {
		if (req.sessionID === sessionID)
			throw new ConflictException(
				'Unable to delete current session: use logout instead'
			)

		await this.redisClient.DEL(addSessionPrefix(sessionID, this.configService))
		this._revokeSession(sessionID, user)
	}

	private async _pushCurrentSession(
		req: Request,
		session: Session & Partial<SessionData>,
		user: UserModel,
		userAgent: string,
		ip: string
	) {
		session.user = user
		session.metadata = await getSessionMetadata(
			this.configService,
			userAgent,
			ip
		)

		if (!session.user.sessionIDs)
			session.user.sessionIDs = await this._dbFetchUserSessions(user)

		const sessionIDs = await this._dbAddUserSessions(user, req.sessionID)
		session.user.sessionIDs = sessionIDs
	}

	private async _revokeSession(sessionID: string, user: UserModel) {
		if (!user) {
			throw new UnauthorizedException('User is unauthorized')
		}

		if (!user.sessionIDs)
			user.sessionIDs = await this._dbFetchUserSessions(user)

		const sessionIDs = await this._dbRevokeUserSessionById(user, sessionID)

		user.sessionIDs = sessionIDs
	}

	// Database related methods
	private async _dbFetchUserSessions(user: UserModel) {
		const userID = user.id
		const foundUser = await this.prismaService.user.findFirst({
			where: { id: userID },
			select: { sessionIDs: true }
		})

		if (!foundUser) {
			throw new Error('Unable to load session data: user is not found')
		}

		return foundUser.sessionIDs
	}

	private async _dbAddUserSessions(user: UserModel, ...sessionIDs: string[]) {
		const userID = user.id
		const currentSessions = await this._dbFetchUserSessions(user)
		const updatedUser = await this.prismaService.user.update({
			where: { id: userID },
			data: { sessionIDs: [...currentSessions, ...sessionIDs] },
			select: { sessionIDs: true }
		})

		if (!updatedUser) {
			throw new Error('Unable to update session data: user is not found')
		}

		return [...currentSessions, ...sessionIDs]
	}

	private async _dbRevokeUserSessionById(user: UserModel, sessionID: string) {
		const userID = user.id
		const currentSessions = await this._dbFetchUserSessions(user)
		const newSessions = currentSessions.filter((id: string) => id !== sessionID)
		const updatedUser = await this.prismaService.user.update({
			where: { id: userID },
			data: { sessionIDs: newSessions },
			select: { sessionIDs: true }
		})

		if (!updatedUser) {
			throw new Error('Unable to update session data: user is not found')
		}

		return updatedUser.sessionIDs
	}
}
