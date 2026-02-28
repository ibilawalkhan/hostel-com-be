import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

export class RoomItemDto {
  @ApiProperty({ description: 'Room number', example: '101' })
  @IsString()
  room_no: string;

  @ApiProperty({ description: 'Floor number', example: '1' })
  @IsString()
  floor_no: string;

  @ApiProperty({ description: 'Room size (e.g. sq ft or label)', example: '120 sq ft' })
  @IsString()
  room_size: string;

  @ApiProperty({ description: 'Whether room has attached washroom', example: true })
  @Transform(({ value }) => (typeof value === 'string' ? value === 'true' : value))
  @IsBoolean()
  attached_washroom: boolean;
}

export class InitiateRoomsDto {
  @ApiProperty({ description: 'Beds per room: 1, 2, 3, 4, or 5', example: 2 })
  @Transform(({ value }) => (value === undefined || value === null ? value : Number(value)))
  @IsInt()
  @Min(1)
  @Max(5)
  room_type: number;

  @ApiProperty({ description: 'Number of rooms (must match rooms array length)', example: 2 })
  @Transform(({ value }) => (value === undefined || value === null ? value : Number(value)))
  @IsInt()
  @Min(1)
  total_rooms: number;

  @ApiProperty({
    description: 'Per-room details: room_no, floor_no, room_size, attached_washroom',
    type: [RoomItemDto],
    example: [
      { room_no: '101', floor_no: '1', room_size: '120 sq ft', attached_washroom: true },
      { room_no: '102', floor_no: '1', room_size: '120 sq ft', attached_washroom: false },
    ],
  })
  @Transform(({ value }) => (Array.isArray(value) ? value : []))
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RoomItemDto)
  rooms: RoomItemDto[];
}
