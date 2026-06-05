import * as React from 'react'
import {
	Body,
	Head,
	Html,
	Preview,
	Section,
	Tailwind,
	Text,
	Link
} from 'react-email'

interface EmailLayoutProps {
	preview: string
	children: React.ReactNode
}

export function EmailLayout({
	preview,
	children
}: EmailLayoutProps) {
	return (
		<Html>
			<Tailwind>
				<Head />
				<Preview>{preview}</Preview>

				<Body className="bg-slate-100 py-10 px-4">
					<Section className="max-w-[600px] mx-auto bg-white border-t-4 border-violet-600">
						<Section className="px-12 py-10">
							{children}
						</Section>

						<Section className="border-t border-slate-200 bg-slate-50 px-12 py-6">
							<Text className="text-sm text-slate-500 text-center m-0">
								If you have any questions, contact{' '}
								<Link
									href="mailto:support@yuiistream.ru"
									className="text-violet-600 underline"
								>
									support@yuiistream.ru
								</Link>
							</Text>

							<Text className="text-xs text-slate-400 text-center mt-4 mb-0">
								© {new Date().getFullYear()} Yuii Stream.
								All rights reserved.
							</Text>
						</Section>
					</Section>
				</Body>
			</Tailwind>
		</Html>
	)
}