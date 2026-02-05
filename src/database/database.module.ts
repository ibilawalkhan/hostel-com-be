import { Module, Global } from '@nestjs/common';
import { Pool } from 'pg';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: 'PG_POOL',
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        return new Pool({
          host: config.get('DB_HOST'),
          port: +config.get('DB_PORT'),
          user: config.get('DB_USER'),
          password: config.get('DB_PASSWORD'),
          database: config.get('DB_NAME'),
        });
      },
    },
  ],
  exports: ['PG_POOL'],
})

export class DatabaseModule {}
