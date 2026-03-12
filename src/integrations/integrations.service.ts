import { Injectable } from '@nestjs/common';
import { S3Service } from './s3.service';
import { normalizeCategory } from './helper/normalizeCategory.helper';

@Injectable()
export class IntegrationsService {
  constructor(private readonly s3Service: S3Service) {}

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

}
