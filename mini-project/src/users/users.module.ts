import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  controllers: [UsersController],
  providers: [UsersService],
  // Exporting UsersService is a good practice if other modules need user data later
  exports: [UsersService], 
})
export class UsersModule {}