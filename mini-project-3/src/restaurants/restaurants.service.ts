import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateRestaurantDto } from './dto/create-restaurant.dto';
import { CreateMenuItemDto } from './dto/create-menu-item.dto';
import { GetRestaurantsQueryDto } from './dto/get-restaurants-query.dto';

export interface MenuItem {
  id: string;
  restaurantId: string;
  name: string;
  description: string;
  price: number;
  category: string;
  isAvailable: boolean;
}

export interface Restaurant {
  id: string;
  ownerId: string;
  name: string;
  address: string;
  contact: string;
  status: 'OPEN' | 'CLOSED';
  operatingHours: string;
  createdAt: Date;
}

@Injectable()
export class RestaurantsService {
  private restaurantsTable: Map<string, Restaurant> = new Map();
  private menuItemsTable: Map<string, MenuItem> = new Map();

  createRestaurant(ownerId: string, dto: CreateRestaurantDto): Restaurant {
    const restaurant: Restaurant = {
      id: `rst_${Date.now()}`,
      ownerId,
      ...dto,
      status: 'OPEN',
      createdAt: new Date(),
    };
    this.restaurantsTable.set(restaurant.id, restaurant);
    return restaurant;
  }

  // --- Search, Filtering & Pagination Engine (Day 02 A) ---
  findAllRestaurants(query: GetRestaurantsQueryDto) {
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
      const restaurantIdsWithCategory = new Set(
        Array.from(this.menuItemsTable.values())
          .filter(m => m.category.toLowerCase() === cat)
          .map(m => m.restaurantId)
      );
      list = list.filter(r => restaurantIdsWithCategory.has(r.id));
    }

    const sortBy = query.sortBy || 'name';
    const sortOrder = query.sortOrder || 'asc';
    list.sort((a, b) => {
      let valA: string | number | Date = a[sortBy as keyof Restaurant];
      let valB: string | number | Date = b[sortBy as keyof Restaurant];

      if (valA instanceof Date) valA = valA.getTime();
      if (valB instanceof Date) valB = valB.getTime();

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
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

  findRestaurantById(id: string): Restaurant {
    const r = this.restaurantsTable.get(id);
    if (!r) throw new NotFoundException('Restaurant not found.');
    return r;
  }

  // --- Menu Management & Browsing Engine (Day 02 A) ---
  addMenuItem(restaurantId: string, dto: CreateMenuItemDto): MenuItem {
    this.findRestaurantById(restaurantId);
    const item: MenuItem = {
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

  getMenuByRestaurant(restaurantId: string, availableOnly?: boolean): MenuItem[] {
    this.findRestaurantById(restaurantId);
    let items = Array.from(this.menuItemsTable.values()).filter(m => m.restaurantId === restaurantId);
    if (availableOnly) {
      items = items.filter(m => m.isAvailable);
    }
    return items;
  }

  getMenuItemById(itemId: string): MenuItem {
    const item = this.menuItemsTable.get(itemId);
    if (!item) throw new NotFoundException('Menu item not found.');
    return item;
  }

  deleteMenuItem(itemId: string): { message: string } {
    if (!this.menuItemsTable.has(itemId)) throw new NotFoundException('Menu item not found.');
    this.menuItemsTable.delete(itemId);
    return { message: 'Menu item deleted successfully.' };
  }
}