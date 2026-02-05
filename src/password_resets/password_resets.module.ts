import { Module } from '@nestjs/common';
import { PasswordResetsService } from './password_resets.service';
import { PasswordResetsController } from './password_resets.controller';

@Module({
  providers: [PasswordResetsService],
  controllers: [PasswordResetsController]
})
export class PasswordResetsModule {}
