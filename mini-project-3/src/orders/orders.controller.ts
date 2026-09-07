import { Controller, Post, Get, Patch, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { GetOrdersQueryDto } from './dto/get-orders-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Orders')
@ApiBearerAuth('JWT-auth')
@Controller('orders')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @ApiOperation({ summary: 'Create order from current user cart' })
  @Roles('customer', 'admin', 'restaurant_admin', 'delivery_partner')
  createOrder(@Request() req, @Body() dto: CreateOrderDto) {
    const userId = req.user?.userId || req.user?.sub || req.user?.id;
    return this.ordersService.createOrderFromCart(userId, dto);
  }

  @Get('my-orders')
  @ApiOperation({ summary: 'Get filtered and paginated order history for current customer' })
  @Roles('customer', 'admin', 'restaurant_admin', 'delivery_partner')
  getMyOrders(@Request() req, @Query() query: GetOrdersQueryDto) {
    const userId = req.user?.userId || req.user?.sub || req.user?.id;
    return this.ordersService.getUserOrders(userId);
  }

  @Get('restaurant/:restaurantId')
  @ApiOperation({ summary: 'Get order history for a specific restaurant' })
  @Roles('restaurant_admin', 'admin')
  getRestaurantOrders(@Param('restaurantId') restaurantId: string) {
    return this.ordersService.getRestaurantOrders(restaurantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get order details by order ID' })
  getOrderById(@Param('id') id: string) {
    return this.ordersService.getOrderById(id);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update status of an existing order' })
  @Roles('restaurant_admin', 'admin')
  updateStatus(@Param('id') id: string, @Body() dto: UpdateOrderStatusDto) {
    return this.ordersService.updateOrderStatus(id, dto.status);
  }
}