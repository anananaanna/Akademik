import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from '../../modules/users/entities/user.entity';

/**
 * Extracts the authenticated user from the request.
 *
 * Usage:
 *   @CurrentUser() user: User          → full user object
 *   @CurrentUser('id') id: string      → single field
 */
export const CurrentUser = createParamDecorator(
  (field: keyof User | undefined, ctx: ExecutionContext): User | unknown => {
    const request = ctx.switchToHttp().getRequest<{ user: User }>();
    const user = request.user;
    return field ? user?.[field] : user;
  },
);