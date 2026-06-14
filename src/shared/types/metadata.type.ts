import { DeviceDetectorResult } from 'device-detector-js'

import { Nullable } from './type'

export interface LocationLookupResult {
	type: string
	continent_code: string
	continent_name: string
	country_code: string
	country_name: string
	region_code: string | Nullable
	region_name: string | Nullable
	city: string | Nullable
	zip: string | Nullable
	latitude: number | Nullable
	longitude: number | Nullable
	msa: string | Nullable
	dma: string | Nullable
	radius: string | Nullable
	ip_routing_type: string | Nullable
	connection_type: string | Nullable
	location: {
		geoname_id: number
		capital: string | Nullable
		languages: {
			code: string
			name: string
			native: string
		}[]
		country_flag: string | Nullable
		country_flag_emoji: string | Nullable
		country_flag_emoji_unicode: string | Nullable
		calling_code: string | Nullable
		is_eu: boolean | Nullable
	}
	time_zone: {
		id: string
		current_time: string
		gmt_offset: number
		code: string
		is_daylight_saving: boolean
	}
	currency: {
		code: string
		name: string
		plural: string
		symbol: string
		symbol_native: string
	}
	connection: {
		asn: number | Nullable
		isp: string | Nullable
		sld: string | Nullable
		tld: string | Nullable
		carrier: string | Nullable
		home: boolean | Nullable
		organization_type: string | Nullable
		isic_code: string | Nullable
		naics_code: string | Nullable
	}
}
export interface SessionMetadata {
	locationDetails: LocationLookupResult
	device: DeviceDetectorResult
	ip: string
}
