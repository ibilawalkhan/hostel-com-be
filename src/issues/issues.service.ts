import { Injectable, NotFoundException } from '@nestjs/common';
import { IssueRepository } from './repositories/issue.repository';
import { IssueLookupRepository } from './repositories/issue-lookup.repository';
import { RoleRepository } from '../auth/repositories/role.repository';
import { TransactionHelper } from '../common/database/transaction.helper';
import { LoggerService } from '../common/services/logger.service';
import {
  CreateIssueDto,
  UpdateIssueStatusDto,
  AddCommentDto,
  GetIssuesQueryDto,
} from './dto/issues.dto';
import type { IssueStatus } from './interfaces/issue.interface';

@Injectable()
export class IssuesService {
  constructor(
    private issueRepository: IssueRepository,
    private issueLookupRepository: IssueLookupRepository,
    private roleRepository: RoleRepository,
    private transactionHelper: TransactionHelper,
    private logger: LoggerService,
  ) {}

  // ─── Context-specific lookups ─────────────────────────────────────────────

  async getResidentHostels(userKuid: string) {
    const hostels = await this.issueLookupRepository.findResidentHostels(userKuid);
    return { hostels };
  }

  async getBranchesByHostel(hostelKuid: string) {
    const branches = await this.issueLookupRepository.findBranchesByHostel(hostelKuid);
    return { branches };
  }

  // ─── Customer: submit & view own issues ──────────────────────────────────

  async submitIssue(userKuid: string, data: CreateIssueDto) {
    // Resolve the user's active CUSTOMER role kuid from the DB — no JWT role_kuid needed
    const roles = await this.roleRepository.findByUserKuid(userKuid);
    const customerRole = roles.find((r) => r.name === 'CUSTOMER' && r.is_active);
    if (!customerRole) {
      throw new NotFoundException('No active customer role found for this user');
    }

    const issue = await this.transactionHelper.executeInTransaction(
      async (client) => {
        return this.issueRepository.create(client, {
          hostelKuid: data.hostel_kuid,
          branchKuid: data.branch_kuid,
          roleKuid: customerRole.kuid,
          categoryKuid: data.category_kuid,
          priorityKuid: data.priority_kuid,
          roomNo: data.room_no || null,
          title: data.title,
          description: data.description,
          attachmentUrl: data.attachment_url || null,
        });
      },
    );

    this.logger.log(`Issue submitted by user ${userKuid}: ${issue.kuid}`, 'IssuesService');
    return { message: 'Issue submitted successfully', issue };
  }

  async getMyIssues(userKuid: string) {
    const issues = await this.issueRepository.findByUserKuid(userKuid);
    return { issues };
  }

  async getMyIssue(kuid: string) {
    const issue = await this.issueRepository.findByKuid(kuid);
    if (!issue) throw new NotFoundException('Issue not found');
    const comments = await this.issueRepository.getComments(kuid);
    return { issue: { ...issue, comments } };
  }

  // ─── Owner / Warden: manage issues ───────────────────────────────────────

  async getOwnerIssues(ownerKuid: string, filters: GetIssuesQueryDto) {
    const issues = await this.issueRepository.findByOwnerKuid(ownerKuid, filters);
    return { issues };
  }

  async getOwnerStats(ownerKuid: string) {
    const stats = await this.issueRepository.getOwnerStats(ownerKuid);
    return { stats };
  }

  async getIssue(kuid: string) {
    const issue = await this.issueRepository.findByKuid(kuid);
    if (!issue) throw new NotFoundException('Issue not found');
    const comments = await this.issueRepository.getComments(kuid);
    return { issue: { ...issue, comments } };
  }

  async updateIssueStatus(kuid: string, dto: UpdateIssueStatusDto) {
    const issue = await this.issueRepository.findByKuid(kuid);
    if (!issue) throw new NotFoundException('Issue not found');

    const updated = await this.transactionHelper.executeInTransaction(
      async (client) =>
        this.issueRepository.updateStatus(client, kuid, dto.status as IssueStatus),
    );

    this.logger.log(`Issue ${kuid} status updated to ${dto.status}`, 'IssuesService');
    return { message: 'Issue status updated successfully', issue: updated };
  }

  // ─── Shared: comments ────────────────────────────────────────────────────

  async addComment(complaintKuid: string, userKuid: string, dto: AddCommentDto) {
    const issue = await this.issueRepository.findByKuid(complaintKuid);
    if (!issue) throw new NotFoundException('Issue not found');

    const comment = await this.transactionHelper.executeInTransaction(
      async (client) =>
        this.issueRepository.addComment(client, userKuid, complaintKuid, dto.comment, dto.parent_kuid),
    );

    this.logger.log(`Comment added to issue ${complaintKuid} by user ${userKuid}`, 'IssuesService');
    return { message: 'Comment added successfully', comment };
  }
}
