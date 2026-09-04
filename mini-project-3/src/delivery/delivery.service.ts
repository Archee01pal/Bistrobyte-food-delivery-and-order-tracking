import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { OrdersService, OrderStatus } from '../orders/orders.service';
import { NotificationsService } from '../notifications/notifications.service';
import { AssignDeliveryDto } from './dto/assign-delivery.dto';

export enum DeliveryStatus {
  ASSIGNED = 'ASSIGNED',
  PICKED_UP = 'PICKED_UP',
  IN_TRANSIT = 'IN_TRANSIT',
  DELIVERED = 'DELIVERED',
}

export interface DeliveryRecord {
  id: string;
  orderId: string;
  deliveryPartnerId: string;
  status: DeliveryStatus;
  statusHistory: { status: DeliveryStatus; timestamp: Date }[];
  updatedAt: Date;
}

@Injectable()
export class DeliveryService {
  private deliveryTable: Map<string, DeliveryRecord> = new Map();

  constructor(
    private ordersService: OrdersService,
    private notificationsService: NotificationsService,
  ) {}

  assignDelivery(dto: AssignDeliveryDto): DeliveryRecord {
    const order = this.ordersService.getOrderById(dto.orderId);

    const existing = Array.from(this.deliveryTable.values()).find((d) => d.orderId === dto.orderId);
    if (existing) {
      throw new BadRequestException('Order is already assigned to a delivery partner.');
    }

    const delivery: DeliveryRecord = {
      id: `del_${Date.now()}`,
      orderId: dto.orderId,
      deliveryPartnerId: dto.deliveryPartnerId,
      status: DeliveryStatus.ASSIGNED,
      statusHistory: [{ status: DeliveryStatus.ASSIGNED, timestamp: new Date() }],
      updatedAt: new Date(),
    };

    this.deliveryTable.set(delivery.id, delivery);

    this.notificationsService.notifyDriverAssigned(
      'driver@example.com',
      order.orderNumber,
      order.deliveryAddress,
    );

    return delivery;
  }

  updateDeliveryStatus(deliveryId: string, status: DeliveryStatus): DeliveryRecord {
    const delivery = this.deliveryTable.get(deliveryId);
    if (!delivery) throw new NotFoundException('Delivery assignment not found.');

    delivery.status = status;
    delivery.updatedAt = new Date();
    delivery.statusHistory.push({ status, timestamp: new Date() });
    this.deliveryTable.set(delivery.id, delivery);

    if (status === DeliveryStatus.PICKED_UP) {
      this.ordersService.updateOrderStatus(delivery.orderId, OrderStatus.PREPARING);
    } else if (status === DeliveryStatus.IN_TRANSIT) {
      this.ordersService.updateOrderStatus(delivery.orderId, OrderStatus.OUT_FOR_DELIVERY);
    } else if (status === DeliveryStatus.DELIVERED) {
      this.ordersService.updateOrderStatus(delivery.orderId, OrderStatus.DELIVERED);
      this.notificationsService.notifyDeliveryComplete('customer@example.com', delivery.orderId);
    }

    return delivery;
  }

  getDriverDeliveries(driverId: string): DeliveryRecord[] {
    return Array.from(this.deliveryTable.values()).filter((d) => d.deliveryPartnerId === driverId);
  }

  getDeliveryByOrderId(orderId: string): DeliveryRecord {
    const delivery = Array.from(this.deliveryTable.values()).find((d) => d.orderId === orderId);
    if (!delivery) throw new NotFoundException('Delivery status not found for this order.');
    return delivery;
  }
}