import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { NotificationsModule } from './notifications/notifications.module';
import { PasswordResetsModule } from './password_resets/password_resets.module';
import { UsersModule } from './users/users.module';
import { DatabaseModule } from './database/database.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabaseModule,
    AuthModule,
    NotificationsModule,
    PasswordResetsModule,
    UsersModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
