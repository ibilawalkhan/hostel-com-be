import {
  Controller,
  Get,
  Post,
  Body,
  NotFoundException,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import type { TokenPayload } from '../common/services/token.service';
import { AddNewWardenDto } from '../auth/dto/auth.dto';

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

  @Post('warden')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(RolesGuard)
  @Roles('OWNER')
  @ApiOperation({ summary: 'Owner: add a new warden to their hostel' })
  @ApiResponse({ status: 201, description: 'Warden created successfully' })
  @ApiResponse({ status: 403, description: 'Only OWNER can perform this action' })
  async addNewWarden(@Body() addWardenDto: AddNewWardenDto) {
    return this.usersService.addNewWarden(addWardenDto);
  }
}
