import { UserAlreadyExistsException } from '../../common/exceptions/auth.exceptions';
import { LoggerService } from '../../common/services/logger.service';

/**
 * Handles signup errors consistently
 */
export function handleSignupError(
  error: any,
  identifier: string,
  logger: LoggerService,
): never {
  if (error.code === '23505') {
    // Unique constraint violation
    logger.warn(
      `Signup attempt with duplicate data: ${error.message}`,
      'ErrorHelper',
    );
    throw new UserAlreadyExistsException(undefined, identifier);
  }

  logger.error(
    `Signup failed: ${error.message}`,
    error.stack,
    'ErrorHelper',
  );
  throw error;
}

