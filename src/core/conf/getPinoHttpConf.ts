import { Params } from 'nestjs-pino'
import { randomUUID } from 'node:crypto'
import os from 'os'

import { isDev } from '../../shared/util/isDev.util'

export const getPinoHttpConfig = (): Params['pinoHttp'] => ({
	genReqId: (req, res) => {
		const requestId = req.headers['x-request-id'] ?? randomUUID()

		res.setHeader('X-Request-Id', requestId)

		return requestId
	},
	transport: isDev()
		? {
			   // resolve to the actual module path so pino can load the ESM/CJS entry correctly
			   target: require.resolve('pino-pretty'),
			   options: {
				   colorize: true,
				   crlf: os.type() === 'Windows_NT',
				   translateTime: 'SYS:yyyy-mm-dd HH:MM:ss.l'
			   }
		   }
		: undefined,
	level: isDev() ? 'debug' : 'info',
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
			'req.method',
			'req.query',
			'req.url',
			'req.params',
			'req.headers.accept',
			'req.headers.["accept-encoding"]',
			'req.headers.connection',
			'req.headers.["content-length"]',

			'req.session.metadata',

			'req.body.variables.password',
			'req.body.variables.newPassword',
			'req.body.variables.confirmPassword',

			'res.headers["set-cookie"]',
			'res.headers["x-powered-by"]',
			'res.headers["access-control-allow-origin"]',
			'res.headers["vary"]',
			'res.headers["access-control-allow-credentials"]',
			'res.headers["content-length"]',
			'res.headers["etag"]'
		],
		remove: true
	},
	customLogLevel(req, res, error) {
		if (res.statusCode >= 500 || error) return 'error'
		if (res.statusCode >= 400) return 'warn'
		return 'info'
	}
})
