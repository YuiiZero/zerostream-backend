import {
	Field,
	Float,
	GraphQLISODateTime,
	Int,
	ObjectType
} from '@nestjs/graphql'
import { DeviceType } from 'device-detector-js/dist/typings/device'

import { CookieGql } from '../types/graphql.type'
import { Nullable } from '../types/type'
import { SessionUser } from '../types/user.type'

import { SessionUserModel } from './user.model'

@ObjectType()
export class CookieModel implements CookieGql {
	@Field(() => Int, { nullable: true })
	originalMaxAge!: number | null
	@Field(() => GraphQLISODateTime, { nullable: true })
	expires?: Date | null | undefined
	@Field({ nullable: true })
	secure?: boolean
	@Field({ nullable: true })
	httpOnly?: boolean
	@Field({ nullable: true })
	path?: string
	@Field({ nullable: true })
	sameSite?: 'lax' | 'strict' | 'none'
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
	capital!: string | Nullable
	@Field(() => [LanguagesModel])
	languages!: LanguagesModel[]
	@Field(() => String, { nullable: true })
	country_flag!: string | Nullable
	@Field(() => String, { nullable: true })
	country_flag_emoji!: string | Nullable
	@Field(() => String, { nullable: true })
	country_flag_emoji_unicode!: string | Nullable
	@Field(() => String, { nullable: true })
	calling_code!: string | Nullable
	@Field(() => Boolean, { nullable: true })
	is_eu!: boolean | Nullable
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
	asn!: number | Nullable
	@Field(() => String, { nullable: true })
	isp!: string | Nullable
	@Field(() => String, { nullable: true })
	sld!: string | Nullable
	@Field(() => String, { nullable: true })
	tld!: string | Nullable
	@Field(() => String, { nullable: true })
	carrier!: string | Nullable
	@Field(() => Boolean, { nullable: true })
	home!: boolean | Nullable
	@Field(() => String, { nullable: true })
	organization_type!: string | Nullable
	@Field(() => String, { nullable: true })
	isic_code!: string | Nullable
	@Field(() => String, { nullable: true })
	naics_code!: string | Nullable
}
@ObjectType()
export class LocationDetailsModel {
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
	region_code!: string | Nullable
	@Field(() => String, { nullable: true })
	city!: string | Nullable
	@Field(() => String, { nullable: true })
	zip!: string | Nullable
	@Field(() => Float, { nullable: true })
	latitude!: number | Nullable
	@Field(() => Float, { nullable: true })
	longitude!: number | Nullable
	@Field(() => String, { nullable: true })
	msa!: string | Nullable
	@Field(() => String, { nullable: true })
	dma!: string | Nullable
	@Field(() => String, { nullable: true })
	radius!: string | Nullable
	@Field(() => String, { nullable: true })
	ip_routing_type!: string | Nullable
	@Field(() => String, { nullable: true })
	connection_type!: string | Nullable
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
	client!: ClientModel | Nullable
	@Field(() => DeviceModel, { nullable: true })
	device!: DeviceModel | Nullable
	@Field(() => OsModel, { nullable: true })
	os!: OsModel | Nullable
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
	@Field()
	sessID!: string

	@Field(() => CookieModel)
	cookie!: CookieModel
	@Field(() => SessionUserModel)
	user!: SessionUser
	@Field(() => SessionMetadataModel)
	metadata!: SessionMetadataModel
}
