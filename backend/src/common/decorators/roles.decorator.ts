import { SetMetadata } from '@nestjs/common';
import { userRoleEnum } from '../../db/schema';

// This decorator will be used to restrict access to specific roles
export const ROLES_KEY = 'roles';
export const Roles = (...roles: (typeof userRoleEnum.enumValues)[number][]) => SetMetadata(ROLES_KEY, roles);
