import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateHostelDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  hostel_name: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  branch_no: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  city_kuid: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  area_kuid: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  full_address: string;

  @ApiProperty()
  @IsNumber()
  latitude: number;

  @ApiProperty()
  @IsNumber()
  longitude: number;

  @ApiProperty()
  @IsString()
  nearby: string;

  @ApiProperty({ enum: ['MALE', 'FEMALE'] })
  @IsString()
  @IsIn(['MALE', 'FEMALE'])
  gender: string;

  @ApiProperty({ enum: ['STUDENT', 'PROFESSIONAL', 'MIXED'] })
  @IsString()
  @IsIn(['STUDENT', 'PROFESSIONAL', 'MIXED'])
  hostel_type: string;

  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  facilities: string[];

  @ApiProperty({ enum: ['car', 'bike', 'both', 'none'] })
  @IsString()
  @IsIn(['car', 'bike', 'both', 'none'])
  parking: string;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  security_deposit?: number;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  admission_fee?: number;

  @ApiProperty({ enum: ['ALLOWED', 'NOT_ALLOWED', 'LIMITED_HOURS'] })
  @IsString()
  @IsIn(['ALLOWED', 'NOT_ALLOWED', 'LIMITED_HOURS'])
  visitor_policy: string;

  @ApiProperty({ enum: ['ALLOWED', 'NOT_ALLOWED'] })
  @IsString()
  @IsIn(['ALLOWED', 'NOT_ALLOWED'])
  smoking_policy: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  rules?: string;

  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  exterrior_photos_url?: string[];

  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  entrance_photos_urls?: string[];

  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  messa_area_photos_urls?: string[];
}
