import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Delete,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RoomsService } from './rooms.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { ListRoomsQueryDto } from './dto/list-rooms-query.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import type { TokenPayload } from '../common/services/token.service';

@ApiTags('Rooms')
@ApiBearerAuth('JWT')
@Controller('rooms')
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @Get()
  @UseGuards(RolesGuard)
  @Roles('OWNER', 'WARDEN')
  @ApiOperation({ summary: 'Owner/Warden: list all rooms with pagination (10 per page)' })
  @ApiResponse({ status: 200, description: 'Paginated list of rooms with room_no, type, capacity, occupied, empty_count, status, price_per_bed' })
  listAllRooms(@Query() query: ListRoomsQueryDto) {
    return this.roomsService.listAllRooms(query);
  }

  @Get('stats')
  @UseGuards(RolesGuard)
  @Roles('OWNER', 'WARDEN')
  @ApiOperation({ summary: 'Owner/Warden: get room and bed stats (total_rooms, total_beds, occupied_beds, available_beds)' })
  @ApiResponse({ status: 200, description: 'Aggregate counts; optional hostel_kuid to filter by hostel' })
  getRoomBedStats(@Query('hostel_kuid') hostelKuid?: string) {
    return this.roomsService.getRoomBedStats(hostelKuid);
  }

  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles('OWNER', 'WARDEN')
  @ApiOperation({ summary: 'Owner/Warden: view room details by room kuid' })
  @ApiResponse({ status: 200, description: 'Room with beds, washroom (if any), room_facilities, washroom_facilities' })
  @ApiResponse({ status: 404, description: 'Room not found' })
  getRoomDetails(@Param('id') id: string) {
    return this.roomsService.getRoomDetails(id);
  }

  @Post('create')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(RolesGuard)
  @Roles('OWNER', 'WARDEN')
  @ApiOperation({ summary: 'Owner/Warden: create rooms with beds and washrooms' })
  @ApiResponse({ status: 201, description: 'Rooms created successfully' })
  @ApiResponse({ status: 403, description: 'Only OWNER or WARDEN can perform this action' })
  createRooms(
    @Body() dto: CreateRoomDto,
    @CurrentUser() _user: TokenPayload,
  ) {
    return this.roomsService.createRooms(dto);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RolesGuard)
  @Roles('OWNER', 'WARDEN')
  @ApiOperation({ summary: 'Owner/Warden: edit a room by room kuid' })
  @ApiResponse({ status: 200, description: 'Room updated successfully' })
  @ApiResponse({ status: 404, description: 'Room not found' })
  @ApiResponse({ status: 403, description: 'Only OWNER or WARDEN can perform this action' })
  updateRoom(
    @Param('id') id: string,
    @Body() dto: UpdateRoomDto,
    @CurrentUser() _user: TokenPayload,
  ) {
    return this.roomsService.updateRoom(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RolesGuard)
  @Roles('OWNER', 'WARDEN')
  @ApiOperation({ summary: 'Owner/Warden: delete a room by room kuid (cascades to beds, washroom, facilities)' })
  @ApiResponse({ status: 200, description: 'Room deleted successfully' })
  @ApiResponse({ status: 404, description: 'Room not found' })
  @ApiResponse({ status: 403, description: 'Only OWNER or WARDEN can perform this action' })
  deleteRoom(
    @Param('id') id: string,
    @CurrentUser() _user: TokenPayload,
  ) {
    return this.roomsService.deleteRoom(id);
  }
}
