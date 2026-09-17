export type UserRole = 'customer' | 'restaurant_admin' | 'delivery_partner' | 'admin';
export declare const ROLES_KEY = "roles";
export declare const Roles: (...roles: UserRole[]) => import("@nestjs/common").CustomDecorator<string>;
