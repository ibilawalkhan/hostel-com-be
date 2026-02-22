import { Module } from '@nestjs/common';
import { IssuesController } from './issues.controller';
import { IssuesService } from './issues.service';
import { IssueRepository } from './repositories/issue.repository';
import { IssueLookupRepository } from './repositories/issue-lookup.repository';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [IssuesController],
  providers: [IssuesService, IssueRepository, IssueLookupRepository],
})
export class IssuesModule {}
