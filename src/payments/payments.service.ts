import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { OrdersService, OrderStatus } from '../orders/orders.service';
import { ProcessPaymentDto } from './dto/process-payment.dto';

export enum PaymentStatus {
  PENDING = 'PENDING',
  SUCCESSFUL = 'SUCCESSFUL',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
}

export interface Payment {
  id: string;
  orderId: string;
  amount: number;
  status: PaymentStatus;
  createdAt: Date;
}

@Injectable()
export class PaymentsService {
  private paymentsTable: Map<string, Payment> = new Map();

  constructor(private ordersService: OrdersService) {}

  processPayment(dto: ProcessPaymentDto): Payment {
    const order = this.ordersService.getOrderById(dto.orderId);

    if (order.status !== OrderStatus.PENDING) {
      throw new BadRequestException(`Order cannot be paid in state ${order.status}`);
    }

    const paymentId = `pay_${Date.now()}`;
    const payment: Payment = {
      id: paymentId,
      orderId: dto.orderId,
      amount: order.totalAmount,
      status: dto.shouldSucceed ? PaymentStatus.SUCCESSFUL : PaymentStatus.FAILED,
      createdAt: new Date(),
    };

    this.paymentsTable.set(payment.id, payment);

    if (dto.shouldSucceed) {
      this.ordersService.updateOrderStatus(dto.orderId, OrderStatus.CONFIRMED);
    } else {
      this.ordersService.updateOrderStatus(dto.orderId, OrderStatus.CANCELLED);
    }

    return payment;
  }

  processRefund(orderId: string): Payment {
    const payment = Array.from(this.paymentsTable.values()).find((p) => p.orderId === orderId);
    if (!payment) throw new NotFoundException('Payment record not found for this order.');

    if (payment.status !== PaymentStatus.SUCCESSFUL) {
      throw new BadRequestException('Only successful payments can be refunded.');
    }

    payment.status = PaymentStatus.REFUNDED;
    this.ordersService.updateOrderStatus(orderId, OrderStatus.CANCELLED);
    this.paymentsTable.set(payment.id, payment);

    return payment;
  }

  getPaymentByOrderId(orderId: string): Payment {
    const payment = Array.from(this.paymentsTable.values()).find((p) => p.orderId === orderId);
    if (!payment) throw new NotFoundException('Payment record not found.');
    return payment;
  }
}