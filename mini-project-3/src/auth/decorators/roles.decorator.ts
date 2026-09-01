import { SetMetadata } from '@nestjs/common';

export type UserRole = 'customer' | 'restaurant_admin' | 'delivery_partner' | 'admin';
export const ROLES_KEY = 'roles';
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);