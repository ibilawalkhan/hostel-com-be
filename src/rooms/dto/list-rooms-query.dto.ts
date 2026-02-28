import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class ListRoomsQueryDto {
  @ApiProperty({ description: 'Page number (1-based)', default: 1, required: false })
  @IsOptional()
  @Transform(({ value }) => (value === undefined || value === null ? 1 : Number(value)))
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiProperty({ description: 'Items per page', default: 10, required: false })
  @IsOptional()
  @Transform(({ value }) => (value === undefined || value === null ? 10 : Number(value)))
  @IsInt()
  @Min(1)
  limit?: number = 10;

  @ApiProperty({ description: 'Filter by hostel kuid', required: false })
  @IsOptional()
  @IsString()
  hostel_kuid?: string;
}
