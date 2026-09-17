import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
export declare class AuthService {
    private readonly usersService;
    private readonly jwtService;
    constructor(usersService: UsersService, jwtService: JwtService);
    register(dto: RegisterDto): Promise<{
        message: string;
        accessToken: string;
        user: {
            id: string;
            email: string;
            name: string;
            role: import("./decorators/roles.decorator").UserRole;
        };
    }>;
    login(dto: LoginDto): Promise<{
        message: string;
        accessToken: string;
    }>;
}
