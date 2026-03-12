import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UploadSingleFileDto {
  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'File to upload',
  })
  file: any;

  @ApiPropertyOptional({
    description: 'Folder/category: hostels, rooms, payments, users, misc',
    example: 'hostels',
  })
  category?: string;
}

