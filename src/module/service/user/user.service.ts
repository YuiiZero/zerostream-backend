import { Injectable } from '@nestjs/common'

import { PrismaService } from '../../../core/module/prisma/prisma.service'
import {
	PrivateUser,
	PublicUser,
	SessionUser
} from '../../../shared/types/user.type'

@Injectable()
export class UserService {
	constructor(private readonly prismaService: PrismaService) {}

	private _isPrivate(user: PublicUser | PrivateUser): user is PrivateUser {
		return 'id' in user
	}

	public async toSessionUser(user: PublicUser): Promise<SessionUser>
	public async toSessionUser(user: PrivateUser): Promise<SessionUser>
	public async toSessionUser(user: PublicUser | PrivateUser) {
		if (this._isPrivate(user)) {
			return { id: user.id } as SessionUser
		}

		const { id } = (await this.prismaService.user.findUnique({
			where: { username: user.username }
		}))!

		return { id } as SessionUser
	}
}
