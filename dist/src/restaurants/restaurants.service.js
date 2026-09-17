"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RestaurantsService = void 0;
const common_1 = require("@nestjs/common");
let RestaurantsService = class RestaurantsService {
    constructor() {
        this.restaurantsTable = new Map();
        this.menuItemsTable = new Map();
    }
    createRestaurant(ownerId, dto) {
        const restaurant = {
            id: `rst_${Date.now()}`,
            ownerId,
            ...dto,
            status: 'OPEN',
            createdAt: new Date(),
        };
        this.restaurantsTable.set(restaurant.id, restaurant);
        return restaurant;
    }
    findAllRestaurants(query) {
        let list = Array.from(this.restaurantsTable.values());
        if (query.search) {
            const q = query.search.toLowerCase();
            list = list.filter(r => r.name.toLowerCase().includes(q));
        }
        if (query.location) {
            const loc = query.location.toLowerCase();
            list = list.filter(r => r.address.toLowerCase().includes(loc));
        }
        if (query.status) {
            list = list.filter(r => r.status === query.status);
        }
        if (query.category) {
            const cat = query.category.toLowerCase();
            const restaurantIdsWithCategory = new Set(Array.from(this.menuItemsTable.values())
                .filter(m => m.category.toLowerCase() === cat)
                .map(m => m.restaurantId));
            list = list.filter(r => restaurantIdsWithCategory.has(r.id));
        }
        const sortBy = query.sortBy || 'name';
        const sortOrder = query.sortOrder || 'asc';
        list.sort((a, b) => {
            let valA = a[sortBy];
            let valB = b[sortBy];
            if (valA instanceof Date)
                valA = valA.getTime();
            if (valB instanceof Date)
                valB = valB.getTime();
            if (valA < valB)
                return sortOrder === 'asc' ? -1 : 1;
            if (valA > valB)
                return sortOrder === 'asc' ? 1 : -1;
            return 0;
        });
        const page = query.page || 1;
        const limit = query.limit || 10;
        const startIndex = (page - 1) * limit;
        const paginatedData = list.slice(startIndex, startIndex + limit);
        return {
            total: list.length,
            page,
            limit,
            data: paginatedData,
        };
    }
    findRestaurantById(id) {
        const r = this.restaurantsTable.get(id);
        if (!r)
            throw new common_1.NotFoundException('Restaurant not found.');
        return r;
    }
    addMenuItem(restaurantId, dto) {
        this.findRestaurantById(restaurantId);
        const item = {
            id: `mn_${Date.now()}`,
            restaurantId,
            name: dto.name,
            description: dto.description,
            price: dto.price,
            category: dto.category,
            isAvailable: dto.isAvailable ?? true,
        };
        this.menuItemsTable.set(item.id, item);
        return item;
    }
    getMenuByRestaurant(restaurantId, availableOnly) {
        this.findRestaurantById(restaurantId);
        let items = Array.from(this.menuItemsTable.values()).filter(m => m.restaurantId === restaurantId);
        if (availableOnly) {
            items = items.filter(m => m.isAvailable);
        }
        return items;
    }
    getMenuItemById(itemId) {
        const item = this.menuItemsTable.get(itemId);
        if (!item)
            throw new common_1.NotFoundException('Menu item not found.');
        return item;
    }
    deleteMenuItem(itemId) {
        if (!this.menuItemsTable.has(itemId))
            throw new common_1.NotFoundException('Menu item not found.');
        this.menuItemsTable.delete(itemId);
        return { message: 'Menu item deleted successfully.' };
    }
};
exports.RestaurantsService = RestaurantsService;
exports.RestaurantsService = RestaurantsService = __decorate([
    (0, common_1.Injectable)()
], RestaurantsService);
//# sourceMappingURL=restaurants.service.js.map