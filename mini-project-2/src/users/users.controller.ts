import { Controller, Get, Param, Query } from '@nestjs/common';
import { UsersService, UserProfile } from './users.service';
import { GetUsersQueryDto } from './dto/get-users-query.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // Exposes GET /users with validation query interceptors built directly in
  @Get()
  getAllUsers(@Query() query: GetUsersQueryDto): UserProfile[] {
    return this.usersService.findAll(query);
  }

  @Get(':id')
  getUserById(@Param('id') id: string): UserProfile {
    return this.usersService.fetchProfile(id);
  }
}