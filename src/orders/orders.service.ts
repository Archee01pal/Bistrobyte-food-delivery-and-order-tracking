import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { CartService } from '../cart/cart.service';
import { RestaurantsService } from '../restaurants/restaurants.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateOrderDto } from './dto/create-order.dto';

export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  PREPARING = 'PREPARING',
  READY = 'READY',
  OUT_FOR_DELIVERY = 'OUT_FOR_DELIVERY',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
}

export interface OrderItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  subtotal: number;
}

export interface StatusHistory {
  status: OrderStatus;
  timestamp: Date;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  restaurantId: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  totalAmount: number;
  status: OrderStatus;
  statusHistory: StatusHistory[];
  deliveryAddress: string;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);
  private ordersTable: Map<string, Order> = new Map();

  constructor(
    private cartService: CartService,
    private restaurantsService: RestaurantsService,
    private notificationsService: NotificationsService,
  ) {}

  createOrderFromCart(userId: string, dto: CreateOrderDto): Order {
    const cart = this.cartService.getCart(userId);
    if (!cart.items || cart.items.length === 0) {
      throw new BadRequestException('Cannot create an order with an empty cart.');
    }

    const orderItems: OrderItem[] = cart.items.map((item) => {
      const menuItem = (this.restaurantsService as any).findMenuItemById(item.menuItemId);
      const price = menuItem ? menuItem.price : 0;
      const name = menuItem ? menuItem.name : 'Unknown Item';

      return {
        menuItemId: item.menuItemId,
        name,
        price,
        quantity: item.quantity,
        subtotal: price * item.quantity,
      };
    });

    const subtotal = orderItems.reduce((sum, item) => sum + item.subtotal, 0);
    const deliveryFee = subtotal > 0 ? 5.0 : 0.0;
    const discount = dto.discountCodeAmount || 0;
    const totalAmount = Math.max(0, subtotal + deliveryFee - discount);

    const orderId = `ord_${Date.now()}`;
    const orderNumber = `ORD-${Math.floor(100000 + Math.random() * 900000)}`;

    const newOrder: Order = {
      id: orderId,
      orderNumber,
      customerId: userId,
      restaurantId: cart.restaurantId,
      items: orderItems,
      subtotal,
      deliveryFee,
      discount,
      totalAmount,
      status: OrderStatus.PENDING,
      statusHistory: [{ status: OrderStatus.PENDING, timestamp: new Date() }],
      deliveryAddress: dto.deliveryAddress,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.ordersTable.set(newOrder.id, newOrder);
    this.cartService.clearCart(userId);

    this.notificationsService.notifyOrderConfirmation('customer@example.com', orderNumber);

    return newOrder;
  }

  getUserOrders(userId: string): Order[] {
    return Array.from(this.ordersTable.values()).filter((o) => o.customerId === userId);
  }

  getOrderById(orderId: string): Order {
    const order = this.ordersTable.get(orderId);
    if (!order) throw new NotFoundException('Order not found.');
    return order;
  }

  getRestaurantOrders(restaurantId: string): Order[] {
    return Array.from(this.ordersTable.values()).filter((o) => o.restaurantId === restaurantId);
  }

  updateOrderStatus(orderId: string, status: OrderStatus): Order {
    const order = this.getOrderById(orderId);
    order.status = status;
    order.updatedAt = new Date();
    order.statusHistory.push({ status, timestamp: new Date() });
    this.ordersTable.set(order.id, order);

    this.notificationsService.notifyOrderStatusChange('customer@example.com', order.orderNumber, status);

    return order;
  }

  // Cron job running every minute to auto-cancel unfulfilled PENDING orders older than 15 minutes
  @Cron(CronExpression.EVERY_MINUTE)
  handlePendingTimeoutOrders() {
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);

    for (const order of this.ordersTable.values()) {
      if (order.status === OrderStatus.PENDING && order.createdAt < fifteenMinutesAgo) {
        this.logger.warn(`[CRON] Timing out stale order: ${order.orderNumber}`);
        this.updateOrderStatus(order.id, OrderStatus.CANCELLED);
      }
    }
  }
}