import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Cron } from '@nestjs/schedule'
import ms, { StringValue } from 'ms'

import { PrismaService } from '../../core/module/prisma/prisma.service'
import { MailService } from '../mail/mail.service'

@Injectable()
export class CronService {
	ALLOWED_ORIGIN: string

	constructor(
		private readonly prismaService: PrismaService,
		private readonly configService: ConfigService,
		private readonly mailService: MailService
	) {
		this.ALLOWED_ORIGIN = configService.getOrThrow('ALLOWED_ORIGIN')
	}

	@Cron('* 0 * * *', { name: 'clearDeactivatedAccounts' })
	public async clearDeactivatedAccounts() {
		console.log('CLEAR_DEACTIVATED_CRON')
		const deletionInterval = ms(
			this.configService.getOrThrow<StringValue>('ACCOUNT_DELETION_INTERVAL')
		)
		const deletionDate = new Date(Date.now() - deletionInterval)
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
		// Удаляет пользователей, только если отправка письма об удалении завершилась удачно
		const promiseSettledResult = await Promise.allSettled(
			userEntries.map(async ({ email, id }) => {
				await this.mailService.sendAccountDeletionEmail({
					domain: this.ALLOWED_ORIGIN,
					to: email
				})
				return id
			})
		)
		const fulfilledResults = promiseSettledResult.filter(
			(result): result is PromiseFulfilledResult<string> =>
				result.status === 'fulfilled'
		)
		const userIds = fulfilledResults.map(result => result.value)

		if (userIds.length !== 0) {
			await this.prismaService.user.deleteMany({
				where: {
					id: { in: userIds },
					isDeactivated: true
				}
			})
		}
	}

	@Cron('* 0 * * *', { name: 'clearExpiredTokens' })
	clearExpiredTokens() {
		this.prismaService.token.deleteMany({
			where: {
				expires: {
					lte: new Date()
				}
			}
		})
	}
}
