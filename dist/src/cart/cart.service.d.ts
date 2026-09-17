import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { RestaurantsService } from '../restaurants/restaurants.service';
export interface CartItem {
    menuItemId: string;
    name: string;
    price: number;
    quantity: number;
    itemTotal: number;
}
export interface Cart {
    userId: string;
    restaurantId: string | null;
    items: CartItem[];
    subtotal: number;
}
export declare class CartService {
    private readonly restaurantsService;
    private cartsTable;
    constructor(restaurantsService: RestaurantsService);
    getCart(userId: string): Cart;
    addToCart(userId: string, dto: AddToCartDto): Cart;
    updateItemQuantity(userId: string, menuItemId: string, dto: UpdateCartItemDto): Cart;
    removeItem(userId: string, menuItemId: string): Cart;
    clearCart(userId: string): Cart;
    private recalculateSubtotal;
}
