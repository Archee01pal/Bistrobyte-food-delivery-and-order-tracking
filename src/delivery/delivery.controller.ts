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

  @Patch(':id/status')
  @Roles('delivery_partner', 'admin')
  updateStatus(@Param('id') id: string, @Body() dto: UpdateDeliveryStatusDto) {
    return this.deliveryService.updateDeliveryStatus(id, dto.status);
  }

  @Get('order/:orderId')
  getDeliveryByOrder(@Param('orderId') orderId: string) {
    return this.deliveryService.getDeliveryByOrderId(orderId);
  }
}