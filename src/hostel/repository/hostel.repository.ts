import { Injectable, Inject } from '@nestjs/common';
import { Pool, PoolClient } from 'pg';
import { CreateHostelDto } from './dto/create-hostel.dto';
import { UpdateHostelDto } from './dto/update-hostel.dto';

export interface HostelRow {
  kuid: string;
  owner_kuid: string;
  name: string;
  city_kuid: string | null;
  area_kuid: string | null;
  full_address_text: string | null;
  latitude: string | null;
  longitude: string | null;
  near_by: string | null;
  gender_allowed: string | null;
  type: string | null;
  visitor_policy: string | null;
  smoking: string | null;
  admission_photos_url: string[] | null;
  reception_photos_url: string[] | null;
  mess_area_photos_url: string[] | null;
  parking_type: string | null;
  security_deposit: string | null;
  admission_fee: string | null;
  created_at: Date;
  updated_at: Date;
}

@Injectable()
export class HostelRepository {
  constructor(@Inject('PG_POOL') private pool: Pool) {}

  async findByKuid(
    client: PoolClient,
    hostelKuid: string,
  ): Promise<HostelRow | null> {
    const result = await client.query(
      `SELECT *
       FROM hostel
       WHERE kuid = $1`,
      [hostelKuid],
    );

    return result.rows[0] || null;
  }

  async createHostel(
    client: PoolClient,
    ownerKuid: string,
    dto: CreateHostelDto,
  ): Promise<HostelRow> {
    const result = await client.query(
      `INSERT INTO hostel (
        owner_kuid,
        name,
        city_kuid,
        area_kuid,
        full_address_text,
        latitude,
        longitude,
        near_by,
        gender_allowed,
        type,
        visitor_policy,
        smoking,
        admission_photos_url,
        reception_photos_url,
        mess_area_photos_url,
        parking_type,
        security_deposit,
        admission_fee
      )
      VALUES (
        $1, $2, $3, $4, $5,
        $6, $7, $8, $9, $10,
        $11, $12, $13, $14, $15,
        $16, $17, $18
      )
      RETURNING *`,
      [
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
      ],
    );

    return result.rows[0];
  }

  async createHostelBranch(
    client: PoolClient,
    hostelKuid: string,
    branchNo: string,
  ): Promise<void> {
    await client.query(
      `INSERT INTO hostel_branch (hostel_kuid, branch_number)
       VALUES ($1, $2)`,
      [hostelKuid, branchNo],
    );
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
      `UPDATE hostel
       SET ${sets.join(', ')}, updated_at = NOW()
       WHERE kuid = $${idx}
       RETURNING *`,
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

    const query = `INSERT INTO hostel_facility (hostel_kuid, facility_kuid)
                   VALUES ($1, $2)
                   ON CONFLICT (hostel_kuid, facility_kuid) DO NOTHING`;

    for (const facilityKuid of facilityKuids) {
      await client.query(query, [hostelKuid, facilityKuid]);
    }
  }

  async findFacilityKuidsByHostelKuid(
    client: PoolClient,
    hostelKuid: string,
  ): Promise<string[]> {
    const result = await client.query(
      `SELECT facility_kuid
       FROM hostel_facility
       WHERE hostel_kuid = $1`,
      [hostelKuid],
    );

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

    await client.query(
      `DELETE FROM hostel_facility
       WHERE hostel_kuid = $1`,
      [hostelKuid],
    );

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

    const result = await client.query(
      `SELECT kuid, branch_number
       FROM hostel_branch
       WHERE hostel_kuid = $1
       LIMIT 1`,
      [hostelKuid],
    );

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

    await client.query(
      `UPDATE hostel_branch
       SET branch_number = $1
       WHERE hostel_kuid = $2`,
      [branchNo, hostelKuid],
    );
  }
}

