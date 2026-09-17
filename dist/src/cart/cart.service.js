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
exports.CartService = void 0;
const common_1 = require("@nestjs/common");
const restaurants_service_1 = require("../restaurants/restaurants.service");
let CartService = class CartService {
    constructor(restaurantsService) {
        this.restaurantsService = restaurantsService;
        this.cartsTable = new Map();
    }
    getCart(userId) {
        if (!this.cartsTable.has(userId)) {
            const emptyCart = {
                userId,
                restaurantId: null,
                items: [],
                subtotal: 0,
            };
            this.cartsTable.set(userId, emptyCart);
        }
        return this.cartsTable.get(userId);
    }
    addToCart(userId, dto) {
        const menuItem = this.restaurantsService.getMenuItemById(dto.menuItemId);
        if (!menuItem.isAvailable) {
            throw new common_1.BadRequestException(`Cannot add '${menuItem.name}' to cart because it is currently unavailable.`);
        }
        const cart = this.getCart(userId);
        if (cart.restaurantId && cart.restaurantId !== menuItem.restaurantId && cart.items.length > 0) {
            throw new common_1.BadRequestException('Conflict: Your cart already contains items from a different restaurant. Clear your cart first to order from here.');
        }
        cart.restaurantId = menuItem.restaurantId;
        const existingIndex = cart.items.findIndex(i => i.menuItemId === dto.menuItemId);
        if (existingIndex > -1) {
            cart.items[existingIndex].quantity += dto.quantity;
            cart.items[existingIndex].itemTotal = cart.items[existingIndex].quantity * menuItem.price;
        }
        else {
            cart.items.push({
                menuItemId: menuItem.id,
                name: menuItem.name,
                price: menuItem.price,
                quantity: dto.quantity,
                itemTotal: dto.quantity * menuItem.price,
            });
        }
        this.recalculateSubtotal(cart);
        this.cartsTable.set(userId, cart);
        return cart;
    }
    updateItemQuantity(userId, menuItemId, dto) {
        const cart = this.getCart(userId);
        const item = cart.items.find(i => i.menuItemId === menuItemId);
        if (!item) {
            throw new common_1.NotFoundException('Item not found in your cart.');
        }
        item.quantity = dto.quantity;
        item.itemTotal = item.quantity * item.price;
        this.recalculateSubtotal(cart);
        this.cartsTable.set(userId, cart);
        return cart;
    }
    removeItem(userId, menuItemId) {
        const cart = this.getCart(userId);
        cart.items = cart.items.filter(i => i.menuItemId !== menuItemId);
        if (cart.items.length === 0) {
            cart.restaurantId = null;
        }
        this.recalculateSubtotal(cart);
        this.cartsTable.set(userId, cart);
        return cart;
    }
    clearCart(userId) {
        const cart = {
            userId,
            restaurantId: null,
            items: [],
            subtotal: 0,
        };
        this.cartsTable.set(userId, cart);
        return cart;
    }
    recalculateSubtotal(cart) {
        cart.subtotal = cart.items.reduce((sum, item) => sum + item.itemTotal, 0);
    }
};
exports.CartService = CartService;
exports.CartService = CartService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [restaurants_service_1.RestaurantsService])
], CartService);
//# sourceMappingURL=cart.service.js.map