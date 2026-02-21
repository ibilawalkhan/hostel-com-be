import { Injectable, Inject } from '@nestjs/common';
import { Pool, PoolClient } from 'pg';
import { RoleQueries } from '../queries/role.queries';

export interface Role {
  kuid: string;
  user_kuid: string;
  assigned_hostel: string | null;
  hostel_branch: string | null;
  name: 'OWNER' | 'WARDEN' | 'CUSTOMER';
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

@Injectable()
export class RoleRepository {
  constructor(@Inject('PG_POOL') private pool: Pool) {}

  async create(
    client: PoolClient,
    userKuid: string,
    roleName: 'OWNER' | 'WARDEN' | 'CUSTOMER',
    assignedHostel?: string | null,
    hostelBranch?: string | null,
  ): Promise<Role> {
    const result = await client.query(RoleQueries.INSERT_ROLE, [
      userKuid,
      roleName,
      assignedHostel || null,
      hostelBranch || null,
    ]);

    return result.rows[0];
  }

  async findByUserKuid(userKuid: string): Promise<Role[]> {
    const result = await this.pool.query(RoleQueries.FIND_BY_USER_KUID, [
      userKuid,
    ]);
    return result.rows;
  }

  async assignPermission(
    client: PoolClient,
    roleKuid: string,
    permissionKuid: string,
  ): Promise<void> {
    await client.query(RoleQueries.INSERT_ROLE_PERMISSION, [
      roleKuid,
      permissionKuid,
    ]);
  }

  async assignPermissions(
    client: PoolClient,
    roleKuid: string,
    permissionKuids: string[],
  ): Promise<void> {
    for (const permissionKuid of permissionKuids) {
      await this.assignPermission(client, roleKuid, permissionKuid);
    }
  }

  async findPermissionsByRoleKuid(roleKuid: string): Promise<Array<{
    kuid: string;
    permission_name: string;
    description: string | null;
  }>> {
    const result = await this.pool.query(
      RoleQueries.FIND_PERMISSIONS_BY_ROLE_KUID,
      [roleKuid],
    );
    return result.rows;
  }
}

