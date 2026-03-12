import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';
import { LoggerService } from '../common/services/logger.service';

@Injectable()
export class S3Service {
  private s3Client: S3Client;
  private readonly bucketName: string;
  private readonly region: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly logger: LoggerService,
  ) {
    this.bucketName = this.configService.getOrThrow<string>('AWS_BUCKET_NAME');
    this.region = this.configService.getOrThrow<string>('AWS_REGION');

    // Initialize the S3 client
    this.s3Client = new S3Client({
      region: this.region,
      credentials: {
        accessKeyId: this.configService.getOrThrow<string>('AWS_ACCESS_KEY'),
        secretAccessKey:
          this.configService.getOrThrow<string>('AWS_SECRET_KEY'),
      },
    });
  }

  // Upload a file to a specific folder/category within the bucket
  async uploadFile(
    file: Express.Multer.File,
    category: 'hostels' | 'rooms' | 'payments' | 'users' | 'misc' = 'misc',
  ) {
    const fileExtension = file.originalname.split('.').pop();
    const safeCategory = category || 'misc';
    const uniqueFileName = `${safeCategory}/${uuidv4()}.${fileExtension}`;

    try {
      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: this.bucketName,
          Key: uniqueFileName,
          Body: file.buffer,
          ContentType: file.mimetype,
        }),
      );

      return `https://${this.bucketName}.s3.${this.region}.amazonaws.com/${uniqueFileName}`;
    } catch (error: any) {
      this.logger.error(
        `S3 upload failed for ${file.originalname}: ${error.message}`,
        error.stack,
        S3Service.name,
      );
      throw new InternalServerErrorException('S3 upload failed');
    }
  }

  // Delete a file
  async deleteFile(fileName: string) {
    try {
      await this.s3Client.send(
        new DeleteObjectCommand({
          Bucket: this.bucketName,
          Key: fileName,
        }),
      );
    } catch (error: any) {
      this.logger.error(
        `S3 delete failed for ${fileName}: ${error.message}`,
        error.stack,
        S3Service.name,
      );
      throw new InternalServerErrorException('S3 delete failed');
    }
  }
}
