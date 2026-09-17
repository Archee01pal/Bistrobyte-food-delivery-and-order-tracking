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
exports.RestaurantsController = void 0;
const common_1 = require("@nestjs/common");
const restaurants_service_1 = require("./restaurants.service");
const create_restaurant_dto_1 = require("./dto/create-restaurant.dto");
const create_menu_item_dto_1 = require("./dto/create-menu-item.dto");
const get_restaurants_query_dto_1 = require("./dto/get-restaurants-query.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
let RestaurantsController = class RestaurantsController {
    constructor(restaurantsService) {
        this.restaurantsService = restaurantsService;
    }
    getAllRestaurants(query) {
        return this.restaurantsService.findAllRestaurants(query);
    }
    getRestaurantById(id) {
        return this.restaurantsService.findRestaurantById(id);
    }
    createRestaurant(req, dto) {
        return this.restaurantsService.createRestaurant(req.user.userId, dto);
    }
    getRestaurantMenu(id, availableOnly) {
        return this.restaurantsService.getMenuByRestaurant(id, availableOnly === 'true');
    }
    addMenuItem(id, dto) {
        return this.restaurantsService.addMenuItem(id, dto);
    }
    deleteMenuItem(itemId) {
        return this.restaurantsService.deleteMenuItem(itemId);
    }
};
exports.RestaurantsController = RestaurantsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [get_restaurants_query_dto_1.GetRestaurantsQueryDto]),
    __metadata("design:returntype", void 0)
], RestaurantsController.prototype, "getAllRestaurants", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], RestaurantsController.prototype, "getRestaurantById", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('restaurant_admin', 'admin'),
    (0, common_1.Post)(),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_restaurant_dto_1.CreateRestaurantDto]),
    __metadata("design:returntype", void 0)
], RestaurantsController.prototype, "createRestaurant", null);
__decorate([
    (0, common_1.Get)(':id/menu'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)('availableOnly')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], RestaurantsController.prototype, "getRestaurantMenu", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('restaurant_admin', 'admin'),
    (0, common_1.Post)(':id/menu'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_menu_item_dto_1.CreateMenuItemDto]),
    __metadata("design:returntype", void 0)
], RestaurantsController.prototype, "addMenuItem", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('restaurant_admin', 'admin'),
    (0, common_1.Delete)('menu/:itemId'),
    __param(0, (0, common_1.Param)('itemId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], RestaurantsController.prototype, "deleteMenuItem", null);
exports.RestaurantsController = RestaurantsController = __decorate([
    (0, common_1.Controller)('restaurants'),
    __metadata("design:paramtypes", [restaurants_service_1.RestaurantsService])
], RestaurantsController);
//# sourceMappingURL=restaurants.controller.js.map