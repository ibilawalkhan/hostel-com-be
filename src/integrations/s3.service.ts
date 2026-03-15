import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
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

  // Generate a pre-signed PUT URL so the client can upload directly to S3
  async getPresignedPutUrl(
    key: string,
    contentType?: string,
    expiresIn: number = 900,
  ): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      ...(contentType && { ContentType: contentType }),
    });
    return getSignedUrl(this.s3Client, command, { expiresIn });
  }

  /// Build the public URL for an object key
  getPublicUrl(key: string): string {
    return `https://${this.bucketName}.s3.${this.region}.amazonaws.com/${key}`;
  }

  /// Generate a pre-signed GET URL for reading/displaying a private S3 object (e.g. in <img src>).
  async getPresignedGetUrl(key: string, expiresIn: number = 3600): Promise<string> {

    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });

    return getSignedUrl(this.s3Client, command, { expiresIn });
  }

  /// Extract S3 object key from a full public URL (e.g. https://bucket.s3.region.amazonaws.com/key).
  /// Returns null if the URL does not match this bucket.
  keyFromPublicUrl(publicUrl: string): string | null {

    const prefix = `https://${this.bucketName}.s3.${this.region}.amazonaws.com/`;

    if (!publicUrl || !publicUrl.startsWith(prefix)) return null;

    return publicUrl.slice(prefix.length);
  }

  async existsInS3(key: string): Promise<boolean> {
    try {
      await this.s3Client.send(new HeadObjectCommand({ Bucket: this.bucketName, Key: key }));
      return true;
    } catch (err) {
      if (err instanceof NotFoundException) return false;
      throw err;
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
