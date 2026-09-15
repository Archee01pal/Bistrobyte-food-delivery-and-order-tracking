import { Controller, Post, Get, Patch, Body, Param, UseGuards, Request } from '@nestjs/common';
import { DeliveryService } from './delivery.service';
import { AssignDeliveryDto } from './dto/assign-delivery.dto';
import { UpdateDeliveryStatusDto } from './dto/update-delivery-status.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('delivery')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DeliveryController {
  constructor(private readonly deliveryService: DeliveryService) {}

  @Post('assign')
  @Roles('admin', 'restaurant_admin')
  assignDelivery(@Body() dto: AssignDeliveryDto) {
    return this.deliveryService.assignDelivery(dto);
  }

  @Get('my-deliveries')
  @Roles('delivery_partner', 'admin')
  getMyDeliveries(@Request() req) {
    const userId = req.user?.userId || req.user?.sub;
    return this.deliveryService.getDriverDeliveries(userId);
  }

  // Alias route endpoint matching frontend: GET /driver/orders
  @Get('driver/orders')
  @Roles('delivery_partner', 'admin')
  getAssignedDriverOrders(@Request() req) {
    const userId = req.user?.userId || req.user?.sub || 'driver-1';
    return this.deliveryService.getDriverDeliveries(userId);
  }

  // Driver offer acceptance endpoint: POST /delivery/orders/:id/accept
  @Post('orders/:id/accept')
  @Roles('delivery_partner', 'admin')
  acceptDeliveryOffer(@Param('id') orderId: string, @Request() req) {
    const driverId = req.user?.userId || req.user?.sub || 'driver-1';
    return this.deliveryService.acceptDeliveryOffer(orderId, driverId);
  }

  @Patch(':id/status')
  @Roles('delivery_partner', 'admin')
  updateStatus(@Param('id') id: string, @Body() dto: UpdateDeliveryStatusDto) {
    return this.deliveryService.updateDeliveryStatus(id, dto.status);
  }

  // Direct order status update alias: PATCH /delivery/driver/orders/:id/status
  @Patch('driver/orders/:id/status')
  @Roles('delivery_partner', 'admin')
  updateDriverOrderStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.deliveryService.updateDeliveryStatusByOrderId(id, status);
  }

  // Driver online availability status bar: PATCH /delivery/drivers/status
  @Patch('drivers/status')
  @Roles('delivery_partner', 'admin')
  updateDriverAvailabilityStatus(@Request() req, @Body('status') status: 'AVAILABLE' | 'BUSY' | 'OFFLINE') {
    const driverId = req.user?.userId || req.user?.sub || 'driver-1';
    return this.deliveryService.updateDriverAvailability(driverId, status);
  }

  @Get('order/:orderId')
  getDeliveryByOrder(@Param('orderId') orderId: string) {
    return this.deliveryService.getDeliveryByOrderId(orderId);
  }
}