import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from '../auth.service';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly authService: AuthService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Access Denied: Missing or malformed authentication token.');
    }

    const token = authHeader.split(' ')[1];

    // Check if the user logged out and invalidated this token
    if (this.authService.isTokenInvalid(token)) {
      throw new UnauthorizedException('Session expired: Token has been logged out.');
    }

    try {
      const decodedPayload = this.jwtService.verify(token);
      // Attach the user details to the request object for RolesGuard to use
      request.user = decodedPayload;
      return true;
    } catch (error) {
      throw new UnauthorizedException('Access Denied: Invalid or expired session token.');
    }
  }
}