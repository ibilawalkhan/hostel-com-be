import { Injectable, Inject } from '@nestjs/common';
import { Pool, PoolClient } from 'pg';
import { IssueQueries } from '../queries/issues.queries';
import {
  Issue,
  IssueComment,
  IssueListItem,
  IssueStats,
  IssueStatus,
} from '../interfaces/issue.interface';
import { GetIssuesQueryDto } from '../dto/issues.dto';

@Injectable()
export class IssueRepository {
  constructor(@Inject('PG_POOL') private pool: Pool) {}

  async create(
    client: PoolClient,
    data: {
      hostelKuid: string;
      branchKuid: string;
      roleKuid: string;
      categoryKuid: string;
      priorityKuid: string;
      roomNo: string | null;
      title: string;
      description: string;
      attachmentUrl: string | null;
    },
  ): Promise<Issue> {
    const result = await client.query(IssueQueries.CREATE_ISSUE, [
      data.hostelKuid,
      data.branchKuid,
      data.roleKuid,
      data.categoryKuid,
      data.priorityKuid,
      data.roomNo,
      data.title,
      data.description,
      data.attachmentUrl,
    ]);
    return result.rows[0];
  }

  async findByUserKuid(userKuid: string): Promise<IssueListItem[]> {
    const result = await this.pool.query(IssueQueries.GET_MY_ISSUES, [userKuid]);
    return result.rows;
  }

  async findByKuid(kuid: string): Promise<IssueListItem | null> {
    const result = await this.pool.query(IssueQueries.GET_ISSUE_BY_KUID, [kuid]);
    return result.rows[0] || null;
  }

  async findByOwnerKuid(
    ownerKuid: string,
    filters: GetIssuesQueryDto,
  ): Promise<IssueListItem[]> {
    const params: unknown[] = [ownerKuid];
    let paramIdx = 2;
    let extraWhere = '';

    if (filters.status) {
      extraWhere += ` AND c.status = $${paramIdx++}`;
      params.push(filters.status);
    }
    if (filters.hostel_kuid) {
      extraWhere += ` AND c.hostel_kuid = $${paramIdx++}`;
      params.push(filters.hostel_kuid);
    }
    if (filters.category_kuid) {
      extraWhere += ` AND c.category_kuid = $${paramIdx++}`;
      params.push(filters.category_kuid);
    }
    if (filters.priority_kuid) {
      extraWhere += ` AND c.priority_kuid = $${paramIdx++}`;
      params.push(filters.priority_kuid);
    }
    if (filters.search) {
      extraWhere += ` AND (c.title ILIKE $${paramIdx} OR c.description ILIKE $${paramIdx})`;
      params.push(`%${filters.search}%`);
      paramIdx++;
    }

    const query = `
      SELECT
        c.id,
        c.kuid,
        c.room_no,
        c.title,
        c.description,
        c.status,
        c.attachment_url,
        c.created_at,
        c.updated_at,
        'ISS' || LPAD(c.id::text, 3, '0') AS issue_number,
        cc.category_name,
        p.priority_name,
        h.name AS hostel_name,
        hb.branch_number,
        u.full_name AS submitted_by,
        (SELECT COUNT(*) FROM comments cm WHERE cm.complaint_kuid = c.kuid)::int AS comment_count
      FROM complaint c
      INNER JOIN complaintcategory cc ON cc.kuid = c.category_kuid
      INNER JOIN priority p           ON p.kuid  = c.priority_kuid
      INNER JOIN hostel h             ON h.kuid  = c.hostel_kuid
      INNER JOIN hostel_branch hb     ON hb.kuid = c.branch_kuid
      INNER JOIN role r               ON r.kuid  = c.role_kuid
      INNER JOIN "user" u             ON u.kuid  = r.user_kuid
      WHERE h.owner_kuid = $1${extraWhere}
      ORDER BY c.created_at DESC
    `;

    const result = await this.pool.query(query, params);
    return result.rows;
  }

  async getOwnerStats(ownerKuid: string): Promise<IssueStats> {
    const result = await this.pool.query(IssueQueries.GET_OWNER_STATS, [ownerKuid]);
    return result.rows[0];
  }

  async updateStatus(
    client: PoolClient,
    kuid: string,
    status: IssueStatus,
  ): Promise<Issue> {
    const result = await client.query(IssueQueries.UPDATE_STATUS, [status, kuid]);
    return result.rows[0];
  }

  async getComments(complaintKuid: string): Promise<IssueComment[]> {
    const result = await this.pool.query(
      IssueQueries.GET_COMMENTS_BY_COMPLAINT,
      [complaintKuid],
    );
    return result.rows;
  }

  async addComment(
    client: PoolClient,
    userKuid: string,
    complaintKuid: string,
    comment: string,
    parentKuid?: string,
  ): Promise<IssueComment> {
    const result = await client.query(IssueQueries.ADD_COMMENT, [
      userKuid,
      complaintKuid,
      comment,
      parentKuid || null,
    ]);
    return result.rows[0];
  }
}
