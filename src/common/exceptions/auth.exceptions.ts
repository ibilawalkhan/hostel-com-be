import {
  ConflictException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { AuthErrorMessages } from '../constants/error-messages';

export class UserAlreadyExistsException extends ConflictException {
  constructor() {
    super(AuthErrorMessages.USER_ALREADY_EXISTS);
  }
}

export class InvalidCredentialsException extends UnauthorizedException {
  constructor() {
    super(AuthErrorMessages.INVALID_CREDENTIALS);
  }
}

export class AccountLockedException extends UnauthorizedException {
  constructor() {
    super(AuthErrorMessages.ACCOUNT_LOCKED);
  }
}

export class TermsNotAcceptedException extends BadRequestException {
  constructor() {
    super(AuthErrorMessages.TERMS_NOT_ACCEPTED);
  }
}
