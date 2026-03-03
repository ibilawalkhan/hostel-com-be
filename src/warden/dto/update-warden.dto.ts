import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsArray, MinLength, Matches } from 'class-validator';

export class UpdateWardenDto {
  @ApiPropertyOptional({ example: 'Sara Khan' })
  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'Full name must be at least 2 characters long' })
  full_name?: string;

  @ApiPropertyOptional({ example: '+92-333-9876543' })
  @IsOptional()
  @IsString()
  @Matches(/^[0-9+\-\s()]+$/, { message: 'Please provide a valid phone number' })
  phone_number?: string;

  @ApiPropertyOptional({ description: 'hostel_kuid to assign the warden to' })
  @IsOptional()
  @IsString()
  assigned_hostel?: string;

  @ApiPropertyOptional({ description: 'branch_kuid (optional)' })
  @IsOptional()
  @IsString()
  assigned_branch?: string;

  @ApiPropertyOptional({ type: [String], description: 'Array of permission kuids' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  permission_kuids?: string[];
}
