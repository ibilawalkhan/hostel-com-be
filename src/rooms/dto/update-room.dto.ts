import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';
import { BedItemDto } from './create-room.dto';

/**
 * Update a single room by room kuid. All fields optional; only provided fields are updated.
 */
export class UpdateRoomDto {
  @ApiProperty({ example: '101', required: false })
  @IsOptional()
  @IsString()
  room_no?: string;

  @ApiProperty({ example: '1', required: false })
  @IsOptional()
  @IsString()
  floor_no?: string;

  @ApiProperty({ example: '120 sq ft', required: false })
  @IsOptional()
  @IsString()
  room_size?: string;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  attached_washroom?: boolean;

  @ApiProperty({ type: [BedItemDto], required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BedItemDto)
  beds?: BedItemDto[];

  @ApiProperty({ type: [String], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  room_facilities?: string[];

  @ApiProperty({ type: [String], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  washroom_facilities?: string[];

  @ApiProperty({ type: [String], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  room_photos_urls?: string[];

  @ApiProperty({ type: [String], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  washroom_photos_urls?: string[];
}
