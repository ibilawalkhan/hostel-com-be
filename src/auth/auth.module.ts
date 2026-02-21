import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TransactionHelper } from '../common/database/transaction.helper';
import { LoggerService } from '../common/services/logger.service';
import { PasswordService } from '../common/services/password.service';
import { TokenService } from '../common/services/token.service';
import { UserRepository } from './repositories/user.repository';
import { RoleRepository } from './repositories/role.repository';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_ACCESS_SECRET'),
        signOptions: { expiresIn: '15m' },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    UserRepository,
    RoleRepository,
    PasswordService,
    TokenService,
    LoggerService,
    TransactionHelper,
    JwtAuthGuard,
    RolesGuard,
  ],
  exports: [
    TokenService,
    PasswordService,
    JwtAuthGuard,
    RolesGuard,
    UserRepository,
    RoleRepository,
    TransactionHelper,
    LoggerService,
  ],
})
export class AuthModule {}
