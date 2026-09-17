import { UserRole } from '../decorators/roles.decorator';
export declare class RegisterDto {
    email: string;
    password: string;
    name: string;
    role?: UserRole;
}
