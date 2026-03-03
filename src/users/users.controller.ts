import {
  Controller,
  Get,
  NotFoundException,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { TokenPayload } from '../common/services/token.service';

@ApiTags('Users')
@ApiBearerAuth('JWT')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get the currently authenticated user profile' })
  @ApiResponse({ status: 200, description: 'Returns user profile and role info' })
  async getCurrentUser(@CurrentUser() payload: TokenPayload) {
    const user = await this.usersService.getCurrentUser(payload.sub);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return {
      user,
      role: payload.role,
      role_kuid: payload.role_kuid,
    };
  }
}
