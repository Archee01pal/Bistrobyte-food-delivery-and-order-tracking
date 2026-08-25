import { Module, Global } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';

@Global() // Exposing globally so Auth can auto-register matching profile states upon user signups!
@Module({
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService]
})
export class UsersModule {}