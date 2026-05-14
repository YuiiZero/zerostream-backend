import { applyDecorators, UseGuards } from '@nestjs/common'

import { AuthGuard } from '../guard/auth.guard'

export const Authorization = () => {
	return applyDecorators(UseGuards(AuthGuard))
}
