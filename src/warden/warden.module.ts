import { Module } from '@nestjs/common';
import { WardenService } from './warden.service';
import { WardenController } from './warden.controller';
import { WardenRepository } from './repository/warden.repository';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [WardenController],
  providers: [WardenService, WardenRepository],
})
export class WardenModule {}
