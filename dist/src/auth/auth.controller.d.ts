import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
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
