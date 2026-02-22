import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsIn,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { IssueStatus } from '../interfaces/issue.interface';

export class CreateIssueDto {
  @ApiProperty({ description: 'kuid of the hostel' })
  @IsNotEmpty()
  @IsString()
  hostel_kuid: string;

  @ApiProperty({ description: 'kuid of the hostel branch' })
  @IsNotEmpty()
  @IsString()
  branch_kuid: string;

  @ApiProperty({ description: 'kuid of the complaint category' })
  @IsNotEmpty()
  @IsString()
  category_kuid: string;

  @ApiProperty({ description: 'kuid of the priority level' })
  @IsNotEmpty()
  @IsString()
  priority_kuid: string;

  @ApiPropertyOptional({ example: '101', description: 'Room number (optional)' })
  @IsOptional()
  @IsString()
  room_no?: string;

  @ApiProperty({ example: 'Water leakage in bathroom' })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({ example: 'There is a continuous water drip from the ceiling pipe near the shower.' })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiPropertyOptional({ example: 'https://cdn.example.com/photo.jpg', description: 'URL of attached image/file' })
  @IsOptional()
  @IsString()
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
  comment: string;

  @ApiPropertyOptional({ description: 'kuid of parent comment (for threaded replies)' })
  @IsOptional()
  @IsString()
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
  hostel_kuid?: string;

  @ApiPropertyOptional({ description: 'Filter by category kuid' })
  @IsOptional()
  @IsString()
  category_kuid?: string;

  @ApiPropertyOptional({ description: 'Filter by priority kuid' })
  @IsOptional()
  @IsString()
  priority_kuid?: string;

  @ApiPropertyOptional({ description: 'Search by title or description' })
  @IsOptional()
  @IsString()
  search?: string;
}
