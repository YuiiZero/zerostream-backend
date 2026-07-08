export interface CronServiceInterface {
	clearExpiredTokensCron(): Promise<void>
	clearDeactivatedUsersCron(): Promise<void>

	sendTotpActivationMessageCron(): Promise<void>
}
