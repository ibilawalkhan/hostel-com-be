import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsIn,
  Matches,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { IssueStatus } from '../interfaces/issue.interface';

// Reusable kuid validation: CHAR(32) hex UUID without hyphens
const KUID_REGEX = /^[0-9a-f]{32}$/i;
const KUID_MSG = 'must be a valid 32-character identifier';

export class CreateIssueDto {
  @ApiProperty({ description: 'kuid of the hostel', example: 'a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4' })
  @IsNotEmpty()
  @IsString()
  @Matches(KUID_REGEX, { message: `hostel_kuid ${KUID_MSG}` })
  hostel_kuid: string;

  @ApiProperty({ description: 'kuid of the hostel branch', example: 'a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4' })
  @IsNotEmpty()
  @IsString()
  @Matches(KUID_REGEX, { message: `branch_kuid ${KUID_MSG}` })
  branch_kuid: string;

  @ApiProperty({ description: 'kuid of the complaint category', example: 'a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4' })
  @IsNotEmpty()
  @IsString()
  @Matches(KUID_REGEX, { message: `category_kuid ${KUID_MSG}` })
  category_kuid: string;

  @ApiProperty({ description: 'kuid of the priority level', example: 'a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4' })
  @IsNotEmpty()
  @IsString()
  @Matches(KUID_REGEX, { message: `priority_kuid ${KUID_MSG}` })
  priority_kuid: string;

  @ApiPropertyOptional({ example: '101', description: 'Room number (optional)' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  room_no?: string;

  @ApiProperty({ example: 'Water leakage in bathroom' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  title: string;

  @ApiProperty({ example: 'There is a continuous water drip from the ceiling pipe near the shower.' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(2000)
  description: string;

  @ApiPropertyOptional({ example: 'https://cdn.example.com/photo.jpg', description: 'URL of attached image/file' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  attachment_url?: string; // single URL — matches existing DB column type TEXT
}

export class UpdateIssueStatusDto {
  @ApiProperty({ enum: ['OPEN', 'INPROGRESS', 'CLOSED'], example: 'INPROGRESS' })
  @IsNotEmpty()
  @IsIn(['OPEN', 'INPROGRESS', 'CLOSED'], {
    message: 'status must be one of: OPEN, INPROGRESS, CLOSED',
  })
  status: IssueStatus;
}

export class AddCommentDto {
  @ApiProperty({ example: 'We will look into this today.' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(2000)
  comment: string;

  @ApiPropertyOptional({ description: 'kuid of parent comment (for threaded replies)' })
  @IsOptional()
  @IsString()
  @Matches(KUID_REGEX, { message: `parent_kuid ${KUID_MSG}` })
  parent_kuid?: string;
}

export class GetIssuesQueryDto {
  @ApiPropertyOptional({ enum: ['OPEN', 'INPROGRESS', 'CLOSED'] })
  @IsOptional()
  @IsIn(['OPEN', 'INPROGRESS', 'CLOSED'])
  status?: IssueStatus;

  @ApiPropertyOptional({ description: 'Filter by hostel kuid' })
  @IsOptional()
  @IsString()
  @Matches(KUID_REGEX, { message: `hostel_kuid ${KUID_MSG}` })
  hostel_kuid?: string;

  @ApiPropertyOptional({ description: 'Filter by category kuid' })
  @IsOptional()
  @IsString()
  @Matches(KUID_REGEX, { message: `category_kuid ${KUID_MSG}` })
  category_kuid?: string;

  @ApiPropertyOptional({ description: 'Filter by priority kuid' })
  @IsOptional()
  @IsString()
  @Matches(KUID_REGEX, { message: `priority_kuid ${KUID_MSG}` })
  priority_kuid?: string;

  @ApiPropertyOptional({ description: 'Search by title or description' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  search?: string;
}
