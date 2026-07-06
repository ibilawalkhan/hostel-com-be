import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { DatabaseModule } from './database/database.module';
import { IssuesModule } from './issues/issues.module';
import { LookupModule } from './lookup/lookup.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { HostelModule } from './hostel/hostel.module';
import { RoomsModule } from './rooms/rooms.module';
import { BedModule } from './bed/bed.module';
import { WardenModule } from './warden/warden.module';
import { IntegrationsModule } from './integrations/integrations.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabaseModule,
    AuthModule,
    UsersModule,
    IssuesModule,
    LookupModule,
    HostelModule,
    RoomsModule,
    BedModule,
    WardenModule,
    IntegrationsModule,
    HealthModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
