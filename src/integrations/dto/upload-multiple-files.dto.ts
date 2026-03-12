import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UploadMultipleFilesDto {
  @ApiProperty({
    type: 'array',
    items: {
      type: 'string',
      format: 'binary',
    },
    description: 'Files to upload',
  })
  files: any[];

  @ApiPropertyOptional({
    description: 'Folder/category: hostels, rooms, payments, users, misc',
    example: 'rooms',
  })
  category?: string;
}

