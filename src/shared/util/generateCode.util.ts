import { randomInt } from 'crypto'

export function generateCode(digits: number) {
	return Array.from({ length: digits }, () => randomInt(0, 9)).join('')
}
