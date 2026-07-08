import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Cron, CronExpression } from '@nestjs/schedule'
import ms, { StringValue } from 'ms'

import { PrismaService } from '../../core/module/prisma/prisma.service'
import { handleException } from '../../shared/util/handleException.util'
import { MailService } from '../mail/mail.service'

import { CronServiceInterface } from './interface/cron.interface'

@Injectable()
export class CronService implements CronServiceInterface {
	private readonly ALLOWED_ORIGIN: string
	private readonly ACCOUNT_DELETION_INTERVAL: StringValue

	public constructor(
		private readonly prismaService: PrismaService,
		private readonly configService: ConfigService,
		private readonly mailService: MailService
	) {
		this.ALLOWED_ORIGIN = configService.getOrThrow('ALLOWED_ORIGIN')
		this.ACCOUNT_DELETION_INTERVAL = configService.getOrThrow<StringValue>(
			'ACCOUNT_DELETION_INTERVAL'
		)
	}

	@Cron(CronExpression.EVERY_WEEKEND, {
		name: 'clearDeactivatedUsersCron'
	})
	public async clearDeactivatedUsersCron(): Promise<void> {
		try {
			const deletionDate = new Date(
				Date.now() - ms(this.ACCOUNT_DELETION_INTERVAL)
			)
			const userEntries = await this.prismaService.user.findMany({
				where: {
					isDeactivated: true,
					deactivatedAt: {
						lt: deletionDate
					}
				},
				select: {
					id: true,
					email: true
				}
			})

			if (userEntries.length === 0) return

			const userIds = userEntries.map(({ id }) => id)
			const emailResults = await Promise.allSettled(
				userEntries.map(async ({ email }) => {
					await this.mailService.sendAccountDeletionEmail({
						domain: this.ALLOWED_ORIGIN,
						to: email
					})
				})
			)
			const failedEmails = emailResults.filter(
				result => result.status === 'rejected'
			)

			if (failedEmails.length > 0) {
				// log here
			}

			const { count: deletedCount } = await this.prismaService.user.deleteMany({
				where: {
					id: { in: userIds },
					isDeactivated: true
				}
			})
		} catch (error) {
			handleException(error, 'Failed to execute clearDeactivatedUsersCron.')
		}
	}

	@Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT, {
		name: 'clearExpiredTokensCron'
	})
	public async clearExpiredTokensCron(): Promise<void> {
		try {
			const { count: deletedCount } = await this.prismaService.token.deleteMany(
				{
					where: {
						expires: {
							lte: new Date()
						}
					}
				}
			)
		} catch (error) {
			handleException(error, 'Failed to execute clearExpiredTokensCron.')
		}
	}

	@Cron(CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_MIDNIGHT, {
		name: 'sendTotpActivationMessageCron'
	})
	public async sendTotpActivationMessageCron(): Promise<void> {
		try {
			const usersWithoutTotp = await this.prismaService.user.findMany({
				where: {
					isTotpEnabled: false
				},
				select: {
					email: true,
					id: true
				}
			})

			const emailResults = await Promise.allSettled(
				usersWithoutTotp.map(async ({ email }) => {
					await this.mailService.sendAddAuthenticatorEmail({
						domain: this.ALLOWED_ORIGIN,
						to: email
					})
				})
			)
			const failedEmails = emailResults.filter(
				result => result.status === 'rejected'
			)

			if (failedEmails.length > 0) {
				// log here
			}

			failedEmails.forEach(failed => {
				// log here
			})
		} catch (error) {
			handleException(error, 'Failed to execute sendTotpActivationMessageCron.')
		}
	}
}
