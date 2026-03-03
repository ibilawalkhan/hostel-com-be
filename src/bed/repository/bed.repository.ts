import { Injectable, Inject } from '@nestjs/common';
import { Pool, PoolClient } from 'pg';
import type { BedRow } from '../interfaces/bed.interface';
import { BedQueries } from '../queries/bed.queries';

@Injectable()
export class BedRepository {
  constructor(@Inject('PG_POOL') private pool: Pool) {}

  async findBedByKuid(client: PoolClient, bedKuid: string): Promise<BedRow | null> {
    const result = await client.query(BedQueries.FIND_BED_BY_KUID, [bedKuid]);
    return (result.rows[0] as BedRow) || null;
  }

  async updateBed(
    client: PoolClient,
    bedKuid: string,
    updates: { monthly_rent?: number | null; bed_occupied_enum?: 'OCCUPIED' | 'RESERVED' | 'AVAILABLE' },
  ): Promise<BedRow> {
    const sets: string[] = [];
    const values: unknown[] = [];
    let idx = 1;

    if (updates.monthly_rent !== undefined) {
      sets.push(`monthly_rent = $${idx++}`);
      values.push(updates.monthly_rent);
    }
    if (updates.bed_occupied_enum !== undefined) {
      sets.push(`bed_occupied_enum = $${idx++}`);
      values.push(updates.bed_occupied_enum);
    }
    if (sets.length === 0) {
      const r = await client.query(BedQueries.SELECT_BED_BY_KUID, [bedKuid]);
      return r.rows[0] as BedRow;
    }
    sets.push(`updated_at = NOW()`);
    values.push(bedKuid);
    const result = await client.query(
      `UPDATE bed SET ${sets.join(', ')} WHERE kuid = $${idx} RETURNING *`,
      values,
    );
    return result.rows[0] as BedRow;
  }

  async clearResidentsAssignedToBed(client: PoolClient, bedKuid: string): Promise<void> {
    await client.query(BedQueries.CLEAR_RESIDENTS_ASSIGNED_TO_BED, [bedKuid]);
  }

  async setResidentAssignedBed(
    client: PoolClient,
    residentKuid: string,
    bedKuid: string,
  ): Promise<void> {
    await client.query(BedQueries.SET_RESIDENT_ASSIGNED_BED, [bedKuid, residentKuid]);
  }

  async existsResidentByKuid(client: PoolClient, residentKuid: string): Promise<boolean> {
    const result = await client.query(BedQueries.EXISTS_RESIDENT_BY_KUID, [residentKuid]);
    return (result.rowCount ?? 0) > 0;
  }

  async getResidentKuidByAssignedBed(client: PoolClient, bedKuid: string): Promise<string | null> {
    const result = await client.query(BedQueries.GET_RESIDENT_KUID_BY_ASSIGNED_BED, [bedKuid]);
    const row = result.rows[0] as { kuid: string } | undefined;
    return row?.kuid ?? null;
  }
}
