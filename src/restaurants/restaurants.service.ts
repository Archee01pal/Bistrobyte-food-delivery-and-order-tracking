import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateRestaurantDto } from './dto/create-restaurant.dto';
import { CreateMenuItemDto } from './dto/create-menu-item.dto';

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
    };
    this.restaurantsTable.set(restaurant.id, restaurant);
    return restaurant;
  }

  findAllRestaurants(): Restaurant[] {
    return Array.from(this.restaurantsTable.values());
  }

  findRestaurantById(id: string): Restaurant {
    const r = this.restaurantsTable.get(id);
    if (!r) throw new NotFoundException('Restaurant not found.');
    return r;
  }

  // --- Menu Item Engine (Day 01 B) ---
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

  getMenuByRestaurant(restaurantId: string): MenuItem[] {
    this.findRestaurantById(restaurantId);
    return Array.from(this.menuItemsTable.values()).filter(m => m.restaurantId === restaurantId);
  }

  deleteMenuItem(itemId: string): { message: string } {
    if (!this.menuItemsTable.has(itemId)) throw new NotFoundException('Menu item not found.');
    this.menuItemsTable.delete(itemId);
    return { message: 'Menu item deleted successfully.' };
  }
}