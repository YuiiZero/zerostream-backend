import { DeviceDetectorResult } from 'device-detector-js'
import type { Request, Response } from 'express'
import session from 'express-session'

import { User as UserPrisma } from '../../../prisma/generated/prisma/client'

export type BooleanString = 'true' | 'false'
export type ExpressSession = typeof session
export type Ctx = { req: Request; res: Response }
export enum HTTP_HEADERS {
	SET_COOKIE = 'Set-Cookie'
}
export type User = Omit<UserPrisma, 'createdAt' | 'updatedAt' | 'id'>
export interface LocationLookupResult {
	ip: string
	type: string
	continent_code: string
	continent_name: string
	country_code: string
	country_name: string
	region_code: string | null
	region_name: string | null
	city: string | null
	zip: string | null
	latitude: number | null
	longitude: number | null
	msa: string | null
	dma: string | null
	radius: string | null
	ip_routing_type: string | null
	connection_type: string | null
	location: {
		geoname_id: number
		capital: string | null
		languages: {
			code: string
			name: string
			native: string
		}[]
		country_flag: string | null
		country_flag_emoji: string | null
		country_flag_emoji_unicode: string | null
		calling_code: string | null
		is_eu: boolean | null
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
		asn: number | null
		isp: string | null
		sld: string | null
		tld: string | null
		carrier: string | null
		home: boolean | null
		organization_type: string | null
		isic_code: string | null
		naics_code: string | null
	}
}
export interface SessionMetadata {
	locationDetails: LocationLookupResult
	device: DeviceDetectorResult
	ip: string
}

export interface SendMailOptions {
	to: string
	subject: string
	html: string
}

export type Nullable = null | undefined
