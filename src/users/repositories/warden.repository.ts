import { Injectable, Inject } from '@nestjs/common';
import { Pool } from 'pg';

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
  constructor(@Inject('PG_POOL') private pool: Pool) { }

  /**
   * Lists wardens whose assigned hostel is owned by the given owner.
   */
  async findWardensByOwnerKuid(ownerKuid: string): Promise<WardenRow[]> {
    const result = await this.pool.query(
      `SELECT
        u.kuid AS user_kuid,
        u.full_name,
        u.email,
        u.phone,
        u.is_active,
        u.created_at,
        r.kuid AS role_kuid,
        h.name AS hostel_name,
        hb.branch_number AS branch_number
       FROM "user" u
       INNER JOIN role r ON r.user_kuid = u.kuid AND r.name = 'WARDEN'
       INNER JOIN hostel h ON h.kuid = r.assigned_hostel_kuid AND h.owner_kuid = $1
       LEFT JOIN hostel_branch hb ON hb.kuid = r.hostel_branch_kuid
       ORDER BY u.created_at DESC`,
      [ownerKuid],
    );
    return result.rows;
  }

  /**
   * Returns permissions for the given role kuids (role_kuid, permission_name).
   */
  async findPermissionsByRoleKuids(roleKuids: string[]): Promise<PermissionRow[]> {

    if (roleKuids.length === 0) return [];

    const result = await this.pool.query(
      `SELECT rp.role_kuid, p.permission_name
       FROM role_permission rp
       INNER JOIN permission p ON p.kuid = rp.permission_kuid
       WHERE rp.role_kuid = ANY($1)`,
      [roleKuids],
    );

    return result.rows;
  }
}
