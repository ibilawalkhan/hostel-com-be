import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { WardenService } from './warden.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import type { TokenPayload } from '../common/services/token.service';
import { AddNewWardenDto } from '../auth/dto/auth.dto';
import { UpdateWardenDto } from './dto/update-warden.dto';

@ApiTags('Warden')
@ApiBearerAuth('JWT')
@Controller('warden')
export class WardenController {
  constructor(private readonly wardenService: WardenService) {}

  @Post('add-new-warden')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(RolesGuard)
  @Roles('OWNER')
  @ApiOperation({ summary: 'Owner: add a new warden to their hostel' })
  @ApiResponse({ status: 201, description: 'Warden created successfully' })
  @ApiResponse({ status: 403, description: 'Only OWNER can perform this action' })
  async addNewWarden(@Body() addWardenDto: AddNewWardenDto) {
    return this.wardenService.addNewWarden(addWardenDto);
  }

  @Get('list-wardens-by-owner')
  @UseGuards(RolesGuard)
  @Roles('OWNER')
  @ApiOperation({ summary: 'Owner: list wardens for their hostels' })
  @ApiResponse({ status: 200, description: 'List of wardens with name, status, email, phone, hostel, branch, permissions, created date' })
  @ApiResponse({ status: 403, description: 'Only OWNER can perform this action' })
  async getWardenList(@CurrentUser() payload: TokenPayload) {
    const list = await this.wardenService.getWardenList(payload.sub);
    return { wardens: list };
  }

  @Patch(':userKuid')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RolesGuard)
  @Roles('OWNER')
  @ApiOperation({ summary: 'Owner: edit a warden (name, phone, hostel, branch, permissions)' })
  @ApiResponse({ status: 200, description: 'Warden updated successfully' })
  @ApiResponse({ status: 404, description: 'Warden not found' })
  @ApiResponse({ status: 409, description: 'Phone number already in use' })
  @ApiResponse({ status: 403, description: 'Only OWNER can perform this action' })
  async editWarden(
    @Param('userKuid') userKuid: string,
    @Body() updateWardenDto: UpdateWardenDto,
    @CurrentUser() payload: TokenPayload,
  ) {
    return this.wardenService.editWarden(userKuid, payload.sub, updateWardenDto);
  }
}
