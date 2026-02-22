import { Injectable, Inject } from '@nestjs/common';
import { Pool } from 'pg';
import { IssueQueries } from '../queries/issues.queries';
import { ResidentHostel, HostelBranch } from '../interfaces/issue.interface';

@Injectable()
export class IssueLookupRepository {
  constructor(@Inject('PG_POOL') private pool: Pool) {}

  async findResidentHostels(userKuid: string): Promise<ResidentHostel[]> {
    const result = await this.pool.query(IssueQueries.GET_RESIDENT_HOSTELS, [userKuid]);
    return result.rows;
  }

  async findBranchesByHostel(hostelKuid: string): Promise<HostelBranch[]> {
    const result = await this.pool.query(IssueQueries.GET_BRANCHES_BY_HOSTEL, [hostelKuid]);
    return result.rows;
  }
}
