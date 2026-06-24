import { Field, InputType } from '@nestjs/graphql'
import { IsString } from 'class-validator'

import { DeactivateAccountInputInterface } from '../interface/deactivate.interface'

@InputType()
export class DeactivateAccountInput implements DeactivateAccountInputInterface {
	@Field()
	@IsString()
	public token!: string
}
