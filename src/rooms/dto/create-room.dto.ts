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

export class BedItemDto {
  @ApiProperty({ description: 'Bed identifier e.g. 1-Bed-A', example: '1-Bed-A' })
  @IsString()
  bedId: string;

  @ApiProperty({ enum: ['Available', 'Occupied', 'Reserved'], example: 'Available' })
  @IsString()
  occupancy_status: string;

  @ApiProperty({ example: 5000 })
  @IsNumber()
  @Min(0)
  monthly_rent: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  assigned_resident?: string;

  @ApiProperty({ required: false, example: '2025-03-01' })
  @IsOptional()
  @IsString()
  move_in_date?: string;
}

export class RoomItemCreateDto {
  @ApiProperty({ example: '101' })
  @IsString()
  room_no: string;

  @ApiProperty({ example: '1' })
  @IsString()
  floor_no: string;

  @ApiProperty({ example: '120 sq ft' })
  @IsString()
  room_size: string;

  @ApiProperty({ example: true })
  @IsBoolean()
  attached_washroom: boolean;

  @ApiProperty({ type: [BedItemDto], description: 'beds e.g. bedA, bedB' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BedItemDto)
  beds: BedItemDto[];

  @ApiProperty({ description: 'Facility kuids for this room', type: [String], default: [] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  room_facilities?: string[];

  @ApiProperty({ description: 'Facility kuids for this room\'s washroom (if attached)', type: [String], default: [] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  washroom_facilities?: string[];
}

export class CreateRoomDto {
  @ApiProperty({ description: 'Hostel kuid to create rooms in' })
  @IsString()
  hostel_kuid: string;

  @ApiProperty({ type: [RoomItemCreateDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RoomItemCreateDto)
  rooms: RoomItemCreateDto[];

  @ApiProperty({ description: 'Photo URLs applied to all rooms', type: [String], default: [] })
  @IsArray()
  @IsString({ each: true })
  room_photos_urls: string[];

  @ApiProperty({ description: 'Photo URLs applied to all washrooms', type: [String], default: [] })
  @IsArray()
  @IsString({ each: true })
  washroom_photos_urls: string[];
}
