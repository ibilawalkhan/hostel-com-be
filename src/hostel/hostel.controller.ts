import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { HostelService } from './hostel.service';
import { CreateHostelDto } from './dto/create-hostel.dto';
import { UpdateHostelDto } from './dto/update-hostel.dto';
import { SearchHostelQueryDto } from './dto/search-hostel-query.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import type { TokenPayload } from '../common/services/token.service';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Hostel')
@ApiBearerAuth('JWT')
@Controller('hostel')
export class HostelController {
  constructor(private readonly hostelService: HostelService) {}

  @Post('create')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(RolesGuard)
  @Roles('OWNER', 'WARDEN')
  @ApiOperation({ summary: 'Owner/Warden: add a new hostel' })
  @ApiResponse({ status: 201, description: 'Hostel created successfully' })
  @ApiResponse({ status: 403, description: 'Only OWNER or WARDEN can perform this action' })
  create(
    @Body() createHostelDto: CreateHostelDto,
    @CurrentUser() user: TokenPayload,
  ) {
    return this.hostelService.create(createHostelDto, user.sub);
  }


  @Get('list')
  @UseGuards(RolesGuard)
  @Roles('OWNER', 'WARDEN')
  @ApiOperation({ summary: 'Owner/Warden: list all hostels with name, branch, status, address, total rooms, total beds, occupancy %, warden name' })
  @ApiResponse({ status: 200, description: 'List of hostels with hostel_name, branch_no, status, address, total_rooms, total_beds, total_occupancy, warden_name' })
  listAllHostels() {
    return this.hostelService.listAllHostels();
  }

  @Get('search')
  @UseGuards(RolesGuard)
  @Roles('OWNER', 'WARDEN')
  @ApiOperation({ summary: 'Owner/Warden: search hostels by name and/or branch' })
  @ApiResponse({ status: 200, description: 'List of hostels matching search (same shape as list)' })
  searchHostels(@Query() query: SearchHostelQueryDto) {
    return this.hostelService.searchHostels({ name: query.name, branch: query.branch });
  }

  @Get('stats')
  @UseGuards(RolesGuard)
  @Roles('OWNER')
  @ApiOperation({ summary: 'Owner: get aggregate stats for own hostels (total hostels, total rooms, total beds, avg occupancy %)' })
  @ApiResponse({ status: 200, description: 'total_hostels, total_rooms, total_beds, avg_occupancy' })
  getHostelStats(@CurrentUser() user: TokenPayload) {
    return this.hostelService.getHostelStats(user.sub);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RolesGuard)
  @Roles('OWNER', 'WARDEN')
  @ApiOperation({ summary: 'Owner/Warden: edit an existing hostel' })
  @ApiResponse({ status: 200, description: 'Hostel updated successfully' })
  @ApiResponse({ status: 404, description: 'Hostel not found' })
  @ApiResponse({ status: 403, description: 'Only OWNER or WARDEN can perform this action' })
  update(
    @Param('id') id: string,
    @Body() updateHostelDto: UpdateHostelDto,
  ) {
    return this.hostelService.update(id, updateHostelDto);
  }

}
