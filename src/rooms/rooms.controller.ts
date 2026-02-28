import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RoomsService } from './rooms.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { InitiateRoomsDto } from './dto/initiate-rooms.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import type { TokenPayload } from '../common/services/token.service';

@ApiTags('Rooms')
@ApiBearerAuth('JWT')
@Controller('rooms')
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @Post('initiate')
  @UseGuards(RolesGuard)
  @Roles('OWNER', 'WARDEN')
  @ApiOperation({
    summary: 'Owner/Warden: get rooms & beds configuration for given room_type and total_rooms',
  })
  @ApiResponse({
    status: 200,
    description:
      'Returns rooms array with room_type, room_no, floor_no, room_size, attached_washroom, beds_configuration per room',
  })
  @ApiResponse({ status: 403, description: 'Only OWNER or WARDEN can perform this action' })
  initiateRooms(
    @Body() dto: InitiateRoomsDto,
    @CurrentUser() _user: TokenPayload,
  ) {
    return this.roomsService.initiateRooms(dto);
  }

  @Post()
  create(@Body() createRoomDto: CreateRoomDto) {
    return this.roomsService.create(createRoomDto);
  }

  @Get()
  findAll() {
    return this.roomsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.roomsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRoomDto: UpdateRoomDto) {
    return this.roomsService.update(+id, updateRoomDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.roomsService.remove(+id);
  }
}
