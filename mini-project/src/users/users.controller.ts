import { Controller, Get, Body, Patch, Param, Query, ValidationPipe } from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { GetUsersFilterDto } from './dto/get-users-filter.dto';
import { UpdateStatusDto } from './dto/update-status.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // ✅ Day 04 / 05: Get All Users with Filter, Sort & Pagination
  @Get()
  async getAllUsers(
    @Query(new ValidationPipe({ transform: true, whitelist: true })) 
    filterDto: GetUsersFilterDto,
  ) {
    return this.usersService.findAll(filterDto);
  }

  // ✅ Day 03 / 05: Fetch Specific User Details
  @Get(':id')
  async getProfile(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  // ✅ Day 03: Update profile fields
  @Patch(':id')
  async updateProfile(
    @Param('id') id: string, 
    @Body(new ValidationPipe({ whitelist: true })) updateProfileDto: UpdateProfileDto
  ) {
    return this.usersService.updateProfile(id, updateProfileDto);
  }

  // ✨ Day 05: Toggle/Update User Status (Activate/Deactivate)
  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body(new ValidationPipe({ whitelist: true })) updateStatusDto: UpdateStatusDto,
  ) {
    return this.usersService.updateStatus(id, updateStatusDto);
  }
}