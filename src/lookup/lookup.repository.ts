import { Injectable, Inject } from '@nestjs/common';
import { Pool } from 'pg';

@Injectable()
export class LookupRepository {
  constructor(@Inject('PG_POOL') private pool: Pool) {}

  async findComplaintCategories() {
    const result = await this.pool.query(
      `SELECT kuid, category_name FROM complaintcategory ORDER BY category_name`,
    );
    return result.rows;
  }

  async findComplaintPriorities() {
    const result = await this.pool.query(
      `SELECT kuid, priority_name FROM priority ORDER BY priority_name`,
    );
    return result.rows;
  }

  async findPermissions() {
    const result = await this.pool.query(
      `SELECT kuid, permission_name, description FROM permission ORDER BY permission_name`,
    );
    return result.rows;
  }

  async findAllMetadata() {
    const [categories, priorities, permissions] = await Promise.all([
      this.findComplaintCategories(),
      this.findComplaintPriorities(),
      this.findPermissions(),
    ]);

    return {
      categories,
      priorities,
      permissions,
    };
  }
}
