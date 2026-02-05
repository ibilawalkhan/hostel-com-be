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
import { AuthMethodRepository } from './repositories/auth-method.repository';

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
    AuthMethodRepository,
    PasswordService,
    TokenService,
    LoggerService,
    TransactionHelper,
  ],
  exports: [TokenService, PasswordService], 
})
export class AuthModule {}
