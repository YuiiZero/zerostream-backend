import { SessionMetadata } from "../../../../shared/types/type";
import * as React from 'react'
import {Html, Tailwind, Head, Preview, Body, Section, Heading, Text, Link} from 'react-email'

interface PasswordRecoveryTemplateProps {
  domain: string,
  token: string,
  metadata: SessionMetadata
}

export function PasswordRecoveryTemplate({ domain, token, metadata }: PasswordRecoveryTemplateProps) {
  const recoveryLink = `${domain}/account/reset-password?token=${token}`
  const client = metadata.device.client?.name
  const location = `${metadata.locationDetails.country_name}: ${metadata.locationDetails.city}`
  const ip = metadata.ip
  const os = metadata.device.os?.name

  return <Html>
    <Tailwind>
      <Head />
      <Preview>Password reset request</Preview>
      <Body className='max-w-2xl mx-auto p-6 bg-slate-50'>
        <Section className='text-center mb-8'>
          <Heading className='text-3xl font-bold'>Password reset request on {domain}</Heading>
          <Text className='text-base text-black'>
            Hello! Press the button below to reset your password on Yuii Stream.
          </Text>
          <Text className='text-base font-semibold text-red-600'>
            Warning: if you have not requested password recovery, ignore this message. Do not share this link with anyone.
          </Text>
          <Text>
            Information about the request:
            <ul className="text-left">
              {ip && <li><span className="font-semibold text-violet-800">IP</span> {ip}</li>}
              {location && <li><span className="font-semibold text-violet-800">Location</span> {location}</li>}
              {client && <li><span className="font-semibold text-violet-800">Client</span> {client}</li>}
              {os && <li><span className="font-semibold text-violet-800">OS</span> {os}</li>}
            </ul>
          </Text>
          <Link href={recoveryLink} className="font-semibold mx-auto px-5 py-1 bg-transparent text-violet-800 border-2 rounded-full hover:bg-violet-800 hover:border-transparent hover:text-white active:bg-violet-900">
            Reset password
          </Link>
        </Section>
        <Section className="text-center text-gray-600">
          If you have any questions, please contact us: <Link href="mailto:support@yuiistream.ru" className="underline">support@yuiistream.ru</Link>
        </Section>
      </Body>
    </Tailwind>
  </Html>
}