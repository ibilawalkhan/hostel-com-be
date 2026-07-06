import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';

@Controller('health')
export class HealthController {
    
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
