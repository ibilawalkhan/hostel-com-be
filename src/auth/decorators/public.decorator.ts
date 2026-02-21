import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Mark a route or controller as public (no JWT required).
 * Use on signin, signup, and other unauthenticated endpoints.
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
