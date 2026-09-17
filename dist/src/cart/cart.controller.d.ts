import { CartService } from './cart.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
export declare class CartController {
    private readonly cartService;
    constructor(cartService: CartService);
    getCart(req: any): import("./cart.service").Cart;
    addToCart(req: any, dto: AddToCartDto): import("./cart.service").Cart;
    updateQuantity(req: any, menuItemId: string, dto: UpdateCartItemDto): import("./cart.service").Cart;
    removeItem(req: any, menuItemId: string): import("./cart.service").Cart;
    clearCart(req: any): import("./cart.service").Cart;
}
