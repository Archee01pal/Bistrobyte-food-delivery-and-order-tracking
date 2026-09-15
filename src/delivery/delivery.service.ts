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

export type DriverAvailabilityStatus = 'AVAILABLE' | 'BUSY' | 'OFFLINE';

@Injectable()
export class DeliveryService {
  private deliveryTable: Map<string, DeliveryRecord> = new Map();
  private driverAvailabilityTable: Map<string, DriverAvailabilityStatus> = new Map();

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

  acceptDeliveryOffer(orderId: string, driverId: string): DeliveryRecord {
    let delivery = Array.from(this.deliveryTable.values()).find((d) => d.orderId === orderId);

    if (!delivery) {
      delivery = {
        id: `del_${Date.now()}`,
        orderId,
        deliveryPartnerId: driverId,
        status: DeliveryStatus.ASSIGNED,
        statusHistory: [{ status: DeliveryStatus.ASSIGNED, timestamp: new Date() }],
        updatedAt: new Date(),
      };
    } else {
      delivery.deliveryPartnerId = driverId;
      delivery.status = DeliveryStatus.ASSIGNED;
      delivery.updatedAt = new Date();
    }

    this.deliveryTable.set(delivery.id, delivery);
    this.driverAvailabilityTable.set(driverId, 'BUSY');

    return delivery;
  }

  updateDeliveryStatus(deliveryId: string, status: DeliveryStatus | string): DeliveryRecord {
    const delivery = this.deliveryTable.get(deliveryId);
    if (!delivery) throw new NotFoundException('Delivery assignment not found.');

    const formattedStatus = status as DeliveryStatus;
    delivery.status = formattedStatus;
    delivery.updatedAt = new Date();
    delivery.statusHistory.push({ status: formattedStatus, timestamp: new Date() });
    this.deliveryTable.set(delivery.id, delivery);

    if (formattedStatus === DeliveryStatus.PICKED_UP || status === 'PREPARING') {
      this.ordersService.updateOrderStatus(delivery.orderId, OrderStatus.PREPARING);
    } else if (formattedStatus === DeliveryStatus.IN_TRANSIT || status === 'IN_TRANSIT') {
      this.ordersService.updateOrderStatus(delivery.orderId, OrderStatus.OUT_FOR_DELIVERY);
    } else if (formattedStatus === DeliveryStatus.DELIVERED || status === 'DELIVERED') {
      this.ordersService.updateOrderStatus(delivery.orderId, OrderStatus.DELIVERED);
      this.notificationsService.notifyDeliveryComplete('customer@example.com', delivery.orderId);
      this.driverAvailabilityTable.set(delivery.deliveryPartnerId, 'AVAILABLE');
    }

    return delivery;
  }

  updateDeliveryStatusByOrderId(orderId: string, status: string): DeliveryRecord {
    const delivery = Array.from(this.deliveryTable.values()).find((d) => d.orderId === orderId);
    if (!delivery) {
      throw new NotFoundException(`No delivery record found associated with order ID ${orderId}`);
    }

    return this.updateDeliveryStatus(delivery.id, status as DeliveryStatus);
  }

  updateDriverAvailability(driverId: string, status: DriverAvailabilityStatus) {
    this.driverAvailabilityTable.set(driverId, status);
    return { driverId, status, updatedAt: new Date() };
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