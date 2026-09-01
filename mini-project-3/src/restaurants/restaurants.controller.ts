import { Controller, Post, Get, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { RestaurantsService } from './restaurants.service';
import { CreateRestaurantDto } from './dto/create-restaurant.dto';
import { CreateMenuItemDto } from './dto/create-menu-item.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('restaurants')
export class RestaurantsController {
  constructor(private readonly restaurantsService: RestaurantsService) {}

  @Get()
  getAllRestaurants() {
    return this.restaurantsService.findAllRestaurants();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('restaurant_admin', 'admin')
  @Post()
  createRestaurant(@Request() req, @Body() dto: CreateRestaurantDto) {
    return this.restaurantsService.createRestaurant(req.user.userId, dto);
  }

  @Get(':id/menu')
  getRestaurantMenu(@Param('id') id: string) {
    return this.restaurantsService.getMenuByRestaurant(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('restaurant_admin', 'admin')
  @Post(':id/menu')
  addMenuItem(@Param('id') id: string, @Body() dto: CreateMenuItemDto) {
    return this.restaurantsService.addMenuItem(id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('restaurant_admin', 'admin')
  @Delete('menu/:itemId')
  deleteMenuItem(@Param('itemId') itemId: string) {
    return this.restaurantsService.deleteMenuItem(itemId);
  }
}