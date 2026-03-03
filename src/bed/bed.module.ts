import { Module } from '@nestjs/common';
import { BedService } from './bed.service';
import { BedController } from './bed.controller';
import { BedRepository } from './repository/bed.repository';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [BedController],
  providers: [BedService, BedRepository],
})
export class BedModule {}
