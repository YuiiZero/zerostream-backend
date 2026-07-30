export function isDev() {
	const raw = process.env['NODE_ENV']
	if (!raw) return false

	const cleaned = typeof raw === 'string'
		? raw.trim().replace(/^['"]+|['"]+$/g, '')
		: raw

	return cleaned === 'development'
}
