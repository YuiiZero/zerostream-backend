import * as React from 'react'
import { Body, Head, Heading, Html, Link, Preview, Section, Tailwind, Text } from 'react-email'

interface VerificationTemplateProps {
  domain: string,
  token: string
}

export function VerificationTemplate({ domain, token }: VerificationTemplateProps) {
  const verificationLink = `${domain}/account/verify?token=${token}`

  return <Html>
    <Tailwind>
      <Head />
      <Preview>Verify your account</Preview>
      <Body className='max-w-2xl mx-auto p-6 bg-slate-50'>
        <Section className='text-center mb-8'>
          <Heading className='text-3xl font-bold'>Verify your email on {domain}</Heading>
          <Text className='text-base text-black'>
            Welcome to Yuii's streaming platform!{<br></br>}
            Please, verify your email address by pressing the button below:
          </Text>
          <Link href={verificationLink} className="font-semibold mx-auto px-5 py-1 bg-transparent text-violet-800 border-2 rounded-full hover:bg-violet-800 hover:border-transparent hover:text-white active:bg-violet-900">
            Verify
          </Link>
        </Section>
        <Section className="text-center text-gray-600">
          If you have any questions, please contact us: <Link href="mailto:support@yuiistream.ru" className="underline">support@yuiistream.ru</Link>
        </Section>
      </Body>
    </Tailwind>
  </Html>
}