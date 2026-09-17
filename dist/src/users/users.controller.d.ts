import { UsersService } from './users.service';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    getProfile(req: any): {
        id: string;
        email: string;
        name: string;
        role: import("../auth/decorators/roles.decorator").UserRole;
        createdAt: Date;
    };
}
