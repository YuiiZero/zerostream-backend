import { Field, ObjectType } from '@nestjs/graphql'
import { IsNotEmpty, IsString } from 'class-validator'

import { UserModel } from './user.model'

@ObjectType()
export class AuthModel {
	@Field(() => UserModel, { nullable: true })
	user?: UserModel

	@Field({ nullable: true })
	@IsString()
	@IsNotEmpty()
	message?: string
}
