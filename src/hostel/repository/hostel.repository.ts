import { Injectable, Inject } from '@nestjs/common';
import { Pool, PoolClient } from 'pg';
import { CreateHostelDto } from '../dto/create-hostel.dto';
import { UpdateHostelDto } from '../dto/update-hostel.dto';
import { HostelRow, ListHostelItem, HostelStats } from '../interface/hostel.interface';
import { HostelQueries } from '../queries/hostel.queries';

@Injectable()
export class HostelRepository {
  constructor(@Inject('PG_POOL') private pool: Pool) {}

  async findByKuid(
    client: PoolClient,
    hostelKuid: string,
  ): Promise<HostelRow | null> {
    const result = await client.query(HostelQueries.FIND_BY_KUID, [hostelKuid]);
    return result.rows[0] || null;
  }

  async createHostel(
    client: PoolClient,
    ownerKuid: string,
    dto: CreateHostelDto,
  ): Promise<HostelRow> {
    const result = await client.query(HostelQueries.INSERT_HOSTEL, [
      ownerKuid,
      dto.hostel_name,
      dto.city_kuid,
      dto.area_kuid,
      dto.full_address,
      dto.latitude,
      dto.longitude,
      dto.nearby,
      dto.gender,
      dto.hostel_type,
      dto.visitor_policy,
      dto.smoking_policy,
      dto.exterrior_photos_url ?? [],
      dto.entrance_photos_urls ?? [],
      dto.messa_area_photos_urls ?? [],
      dto.parking,
      dto.security_deposit ?? null,
      dto.admission_fee ?? null,
    ]);
    return result.rows[0];
  }

  async createHostelBranch(
    client: PoolClient,
    hostelKuid: string,
    branchNo: string,
  ): Promise<void> {
    await client.query(HostelQueries.INSERT_HOSTEL_BRANCH, [hostelKuid, branchNo]);
  }

  async updateHostel(
    client: PoolClient,
    existing: HostelRow,
    dto: UpdateHostelDto,
  ): Promise<HostelRow> {
    const sets: string[] = [];
    const values: any[] = [];
    let idx = 1;

    const addIfChanged = (
      column: string,
      currentValue: any,
      newValue: any,
    ) => {
      if (newValue === undefined) return;
      if (newValue === currentValue) return;
      sets.push(`${column} = $${idx}`);
      values.push(newValue);
      idx += 1;
    };

    addIfChanged('name', existing.name, dto.hostel_name);
    addIfChanged('city_kuid', existing.city_kuid, dto.city_kuid);
    addIfChanged('area_kuid', existing.area_kuid, dto.area_kuid);
    addIfChanged(
      'full_address_text',
      existing.full_address_text,
      dto.full_address,
    );
    addIfChanged('latitude', existing.latitude, dto.latitude as any);
    addIfChanged('longitude', existing.longitude, dto.longitude as any);
    addIfChanged('near_by', existing.near_by, dto.nearby);
    addIfChanged('gender_allowed', existing.gender_allowed, dto.gender);
    addIfChanged('type', existing.type, dto.hostel_type);
    addIfChanged(
      'visitor_policy',
      existing.visitor_policy,
      dto.visitor_policy,
    );
    addIfChanged('smoking', existing.smoking, dto.smoking_policy);

    if (dto.exterrior_photos_url !== undefined) {
      sets.push(`admission_photos_url = $${idx}`);
      values.push(dto.exterrior_photos_url ?? []);
      idx += 1;
    }

    if (dto.entrance_photos_urls !== undefined) {
      sets.push(`reception_photos_url = $${idx}`);
      values.push(dto.entrance_photos_urls ?? []);
      idx += 1;
    }

    if (dto.messa_area_photos_urls !== undefined) {
      sets.push(`mess_area_photos_url = $${idx}`);
      values.push(dto.messa_area_photos_urls ?? []);
      idx += 1;
    }

    addIfChanged('parking_type', existing.parking_type, dto.parking);
    addIfChanged(
      'security_deposit',
      existing.security_deposit,
      dto.security_deposit as any,
    );
    addIfChanged(
      'admission_fee',
      existing.admission_fee,
      dto.admission_fee as any,
    );

    if (!sets.length) {
      return existing;
    }

    values.push(existing.kuid);

    const result = await client.query(
      `UPDATE hostel SET ${sets.join(', ')}, updated_at = NOW() WHERE kuid = $${idx} RETURNING *`,
      values,
    );
    return result.rows[0];
  }

  async addHostelFacilities(
    client: PoolClient,
    hostelKuid: string,
    facilityKuids: string[],
  ): Promise<void> {
    if (!facilityKuids?.length) return;
    for (const facilityKuid of facilityKuids) {
      await client.query(HostelQueries.INSERT_HOSTEL_FACILITY, [hostelKuid, facilityKuid]);
    }
  }

  async findFacilityKuidsByHostelKuid(
    client: PoolClient,
    hostelKuid: string,
  ): Promise<string[]> {
    const result = await client.query(HostelQueries.FIND_FACILITY_KUIDS_BY_HOSTEL, [hostelKuid]);
    return result.rows.map((r) => r.facility_kuid as string);
  }

  async replaceHostelFacilities(
    client: PoolClient,
    hostelKuid: string,
    facilityKuids: string[] | undefined,
  ): Promise<void> {
    if (facilityKuids === undefined) {
      return;
    }

    const existing = await this.findFacilityKuidsByHostelKuid(
      client,
      hostelKuid,
    );

    const normalize = (arr: string[]) =>
      [...new Set(arr)].sort((a, b) => a.localeCompare(b));

    const normalizedExisting = normalize(existing);
    const normalizedNew = normalize(facilityKuids);

    const isSame =
      normalizedExisting.length === normalizedNew.length &&
      normalizedExisting.every((val, idx) => val === normalizedNew[idx]);

    if (isSame) {
      return;
    }
    await client.query(HostelQueries.DELETE_HOSTEL_FACILITIES, [hostelKuid]);
    await this.addHostelFacilities(client, hostelKuid, facilityKuids);
  }

  async upsertHostelBranch(
    client: PoolClient,
    hostelKuid: string,
    branchNo: string | undefined,
  ): Promise<void> {
    if (branchNo === undefined) {
      return;
    }
    const result = await client.query(HostelQueries.SELECT_HOSTEL_BRANCH, [hostelKuid]);
    const existing = result.rows[0] as
      | { kuid: string; branch_number: string }
      | undefined;

    if (!existing) {
      await this.createHostelBranch(client, hostelKuid, branchNo);
      return;
    }
    if (existing.branch_number === branchNo) {
      return;
    }
    await client.query(HostelQueries.UPDATE_HOSTEL_BRANCH, [branchNo, hostelKuid]);
  }

  async listAllHostels(): Promise<ListHostelItem[]> {
    const result = await this.pool.query(
      `${HostelQueries.LIST_HOSTELS_BODY.trim()}\n    ORDER BY h.name`,
    );
    return result.rows as ListHostelItem[];
  }

  async searchHostels(params: { name?: string; branch?: string }): Promise<ListHostelItem[]> {
    const conditions: string[] = [];
    const values: unknown[] = [];
    let idx = 1;
    if (params.name?.trim()) {
      conditions.push(`h.name ILIKE $${idx}`);
      values.push(`%${params.name.trim()}%`);
      idx += 1;
    }
    if (params.branch?.trim()) {
      conditions.push(`h.kuid IN (SELECT hostel_kuid FROM hostel_branch WHERE branch_number ILIKE $${idx})`);
      values.push(`%${params.branch.trim()}%`);
      idx += 1;
    }
    const whereClause = conditions.length > 0 ? `\n    WHERE ${conditions.join(' AND ')}` : '';
    const query = `${HostelQueries.LIST_HOSTELS_BODY.trim()}${whereClause}\n    ORDER BY h.name`;
    const result = await this.pool.query(query, values);
    return result.rows as ListHostelItem[];
  }

  /** Aggregate stats for an owner: total hostels, total rooms, total beds, avg occupancy (%) */
  async getHostelStats(ownerKuid: string): Promise<HostelStats> {
    const result = await this.pool.query(HostelQueries.GET_HOSTEL_STATS, [ownerKuid]);
    const row = result.rows[0];
    return {
      total_hostels: row?.total_hostels ?? 0,
      total_rooms: row?.total_rooms ?? 0,
      total_beds: row?.total_beds ?? 0,
      avg_occupancy: Number(row?.avg_occupancy ?? 0),
    };
  }
}
