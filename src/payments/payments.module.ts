import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { PaymentsRepository } from './repository/payments.repository';

@Module({
  controllers: [PaymentsController],
  providers: [PaymentsService, PaymentsRepository],
})

export class PaymentsModule {}