import * as React from 'react'
import {
	Heading,
	Link,
	Section,
	Text
} from 'react-email'

import { EmailLayout } from './email-layout'

interface VerificationTemplateProps {
	domain: string
	token: string
}

export function VerificationTemplate({
	domain,
	token
}: VerificationTemplateProps) {
	const verificationLink =
		`${domain}/account/verify?token=${token}`

	return (
		<EmailLayout preview="Verify your email address">
			<Heading className="text-[36px] font-bold text-slate-900 mb-6">
				Verify your email address
			</Heading>

			<Text className="text-[18px] leading-8 text-slate-700">
				Thanks for creating your Yuii Stream account.
				To activate your account and start using the platform,
				please verify your email address by clicking the button below.
			</Text>

			<Section className="text-center my-10">
				<Link
					href={verificationLink}
					className="inline-block bg-violet-600 text-white no-underline px-8 py-4 rounded font-semibold"
				>
					Verify Email
				</Link>
			</Section>

			<Text className="text-slate-500 text-sm">
				If the button does not work, copy and paste
				the following link into your browser:
			</Text>

			<Link
				href={verificationLink}
				className="text-violet-600 break-all"
			>
				{verificationLink}
			</Link>
		</EmailLayout>
	)
}