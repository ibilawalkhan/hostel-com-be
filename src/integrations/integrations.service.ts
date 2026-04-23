import { Injectable, NotFoundException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { S3Service } from './s3.service';
import { normalizeCategory } from './helper/normalizeCategory.helper';

@Injectable()
export class IntegrationsService {
  constructor(private readonly s3Service: S3Service) { }

  async uploadUserFile(file: Express.Multer.File, category: string) {
    const normalizedCategory = normalizeCategory(category);
    const fileUrl = await this.s3Service.uploadFile(file, normalizedCategory);

    return fileUrl;
  }

  async uploadUserFiles(files: Express.Multer.File[], category: string) {
    const normalizedCategory = normalizeCategory(category);
    const fileUrls = await Promise.all(
      files.map((file) => this.s3Service.uploadFile(file, normalizedCategory)),
    );

    return fileUrls;
  }

  // Get a pre-signed PUT URL for direct client upload to S3. Backend does not upload the file.
  async getPresignedUploadUrl(
    category: string,
    fileName: string,
    contentType?: string,
    expiresIn: number = 900,
  ): Promise<{ uploadUrl: string; key: string; publicUrl: string }> {

    const normalizedCategory = normalizeCategory(category);

    const ext = fileName.includes('.') ? fileName.split('.').pop()?.toLowerCase() ?? 'bin' : 'bin';

    const key = `${normalizedCategory}/${uuidv4()}.${ext}`;

    const uploadUrl = await this.s3Service.getPresignedPutUrl(
      key,
      contentType,
      expiresIn,
    );

    const publicUrl = this.s3Service.getPublicUrl(key);

    return { uploadUrl, key, publicUrl };
  }

  async getPresignedUploadUrls(
    fileSpecs: Array<{ category: string; fileName: string; contentType?: string }>,
    expiresIn: number = 900,
  ): Promise<Array<{ uploadUrl: string; key: string; publicUrl: string }>> {

    return Promise.all(
      fileSpecs.map((spec) =>
        this.getPresignedUploadUrl(
          spec.category,
          spec.fileName,
          spec.contentType,
          expiresIn,
        ),
      ),
    );

  }

  // Resolve an S3 key or public URL to a temporary display URL (for use in API responses).
  // Use when returning entities that have image keys – call this and send the result so the FE can use it in <img src>.
  async getDisplayUrl(keyOrPublicUrl: string, expiresIn: number = 3600): Promise<string | null> {

    const key = this.s3Service.keyFromPublicUrl(keyOrPublicUrl) ?? keyOrPublicUrl;

    const exists = await this.s3Service.existsInS3(key);
    if (!exists) return null;

    return this.s3Service.getPresignedGetUrl(key, expiresIn);
  }

  // Resolve multiple keys/URLs to display URLs in one go. Returns array in same order; null/empty input → null in output.
  async getDisplayUrls(
    keysOrUrls: (string | null | undefined)[],
    expiresIn: number = 3600,
  ): Promise<(string | null)[]> {

    const resolved = await Promise.all(

      keysOrUrls.map(async (k) => {
      
        if (!k?.trim()) return null;
      
        try {
          return await this.getDisplayUrl(k.trim(), expiresIn);
        } catch {
          return null;
        }
      }),
    );

    return resolved;
  }
}
