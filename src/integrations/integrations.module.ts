import { Module } from '@nestjs/common';
import { IntegrationsController } from './integrations.controller';
import { IntegrationsService } from './integrations.service';
import { S3Service } from './s3.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [IntegrationsController],
  providers: [IntegrationsService, S3Service],
  exports: [IntegrationsService, S3Service],
})
export class IntegrationsModule {}
