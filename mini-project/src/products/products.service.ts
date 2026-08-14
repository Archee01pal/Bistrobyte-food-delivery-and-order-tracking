import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Product, Cart, CartItem } from './products.model';

@Injectable()
export class ProductsService {
  private products: Product[] = [
    { id: '1', title: 'Wireless Mouse', description: 'Ergonomic 2.4GHz mouse', price: 29.99 },
    { id: '2', title: 'Mechanical Keyboard', description: 'RGB tactile switches', price: 89.99 },
  ];

  // Day 08 Data Stores
  private userFavorites: Map<string, Set<string>> = new Map();

  // DAY 09: In-Memory Shopping Carts Data Store
  private userCarts: Map<string, Cart> = new Map();

  // Existing Day 3-7 CRUD & Search Methods
  findAll(search?: string, minPrice?: number, maxPrice?: number): Product[] {
    let filtered = [...this.products];
    if (search) {
      filtered = filtered.filter(p => 
        p.title.toLowerCase().includes(search.toLowerCase()) || 
        p.description.toLowerCase().includes(search.toLowerCase())
      );
    }
    if (minPrice !== undefined) filtered = filtered.filter(p => p.price >= minPrice);
    if (maxPrice !== undefined) filtered = filtered.filter(p => p.price <= maxPrice);
    return filtered;
  }

  findOne(id: string): Product {
    const product = this.products.find(p => p.id === id);
    if (!product) throw new NotFoundException(`Product with ID "${id}" not found.`);
    return product;
  }

  create(title: string, description: string, price: number): Product {
    const newProduct: Product = { id: Date.now().toString(), title, description, price };
    this.products.push(newProduct);
    return newProduct;
  }

  updateImage(id: string, imageUrl: string): Product {
    const product = this.findOne(id);
    product.imageUrl = imageUrl;
    return product;
  }

  // Day 08: Favorites Management
  toggleFavorite(userId: string, productId: string): string[] {
    this.findOne(productId); // Verifies product exists
    if (!this.userFavorites.has(userId)) {
      this.userFavorites.set(userId, new Set());
    }
    const favorites = this.userFavorites.get(userId)!;
    if (favorites.has(productId)) {
      favorites.delete(productId);
    } else {
      favorites.add(productId);
    }
    return Array.from(favorites);
  }

  getFavorites(userId: string): Product[] {
    const favoriteIds = this.userFavorites.get(userId);
    if (!favoriteIds) return [];
    return this.products.filter(p => favoriteIds.has(p.id));
  }

  // =========================================================================
  // DAY 09: SHOPPING CART CORE BUSINESS LOGIC
  // =========================================================================
  
  // Helper to fetch or initialize an empty cart for a session
  private getOrCreateCart(userId: string): Cart {
    if (!this.userCarts.has(userId)) {
      this.userCarts.set(userId, {
        userId,
        items: [],
        totalItems: 0,
        totalPrice: 0,
      });
    }
    return this.userCarts.get(userId)!;
  }

  // Helper to recalculate totals dynamically on mutations
  private recalculateCartTotals(cart: Cart): void {
    cart.totalItems = cart.items.reduce((acc, item) => acc + item.quantity, 0);
    cart.totalPrice = Number(
      cart.items.reduce((acc, item) => acc + item.product.price * item.quantity, 0).toFixed(2)
    );
  }

  getCart(userId: string): Cart {
    return this.getOrCreateCart(userId);
  }

  addToCart(userId: string, productId: string, quantity: number): Cart {
    if (quantity <= 0) throw new BadRequestException('Quantity must be greater than 0');
    const product = this.findOne(productId); // Throws 404 if product doesn't exist
    const cart = this.getOrCreateCart(userId);

    const existingItem = cart.items.find(item => item.product.id === productId);
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({ product, quantity });
    }

    this.recalculateCartTotals(cart);
    return cart;
  }

  updateCartItem(userId: string, productId: string, quantity: number): Cart {
    const cart = this.getOrCreateCart(userId);
    const itemIndex = cart.items.findIndex(item => item.product.id === productId);

    if (itemIndex === -1) {
      throw new NotFoundException(`Product with ID "${productId}" is not in your cart.`);
    }

    if (quantity <= 0) {
      // If quantity drops to 0 or negative, wipe item from cart array completely
      cart.items.splice(itemIndex, 1);
    } else {
      cart.items[itemIndex].quantity = quantity;
    }

    this.recalculateCartTotals(cart);
    return cart;
  }
}