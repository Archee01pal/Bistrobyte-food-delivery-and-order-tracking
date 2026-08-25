import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: 'admin' | 'user';
  status: 'active' | 'inactive';
}

@Injectable()
export class AuthService {
  // In-Memory table mimicking a physical database storage system
  private usersTable: User[] = [];
  // Set to blacklist tokens during logout
  private invalidatedTokens: Set<string> = new Set();

  constructor(private readonly jwtService: JwtService) {}

  async signUp(dto: RegisterDto): Promise<{ message: string }> {
    const existingUser = this.usersTable.find(u => u.email === dto.email.toLowerCase());
    if (existingUser) {
      throw new ConflictException('An account with this email already exists.');
    }

    // Securely hash the plain text password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(dto.password, salt);

    const newUser: User = {
      id: `usr_${Date.now()}`,
      name: dto.name,
      email: dto.email.toLowerCase(),
      passwordHash,
      role: dto.role || 'user',
      status: 'active',
    };

    this.usersTable.push(newUser);
    return { message: 'Registration successful! Proceed to authentication login.' };
  }

  async login(dto: LoginDto): Promise<{ accessToken: string; user: Partial<User> }> {
    const user = this.usersTable.find(u => u.email === dto.email.toLowerCase());
    if (!user || user.status === 'inactive') {
      throw new UnauthorizedException('Invalid authentication credentials supplied.');
    }

    // Verify password against stored hash
    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid authentication credentials supplied.');
    }

    // Encode authentication payload
    const payload = { sub: user.id, email: user.email, role: user.role };
    const token = this.jwtService.sign(payload);

    return {
      accessToken: token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, status: user.status },
    };
  }

  logout(token: string): { message: string } {
    if (token) {
      this.invalidatedTokens.add(token);
    }
    return { message: 'Logout execution finalized. Session terminated cleanly.' };
  }

  isTokenInvalid(token: string): boolean {
    return this.invalidatedTokens.has(token);
  }
}