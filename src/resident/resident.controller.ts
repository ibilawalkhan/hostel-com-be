import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ResidentService } from './resident.service';
import { CreateWalkInDto } from './dto/create-walk-in.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import type { TokenPayload } from '../common/services/token.service';

@ApiTags('Resident')
@ApiBearerAuth('JWT')
@Controller('resident')
export class ResidentController {
  constructor(private readonly residentService: ResidentService) {}

  @Post('walk-in')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(RolesGuard)
  @Roles('OWNER')
  @ApiOperation({ summary: 'Register a walk-in resident' })
  @ApiResponse({ status: 201, description: 'Walk-in registered successfully' })
  @ApiResponse({
    status: 403,
    description: 'Only OWNER  can perform this action',
  })
  walkIn(
    @Body() createWalkInDto: CreateWalkInDto,
    @CurrentUser() user: TokenPayload,
  ) {
    return this.residentService.walkIn(createWalkInDto, user.sub);
  }

  @Get('stats')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RolesGuard)
  @Roles('OWNER')
  @ApiOperation({
    summary: 'Get resident stats: total, walk-in, online, rent paid, rent due',
  })
  @ApiResponse({
    status: 200,
    description: 'Resident stats fetched successfully',
  })
  getStats() {
    return this.residentService.getStats();
  }
}
