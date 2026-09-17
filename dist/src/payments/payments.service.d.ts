import { OrdersService } from '../orders/orders.service';
import { ProcessPaymentDto } from './dto/process-payment.dto';
export declare enum PaymentStatus {
    PENDING = "PENDING",
    SUCCESSFUL = "SUCCESSFUL",
    FAILED = "FAILED",
    REFUNDED = "REFUNDED"
}
export interface Payment {
    id: string;
    orderId: string;
    amount: number;
    status: PaymentStatus;
    createdAt: Date;
}
export declare class PaymentsService {
    private ordersService;
    private paymentsTable;
    constructor(ordersService: OrdersService);
    processPayment(dto: ProcessPaymentDto): Payment;
    processRefund(orderId: string): Payment;
    getPaymentByOrderId(orderId: string): Payment;
}
