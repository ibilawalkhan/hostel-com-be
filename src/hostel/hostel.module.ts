import { Module } from '@nestjs/common';
import { HostelService } from './hostel.service';
import { HostelController } from './hostel.controller';
import { HostelRepository } from './hostel.repository';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [HostelController],
  providers: [HostelService, HostelRepository],
})
export class HostelModule {}
