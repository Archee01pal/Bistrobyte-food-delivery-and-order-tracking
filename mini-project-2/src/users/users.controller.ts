import { Controller, Get, Body, Patch, UseGuards, Request, ValidationPipe } from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('users')
@UseGuards(JwtAuthGuard) // Protects all routes inside this controller with JWT authentication
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  getAccountProfile(@Request() req: any) {
    // req.user is automatically populated by our JwtAuthGuard interceptor layer
    return this.usersService.fetchProfile(req.user.sub);
  }

  @Patch('profile')
  updateAccountProfile(
    @Request() req: any,
    @Body(new ValidationPipe()) updateDto: UpdateProfileDto
  ) {
    return this.usersService.updateProfile(
      req.user.sub,
      updateDto.name,
      updateDto.profilePictureBase64
    );
  }
}