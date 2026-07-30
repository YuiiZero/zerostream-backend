import { Injectable } from '@nestjs/common'
import { hash } from 'argon2'
import { randomUUID } from 'node:crypto'

import { User } from '../../../prisma/generated/prisma/client'
import { PrismaService } from '../../core/module/prisma/prisma.service'

@Injectable()
export class TestService {
	public constructor(private readonly prismaService: PrismaService) {}

	public async generateUsers(
		count: number,
		isStreaming: boolean = false
	): Promise<User[]> {
		const sharedPass = await hash('test')
		const users = Array.from(
			{ length: count },
			(): Pick<
				User,
				'id' | 'email' | 'username' | 'hashPassword' | 'isEmailVerified'
			> => {
				const id = randomUUID()

				return {
					id,
					email: `${id}@test.com`,
					username: `test-user-${id}`,
					hashPassword: sharedPass,
					isEmailVerified: true
				}
			}
		)

		const createdUsers = await this.prismaService.$transaction(async tx => {
			const createdUsers = await tx.user.createManyAndReturn({
				data: users
			})

			if (isStreaming) {
				const streams = createdUsers.map(user => ({
					title: `${user.username}'s stream`,
					userId: user.id
				}))

				await tx.stream.createMany({
					data: streams
				})
			}

			return createdUsers
		})

		return createdUsers
	}

	public async clearTestUsers(): Promise<number> {
		const { count } = await this.prismaService.user.deleteMany({
			where: {
				username: {
					startsWith: 'test-user-'
				}
			}
		})

		return count
	}
}
