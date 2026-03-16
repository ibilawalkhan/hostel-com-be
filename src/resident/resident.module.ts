import { Module } from '@nestjs/common';
import { ResidentController } from './resident.controller';
import { ResidentService } from './resident.service';
import { ResidentRepository } from './repository/resident.repository';
import { TransactionHelper } from '../common/database/transaction.helper';
import { LoggerService } from '../common/services/logger.service';
import { RoleRepository } from '../auth/repositories/role.repository';
import { PasswordService } from '../common/services/password.service';

@Module({
  controllers: [ResidentController],
  providers: [
    ResidentService,
    ResidentRepository,
    TransactionHelper,
    LoggerService,
    RoleRepository,
    PasswordService,
  ],
})
export class ResidentModule {}
