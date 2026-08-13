import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { GetUsersFilterDto } from './dto/get-users-filter.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { saveBase64Image } from '../utils/file-upload.util';

@Injectable()
export class UsersService {
  // Enhanced Mock Database Array
  private users = [
    { id: '1', name: 'Archee Paliwal', email: 'paliwalarchee@gmail.com', role: 'admin', status: 'active', avatarUrl: null },
    { id: '2', name: 'Deeksha Sharma', email: 'deesharma@gmail.com', role: 'user', status: 'inactive', avatarUrl: null },
    { id: '3', name: 'Ankita', email: 'ankita20@gmail.com', role: 'user', status: 'active', avatarUrl: null },
    { id: '4', name: 'Rakesh Singh', email: 'sharmarakesh@gmail.com', role: 'admin', status: 'active', avatarUrl: null },
  ];

  // ✅ Day 04 System updated with Day 05 Pagination slicing
  async findAll(filterDto: GetUsersFilterDto) {
    const { role, status, search, sortBy, sortOrder, page, limit } = filterDto;
    let result = [...this.users];

    // Filtering & Searching
    if (role) result = result.filter(u => u.role === role.toLowerCase());
    if (status) result = result.filter(u => u.status === status.toLowerCase());
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(u => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
    }

    // Sorting
    result.sort((a, b) => {
      const fieldA = a[sortBy].toLowerCase();
      const fieldB = b[sortBy].toLowerCase();
      if (fieldA < fieldB) return sortOrder === 'asc' ? -1 : 1;
      if (fieldA > fieldB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    // ✨ Day 05 Pagination Slicing
    const totalItems = result.length;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedItems = result.slice(startIndex, endIndex);

    return {
      data: paginatedItems,
      meta: {
        totalItems,
        itemCount: paginatedItems.length,
        itemsPerPage: limit,
        currentPage: page,
        totalPages: Math.ceil(totalItems / limit),
      },
    };
  }

  // ✅ Day 03/05: Fetch Specific User Details
  async findOne(id: string) {
    const user = this.users.find(u => u.id === id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  // ✅ Day 03: Update User Details
  async updateProfile(id: string, updateProfileDto: UpdateProfileDto) {
    const user = await this.findOne(id);
    const { avatarBase64, ...profileData } = updateProfileDto;

    if (avatarBase64) {
      user.avatarUrl = saveBase64Image(avatarBase64, id);
    }
    Object.assign(user, profileData);
    return user;
  }

  // ✨ Day 05: Activate/Deactivate User
  async updateStatus(id: string, updateStatusDto: UpdateStatusDto) {
    const user = await this.findOne(id);
    user.status = updateStatusDto.status.toLowerCase();
    return {
      message: `User status successfully updated to ${user.status}`,
      user,
    };
  }
}