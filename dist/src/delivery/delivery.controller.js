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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeliveryController = void 0;
const common_1 = require("@nestjs/common");
const delivery_service_1 = require("./delivery.service");
const assign_delivery_dto_1 = require("./dto/assign-delivery.dto");
const update_delivery_status_dto_1 = require("./dto/update-delivery-status.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
let DeliveryController = class DeliveryController {
    constructor(deliveryService) {
        this.deliveryService = deliveryService;
    }
    assignDelivery(dto) {
        return this.deliveryService.assignDelivery(dto);
    }
    getMyDeliveries(req) {
        const userId = req.user?.userId || req.user?.sub;
        return this.deliveryService.getDriverDeliveries(userId);
    }
    getAssignedDriverOrders(req) {
        const userId = req.user?.userId || req.user?.sub || 'driver-1';
        return this.deliveryService.getDriverDeliveries(userId);
    }
    acceptDeliveryOffer(orderId, req) {
        const driverId = req.user?.userId || req.user?.sub || 'driver-1';
        return this.deliveryService.acceptDeliveryOffer(orderId, driverId);
    }
    updateStatus(id, dto) {
        return this.deliveryService.updateDeliveryStatus(id, dto.status);
    }
    updateDriverOrderStatus(id, status) {
        return this.deliveryService.updateDeliveryStatusByOrderId(id, status);
    }
    updateDriverAvailabilityStatus(req, status) {
        const driverId = req.user?.userId || req.user?.sub || 'driver-1';
        return this.deliveryService.updateDriverAvailability(driverId, status);
    }
    getDeliveryByOrder(orderId) {
        return this.deliveryService.getDeliveryByOrderId(orderId);
    }
};
exports.DeliveryController = DeliveryController;
__decorate([
    (0, common_1.Post)('assign'),
    (0, roles_decorator_1.Roles)('admin', 'restaurant_admin'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [assign_delivery_dto_1.AssignDeliveryDto]),
    __metadata("design:returntype", void 0)
], DeliveryController.prototype, "assignDelivery", null);
__decorate([
    (0, common_1.Get)('my-deliveries'),
    (0, roles_decorator_1.Roles)('delivery_partner', 'admin'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], DeliveryController.prototype, "getMyDeliveries", null);
__decorate([
    (0, common_1.Get)('driver/orders'),
    (0, roles_decorator_1.Roles)('delivery_partner', 'admin'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], DeliveryController.prototype, "getAssignedDriverOrders", null);
__decorate([
    (0, common_1.Post)('orders/:id/accept'),
    (0, roles_decorator_1.Roles)('delivery_partner', 'admin'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], DeliveryController.prototype, "acceptDeliveryOffer", null);
__decorate([
    (0, common_1.Patch)(':id/status'),
    (0, roles_decorator_1.Roles)('delivery_partner', 'admin'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_delivery_status_dto_1.UpdateDeliveryStatusDto]),
    __metadata("design:returntype", void 0)
], DeliveryController.prototype, "updateStatus", null);
__decorate([
    (0, common_1.Patch)('driver/orders/:id/status'),
    (0, roles_decorator_1.Roles)('delivery_partner', 'admin'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], DeliveryController.prototype, "updateDriverOrderStatus", null);
__decorate([
    (0, common_1.Patch)('drivers/status'),
    (0, roles_decorator_1.Roles)('delivery_partner', 'admin'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], DeliveryController.prototype, "updateDriverAvailabilityStatus", null);
__decorate([
    (0, common_1.Get)('order/:orderId'),
    __param(0, (0, common_1.Param)('orderId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], DeliveryController.prototype, "getDeliveryByOrder", null);
exports.DeliveryController = DeliveryController = __decorate([
    (0, common_1.Controller)('delivery'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [delivery_service_1.DeliveryService])
], DeliveryController);
//# sourceMappingURL=delivery.controller.js.map