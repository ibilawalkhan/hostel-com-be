import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEmail,
  IsNumber,
  IsIn,
  IsDateString,
} from 'class-validator';

export class CreateWalkInDto {
  // Personal Info
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  full_name: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  phone_number: string;

  @ApiProperty()
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  cnic: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  emergency_contact_name: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  emergency_phone: string;

  // Hostel Selection
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  hostel_kuid: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  branch_kuid: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  room_type: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  room_kuid: string;

@ApiProperty({ enum: ['ONLINE', 'WALK-IN'] })
@IsString()
@IsIn(['ONLINE', 'WALK-IN'])
resident_type: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  bed_kuid: string;

  @ApiProperty()
  @IsDateString()
  check_in_date: string;

  // Payment
  @ApiProperty()
  @IsNumber()
  monthly_rent: number;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  security_deposit?: number;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  ac_charges?: number;

  @ApiProperty({ enum: ['CASH', 'BANK_TRANSFER', 'ONLINE'] })
  @IsString()
  @IsIn(['CASH', 'BANK_TRANSFER', 'ONLINE'])
  payment_mode: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  transaction_id?: string;
}
