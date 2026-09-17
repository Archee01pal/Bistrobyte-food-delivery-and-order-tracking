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
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeliveryService = exports.DeliveryStatus = void 0;
const common_1 = require("@nestjs/common");
const orders_service_1 = require("../orders/orders.service");
const notifications_service_1 = require("../notifications/notifications.service");
var DeliveryStatus;
(function (DeliveryStatus) {
    DeliveryStatus["ASSIGNED"] = "ASSIGNED";
    DeliveryStatus["PICKED_UP"] = "PICKED_UP";
    DeliveryStatus["IN_TRANSIT"] = "IN_TRANSIT";
    DeliveryStatus["DELIVERED"] = "DELIVERED";
})(DeliveryStatus || (exports.DeliveryStatus = DeliveryStatus = {}));
let DeliveryService = class DeliveryService {
    constructor(ordersService, notificationsService) {
        this.ordersService = ordersService;
        this.notificationsService = notificationsService;
        this.deliveryTable = new Map();
        this.driverAvailabilityTable = new Map();
    }
    assignDelivery(dto) {
        const order = this.ordersService.getOrderById(dto.orderId);
        const existing = Array.from(this.deliveryTable.values()).find((d) => d.orderId === dto.orderId);
        if (existing) {
            throw new common_1.BadRequestException('Order is already assigned to a delivery partner.');
        }
        const delivery = {
            id: `del_${Date.now()}`,
            orderId: dto.orderId,
            deliveryPartnerId: dto.deliveryPartnerId,
            status: DeliveryStatus.ASSIGNED,
            statusHistory: [{ status: DeliveryStatus.ASSIGNED, timestamp: new Date() }],
            updatedAt: new Date(),
        };
        this.deliveryTable.set(delivery.id, delivery);
        this.notificationsService.notifyDriverAssigned('driver@example.com', order.orderNumber, order.deliveryAddress);
        return delivery;
    }
    acceptDeliveryOffer(orderId, driverId) {
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
        }
        else {
            delivery.deliveryPartnerId = driverId;
            delivery.status = DeliveryStatus.ASSIGNED;
            delivery.updatedAt = new Date();
        }
        this.deliveryTable.set(delivery.id, delivery);
        this.driverAvailabilityTable.set(driverId, 'BUSY');
        return delivery;
    }
    updateDeliveryStatus(deliveryId, status) {
        const delivery = this.deliveryTable.get(deliveryId);
        if (!delivery)
            throw new common_1.NotFoundException('Delivery assignment not found.');
        const formattedStatus = status;
        delivery.status = formattedStatus;
        delivery.updatedAt = new Date();
        delivery.statusHistory.push({ status: formattedStatus, timestamp: new Date() });
        this.deliveryTable.set(delivery.id, delivery);
        if (formattedStatus === DeliveryStatus.PICKED_UP || status === 'PREPARING') {
            this.ordersService.updateOrderStatus(delivery.orderId, orders_service_1.OrderStatus.PREPARING);
        }
        else if (formattedStatus === DeliveryStatus.IN_TRANSIT || status === 'IN_TRANSIT') {
            this.ordersService.updateOrderStatus(delivery.orderId, orders_service_1.OrderStatus.OUT_FOR_DELIVERY);
        }
        else if (formattedStatus === DeliveryStatus.DELIVERED || status === 'DELIVERED') {
            this.ordersService.updateOrderStatus(delivery.orderId, orders_service_1.OrderStatus.DELIVERED);
            this.notificationsService.notifyDeliveryComplete('customer@example.com', delivery.orderId);
            this.driverAvailabilityTable.set(delivery.deliveryPartnerId, 'AVAILABLE');
        }
        return delivery;
    }
    updateDeliveryStatusByOrderId(orderId, status) {
        const delivery = Array.from(this.deliveryTable.values()).find((d) => d.orderId === orderId);
        if (!delivery) {
            throw new common_1.NotFoundException(`No delivery record found associated with order ID ${orderId}`);
        }
        return this.updateDeliveryStatus(delivery.id, status);
    }
    updateDriverAvailability(driverId, status) {
        this.driverAvailabilityTable.set(driverId, status);
        return { driverId, status, updatedAt: new Date() };
    }
    getDriverDeliveries(driverId) {
        return Array.from(this.deliveryTable.values()).filter((d) => d.deliveryPartnerId === driverId);
    }
    getDeliveryByOrderId(orderId) {
        const delivery = Array.from(this.deliveryTable.values()).find((d) => d.orderId === orderId);
        if (!delivery)
            throw new common_1.NotFoundException('Delivery status not found for this order.');
        return delivery;
    }
};
exports.DeliveryService = DeliveryService;
exports.DeliveryService = DeliveryService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [orders_service_1.OrdersService,
        notifications_service_1.NotificationsService])
], DeliveryService);
//# sourceMappingURL=delivery.service.js.map