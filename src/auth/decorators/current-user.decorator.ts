import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { TokenPayload } from '../../common/services/token.service';
import { JWT_PAYLOAD_KEY } from '../guards/jwt-auth.guard';

/**
 * Use with JwtAuthGuard to get the verified JWT payload (user kuid, role, etc.) in route handlers.
 *
 * @example
 * @UseGuards(JwtAuthGuard)
 * @Get('profile')
 * getProfile(@CurrentUser() user: TokenPayload) {
 *   return { kuid: user.sub, role: user.role };
 * }
 *
 * @example Get only a specific field
 * @Get('me')
 * getMe(@CurrentUser('sub') kuid: string) {
 *   return { kuid };
 * }
 */
export const CurrentUser = createParamDecorator(
  (data: keyof TokenPayload | undefined, ctx: ExecutionContext): TokenPayload | unknown => {
    const request = ctx.switchToHttp().getRequest();
    const user = request[JWT_PAYLOAD_KEY] as TokenPayload | undefined;

    if (!user) {
      return undefined;
    }

    return data ? user[data] : user;
  },
);
