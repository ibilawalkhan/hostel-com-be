import { Injectable, Inject } from '@nestjs/common';
import { Pool } from 'pg';
import { WardenQueries } from '../queries/warden.queries';

export interface WardenRow {
  user_kuid: string;
  full_name: string;
  email: string | null;
  phone: string;
  is_active: boolean;
  created_at: Date;
  role_kuid: string;
  hostel_name: string;
  branch_number: string | null;
}

export interface PermissionRow {
  role_kuid: string;
  permission_name: string;
}

@Injectable()
export class WardenRepository {
  constructor(@Inject('PG_POOL') private pool: Pool) {}

  async findWardensByOwnerKuid(ownerKuid: string): Promise<WardenRow[]> {
    const result = await this.pool.query(WardenQueries.FIND_WARDENS_BY_OWNER_KUID, [ownerKuid]);
    return result.rows;
  }

  async findPermissionsByRoleKuids(roleKuids: string[]): Promise<PermissionRow[]> {
    if (roleKuids.length === 0) return [];
    const result = await this.pool.query(WardenQueries.FIND_PERMISSIONS_BY_ROLE_KUIDS, [roleKuids]);
    return result.rows;
  }

  async findWardenByUserKuidAndOwnerKuid(
    ownerKuid: string,
    userKuid: string,
  ): Promise<WardenRow | null> {
    const result = await this.pool.query(WardenQueries.FIND_WARDEN_BY_USER_KUID_AND_OWNER_KUID, [
      ownerKuid,
      userKuid,
    ]);
    return (result.rows[0] as WardenRow) || null;
  }
}
