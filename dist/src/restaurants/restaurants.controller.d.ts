import { RestaurantsService } from './restaurants.service';
import { CreateRestaurantDto } from './dto/create-restaurant.dto';
import { CreateMenuItemDto } from './dto/create-menu-item.dto';
import { GetRestaurantsQueryDto } from './dto/get-restaurants-query.dto';
export declare class RestaurantsController {
    private readonly restaurantsService;
    constructor(restaurantsService: RestaurantsService);
    getAllRestaurants(query: GetRestaurantsQueryDto): {
        total: number;
        page: number;
        limit: number;
        data: import("./restaurants.service").Restaurant[];
    };
    getRestaurantById(id: string): import("./restaurants.service").Restaurant;
    createRestaurant(req: any, dto: CreateRestaurantDto): import("./restaurants.service").Restaurant;
    getRestaurantMenu(id: string, availableOnly?: string): import("./restaurants.service").MenuItem[];
    addMenuItem(id: string, dto: CreateMenuItemDto): import("./restaurants.service").MenuItem;
    deleteMenuItem(itemId: string): {
        message: string;
    };
}
