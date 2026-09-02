import { Module } from '@nestjs/common';
import { CartService } from './cart.service';
import { CartController } from './cart.controller';
import { RestaurantsModule } from '../restaurants/restaurants.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [RestaurantsModule, AuthModule],
  providers: [CartService],
  controllers: [CartController],
  exports: [CartService],
})
export class CartModule {}