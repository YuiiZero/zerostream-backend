import { Field, InputType } from '@nestjs/graphql'
import { IsEmail, IsUUID } from 'class-validator'

import {
	SendVerifyEmailTokenInputInterface,
	VerifyEmailInputInterface
} from '../interface/verify.interface'

@InputType()
export class VerifyEmailInput implements VerifyEmailInputInterface {
	@Field()
	@IsUUID('4')
	public token!: string
}

@InputType()
export class SendVerifyEmailTokenInput implements SendVerifyEmailTokenInputInterface {
	@Field()
	@IsEmail()
	public email!: string
}
