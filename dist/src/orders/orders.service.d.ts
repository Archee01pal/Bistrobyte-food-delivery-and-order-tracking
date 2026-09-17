import { Observable } from 'rxjs';
import { CartService } from '../cart/cart.service';
import { RestaurantsService } from '../restaurants/restaurants.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { GetOrdersQueryDto } from './dto/get-orders-query.dto';
export declare enum OrderStatus {
    PENDING = "PENDING",
    CONFIRMED = "CONFIRMED",
    PREPARING = "PREPARING",
    READY = "READY",
    OUT_FOR_DELIVERY = "OUT_FOR_DELIVERY",
    DELIVERED = "DELIVERED",
    CANCELLED = "CANCELLED"
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
export declare class OrdersService {
    private cartService;
    private restaurantsService;
    private notificationsService;
    private readonly logger;
    private ordersTable;
    private orderStream$;
    constructor(cartService: CartService, restaurantsService: RestaurantsService, notificationsService: NotificationsService);
    getOrderEvents(): Observable<{
        type: 'CREATED' | 'UPDATED';
        order: Order;
    }>;
    createOrderFromCart(userId: string, dto: CreateOrderDto): Order;
    getUserOrders(userId: string): Order[];
    getUserOrdersFiltered(userId: string, query: GetOrdersQueryDto): {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
        data: Order[];
    };
    getAllOrders(): Order[];
    getOrderById(orderId: string): Order | null;
    getRestaurantOrders(restaurantId: string): Order[];
    updateOrderStatus(orderId: string, status: OrderStatus): Order;
    handlePendingTimeoutOrders(): void;
}
