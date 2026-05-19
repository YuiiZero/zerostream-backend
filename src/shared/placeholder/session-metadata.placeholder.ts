import { LocationLookupResult } from '../types/type'

export const locationDetailsPlaceholder: LocationLookupResult = {
	ip: '89.127.194.227',
	type: 'ipv4',
	continent_code: 'EU',
	continent_name: 'Europe',
	country_code: 'DE',
	country_name: 'Germany',
	region_code: 'HE',
	region_name: 'Hessen',
	city: 'Frankfurt Am Main',
	zip: '60311',
	latitude: 50.11090087890625,
	longitude: 8.682100296020508,
	msa: null,
	dma: null,
	radius: '0',
	ip_routing_type: 'fixed',
	connection_type: 'fixed wireless',
	location: {
		geoname_id: 6553153,
		capital: 'Berlin',
		languages: [{ code: 'de', name: 'German', native: 'Deutsch' }],
		country_flag: 'https://assets.ipstack.com/flags/de.svg',
		country_flag_emoji: '🇩🇪',
		country_flag_emoji_unicode: 'U+1F1E9 U+1F1EA',
		calling_code: '49',
		is_eu: true
	},
	time_zone: {
		id: 'Europe/Berlin',
		current_time: '2026-05-19T13:31:10+02:00',
		gmt_offset: 7200,
		code: 'CEST',
		is_daylight_saving: true
	},
	currency: {
		code: 'EUR',
		name: 'Euro',
		plural: 'euros',
		symbol: '€',
		symbol_native: '€'
	},
	connection: {
		asn: 44051,
		isp: 'Fornex Hosting s.l.',
		sld: 'fornex',
		tld: 'cloud',
		carrier: 'fornex hosting s.l.',
		home: false,
		organization_type: 'Internet Hosting Services',
		isic_code: 'J6311',
		naics_code: '518210'
	}
}
