import { ConfigService } from '@nestjs/config'
import axios from 'axios'
import DeviceDetector from 'device-detector-js'

import { locationDetailsPlaceholder } from '../placeholder/session-metadata.placeholder'
import { LocationLookupResult } from '../types/metadata.type'

import { isDev } from './isDev.util'

export async function getSessionMetadata(
	configService: ConfigService,
	userAgent: string,
	ip: string
) {
	const deviceDetector = new DeviceDetector()
	const device = deviceDetector.parse(userAgent)
	const ipapiKey = configService.getOrThrow<string>('IPAPI_KEY')
	const IS_DEV = isDev()
	const locationDetails: LocationLookupResult = IS_DEV
		? locationDetailsPlaceholder
		: (
				await axios.get(
					`https://api.ipapi.com/api/${!IS_DEV ? '89.127.194.227' : ip}?access_key=${ipapiKey}`
				)
			).data

	return {
		device,
		ip,
		locationDetails
	}
}
