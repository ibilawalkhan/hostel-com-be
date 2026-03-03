import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { BedService } from './bed.service';
import { CreateBedDto } from './dto/create-bed.dto';
import { UpdateBedDto } from './dto/update-bed.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { TokenPayload } from '../common/services/token.service';

@ApiTags('Bed')
@ApiBearerAuth('JWT')
@Controller('bed')
export class BedController {
  constructor(private readonly bedService: BedService) {}

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RolesGuard)
  @Roles('OWNER', 'WARDEN')
  @ApiOperation({ summary: 'Owner/Warden: update a bed (rent, assigned resident, status)' })
  @ApiResponse({ status: 200, description: 'Bed updated successfully' })
  @ApiResponse({ status: 404, description: 'Bed or resident not found' })
  @ApiResponse({ status: 403, description: 'Only OWNER or WARDEN can perform this action' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateBedDto,
    @CurrentUser() _user: TokenPayload,
  ) {
    return this.bedService.update(id, dto);
  }

}
