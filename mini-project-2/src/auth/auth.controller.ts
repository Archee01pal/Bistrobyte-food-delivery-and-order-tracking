import { Controller, Post, Body, Headers, Get, UseGuards, SetMetadata } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // NestJS decorators use the legacy decorator signature.
  @Post('signup')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.signUp(registerDto);
  }

  // NestJS decorators use the legacy decorator signature.
  @Post('login')
  async authenticate(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('logout')
  terminateSession(@Headers('authorization') authHeader: string) {
    const token = authHeader?.replace('Bearer ', '');
    return this.authService.logout(token);
  }

  // UPDATED WITH BOTH GUARDS OPERATING IN SEQUENCE
  @Get('admin-only-dashboard')
  @SetMetadata('roles', ['admin'])
  @UseGuards(JwtAuthGuard, RolesGuard) // 1st decodes token, 2nd verifies admin role
  testAdminAccess() {
    return { message: 'Welcome Admin! Access granted to structural configurations.' };
  }
}