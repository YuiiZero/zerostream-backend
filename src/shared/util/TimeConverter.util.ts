import { Injectable } from '@nestjs/common'
import { StringValue } from 'ms'
import ms from 'ms'

@Injectable()
export class TimeConverter {
	isStringValue(value: StringValue): boolean {
		if (typeof value !== 'string') {
			return false
		}
		const result = ms(value)
		return typeof result === 'number' && !isNaN(result)
	}

	validate(value: StringValue) {
		if (!this.isStringValue(value)) {
			throw new Error(`${value} is not a StringValue`)
		}
	}

	getSeconds(value: StringValue): number {
		this.validate(value)
		return ms(value) / 1000
	}

	getMilliseconds(value: StringValue): number {
		this.validate(value)
		return ms(value)
	}

	getMinutes(value: StringValue): number {
		this.validate(value)
		return ms(value) / 1000 / 60
	}

	getHours(value: StringValue): number {
		this.validate(value)
		return ms(value) / 1000 / 60 / 60
	}

	getDays(value: StringValue): number {
		this.validate(value)
		return ms(value) / 1000 / 60 / 60 / 24
	}
}
