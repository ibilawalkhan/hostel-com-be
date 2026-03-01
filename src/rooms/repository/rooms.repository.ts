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

@Injectable()
export class RoomsRepository {
  constructor(@Inject('PG_POOL') private pool: Pool) { }

  async findRoomByKuid(
    client: PoolClient,
    roomKuid: string,
  ): Promise<RoomRow | null> {

    const result = await client.query(
      `SELECT * FROM room WHERE kuid = $1`,
      [roomKuid],
    );

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
    await client.query(`DELETE FROM bed WHERE room_kuid = $1`, [roomKuid]);
  }

  async findWashroomByRoomKuid(
    client: PoolClient,
    roomKuid: string,
  ): Promise<{ kuid: string } | null> {

    const result = await client.query(
      `SELECT kuid FROM washroom WHERE room_kuid = $1 LIMIT 1`,
      [roomKuid],
    );

    return result.rows[0] || null;
  }

  async updateWashroom(
    client: PoolClient,
    washroomKuid: string,
    photos: string[] | null,
  ): Promise<void> {

    await client.query(
      `UPDATE washroom SET photos = $1, updated_at = NOW() WHERE kuid = $2`,
      [photos?.length ? photos : null, washroomKuid],
    );

  }

  async deleteWashroomByRoomKuid(client: PoolClient, roomKuid: string): Promise<void> {
    await client.query(`DELETE FROM washroom WHERE room_kuid = $1`, [roomKuid]);
  }

  async deleteRoomFacilitiesByRoomKuid(client: PoolClient, roomKuid: string): Promise<void> {
    await client.query(`DELETE FROM room_facility WHERE room_kuid = $1`, [roomKuid]);
  }

  async deleteWashroomFacilitiesByWashroomKuid(
    client: PoolClient,
    washroomKuid: string,
  ): Promise<void> {

    await client.query(
      `DELETE FROM washroom_facilities WHERE washroom_kuid = $1`,
      [washroomKuid],
    );

  }

  async deleteRoom(client: PoolClient, roomKuid: string): Promise<void> {
    await client.query(`DELETE FROM room WHERE kuid = $1`, [roomKuid]);
  }

  async insertRoom(
    client: PoolClient,
    hostelKuid: string,
    room: RoomItemCreateDto,
    roomType: '1' | '2' | '3' | '4' | '5',
    status: 'EMPTY' | 'PARTIAL_OCCUPIED' | 'FULL',
    photos: string[],
  ): Promise<RoomRow> {

    const result = await client.query(
      `INSERT INTO room (hostel_kuid, room_type, room_no, floor_no, room_size, status, photos) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) 
       RETURNING *`,
      [
        hostelKuid,
        roomType,
        room.room_no,
        room.floor_no,
        room.room_size,
        status,
        photos.length ? photos : null,
      ],
    );

    return result.rows[0];
  }

  async insertBed(
    client: PoolClient,
    roomKuid: string,
    bed: BedItemDto,
  ): Promise<void> {

    await client.query(
      `INSERT INTO bed (room_kuid, bed_no, monthly_rent, bed_occupied_enum)
       VALUES ($1, $2, $3, $4)`,
      [
        roomKuid,
        bed.bedId,
        bed.monthly_rent,
        occupancyToEnum(bed.occupancy_status),
      ],
    );

  }

  async insertWashroom(
    client: PoolClient,
    roomKuid: string,
    photos: string[],
    name?: string,
  ): Promise<{ kuid: string }> {

    const result = await client.query(
      `INSERT INTO washroom (room_kuid, name, photos)
       VALUES ($1, $2, $3)
       RETURNING kuid`,
      [roomKuid, name ?? 'Attached', photos.length ? photos : null],
    );

    return result.rows[0];
  }

  async insertRoomFacilities(
    client: PoolClient,
    roomKuid: string,
    facilityKuids: string[],
  ): Promise<void> {

    for (const fk of facilityKuids) {
      await client.query(
        `INSERT INTO room_facility (room_kuid, facility_kuid)
         VALUES ($1, $2)
         ON CONFLICT (room_kuid, facility_kuid) DO NOTHING`,
        [roomKuid, fk],
      );
    }

  }

  async insertWashroomFacilities(
    client: PoolClient,
    washroomKuid: string,
    facilityKuids: string[],
  ): Promise<void> {

    for (const fk of facilityKuids) {
      await client.query(
        `INSERT INTO washroom_facilities (washroom_kuid, facility_kuid)
         VALUES ($1, $2)
         ON CONFLICT (washroom_kuid, facility_kuid) DO NOTHING`,
        [washroomKuid, fk],
      );
    }

  }

  async findRoomsPaginated(
    hostelKuid: string | null,
    page: number,
    limit: number,
  ): Promise<{ rows: RoomListItemRow[]; total: number }> {
    const offset = (page - 1) * limit;

    const countResult = await this.pool.query(
      `SELECT count(*)::int AS total
       FROM room
       WHERE is_active = true
         AND ($1::text IS NULL OR hostel_kuid = $1)`,
      [hostelKuid],
    );
    const total = countResult.rows[0]?.total ?? 0;

    const result = await this.pool.query(
      `SELECT
         r.kuid,
         r.room_no,
         r.room_type AS type,
         (r.room_type::int) AS capacity,
         coalesce(b.occupied, 0)::int AS occupied,
         coalesce(b.empty_count, 0)::int AS empty_count,
         r.status,
         b.price_per_bed
       FROM room r
       LEFT JOIN LATERAL (
         SELECT
           count(*) FILTER (WHERE bed_occupied_enum = 'OCCUPIED') AS occupied,
           count(*) FILTER (WHERE bed_occupied_enum = 'AVAILABLE') AS empty_count,
           round(avg(monthly_rent)::numeric, 2) AS price_per_bed
         FROM bed
         WHERE room_kuid = r.kuid AND is_active = true
       ) b ON true
       WHERE r.is_active = true
         AND ($1::text IS NULL OR r.hostel_kuid = $1)
       ORDER BY r.room_no
       LIMIT $2 OFFSET $3`,
      [hostelKuid, limit, offset],
    );

    return { rows: result.rows, total };
  }

  async getRoomBedStats(hostelKuid: string | null): Promise<RoomBedStatsRow> {

    const result = await this.pool.query(
      `SELECT
         count(DISTINCT r.kuid)::int AS total_rooms,
         count(b.kuid)::int AS total_beds,
         count(b.kuid) FILTER (WHERE b.bed_occupied_enum = 'OCCUPIED')::int AS occupied_beds,
         count(b.kuid) FILTER (WHERE b.bed_occupied_enum = 'AVAILABLE')::int AS available_beds
       FROM room r
       LEFT JOIN bed b ON b.room_kuid = r.kuid AND b.is_active = true
       WHERE r.is_active = true
         AND ($1::text IS NULL OR r.hostel_kuid = $1)`,
      [hostelKuid],
    );

    const row = result.rows[0];

    return {
      total_rooms: row?.total_rooms ?? 0,
      total_beds: row?.total_beds ?? 0,
      occupied_beds: row?.occupied_beds ?? 0,
      available_beds: row?.available_beds ?? 0,
    };
  }

  async findRoomDetailsByKuid(roomKuid: string): Promise<RoomDetailsResponse | null> {
    const roomResult = await this.pool.query(
      `SELECT kuid, hostel_kuid, room_type, room_no, floor_no, room_size, status, photos, is_active, created_at, updated_at
       FROM room WHERE kuid = $1 AND is_active = true`,
      [roomKuid],
    );
    const room = roomResult.rows[0] as RoomRow | undefined;
    if (!room) return null;

    const bedsResult = await this.pool.query(
      `SELECT kuid, room_kuid, bed_no, monthly_rent, bed_photos_url, bed_occupied_enum, is_active, created_at, updated_at
       FROM bed WHERE room_kuid = $1 AND is_active = true ORDER BY bed_no`,
      [roomKuid],
    );
    const beds = (bedsResult.rows || []) as BedRow[];

    const washroomResult = await this.pool.query(
      `SELECT kuid, room_kuid, name, photos, is_active, created_at, updated_at
       FROM washroom WHERE room_kuid = $1 LIMIT 1`,
      [roomKuid],
    );
    const washroom = (washroomResult.rows[0] as WashroomRow | undefined) ?? null;

    const roomFacResult = await this.pool.query(
      `SELECT facility_kuid FROM room_facility WHERE room_kuid = $1`,
      [roomKuid],
    );
    const room_facilities = (roomFacResult.rows || []).map((r: { facility_kuid: string }) => r.facility_kuid);

    let washroom_facilities: string[] = [];
    if (washroom) {
      const wfResult = await this.pool.query(
        `SELECT facility_kuid FROM washroom_facilities WHERE washroom_kuid = $1`,
        [washroom.kuid],
      );
      washroom_facilities = (wfResult.rows || []).map((r: { facility_kuid: string }) => r.facility_kuid);
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