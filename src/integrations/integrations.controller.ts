import { Body, Controller, Post, UploadedFile, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { IntegrationsService } from './integrations.service';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { imageValidationPipe } from './pipes/imageValidation.pipe';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UploadSingleFileDto } from './dto/upload-single-file.dto';
import { UploadMultipleFilesDto } from './dto/upload-multiple-files.dto';

@ApiTags('Integrations')
@ApiBearerAuth('JWT')
@Controller('integrations')
export class IntegrationsController {
  constructor(private readonly integrationsService: IntegrationsService) {}

  @Post('upload-single-file')
  @ApiOperation({
    summary: 'Upload a single image file to S3 (hostels/rooms/payments/users/misc)',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UploadSingleFileDto })
  @ApiResponse({
    status: 201,
    description: 'Image uploaded successfully',
    schema: {
      type: 'object',
      properties: {
        url: { type: 'string', example: 'https://bucket.s3.region.amazonaws.com/hostels/uuid.jpg' },
      },
    },
  })
  @UseGuards(JwtAuthGuard)
  @Roles('OWNER', 'WARDEN')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile(imageValidationPipe())
    file: Express.Multer.File,
    @Body('category') category?: string,
  ) {
    const fileUrl = await this.integrationsService.uploadUserFile(
      file,
      category ?? 'misc',
    );

    return { url: fileUrl };
  }

  @Post('upload-multiple-files')
  @ApiOperation({
    summary: 'Upload multiple image files to S3 (same category for all files)',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UploadMultipleFilesDto })
  @ApiResponse({
    status: 201,
    description: 'Images uploaded successfully',
    schema: {
      type: 'array',
      items: { type: 'string', example: 'https://bucket.s3.region.amazonaws.com/rooms/uuid.jpg' },
    },
  })
  @UseGuards(JwtAuthGuard)
  @Roles('OWNER', 'WARDEN')
  @UseInterceptors(FilesInterceptor('files', 5))
  async uploadFiles(
    @UploadedFiles(imageValidationPipe())
    files: Express.Multer.File[],
    @Body('category') category?: string,
  ) {
    const urls = await this.integrationsService.uploadUserFiles(
      files,
      category ?? 'misc',
    );

    return urls;
  }
}
