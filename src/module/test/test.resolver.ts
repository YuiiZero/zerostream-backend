import { Args, Mutation, Resolver } from '@nestjs/graphql'

import { GenerateUsersInput } from './input/test.input'
import { TestService } from './test.service'

@Resolver()
export class TestResolver {
	public constructor(private readonly testService: TestService) {}

	@Mutation(() => Boolean)
	public async generateUsers(
		@Args('generateUsersInput') input: GenerateUsersInput
	) {
		const { count, isStreaming } = input

		await this.testService.generateUsers(count, isStreaming)

		return true
	}

	@Mutation(() => Number)
	public clearTestUsers() {
		return this.testService.clearTestUsers()
	}
}
