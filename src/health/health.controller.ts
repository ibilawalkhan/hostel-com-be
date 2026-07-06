import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { Public } from '../auth/decorators/public.decorator';

@Controller('health')
export class HealthController {
    
  @Public()
  @Get()
  @HttpCode(HttpStatus.OK)
  check() {
    console.log('Health check endpoint called')
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }
}
