import { OnModuleInit } from '@nestjs/common';
import { UserRole } from '../auth/decorators/roles.decorator';
export interface UserRecord {
    id: string;
    email: string;
    passwordHash: string;
    name: string;
    role: UserRole;
    createdAt: Date;
}
export declare class UsersService implements OnModuleInit {
    private usersTable;
    onModuleInit(): Promise<void>;
    createUser(email: string, passwordRaw: string, name: string, role: UserRole): Promise<UserRecord>;
    findByEmail(email: string): UserRecord | undefined;
    findById(id: string): UserRecord;
}
