import * as React from 'react'
import {
	Heading,
	Section,
	Text
} from 'react-email'

import { StringValue } from 'ms'

import { EmailLayout } from './email-layout'
import { SessionMetadata } from '../../../../shared/types/metadata.type'
import { TimeConverter } from '../../../../shared/util/TimeConverter.util'

interface DeactivationTemplateProps {
	token: string
	metadata: SessionMetadata
	pincodeTTL: StringValue
}

export function DeactivationTemplate({
	token,
	metadata,
	pincodeTTL
}: DeactivationTemplateProps) {
	const timeConverter = new TimeConverter()

	const ttlMinutes =
		timeConverter.getMinutes(pincodeTTL)

	const client = metadata.device.client?.name
	const os = metadata.device.os?.name
	const ip = metadata.ip

	const location =
		metadata.locationDetails?.country_name &&
		metadata.locationDetails?.city
			? `${metadata.locationDetails.country_name}, ${metadata.locationDetails.city}`
			: undefined

	return (
		<EmailLayout preview="Account deactivation request">
			<Heading className="text-[36px] font-bold text-slate-900 mb-6">
				Account deactivation request
			</Heading>

			<Text className="text-[18px] leading-8 text-slate-700">
				You requested to deactivate your
				Yuii Stream account.
				Enter the verification code below
				to continue.
			</Text>

			<Text className="text-slate-700">
				This code expires in{' '}
				<strong>{ttlMinutes} minutes</strong>.
			</Text>

			<Section className="text-center my-10">
				<Text className="inline-block bg-violet-600 text-white text-4xl font-bold tracking-[10px] px-8 py-4 rounded m-0">
					{token}
				</Text>
			</Section>

			<Section className="bg-slate-50 rounded p-5 mb-8">
				<Text className="font-semibold text-slate-900 mb-3">
					Request details
				</Text>

				{ip && (
					<Text className="m-0">
						<strong>IP address:</strong> {ip}
					</Text>
				)}

				{location && (
					<Text className="m-0">
						<strong>Location:</strong> {location}
					</Text>
				)}

				{client && (
					<Text className="m-0">
						<strong>Browser:</strong> {client}
					</Text>
				)}

				{os && (
					<Text className="m-0">
						<strong>Operating system:</strong> {os}
					</Text>
				)}
			</Section>

			<Text className="text-red-600 font-semibold">
				If you did not request this action,
				do not share this code with anyone
				and ignore this email.
			</Text>
		</EmailLayout>
	)
}