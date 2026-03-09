import { UserRepository } from '../repositories/user.repository';
import { UserAlreadyExistsException } from '../../common/exceptions/auth.exceptions';
import { LoggerService } from '../../common/services/logger.service';

/**
 * Validates that user doesn't already exist by phone, email, or CNIC
 */
export async function validateUserUniqueness(
  userRepository: UserRepository,
  logger: LoggerService,
  phone: string,
  email: string | null | undefined,
  cnic: string | null | undefined,
): Promise<void> {
  const existsByPhone = await userRepository.existsByPhone(phone);
  if (existsByPhone) {
    logger.warn(
      `Signup attempt with existing phone: ${phone}`,
      'ValidationHelper',
    );
    throw new UserAlreadyExistsException('phone', phone);
  }

  if (email) {
    const existsByEmail = await userRepository.existsByEmail(email);
    if (existsByEmail) {
      logger.warn(
        `Signup attempt with existing email: ${email}`,
        'ValidationHelper',
      );
      throw new UserAlreadyExistsException('email', email);
    }
  }

  if (cnic) {
    const existsByCnic = await userRepository.existsByCnic(cnic);
    if (existsByCnic) {
      logger.warn(
        `Signup attempt with existing CNIC: ${cnic}`,
        'ValidationHelper',
      );
      throw new UserAlreadyExistsException('cnic', cnic);
    }
  }
}

