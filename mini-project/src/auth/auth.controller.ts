import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/dto.signup';
import { LoginDto } from './dto/dto.login';

@Controller('auth') // Resource route (Level 1 Maturity)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup') // HTTP Verb (Level 2 Maturity)
  signup(@Body() signupDto: SignupDto) {
    return this.authService.signup(signupDto);
  }

  @Post('login') 
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }
}