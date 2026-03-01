import { Module } from '@nestjs/common';
import { LookupController } from './lookup.controller';
import { LookupService } from './lookup.service';
import { LookupRepository } from './repository/lookup.repository';

@Module({
  controllers: [LookupController],
  providers: [LookupService, LookupRepository],
})
export class LookupModule {}
