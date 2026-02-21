import { SetMetadata } from '@nestjs/common';
import type { RoleName } from '../../common/services/token.service';

export const ROLES_KEY = 'roles';

/**
 * Restrict route to specific role(s). Use with RolesGuard.
 * Only users whose JWT payload.role is in this list can access the route.
 */
export const Roles = (...roles: RoleName[]) => SetMetadata(ROLES_KEY, roles);
