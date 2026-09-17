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
export declare class RestaurantsService {
    private restaurantsTable;
    private menuItemsTable;
    createRestaurant(ownerId: string, dto: CreateRestaurantDto): Restaurant;
    findAllRestaurants(query: GetRestaurantsQueryDto): {
        total: number;
        page: number;
        limit: number;
        data: Restaurant[];
    };
    findRestaurantById(id: string): Restaurant;
    addMenuItem(restaurantId: string, dto: CreateMenuItemDto): MenuItem;
    getMenuByRestaurant(restaurantId: string, availableOnly?: boolean): MenuItem[];
    getMenuItemById(itemId: string): MenuItem;
    deleteMenuItem(itemId: string): {
        message: string;
    };
}
