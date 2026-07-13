import { Params } from 'nestjs-pino'
import { randomUUID } from 'node:crypto'
import os from 'os'

export const getPinoHttpConfig = (): Params['pinoHttp'] => ({
	genReqId: (req, res) => {
		const requestId = req.headers['x-request-id'] ?? randomUUID()

		res.setHeader('X-Request-Id', requestId)

		return requestId
	},
	transport: process.stdout.isTTY
		? {
				target: 'pino-pretty',
				options: {
					colorize: true,
					crlf: os.type() === 'Windows_NT',
					translateTime: 'SYS:yyyy-mm-dd HH:MM:ss.l'
				}
			}
		: undefined,
	redact: {
		paths: [
			'user.password',
			'user.hashPassword',
			'user.sessionIDs',
			'user.totpSecret',
			'user.encryptedTotpSecret',
			'user.totpPendingSecret',
			'user.encryptedTotpPendingSecret',
			'user.recoveryCodes',
			'user.hashRecoveryCodes',
			'user.deactivationCode',
			'user.hashDeactivationCode',
			'user.deactivationCodeExpiresAt',

			'req.headers.authorization',
			'req.headers.cookie',
			'req.headers["postman-token"]',

			'req.session.metadata',

			'req.body.variables.password',
			'req.body.variables.newPassword',
			'req.body.variables.confirmPassword',

			'res.headers["set-cookie"]'
		],
		remove: true
	},
	customLogLevel(req, res, error) {
		if (res.statusCode >= 500 || error) return 'error'
		if (res.statusCode >= 400) return 'warn'
		return 'info'
	}
})
