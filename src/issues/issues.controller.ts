import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { IssuesService } from './issues.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import type { TokenPayload } from '../common/services/token.service';
import {
  CreateIssueDto,
  UpdateIssueStatusDto,
  AddCommentDto,
  GetIssuesQueryDto,
} from './dto/issues.dto';

@ApiTags('Issues')
@ApiBearerAuth('JWT')
@Controller('issues')
export class IssuesController {
  constructor(private readonly issuesService: IssuesService) {}

  // ─── Context-specific lookups ─────────────────────────────────────────────

  @Get('lookup/my-hostels')
  @UseGuards(RolesGuard)
  @Roles('CUSTOMER')
  @ApiOperation({ summary: 'Customer: get hostels where this user is a resident' })
  @ApiResponse({ status: 200, description: 'List of hostels the resident is assigned to' })
  getResidentHostels(@CurrentUser() user: TokenPayload) {
    return this.issuesService.getResidentHostels(user.sub);
  }

  @Get('lookup/branches/:hostelKuid')
  @ApiOperation({ summary: 'Get branches for a given hostel' })
  @ApiResponse({ status: 200, description: 'List of branches' })
  getBranches(@Param('hostelKuid') hostelKuid: string) {
    return this.issuesService.getBranchesByHostel(hostelKuid);
  }

  // ─── Owner / Warden: stats & list (static routes first) ──────────────────

  @Get('stats')
  @UseGuards(RolesGuard)
  @Roles('OWNER', 'WARDEN')
  @ApiOperation({ summary: 'Owner/Warden: get issue statistics (open, in-progress, closed, critical)' })
  @ApiResponse({ status: 200, description: 'Issue stats for the owner\'s hostels' })
  getOwnerStats(@CurrentUser() user: TokenPayload) {
    return this.issuesService.getOwnerStats(user.sub);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles('OWNER', 'WARDEN')
  @ApiOperation({ summary: 'Owner/Warden: list all issues with optional filters' })
  @ApiResponse({ status: 200, description: 'Paginated list of issues' })
  getOwnerIssues(
    @CurrentUser() user: TokenPayload,
    @Query() query: GetIssuesQueryDto,
  ) {
    return this.issuesService.getOwnerIssues(user.sub, query);
  }

  // ─── Customer: submit & view own issues ──────────────────────────────────

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(RolesGuard)
  @Roles('CUSTOMER')
  @ApiOperation({ summary: 'Customer: submit a new issue/complaint' })
  @ApiResponse({ status: 201, description: 'Issue submitted successfully' })
  submitIssue(@Body() dto: CreateIssueDto, @CurrentUser() user: TokenPayload) {
    return this.issuesService.submitIssue(user.sub, dto);
  }

  @Get('my')
  @UseGuards(RolesGuard)
  @Roles('CUSTOMER')
  @ApiOperation({ summary: 'Customer: get all my submitted issues' })
  @ApiResponse({ status: 200, description: 'List of issues submitted by the current customer' })
  getMyIssues(@CurrentUser() user: TokenPayload) {
    return this.issuesService.getMyIssues(user.sub);
  }

  @Get('my/:kuid')
  @UseGuards(RolesGuard)
  @Roles('CUSTOMER')
  @ApiOperation({ summary: 'Customer: get a single issue with comments' })
  @ApiResponse({ status: 200, description: 'Issue detail with comments' })
  @ApiResponse({ status: 404, description: 'Issue not found' })
  getMyIssue(@Param('kuid') kuid: string) {
    return this.issuesService.getMyIssue(kuid);
  }

  // ─── Owner / Warden: individual issue management ─────────────────────────
  // NOTE: parameterised routes must come AFTER all static routes above

  @Patch(':kuid/status')
  @UseGuards(RolesGuard)
  @Roles('OWNER', 'WARDEN')
  @ApiOperation({ summary: 'Owner/Warden: update issue status' })
  @ApiResponse({ status: 200, description: 'Status updated successfully' })
  @ApiResponse({ status: 404, description: 'Issue not found' })
  updateStatus(@Param('kuid') kuid: string, @Body() dto: UpdateIssueStatusDto) {
    return this.issuesService.updateIssueStatus(kuid, dto);
  }

  @Get(':kuid')
  @UseGuards(RolesGuard)
  @Roles('OWNER', 'WARDEN')
  @ApiOperation({ summary: 'Owner/Warden: get a single issue with comments' })
  @ApiResponse({ status: 200, description: 'Issue detail with comments' })
  @ApiResponse({ status: 404, description: 'Issue not found' })
  getIssue(@Param('kuid') kuid: string) {
    return this.issuesService.getIssue(kuid);
  }

  // ─── Shared: comments (any authenticated user) ───────────────────────────

  @Post(':kuid/comments')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add a comment to an issue (any authenticated user)' })
  @ApiResponse({ status: 201, description: 'Comment added successfully' })
  @ApiResponse({ status: 404, description: 'Issue not found' })
  addComment(
    @Param('kuid') kuid: string,
    @Body() dto: AddCommentDto,
    @CurrentUser() user: TokenPayload,
  ) {
    return this.issuesService.addComment(kuid, user.sub, dto);
  }
}
