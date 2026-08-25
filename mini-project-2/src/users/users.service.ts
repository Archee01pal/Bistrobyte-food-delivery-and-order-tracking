import { Injectable, NotFoundException } from '@nestjs/common';
import { GetUsersQueryDto } from './dto/get-users-query.dto';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  status: 'active' | 'inactive';
  updatedAt: Date;
}

@Injectable()
export class UsersService {
  // Seeding our internal table with initial testing records
  private profilesTable: Map<string, UserProfile> = new Map([
    ['usr_1', { id: 'usr_1', name: 'Alice Smith', email: 'alice@domain.com', role: 'admin', status: 'active', updatedAt: new Date() }],
    ['usr_2', { id: 'usr_2', name: 'Bob Jones', email: 'bob@test.com', role: 'user', status: 'active', updatedAt: new Date() }],
    ['usr_3', { id: 'usr_3', name: 'Charlie Brown', email: 'charlie@domain.com', role: 'user', status: 'inactive', updatedAt: new Date() }],
  ]);

  findAll(query: GetUsersQueryDto): UserProfile[] {
    let users = Array.from(this.profilesTable.values());

    // 1. Filter by Role
    if (query.role) {
      users = users.filter(user => user.role === query.role);
    }

    // 2. Filter by Status
    if (query.status) {
      users = users.filter(user => user.status === query.status);
    }

    // 3. Search by Name or Email (Case-Insensitive)
    if (query.search) {
      const searchLower = query.search.toLowerCase();
      users = users.filter(
        user =>
          user.name.toLowerCase().includes(searchLower) ||
          user.email.toLowerCase().includes(searchLower),
      );
    }

    // 4. Dynamic Sorting (by Name or Email)
    const sortBy = query.sortBy || 'name';
    const sortOrder = query.sortOrder || 'asc';

    users.sort((a, b) => {
      const fieldA = a[sortBy].toLowerCase();
      const fieldB = b[sortBy].toLowerCase();

      if (fieldA < fieldB) return sortOrder === 'asc' ? -1 : 1;
      if (fieldA > fieldB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return users;
  }

  fetchProfile(userId: string): UserProfile {
    const profile = this.profilesTable.get(userId);
    if (!profile) {
      throw new NotFoundException('The requested user account profile does not exist in the active registry.');
    }
    return profile;
  }
}