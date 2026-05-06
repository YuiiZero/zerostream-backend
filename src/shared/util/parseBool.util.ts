export function parseBool(value: string) {
	switch (value) {
		case 'true':
			return true
		case 'false':
			return false
		default:
			throw new Error(`Could not parse value ${value} into boolean`)
	}
}
