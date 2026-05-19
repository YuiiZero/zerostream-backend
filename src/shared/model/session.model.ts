import { Field, Float, Int, ObjectType } from '@nestjs/graphql'
import { DeviceType } from 'device-detector-js/dist/typings/device'

import { SessionUserModel } from './user.model'

@ObjectType()
class CookieModel {
	@Field(() => Int)
	originalMaxAge!: number
	@Field()
	expires!: string
	@Field()
	secure!: boolean
	@Field()
	httpOnly!: boolean
	@Field()
	path!: string
	@Field(() => String)
	sameSite!: 'lax' | 'strict' | 'none'
}

@ObjectType()
class LanguagesModel {
	@Field()
	code!: string
	@Field()
	name!: string
	@Field()
	native!: string
}
@ObjectType()
class LocationModel {
	@Field(() => Int)
	geoname_id!: number
	@Field(() => String, { nullable: true })
	capital!: string | null
	@Field(() => [LanguagesModel])
	languages!: LanguagesModel[]
	@Field(() => String, { nullable: true })
	country_flag!: string | null
	@Field(() => String, { nullable: true })
	country_flag_emoji!: string | null
	@Field(() => String, { nullable: true })
	country_flag_emoji_unicode!: string | null
	@Field(() => String, { nullable: true })
	calling_code!: string | null
	@Field(() => Boolean, { nullable: true })
	is_eu!: boolean | null
}

@ObjectType()
class TimeZoneModel {
	@Field()
	id!: string
	@Field()
	current_time!: string
	@Field(() => Int)
	gmt_offset!: number
	@Field()
	code!: string
	@Field()
	is_daylight_saving!: boolean
}

@ObjectType()
class CurrencyModel {
	@Field()
	code!: string
	@Field()
	name!: string
	@Field()
	plural!: string
	@Field()
	symbol!: string
	@Field()
	symbol_native!: string
}
@ObjectType()
class ConnectionModel {
	@Field(() => Int, { nullable: true })
	asn!: number | null
	@Field(() => String, { nullable: true })
	isp!: string | null
	@Field(() => String, { nullable: true })
	sld!: string | null
	@Field(() => String, { nullable: true })
	tld!: string | null
	@Field(() => String, { nullable: true })
	carrier!: string | null
	@Field(() => Boolean, { nullable: true })
	home!: boolean | null
	@Field(() => String, { nullable: true })
	organization_type!: string | null
	@Field(() => String, { nullable: true })
	isic_code!: string | null
	@Field(() => String, { nullable: true })
	naics_code!: string | null
}
@ObjectType()
export class LocationDetailsModel {
	@Field()
	ip!: string
	@Field()
	type!: string
	@Field()
	continent_code!: string
	@Field()
	continent_name!: string
	@Field()
	country_code!: string
	@Field()
	country_name!: string
	@Field(() => String, { nullable: true })
	region_code!: string | null
	@Field(() => String, { nullable: true })
	city!: string | null
	@Field(() => String, { nullable: true })
	zip!: string | null
	@Field(() => Float, { nullable: true })
	latitude!: number | null
	@Field(() => Float, { nullable: true })
	longitude!: number | null
	@Field(() => String, { nullable: true })
	msa!: string | null
	@Field(() => String, { nullable: true })
	dma!: string | null
	@Field(() => String, { nullable: true })
	radius!: string | null
	@Field(() => String, { nullable: true })
	ip_routing_type!: string | null
	@Field(() => String, { nullable: true })
	connection_type!: string | null
	@Field(() => LocationModel)
	location!: LocationModel
	@Field(() => TimeZoneModel)
	time_zone!: TimeZoneModel
	@Field(() => CurrencyModel)
	currency!: CurrencyModel
	@Field(() => ConnectionModel)
	connection!: ConnectionModel
}

@ObjectType()
class ClientModel {
	@Field()
	type!: string
	@Field()
	name!: string
	@Field()
	version!: string
	@Field({ nullable: true })
	engineVersion?: string
	@Field({ nullable: true })
	url?: string
}

@ObjectType()
class DeviceModel {
	@Field(() => String)
	type!: DeviceType
	@Field()
	brand!: string
	@Field()
	model!: string
}

@ObjectType()
class OsModel {
	@Field()
	name!: string
	@Field()
	version!: string
	@Field(() => String)
	platform!: 'ARM' | 'x64' | 'x86' | 'MIPS' | 'SuperH' | ''
}

@ObjectType()
export class DeviceMetadataModel {
	@Field(() => ClientModel, { nullable: true })
	client!: ClientModel | null
	@Field(() => DeviceModel, { nullable: true })
	device!: DeviceModel | null
	@Field(() => OsModel, { nullable: true })
	os!: OsModel | null
}

@ObjectType()
export class SessionMetadataModel {
	@Field(() => LocationDetailsModel)
	locationDetails!: LocationDetailsModel
	@Field(() => DeviceMetadataModel)
	device!: DeviceMetadataModel
	@Field()
	ip!: string
}

@ObjectType()
export class SessionModel {
	@Field(() => CookieModel)
	cookie!: CookieModel
	@Field(() => SessionUserModel)
	user!: SessionUserModel
	@Field(() => SessionMetadataModel)
	metadata!: SessionMetadataModel
}
