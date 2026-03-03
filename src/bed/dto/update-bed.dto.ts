import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class UpdateBedDto {
  @ApiProperty({ description: 'Monthly rent for the bed', example: 5500, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  rent?: number;

  @ApiProperty({ description: 'Resident kuid to assign to this bed; omit or null to clear assignment', required: false })
  @IsOptional()
  @IsString()
  @IsUUID()
  assigned_resident_kuid?: string | null;

  @ApiProperty({ enum: ['OCCUPIED', 'RESERVED', 'AVAILABLE'], required: false })
  @IsOptional()
  @IsIn(['OCCUPIED', 'RESERVED', 'AVAILABLE'])
  status?: 'OCCUPIED' | 'RESERVED' | 'AVAILABLE';
}
