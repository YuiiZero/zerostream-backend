import { Args, Query, Resolver } from '@nestjs/graphql'

import { MailService } from './mail.service'

@Resolver()
export class MailResolver {
	constructor(private readonly mailService: MailService) {}

	@Query(() => Boolean)
	ping(@Args('email') email: string) {
		this.mailService.sendEmail({ to: email, html: 'Pong', subject: 'Pong' })

		return true
	}
}
