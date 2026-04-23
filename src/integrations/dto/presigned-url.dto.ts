import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, MinLength, IsArray, ValidateNested, ArrayMinSize, ArrayMaxSize } from 'class-validator';
import { Type } from 'class-transformer';


export class PresignedUrlItemDto {
  @ApiProperty({
    description: 'Folder/category: hostels, rooms, payments, users, misc (singular forms accepted)',
    example: 'hostels',
  })
  @IsString()
  category: string;

  @ApiProperty({
    description: 'Original file name (used to derive extension for the stored key)',
    example: 'photo.jpg',
  })
  @IsString()
  @MinLength(1)
  fileName: string;

  @ApiPropertyOptional({
    description: 'Content-Type of the file (e.g. image/jpeg). Recommended so the client can set it when uploading.',
    example: 'image/jpeg',
  })
  @IsOptional()
  @IsString()
  contentType?: string;
}


export class PresignedUrlsDto {
  @ApiProperty({
    type: [PresignedUrlItemDto],
    description: 'One or more file specs. Use a single item for one file, or multiple for batch.',
    minItems: 1,
    maxItems: 10,
    example: [
      { category: 'hostels', fileName: 'photo.jpg', contentType: 'image/jpeg' },
      { category: 'rooms', fileName: 'doc.pdf', contentType: 'application/pdf' },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PresignedUrlItemDto)
  @ArrayMinSize(1)
  @ArrayMaxSize(10)
  files: PresignedUrlItemDto[];
}
