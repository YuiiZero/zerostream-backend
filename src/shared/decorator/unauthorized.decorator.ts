import { applyDecorators, UseGuards } from '@nestjs/common'

import { UnauthorizedGuard } from '../guard/unauth.guard'

export const Unauthorized = () => applyDecorators(UseGuards(UnauthorizedGuard))
