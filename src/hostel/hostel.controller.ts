import {
  Body,
  Controller,
  Delete,
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
import { ApplyFiltersDto } from './dto/apply-filters.dto';
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

  @Post('apply-filters')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RolesGuard)
  @Roles('OWNER', 'WARDEN')
  @ApiOperation({ summary: 'Owner/Warden: filter rooms by hostel, branch, room type, status, floor, price range, availability' })
  @ApiResponse({ status: 200, description: 'rooms: list matching filters (kuid, hostel_kuid, room_no, type, capacity, occupied, empty_count, reserved_count, status, price_per_bed)' })
  async applyFilters(@Body() body: ApplyFiltersDto) {

    const rooms = await this.hostelService.applyFilters({
      hostel_kuid: body.hostel_kuid,
      branch_kuid: body.branch_kuid,
      room_type: body.room_type,
      status: body.status,
      floor_no: body.floor_no,
      min_price: body.min_price,
      max_price: body.max_price,
      availability: body.availability,
      room_kuid: body.room_kuid,
    });
    
    return { rooms };
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

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RolesGuard)
  @Roles('OWNER')
  @ApiOperation({ summary: 'Owner: delete a hostel (only owner can delete)' })
  @ApiResponse({ status: 200, description: 'Hostel deleted successfully' })
  @ApiResponse({ status: 404, description: 'Hostel not found' })
  @ApiResponse({ status: 403, description: 'Only the owner can delete this hostel' })
  deleteHostel(@Param('id') id: string, @CurrentUser() user: TokenPayload) {
    return this.hostelService.deleteHostel(id, user.sub);
  }
}
