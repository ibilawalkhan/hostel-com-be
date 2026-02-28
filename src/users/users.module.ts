import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { AuthModule } from '../auth/auth.module';
import { WardenRepository } from './repositories/warden.repository';

@Module({
  imports: [AuthModule],
  providers: [UsersService, WardenRepository],
  controllers: [UsersController],
})
export class UsersModule {}
