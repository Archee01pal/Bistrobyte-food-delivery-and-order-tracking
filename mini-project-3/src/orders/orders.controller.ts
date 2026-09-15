import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  Sse,
  MessageEvent,
  NotFoundException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
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
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Create order from current user cart' })
  @Roles('customer', 'admin', 'restaurant_admin', 'delivery_partner')
  createOrder(@Request() req, @Body() dto: CreateOrderDto) {
    const userId = req.user?.userId || req.user?.sub || req.user?.id;
    return this.ordersService.createOrderFromCart(userId, dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Get all live real-time orders for dashboard' })
  @Roles('customer', 'admin', 'restaurant_admin', 'delivery_partner')
  getAllOrders() {
    return this.ordersService.getAllOrders();
  }

  @Sse('stream')
  @ApiOperation({ summary: 'Real-time Server-Sent Events stream for live orders' })
  streamOrders(): Observable<MessageEvent> {
    return this.ordersService.getOrderEvents().pipe(
      map((event) => ({ data: event } as MessageEvent)),
    );
  }

  @Get('my-orders')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Get filtered and paginated order history for current customer' })
  @Roles('customer', 'admin', 'restaurant_admin', 'delivery_partner')
  getMyOrders(@Request() req, @Query() query: GetOrdersQueryDto) {
    const userId = req.user?.userId || req.user?.sub || req.user?.id;
    return this.ordersService.getUserOrdersFiltered(userId, query);
  }

  @Get('restaurant/:restaurantId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Get live orders for a specific restaurant' })
  @Roles('customer', 'admin', 'restaurant_admin', 'delivery_partner')
  getRestaurantOrders(@Param('restaurantId') restaurantId: string) {
    return this.ordersService.getRestaurantOrders(restaurantId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Get order details by order ID or Order Number' })
  @Roles('customer', 'admin', 'restaurant_admin', 'delivery_partner')
  getOrderById(@Param('id') id: string) {
    const order = this.ordersService.getOrderById(id);
    if (!order) {
      throw new NotFoundException(`Order with ID or order number "${id}" not found.`);
    }
    return order;
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Update status of an existing order' })
  @Roles('customer', 'admin', 'restaurant_admin', 'delivery_partner')
  updateStatus(@Param('id') id: string, @Body() dto: UpdateOrderStatusDto) {
    return this.ordersService.updateOrderStatus(id, dto.status);
  }
}