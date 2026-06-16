import * as React from 'react'
import {
	Heading,
	Link,
	Section,
	Text
} from 'react-email'

import { EmailLayout } from './email-layout'
import { SessionMetadata } from '../../../shared/types/metadata.type'

interface PasswordRecoveryTemplateProps {
	domain: string
	token: string
	metadata: SessionMetadata
}

export function PasswordRecoveryTemplate({
	domain,
	token,
	metadata
}: PasswordRecoveryTemplateProps) {
	const recoveryLink =
		`${domain}/account/reset-password?token=${token}`

	const client = metadata.device.client?.name
	const os = metadata.device.os?.name
	const ip = metadata.ip

	const location =
		metadata.locationDetails?.country_name &&
		metadata.locationDetails?.city
			? `${metadata.locationDetails.country_name}, ${metadata.locationDetails.city}`
			: undefined

	return (
		<EmailLayout preview="Password reset request">
			<Heading className="text-[36px] font-bold text-slate-900 mb-6">
				Reset your password
			</Heading>

			<Text className="text-[18px] leading-8 text-slate-700">
				We received a request to reset the password
				for your Yuii Stream account.
				Click the button below to create a new password.
			</Text>

			<Section className="text-center my-10">
				<Link
					href={recoveryLink}
					className="inline-block bg-violet-600 text-white no-underline px-8 py-4 rounded font-semibold"
				>
					Reset Password
				</Link>
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
				If you did not request a password reset,
				you can safely ignore this email.
				Your password will remain unchanged.
			</Text>

			<Text className="text-slate-500 text-sm mt-8">
				If the button does not work, copy and paste
				the following link into your browser:
			</Text>

			<Link
				href={recoveryLink}
				className="text-violet-600 break-all"
			>
				{recoveryLink}
			</Link>
		</EmailLayout>
	)
}