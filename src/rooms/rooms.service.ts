import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import type { ListRoomsQueryDto } from './dto/list-rooms-query.dto';
import { RoomsRepository } from './rooms.repository';
import { TransactionHelper } from '../common/database/transaction.helper';
import { LoggerService } from '../common/services/logger.service';
import { roomStatusFromBeds } from './helper/room.helper';

function roomTypeFromBedsCount(n: number): '1' | '2' | '3' | '4' | '5' {
  const k = Math.min(5, Math.max(1, n));
  return String(k) as '1' | '2' | '3' | '4' | '5';
}

@Injectable()
export class RoomsService {
  constructor(
    private readonly roomsRepository: RoomsRepository,
    private readonly transactionHelper: TransactionHelper,
    private readonly logger: LoggerService,
  ) {}

  async createRooms(dto: CreateRoomDto) {
    const { hostel_kuid, rooms, room_photos_urls, washroom_photos_urls } = dto;
    this.logger.log(`Creating rooms for hostel ${hostel_kuid}`, 'RoomsService');

    const roomPhotos = room_photos_urls ?? [];
    const washroomPhotos = washroom_photos_urls ?? [];

    const created = await this.transactionHelper.executeInTransaction(

      async (client) => {
        const createdRooms: Array<{ room: any; washroom?: any }> = [];

        for (const room of rooms) {
          const status = roomStatusFromBeds(room.beds);
          const roomType = roomTypeFromBedsCount(room.beds.length);

          this.logger.log(`Creating room ${room.room_no} with ${room.beds.length} beds and ${room.room_facilities?.length} room facilities`, 'RoomsService');

          const roomRow = await this.roomsRepository.insertRoom(
            client,
            hostel_kuid,
            room,
            roomType,
            status,
            roomPhotos,
          );
          this.logger.log(`Room ${room.room_no} created successfully`, 'RoomsService');

          for (const bed of room.beds) {
            await this.roomsRepository.insertBed(client, roomRow.kuid, bed);
            this.logger.log(`Bed ${bed.bedId} created successfully`, 'RoomsService');
          }

          const roomFacilityKuids = room.room_facilities ?? [];

          if (roomFacilityKuids.length) {
            await this.roomsRepository.insertRoomFacilities(
              client,
              roomRow.kuid,
              roomFacilityKuids,
            );
            this.logger.log(`Room facilities ${roomFacilityKuids.join(', ')} created successfully`, 'RoomsService');
          }

          let washroomRow: { kuid: string } | undefined;

          if (room.attached_washroom) {
            washroomRow = await this.roomsRepository.insertWashroom(
              client,
              roomRow.kuid,
              washroomPhotos,
            );

            const washroomFacilityKuids = room.washroom_facilities ?? [];
            if (washroomFacilityKuids.length) {
              await this.roomsRepository.insertWashroomFacilities(
                client,
                washroomRow.kuid,
                washroomFacilityKuids,
              );
              this.logger.log(`Washroom facilities ${washroomFacilityKuids.join(', ')} created successfully`, 'RoomsService');
            }
          }

          createdRooms.push({ room: roomRow, washroom: washroomRow });
        }
        return createdRooms;
      },
    );

    this.logger.log(
      `Created ${created.length} room(s) for hostel ${hostel_kuid}`,
      'RoomsService',
    );

    return {
      message: 'Rooms created successfully',
      created_rooms: created.length,
      rooms: created,
    };
  }

  async updateRoom(roomKuid: string, dto: UpdateRoomDto) {

    const updated = await this.transactionHelper.executeInTransaction(
      
      async (client) => {

        const existing = await this.roomsRepository.findRoomByKuid(client, roomKuid);

        if (!existing) {
          throw new NotFoundException('Room not found');
        }

        let roomType: '1' | '2' | '3' | '4' | '5' | undefined;
        let status: 'EMPTY' | 'PARTIAL_OCCUPIED' | 'FULL' | undefined;
        if (dto.beds !== undefined) {
          roomType = roomTypeFromBedsCount(dto.beds.length);
          status = roomStatusFromBeds(dto.beds);
        }

        const roomUpdates: Parameters<RoomsRepository['updateRoom']>[2] = {};
        
        if (dto.room_no !== undefined) roomUpdates.room_no = dto.room_no;
        
        if (dto.floor_no !== undefined) roomUpdates.floor_no = dto.floor_no;
        
        if (dto.room_size !== undefined) roomUpdates.room_size = dto.room_size;
        
        if (roomType !== undefined) roomUpdates.room_type = roomType;
        
        if (status !== undefined) roomUpdates.status = status;
        
        if (dto.room_photos_urls !== undefined) roomUpdates.photos = dto.room_photos_urls;

        if (Object.keys(roomUpdates).length > 0) {
          await this.roomsRepository.updateRoom(client, roomKuid, roomUpdates);
        }

        if (dto.beds !== undefined) {
          await this.roomsRepository.deleteBedsByRoomKuid(client, roomKuid);
          for (const bed of dto.beds) {
            await this.roomsRepository.insertBed(client, roomKuid, bed);
          }
        }

        if (dto.room_facilities !== undefined) {
          await this.roomsRepository.deleteRoomFacilitiesByRoomKuid(client, roomKuid);
          if (dto.room_facilities.length) {
            await this.roomsRepository.insertRoomFacilities(
              client,
              roomKuid,
              dto.room_facilities,
            );
          }
        }

        const washroomPhotos = dto.washroom_photos_urls ?? null;
        if (dto.attached_washroom !== undefined) {
          const existingWashroom = await this.roomsRepository.findWashroomByRoomKuid(
            client,
            roomKuid,
          );
          if (dto.attached_washroom) {
            if (existingWashroom) {
              if (washroomPhotos) {
                await this.roomsRepository.updateWashroom(
                  client,
                  existingWashroom.kuid,
                  washroomPhotos,
                );
              }
              if (dto.washroom_facilities !== undefined) {
                await this.roomsRepository.deleteWashroomFacilitiesByWashroomKuid(
                  client,
                  existingWashroom.kuid,
                );
                if (dto.washroom_facilities.length) {
                  await this.roomsRepository.insertWashroomFacilities(
                    client,
                    existingWashroom.kuid,
                    dto.washroom_facilities,
                  );
                }
              }
            } else {
              const washroomRow = await this.roomsRepository.insertWashroom(
                client,
                roomKuid,
                washroomPhotos ?? [],
              );
              const washroomFacilityKuids = dto.washroom_facilities ?? [];
              if (washroomFacilityKuids.length) {
                await this.roomsRepository.insertWashroomFacilities(
                  client,
                  washroomRow.kuid,
                  washroomFacilityKuids,
                );
              }
            }
          } else {
            await this.roomsRepository.deleteWashroomByRoomKuid(client, roomKuid);
          }
        } else if (washroomPhotos) {
          const existingWashroom = await this.roomsRepository.findWashroomByRoomKuid(
            client,
            roomKuid,
          );
          if (existingWashroom) {
            await this.roomsRepository.updateWashroom(
              client,
              existingWashroom.kuid,
              washroomPhotos,
            );
          }
        } else if (dto.washroom_facilities !== undefined) {
          const existingWashroom = await this.roomsRepository.findWashroomByRoomKuid(
            client,
            roomKuid,
          );
          if (existingWashroom) {
            await this.roomsRepository.deleteWashroomFacilitiesByWashroomKuid(
              client,
              existingWashroom.kuid,
            );
            if (dto.washroom_facilities.length) {
              await this.roomsRepository.insertWashroomFacilities(
                client,
                existingWashroom.kuid,
                dto.washroom_facilities,
              );
            }
          }
        }

        return this.roomsRepository.findRoomByKuid(client, roomKuid);
      },
    );

    this.logger.log(`Room ${roomKuid} updated`, 'RoomsService');
    return { message: 'Room updated successfully', room: updated };
  }

  async deleteRoom(roomKuid: string) {

    await this.transactionHelper.executeInTransaction(async (client) => {

      const existing = await this.roomsRepository.findRoomByKuid(client, roomKuid);
      if (!existing) {
        throw new NotFoundException('Room not found');
      }

      await this.roomsRepository.deleteRoom(client, roomKuid);
    });
    this.logger.log(`Room ${roomKuid} deleted`, 'RoomsService');
    return { message: 'Room deleted successfully' };
  }

  async listAllRooms(query: ListRoomsQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const hostelKuid = query.hostel_kuid ?? null;

    const { rows, total } = await this.roomsRepository.findRoomsPaginated(
      hostelKuid,
      page,
      limit,
    );

    const totalPages = Math.ceil(total / limit);

    return {
      rooms: rows,
      pagination: {
        total,
        page,
        limit,
        total_pages: totalPages,
      },
    };
  }

  async getRoomBedStats(hostelKuid?: string) {
    const stats = await this.roomsRepository.getRoomBedStats(hostelKuid ?? null);
    return stats;
  }
}
