import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import type { InitiateRoomsDto } from './dto/initiate-rooms.dto';
import type {
  InitiateRoomsResponse,
  RoomConfiguration,
  BedConfiguration,
} from './interfaces/initiate-rooms.interface';

const BED_LETTERS = ['A', 'B', 'C', 'D', 'E'];

@Injectable()
export class RoomsService {
  initiateRooms(dto: InitiateRoomsDto): InitiateRoomsResponse {
    const { room_type, total_rooms, rooms } = dto;

    if (rooms.length !== total_rooms) {
      throw new BadRequestException(
        `total_rooms (${total_rooms}) must match rooms array length (${rooms.length})`,
      );
    }

    const result: RoomConfiguration[] = rooms.map((room, i) => {
      const roomIndex = i + 1;

      const beds_configuration: BedConfiguration[] = [];

      for (let b = 0; b < room_type; b++) {

        const letter = BED_LETTERS[b];
        
        beds_configuration.push({
          bed_id: `${roomIndex}-Bed-${letter}`,
          occupancy_status: 'Available',
          monthly_rent: null,
        });

      }
      return {
        room_type,
        room_no: room.room_no,
        floor_no: room.floor_no,
        room_size: room.room_size,
        attached_washroom: room.attached_washroom,
        beds_configuration,
      };
    });

    return { rooms: result };
  }

  create(createRoomDto: CreateRoomDto) {
    return 'This action adds a new room';
  }

  findAll() {
    return `This action returns all rooms`;
  }

  findOne(id: number) {
    return `This action returns a #${id} room`;
  }

  update(id: number, updateRoomDto: UpdateRoomDto) {
    return `This action updates a #${id} room`;
  }

  remove(id: number) {
    return `This action removes a #${id} room`;
  }
}
