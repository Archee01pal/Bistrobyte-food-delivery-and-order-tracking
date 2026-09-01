import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { UserRole } from '../auth/decorators/roles.decorator';
import * as bcrypt from 'bcryptjs';

export interface UserRecord {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  role: UserRole;
  createdAt: Date;
}

@Injectable()
export class UsersService {
  private usersTable: Map<string, UserRecord> = new Map();

  async createUser(email: string, passwordRaw: string, name: string, role: UserRole): Promise<UserRecord> {
    const existing = Array.from(this.usersTable.values()).find(u => u.email === email);
    if (existing) throw new ConflictException('User with this email already exists.');

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(passwordRaw, salt);

    const newUser: UserRecord = {
      id: `usr_${Date.now()}`,
      email,
      passwordHash,
      name,
      role,
      createdAt: new Date(),
    };

    this.usersTable.set(newUser.id, newUser);
    return newUser;
  }

  findByEmail(email: string): UserRecord | undefined {
    return Array.from(this.usersTable.values()).find(u => u.email === email);
  }

  findById(id: string): UserRecord {
    const user = this.usersTable.get(id);
    if (!user) throw new NotFoundException('User profile not found.');
    return user;
  }
}