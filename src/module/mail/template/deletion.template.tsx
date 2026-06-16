import * as React from 'react'
import {
	Heading,
	Link,
	Text
} from 'react-email'

import { EmailLayout } from './email-layout'

interface DeletionTemplateProps {
	domain: string
}

export function DeletionTemplate({
	domain
}: DeletionTemplateProps) {
	const registrationLink =
		`${domain}/account/create`

	return (
		<EmailLayout preview="Your account has been deleted">
			<Heading className="text-[36px] font-bold text-slate-900 mb-6">
				Your account has been deleted
			</Heading>

			<Text className="text-[18px] leading-8 text-slate-700">
				This email confirms that your Yuii Stream account and associated data have been permanently deleted.
			</Text>

			<Text className="text-[18px] leading-8 text-slate-700">
				You no longer have access to the account,
				and you will not receive account-related
				notifications from Yuii Stream.
			</Text>

			<Text className="text-[18px] leading-8 text-slate-700">
				If you would like to use Yuii Stream again
				in the future, you can create a new account
				using the link below.
			</Text>

			<Text className="mt-8">
				<Link
					href={registrationLink}
					className="text-violet-600 underline"
				>
					Create a new account
				</Link>
			</Text>
		</EmailLayout>
	)
}