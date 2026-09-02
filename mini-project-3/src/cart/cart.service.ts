import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
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

@Injectable()
export class CartService {
  private cartsTable: Map<string, Cart> = new Map();

  constructor(private readonly restaurantsService: RestaurantsService) {}

  getCart(userId: string): Cart {
    if (!this.cartsTable.has(userId)) {
      const emptyCart: Cart = {
        userId,
        restaurantId: null,
        items: [],
        subtotal: 0,
      };
      this.cartsTable.set(userId, emptyCart);
    }
    return this.cartsTable.get(userId)!;
  }

  addToCart(userId: string, dto: AddToCartDto): Cart {
    const menuItem = this.restaurantsService.getMenuItemById(dto.menuItemId);
    
    if (!menuItem.isAvailable) {
      throw new BadRequestException(`Cannot add '${menuItem.name}' to cart because it is currently unavailable.`);
    }

    const cart = this.getCart(userId);

    // Enforce single-restaurant rule
    if (cart.restaurantId && cart.restaurantId !== menuItem.restaurantId && cart.items.length > 0) {
      throw new BadRequestException(
        'Conflict: Your cart already contains items from a different restaurant. Clear your cart first to order from here.'
      );
    }

    cart.restaurantId = menuItem.restaurantId;

    const existingIndex = cart.items.findIndex(i => i.menuItemId === dto.menuItemId);
    if (existingIndex > -1) {
      cart.items[existingIndex].quantity += dto.quantity;
      cart.items[existingIndex].itemTotal = cart.items[existingIndex].quantity * menuItem.price;
    } else {
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

  updateItemQuantity(userId: string, menuItemId: string, dto: UpdateCartItemDto): Cart {
    const cart = this.getCart(userId);
    const item = cart.items.find(i => i.menuItemId === menuItemId);

    if (!item) {
      throw new NotFoundException('Item not found in your cart.');
    }

    item.quantity = dto.quantity;
    item.itemTotal = item.quantity * item.price;

    this.recalculateSubtotal(cart);
    this.cartsTable.set(userId, cart);
    return cart;
  }

  removeItem(userId: string, menuItemId: string): Cart {
    const cart = this.getCart(userId);
    cart.items = cart.items.filter(i => i.menuItemId !== menuItemId);

    if (cart.items.length === 0) {
      cart.restaurantId = null;
    }

    this.recalculateSubtotal(cart);
    this.cartsTable.set(userId, cart);
    return cart;
  }

  clearCart(userId: string): Cart {
    const cart: Cart = {
      userId,
      restaurantId: null,
      items: [],
      subtotal: 0,
    };
    this.cartsTable.set(userId, cart);
    return cart;
  }

  private recalculateSubtotal(cart: Cart): void {
    cart.subtotal = cart.items.reduce((sum, item) => sum + item.itemTotal, 0);
  }
}