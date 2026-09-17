"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var OrdersService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrdersService = exports.OrderStatus = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const rxjs_1 = require("rxjs");
const cart_service_1 = require("../cart/cart.service");
const restaurants_service_1 = require("../restaurants/restaurants.service");
const notifications_service_1 = require("../notifications/notifications.service");
var OrderStatus;
(function (OrderStatus) {
    OrderStatus["PENDING"] = "PENDING";
    OrderStatus["CONFIRMED"] = "CONFIRMED";
    OrderStatus["PREPARING"] = "PREPARING";
    OrderStatus["READY"] = "READY";
    OrderStatus["OUT_FOR_DELIVERY"] = "OUT_FOR_DELIVERY";
    OrderStatus["DELIVERED"] = "DELIVERED";
    OrderStatus["CANCELLED"] = "CANCELLED";
})(OrderStatus || (exports.OrderStatus = OrderStatus = {}));
let OrdersService = OrdersService_1 = class OrdersService {
    constructor(cartService, restaurantsService, notificationsService) {
        this.cartService = cartService;
        this.restaurantsService = restaurantsService;
        this.notificationsService = notificationsService;
        this.logger = new common_1.Logger(OrdersService_1.name);
        this.ordersTable = new Map();
        this.orderStream$ = new rxjs_1.Subject();
    }
    getOrderEvents() {
        return this.orderStream$.asObservable();
    }
    createOrderFromCart(userId, dto) {
        const cart = this.cartService.getCart(userId);
        if (!cart || !cart.items || cart.items.length === 0) {
            throw new common_1.BadRequestException('Cannot create an order with an empty cart.');
        }
        const orderItems = cart.items.map((item) => {
            const menuItem = this.restaurantsService.getMenuItemById(item.menuItemId);
            const price = menuItem ? menuItem.price : 0;
            const name = menuItem ? menuItem.name : 'Ordered Item';
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
        const timestamp = Date.now();
        const orderId = `ord_${timestamp}`;
        const orderNumber = `ORD-${Math.floor(100000 + Math.random() * 900000)}`;
        const newOrder = {
            id: orderId,
            orderNumber,
            customerId: userId,
            restaurantId: cart.restaurantId || 'rest-1',
            items: orderItems,
            subtotal,
            deliveryFee,
            discount,
            totalAmount,
            status: OrderStatus.PENDING,
            statusHistory: [{ status: OrderStatus.PENDING, timestamp: new Date() }],
            deliveryAddress: dto.deliveryAddress || 'Standard Delivery Address',
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        this.ordersTable.set(newOrder.id, newOrder);
        this.cartService.clearCart(userId);
        this.orderStream$.next({ type: 'CREATED', order: newOrder });
        this.notificationsService.notifyOrderConfirmation('customer@example.com', orderNumber);
        return newOrder;
    }
    getUserOrders(userId) {
        return Array.from(this.ordersTable.values()).filter((o) => o.customerId === userId);
    }
    getUserOrdersFiltered(userId, query) {
        let orders = Array.from(this.ordersTable.values()).filter((o) => o.customerId === userId);
        if (query?.status) {
            orders = orders.filter((o) => o.status === query.status);
        }
        if (query?.startDate) {
            const start = new Date(query.startDate);
            orders = orders.filter((o) => new Date(o.createdAt) >= start);
        }
        if (query?.endDate) {
            const end = new Date(query.endDate);
            end.setHours(23, 59, 59, 999);
            orders = orders.filter((o) => new Date(o.createdAt) <= end);
        }
        orders.sort((a, b) => {
            const timeA = new Date(a.createdAt).getTime();
            const timeB = new Date(b.createdAt).getTime();
            return query?.sort === 'asc' ? timeA - timeB : timeB - timeA;
        });
        const page = query?.page || 1;
        const limit = query?.limit || 10;
        const startIndex = (page - 1) * limit;
        const paginatedOrders = orders.slice(startIndex, startIndex + limit);
        return {
            total: orders.length,
            page,
            limit,
            totalPages: Math.ceil(orders.length / limit),
            data: paginatedOrders,
        };
    }
    getAllOrders() {
        return Array.from(this.ordersTable.values());
    }
    getOrderById(orderId) {
        let order = this.ordersTable.get(orderId);
        if (!order) {
            order = Array.from(this.ordersTable.values()).find((o) => o.orderNumber === orderId || o.id === orderId);
        }
        return order || null;
    }
    getRestaurantOrders(restaurantId) {
        return Array.from(this.ordersTable.values()).filter((o) => o.restaurantId === restaurantId);
    }
    updateOrderStatus(orderId, status) {
        const order = this.getOrderById(orderId);
        if (!order)
            throw new common_1.NotFoundException('Order not found.');
        order.status = status;
        order.updatedAt = new Date();
        order.statusHistory.push({ status, timestamp: new Date() });
        this.ordersTable.set(order.id, order);
        this.orderStream$.next({ type: 'UPDATED', order });
        this.notificationsService.notifyOrderStatusChange('customer@example.com', order.orderNumber, status);
        return order;
    }
    handlePendingTimeoutOrders() {
        const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
        for (const order of this.ordersTable.values()) {
            if (order.status === OrderStatus.PENDING && order.createdAt < fifteenMinutesAgo) {
                this.logger.warn(`[CRON] Timing out stale order: ${order.orderNumber}`);
                this.updateOrderStatus(order.id, OrderStatus.CANCELLED);
            }
        }
    }
};
exports.OrdersService = OrdersService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_MINUTE),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], OrdersService.prototype, "handlePendingTimeoutOrders", null);
exports.OrdersService = OrdersService = OrdersService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [cart_service_1.CartService,
        restaurants_service_1.RestaurantsService,
        notifications_service_1.NotificationsService])
], OrdersService);
//# sourceMappingURL=orders.service.js.map