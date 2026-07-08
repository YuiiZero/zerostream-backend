import * as React from 'react'
import {
  Heading,
  Link,
  Section,
  Text
} from 'react-email'

import { EmailLayout } from './email-layout'

interface TotpTemplateProps {
  domain: string
}

export function TotpTemplate({
  domain
}: TotpTemplateProps) {
  const enableTotpLink = `https://${domain}/account/2fa/totp`
  return (
    <EmailLayout preview="Account security">
      <Heading className="text-[36px] font-bold text-slate-900 mb-6">
        Enable two-factor verification to secure your account
      </Heading>

      <Text className="text-[18px] leading-8 text-slate-700">
        Enabling Google Authencitaor takes just a minute.
        Ensure your account is secured by following this link:
      </Text>

      <Section className="text-center my-10">
        <Link
          href={enableTotpLink}
          className="inline-block bg-violet-600 text-white no-underline px-8 py-4 rounded font-semibold"
        >
          Add authenticator
        </Link>
      </Section>

      <Text className="text-slate-500 text-sm mt-8">
        If the button does not work, copy and paste
        the following link into your browser:
      </Text>

      <Link
        href={enableTotpLink}
        className="text-violet-600 break-all"
      >
        {enableTotpLink}
      </Link>
    </EmailLayout>
  )
}