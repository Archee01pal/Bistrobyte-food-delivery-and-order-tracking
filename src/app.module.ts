import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { RestaurantsModule } from './restaurants/restaurants.module';
import { CartModule } from './cart/cart.module';

@Module({
  imports: [AuthModule, UsersModule, RestaurantsModule, CartModule],
})
export class AppModule {}