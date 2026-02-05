import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common';

@Injectable()
export class LoggerService implements NestLoggerService {
  log(message: string, context?: string) {
    console.log(`[${context || 'App'}] ${message}`);
  }

  error(message: string, trace?: string, context?: string) {
    console.error(`[${context || 'App'}] ${message}`, trace);
  }

  warn(message: string, context?: string) {
    console.warn(`[${context || 'App'}] ${message}`);
  }

  debug(message: string, context?: string) {
    if (process.env.NODE_ENV !== 'production') {
      console.debug(`[${context || 'App'}] ${message}`);
    }
  }

  // Sanitize sensitive data before logging
  sanitize(data: any): any {
    const sanitized = { ...data };
    const sensitiveFields = [
      'password',
      'password_hash',
      'token',
      'refreshToken',
      'accessToken',
    ];

    sensitiveFields.forEach((field) => {
      if (sanitized[field]) {
        sanitized[field] = '[REDACTED]';
      }
    });

    return sanitized;
  }
}
