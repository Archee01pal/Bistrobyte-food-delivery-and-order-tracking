import { MessageEvent } from '@nestjs/common';
import { Observable } from 'rxjs';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { GetOrdersQueryDto } from './dto/get-orders-query.dto';
export declare class OrdersController {
    private readonly ordersService;
    constructor(ordersService: OrdersService);
    createOrder(req: any, dto: CreateOrderDto): import("./orders.service").Order;
    getAllOrders(): import("./orders.service").Order[];
    streamOrders(): Observable<MessageEvent>;
    getMyOrders(req: any, query: GetOrdersQueryDto): {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
        data: import("./orders.service").Order[];
    };
    getRestaurantOrders(restaurantId: string): import("./orders.service").Order[];
    getOrderById(id: string): import("./orders.service").Order;
    updateStatus(id: string, dto: UpdateOrderStatusDto): import("./orders.service").Order;
}
