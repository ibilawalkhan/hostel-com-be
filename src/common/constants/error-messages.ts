export const AuthErrorMessages = {
  INVALID_CREDENTIALS: 'Invalid credentials provided',
  USER_ALREADY_EXISTS: 'An account with this email already exists',
  ACCOUNT_LOCKED: 'Your account has been locked. Please contact support',
  TERMS_NOT_ACCEPTED: 'You must accept the terms and conditions',
  WEAK_PASSWORD: 'Password does not meet security requirements',
  REGISTRATION_FAILED: 'Registration failed. Please try again',
  TOKEN_EXPIRED: 'Your session has expired. Please sign in again',
  TOKEN_INVALID: 'Invalid authentication token',
  UNAUTHORIZED: 'You are not authorized to perform this action',
} as const;

export const AuthSuccessMessages = {
  SIGNUP_SUCCESS: 'Account created successfully',
  SIGNIN_SUCCESS: 'Signed in successfully',
  SIGNOUT_SUCCESS: 'Signed out successfully',
} as const;