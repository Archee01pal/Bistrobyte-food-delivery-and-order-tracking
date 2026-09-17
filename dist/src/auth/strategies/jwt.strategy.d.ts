import { Strategy } from 'passport-jwt';
import { UsersService } from '../../users/users.service';
declare const JwtStrategy_base: new (...args: [opt: import("passport-jwt").StrategyOptionsWithRequest] | [opt: import("passport-jwt").StrategyOptionsWithoutRequest]) => Strategy & {
    validate(...args: any[]): unknown;
};
export declare class JwtStrategy extends JwtStrategy_base {
    private usersService;
    constructor(usersService: UsersService);
    validate(payload: {
        sub: string;
        email: string;
        role: string;
    }): Promise<{
        userId: string;
        sub: string;
        email: string;
        role: import("../decorators/roles.decorator").UserRole;
        name: string;
    }>;
}
export {};
