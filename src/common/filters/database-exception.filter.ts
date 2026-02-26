import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';

// PostgreSQL error codes
const PG_FK_VIOLATION = '23503';
const PG_UNIQUE_VIOLATION = '23505';
const PG_CHECK_VIOLATION = '23514';
const PG_NOT_NULL_VIOLATION = '23502';

// Map FK constraint names → human-readable messages
const FK_MESSAGES: Record<string, string> = {
  // complaint table
  fk_complaint_hostel: 'Hostel does not exist',
  fk_complaint_branch: 'Branch does not exist',
  fk_complaint_role: 'Role does not exist',
  fk_complaint_category: 'Complaint category does not exist',
  fk_complaint_priority: 'Priority does not exist',
  // comments table
  fk_comments_user: 'User does not exist',
  fk_comments_parent: 'Parent comment does not exist',
  fk_comments_complaint: 'Issue does not exist',
};

@Catch()
export class DatabaseExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('DatabaseExceptionFilter');

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    // Pass NestJS HttpExceptions through unchanged
    if (exception instanceof HttpException) {
      return response
        .status(exception.getStatus())
        .json(exception.getResponse());
    }

    // Handle PostgreSQL errors
    if (this.isPgError(exception)) {
      const pgError = exception as Record<string, unknown>;
      const code = pgError.code as string;
      const constraint = pgError.constraint as string | undefined;

      switch (code) {
        case PG_FK_VIOLATION: {
          const message =
            (constraint && FK_MESSAGES[constraint]) ??
            'Referenced record does not exist';
          return response.status(HttpStatus.BAD_REQUEST).json({
            statusCode: HttpStatus.BAD_REQUEST,
            message,
            error: 'Bad Request',
          });
        }

        case PG_UNIQUE_VIOLATION: {
          return response.status(HttpStatus.CONFLICT).json({
            statusCode: HttpStatus.CONFLICT,
            message: 'A record with this value already exists',
            error: 'Conflict',
          });
        }

        case PG_CHECK_VIOLATION: {
          return response.status(HttpStatus.BAD_REQUEST).json({
            statusCode: HttpStatus.BAD_REQUEST,
            message: 'Value fails a database constraint check',
            error: 'Bad Request',
          });
        }

        case PG_NOT_NULL_VIOLATION: {
          return response.status(HttpStatus.BAD_REQUEST).json({
            statusCode: HttpStatus.BAD_REQUEST,
            message: `Field '${pgError.column}' cannot be null`,
            error: 'Bad Request',
          });
        }
      }
    }

    // Unknown / unexpected errors → 500
    this.logger.error('Unhandled exception', exception instanceof Error ? exception.stack : exception);
    return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
      error: 'Internal Server Error',
    });
  }

  private isPgError(error: unknown): boolean {
    return (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      typeof (error as Record<string, unknown>).code === 'string' &&
      /^\d{5}$/.test((error as Record<string, unknown>).code as string)
    );
  }
}
