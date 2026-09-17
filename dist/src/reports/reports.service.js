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
exports.ReportsService = void 0;
const common_1 = require("@nestjs/common");
const orders_service_1 = require("../orders/orders.service");
const delivery_service_1 = require("../delivery/delivery.service");
let ReportsService = class ReportsService {
    constructor(ordersService, deliveryService) {
        this.ordersService = ordersService;
        this.deliveryService = deliveryService;
    }
    getDashboardSummary(query) {
        let orders = this.ordersService.getAllOrders();
        if (query.restaurantId) {
            orders = orders.filter((o) => o.restaurantId === query.restaurantId);
        }
        if (query.startDate) {
            const start = new Date(query.startDate);
            orders = orders.filter((o) => new Date(o.createdAt) >= start);
        }
        if (query.endDate) {
            const end = new Date(query.endDate);
            end.setHours(23, 59, 59, 999);
            orders = orders.filter((o) => new Date(o.createdAt) <= end);
        }
        const totalOrders = orders.length;
        const completedOrders = orders.filter((o) => o.status === orders_service_1.OrderStatus.DELIVERED).length;
        const cancelledOrders = orders.filter((o) => o.status === orders_service_1.OrderStatus.CANCELLED).length;
        const pendingOrders = orders.filter((o) => o.status !== orders_service_1.OrderStatus.DELIVERED && o.status !== orders_service_1.OrderStatus.CANCELLED).length;
        const totalRevenue = orders
            .filter((o) => o.status === orders_service_1.OrderStatus.DELIVERED || o.status === orders_service_1.OrderStatus.CONFIRMED)
            .reduce((sum, o) => sum + o.totalAmount, 0);
        return {
            overview: {
                totalOrders,
                completedOrders,
                cancelledOrders,
                pendingOrders,
                totalRevenue: Number(totalRevenue.toFixed(2)),
            },
            timeRange: {
                startDate: query.startDate || 'All-Time',
                endDate: query.endDate || 'All-Time',
            },
        };
    }
    getDriverPerformanceSummary(driverId) {
        const deliveries = this.deliveryService.getDriverDeliveries(driverId);
        const totalAssigned = deliveries.length;
        const completedDeliveries = deliveries.filter((d) => d.status === 'DELIVERED').length;
        const activeDeliveries = deliveries.filter((d) => d.status !== 'DELIVERED').length;
        return {
            driverId,
            metrics: {
                totalAssigned,
                completedDeliveries,
                activeDeliveries,
                completionRate: totalAssigned > 0 ? `${((completedDeliveries / totalAssigned) * 100).toFixed(1)}%` : '0%',
            },
        };
    }
};
exports.ReportsService = ReportsService;
exports.ReportsService = ReportsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [orders_service_1.OrdersService,
        delivery_service_1.DeliveryService])
], ReportsService);
//# sourceMappingURL=reports.service.js.map