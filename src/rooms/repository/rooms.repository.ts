import { Injectable, Inject } from '@nestjs/common';
import { Pool, PoolClient } from 'pg';
import type { CreateRoomDto, RoomItemCreateDto, BedItemDto } from '../dto/create-room.dto';
import type {
  BedRow,
  RoomDetailsResponse,
  RoomListItemRow,
  RoomRow,
  WashroomRow,
} from '../interfaces/rooms.interface';
import { occupancyToEnum } from '../helper/room.helper';
import { RoomsQueries } from '../queries/rooms.queries';

@Injectable()
export class RoomsRepository {
  constructor(@Inject('PG_POOL') private pool: Pool) {}

  async findRoomByKuid(
    client: PoolClient,
    roomKuid: string,
  ): Promise<RoomRow | null> {
    const result = await client.query(RoomsQueries.FIND_ROOM_BY_KUID, [roomKuid]);
    return result.rows[0] || null;
  }

  async updateRoom(
    client: PoolClient,
    roomKuid: string,
    updates: {
      room_no?: string;
      floor_no?: string;
      room_size?: string;
      room_type?: '1' | '2' | '3' | '4' | '5';
      status?: 'EMPTY' | 'PARTIAL_OCCUPIED' | 'FULL';
      photos?: string[] | null;
    },
  ): Promise<RoomRow> {

    const sets: string[] = [];

    const values: unknown[] = [];

    let idx = 1;

    if (updates.room_no !== undefined) {
      sets.push(`room_no = $${idx++}`);
      values.push(updates.room_no);

    }

    if (updates.floor_no !== undefined) {
      sets.push(`floor_no = $${idx++}`);
      values.push(updates.floor_no);
    }

    if (updates.room_size !== undefined) {
      sets.push(`room_size = $${idx++}`);
      values.push(updates.room_size);
    }

    if (updates.room_type !== undefined) {
      sets.push(`room_type = $${idx++}`);
      values.push(updates.room_type);
    }

    if (updates.status !== undefined) {
      sets.push(`status = $${idx++}`);
      values.push(updates.status);
    }

    if (updates.photos !== undefined) {
      sets.push(`photos = $${idx++}`);
      values.push(updates.photos?.length ? updates.photos : null);
    }

    if (sets.length === 0) {
      const r = await client.query(`SELECT * FROM room WHERE kuid = $1`, [roomKuid]);
      return r.rows[0];
    }

    sets.push(`updated_at = NOW()`);

    values.push(roomKuid);

    const result = await client.query(
      `UPDATE room SET ${sets.join(', ')} WHERE kuid = $${idx} RETURNING *`,
      values,
    );

    return result.rows[0];
  }

  async deleteBedsByRoomKuid(client: PoolClient, roomKuid: string): Promise<void> {
    await client.query(RoomsQueries.DELETE_BEDS_BY_ROOM_KUID, [roomKuid]);
  }

  async findWashroomByRoomKuid(
    client: PoolClient,
    roomKuid: string,
  ): Promise<{ kuid: string } | null> {
    const result = await client.query(RoomsQueries.FIND_WASHROOM_BY_ROOM_KUID, [roomKuid]);
    return result.rows[0] || null;
  }

  async updateWashroom(
    client: PoolClient,
    washroomKuid: string,
    photos: string[] | null,
  ): Promise<void> {
    await client.query(RoomsQueries.UPDATE_WASHROOM, [
      photos?.length ? photos : null,
      washroomKuid,
    ]);
  }

  async deleteWashroomByRoomKuid(client: PoolClient, roomKuid: string): Promise<void> {
    await client.query(RoomsQueries.DELETE_WASHROOM_BY_ROOM_KUID, [roomKuid]);
  }

  async deleteRoomFacilitiesByRoomKuid(client: PoolClient, roomKuid: string): Promise<void> {
    await client.query(RoomsQueries.DELETE_ROOM_FACILITIES_BY_ROOM_KUID, [roomKuid]);
  }

  async deleteWashroomFacilitiesByWashroomKuid(
    client: PoolClient,
    washroomKuid: string,
  ): Promise<void> {
    await client.query(RoomsQueries.DELETE_WASHROOM_FACILITIES_BY_WASHROOM_KUID, [washroomKuid]);
  }

  async deleteRoom(client: PoolClient, roomKuid: string): Promise<void> {
    await client.query(RoomsQueries.DELETE_ROOM, [roomKuid]);
  }

  async insertRoom(
    client: PoolClient,
    hostelKuid: string,
    room: RoomItemCreateDto,
    roomType: '1' | '2' | '3' | '4' | '5',
    status: 'EMPTY' | 'PARTIAL_OCCUPIED' | 'FULL',
    photos: string[],
  ): Promise<RoomRow> {
    const result = await client.query(RoomsQueries.INSERT_ROOM, [
      hostelKuid,
      roomType,
      room.room_no,
      room.floor_no,
      room.room_size,
      status,
      photos.length ? photos : null,
    ]);
    return result.rows[0];
  }

  async insertBed(
    client: PoolClient,
    roomKuid: string,
    bed: BedItemDto,
  ): Promise<void> {
    await client.query(RoomsQueries.INSERT_BED, [
      roomKuid,
      bed.bedId,
      bed.monthly_rent,
      occupancyToEnum(bed.occupancy_status),
    ]);
  }

  async insertWashroom(
    client: PoolClient,
    roomKuid: string,
    photos: string[],
    name?: string,
  ): Promise<{ kuid: string }> {
    const result = await client.query(RoomsQueries.INSERT_WASHROOM, [
      roomKuid,
      name ?? 'Attached',
      photos.length ? photos : null,
    ]);
    return result.rows[0];
  }

  async insertRoomFacilities(
    client: PoolClient,
    roomKuid: string,
    facilityKuids: string[],
  ): Promise<void> {
    for (const fk of facilityKuids) {
      await client.query(RoomsQueries.INSERT_ROOM_FACILITY, [roomKuid, fk]);
    }
  }

  async insertWashroomFacilities(
    client: PoolClient,
    washroomKuid: string,
    facilityKuids: string[],
  ): Promise<void> {
    for (const fk of facilityKuids) {
      await client.query(RoomsQueries.INSERT_WASHROOM_FACILITY, [washroomKuid, fk]);
    }
  }

  async findRoomsPaginated(
    hostelKuid: string | null,
    page: number,
    limit: number,
  ): Promise<{ rows: RoomListItemRow[]; total: number }> {
    const offset = (page - 1) * limit;
    const countResult = await this.pool.query(RoomsQueries.COUNT_ROOMS_PAGINATED, [hostelKuid]);
    const total = countResult.rows[0]?.total ?? 0;
    const result = await this.pool.query(RoomsQueries.FIND_ROOMS_PAGINATED, [
      hostelKuid,
      limit,
      offset,
    ]);
    return { rows: result.rows, total };
  }

  async getRoomBedStats(hostelKuid: string | null): Promise<RoomBedStatsRow> {
    const result = await this.pool.query(RoomsQueries.GET_ROOM_BED_STATS, [hostelKuid]);
    const row = result.rows[0];

    return {
      total_rooms: row?.total_rooms ?? 0,
      total_beds: row?.total_beds ?? 0,
      occupied_beds: row?.occupied_beds ?? 0,
      available_beds: row?.available_beds ?? 0,
    };
  }

  async findRoomDetailsByKuid(roomKuid: string): Promise<RoomDetailsResponse | null> {
    const roomResult = await this.pool.query(RoomsQueries.FIND_ROOM_DETAILS_ROOM, [roomKuid]);
    const room = roomResult.rows[0] as RoomRow | undefined;
    if (!room) return null;

    const bedsResult = await this.pool.query(RoomsQueries.FIND_BEDS_BY_ROOM_KUID, [roomKuid]);
    const beds = (bedsResult.rows || []) as BedRow[];

    const washroomResult = await this.pool.query(RoomsQueries.FIND_WASHROOM_BY_ROOM_KUID_FULL, [
      roomKuid,
    ]);
    const washroom = (washroomResult.rows[0] as WashroomRow | undefined) ?? null;

    const roomFacResult = await this.pool.query(RoomsQueries.FIND_ROOM_FACILITIES_BY_ROOM_KUID, [
      roomKuid,
    ]);
    const room_facilities = (roomFacResult.rows || []).map(
      (r: { facility_kuid: string }) => r.facility_kuid,
    );

    let washroom_facilities: string[] = [];
    if (washroom) {
      const wfResult = await this.pool.query(
        RoomsQueries.FIND_WASHROOM_FACILITIES_BY_WASHROOM_KUID,
        [washroom.kuid],
      );
      washroom_facilities = (wfResult.rows || []).map(
        (r: { facility_kuid: string }) => r.facility_kuid,
      );
    }

    return {
      room,
      beds,
      washroom,
      room_facilities,
      washroom_facilities,
    };
  }
}

export interface RoomBedStatsRow {
  total_rooms: number;
  total_beds: number;
  occupied_beds: number;
  available_beds: number;
}