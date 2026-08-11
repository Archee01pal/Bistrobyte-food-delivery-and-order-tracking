import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
// Local DTO definitions to avoid missing-module errors for './dto/*'
interface SignupDto {
  name: string;
  email: string;
  password: string;
}

interface LoginDto {
  email: string;
  password: string;
}
import { MailService } from '../mail/mail.service'; // Import mail service


@Injectable()
export class AuthService {
  private users = [];

  // Inject the global MailService through the constructor
  constructor(private readonly mailService: MailService) {}

  async signup(signupDto: SignupDto) {
    const userExists = this.users.find(u => u.email === signupDto.email);
    if (userExists) {
      throw new BadRequestException('Email is already registered');
    }

    const newUser = {
      id: Date.now().toString(),
      ...signupDto,
      password: `hashed_${signupDto.password}`,
      status: 'inactive', // Default to inactive until verification link click
    };

    this.users.push(newUser);

    // Generate simulated dynamic tracking verification links
    const verificationUrl = `http://localhost:3000/api/auth/verify?userId=${newUser.id}`;
    
    // Dispatch automated background transactional mail routine
    // Using fire-and-forget style so registration responses return instantly
    this.mailService.sendEmail(
      newUser.email,
      'Action Required: Activate Your Churnetwork Profile',
      welcomeTemplate(newUser.name, verificationUrl)
    );

    const { password, ...result } = newUser;
    return { 
      message: 'User created successfully. Please check your inbox for account activation verification rules.', 
      user: result 
    };
  }

  login(loginDto: LoginDto) {
    // Existing Day 01 Login Code remains unchanged
    const user = this.users.find(u => u.email === loginDto.email);
    if (!user || user.password !== `hashed_${loginDto.password}`) {
      throw new UnauthorizedException('Invalid email or password');
    }
    const { password, ...result } = user;
    return { message: 'Login successful', user: result };
  }
}

function welcomeTemplate(name: string, verificationUrl: string): string {
  throw new Error('Function not implemented.');
}
