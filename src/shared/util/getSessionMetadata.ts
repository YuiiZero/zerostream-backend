import { ConfigService } from '@nestjs/config'
import axios from 'axios'
import DeviceDetector from 'device-detector-js'

import { LocationLookupResult } from '../types/type'

import { isDev } from './isDev.util'

export async function getSessionMetadata(
	configService: ConfigService,
	userAgent: string,
	ip: string
) {
	const deviceDetector = new DeviceDetector()
	const device = deviceDetector.parse(userAgent)
	const ipapiKey = configService.getOrThrow<string>('IPAPI_KEY')
	const axiosResponse = await axios.get(
		`https://api.ipapi.com/api/${isDev(configService) ? '89.127.194.227' : ip}?access_key=${ipapiKey}`
	)
	const locationLookupResult: LocationLookupResult = axiosResponse.data

	return {
		device,
		ip,
		locationDetails: locationLookupResult
	}
}
