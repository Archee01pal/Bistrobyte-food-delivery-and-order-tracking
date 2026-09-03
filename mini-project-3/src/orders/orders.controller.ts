import { Controller, Post, Get, Patch, Body, Param, UseGuards, Request } from '@nestjs/common';
import { OrdersService, OrderStatus } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('orders')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @Roles('customer', 'admin', 'restaurant_admin')
  createOrder(@Request() req, @Body() dto: CreateOrderDto) {
    const userId = req.user?.userId || req.user?.sub || req.user?.id;
    return this.ordersService.createOrderFromCart(userId, dto);
  }

  @Get('my-orders')
  @Roles('customer', 'admin', 'restaurant_admin')
  getMyOrders(@Request() req) {
    const userId = req.user?.userId || req.user?.sub || req.user?.id;
    return this.ordersService.getUserOrders(userId);
  }

  @Get('restaurant/:restaurantId')
  @Roles('restaurant_admin', 'admin')
  getRestaurantOrders(@Param('restaurantId') restaurantId: string) {
    return this.ordersService.getRestaurantOrders(restaurantId);
  }

  @Get(':id')
  getOrderById(@Param('id') id: string) {
    return this.ordersService.getOrderById(id);
  }

  @Patch(':id/status')
  @Roles('restaurant_admin', 'admin')
  updateStatus(@Param('id') id: string, @Body() dto: UpdateOrderStatusDto) {
    return this.ordersService.updateOrderStatus(id, dto.status);
  }
}