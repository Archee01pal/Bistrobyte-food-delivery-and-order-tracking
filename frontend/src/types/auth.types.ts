export type UserRole = 'customer' | 'restaurant_admin' | 'delivery_partner' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}