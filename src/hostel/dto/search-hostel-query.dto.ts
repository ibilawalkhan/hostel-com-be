import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class SearchHostelQueryDto {
  @ApiProperty({ description: 'Filter by hostel name (partial, case-insensitive)', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ description: 'Filter by branch number (partial, case-insensitive)', required: false })
  @IsOptional()
  @IsString()
  branch?: string;
}
