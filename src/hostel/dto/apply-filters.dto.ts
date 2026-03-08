import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber, IsIn, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class ApplyFiltersDto {
  @ApiPropertyOptional({ description: 'Hostel kuid' })
  @IsOptional()
  @IsString()
  hostel_kuid?: string;

  @ApiPropertyOptional({ description: 'Branch kuid (hostel_branch.kuid)' })
  @IsOptional()
  @IsString()
  branch_kuid?: string;

  @ApiPropertyOptional({ description: 'Room type / seater: 1, 2, 3, 4, or 5', enum: ['1', '2', '3', '4', '5'] })
  @IsOptional()
  @IsString()
  @IsIn(['1', '2', '3', '4', '5'])
  room_type?: string;

  @ApiPropertyOptional({
    description: 'Room status: All Status, Empty, Partially Occupied, Full, Maintenance',
    enum: ['ALL_STATUS', 'EMPTY', 'PARTIAL_OCCUPIED', 'FULL', 'MAINTENANCE'],
  })
  @IsOptional()
  @IsString()
  @IsIn(['ALL_STATUS', 'EMPTY', 'PARTIAL_OCCUPIED', 'FULL', 'MAINTENANCE'])
  status?: string;

  @ApiPropertyOptional({ description: 'Floor number (e.g. 1, 2)' })
  @IsOptional()
  @IsString()
  floor_no?: string;

  @ApiPropertyOptional({ description: 'Min price per bed (monthly rent)' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  min_price?: number;

  @ApiPropertyOptional({ description: 'Max price per bed (monthly rent)' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  max_price?: number;

  @ApiPropertyOptional({
    description: 'Availability: All, Has Empty Beds, Fully Occupied',
    enum: ['ALL', 'HAS_EMPTY_BEDS', 'FULLY_OCCUPIED'],
  })
  @IsOptional()
  @IsString()
  @IsIn(['ALL', 'HAS_EMPTY_BEDS', 'FULLY_OCCUPIED'])
  availability?: string;

  @ApiPropertyOptional({ description: 'Specific room kuid' })
  @IsOptional()
  @IsString()
  room_kuid?: string;
}
