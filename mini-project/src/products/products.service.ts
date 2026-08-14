import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { Product, Cart, Review } from './products.model';
import { SearchProductsDto } from './dto/search-product.dto';
import { ReviewProductDto } from './dto/review-product.dto';

@Injectable()
export class ProductsService {
  private products: Product[] = [
    { id: '1', title: 'Wireless Mouse', description: 'Ergonomic 2.4GHz mouse', price: 29.99 },
    { id: '2', title: 'Mechanical Keyboard', description: 'RGB tactile switches', price: 89.99 },
  ];

  private userFavorites: Map<string, Set<string>> = new Map();
  private userCarts: Map<string, Cart> = new Map();

  // DAY 10 REFINEMENT: OPTIMIZED INDEXING & IN-MEMORY CACHE MAPS
 
  private reviewsTable: Review[] = [];
  // Index Mapping table maps productId -> Array of Reviews for O(1) performance lookup 
  private productReviewsIndexCache: Map<string, Review[]> = new Map();

  // Day 3-7 CRUD & Search Methods
  findAll(query: SearchProductsDto): Product[] {
    let filtered = [...this.products];
    const { name, city, maxPrice, sortBy, sortOrder } = query;

    if (name) {
      filtered = filtered.filter(p => p.title.toLowerCase().includes(name.toLowerCase()));
    }
    if (maxPrice) {
      const limit = parseFloat(maxPrice);
      filtered = filtered.filter(p => p.price <= limit);
    }
    if (sortBy === 'price') {
      filtered.sort((a, b) => sortOrder === 'desc' ? b.price - a.price : a.price - b.price);
    }
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

  // Day 08: Favorites
  toggleFavorite(userId: string, productId: string): string[] {
    this.findOne(productId);
    if (!this.userFavorites.has(userId)) this.userFavorites.set(userId, new Set());
    const favorites = this.userFavorites.get(userId)!;
    if (favorites.has(productId)) favorites.delete(productId);
    else favorites.add(productId);
    return Array.from(favorites);
  }

  getFavorites(userId: string): Product[] {
    const favoriteIds = this.userFavorites.get(userId);
    if (!favoriteIds) return [];
    return this.products.filter(p => favoriteIds.has(p.id));
  }

  // Day 09: Shopping Cart Logic
  private getOrCreateCart(userId: string): Cart {
    if (!this.userCarts.has(userId)) {
      this.userCarts.set(userId, { userId, items: [], totalItems: 0, totalPrice: 0 });
    }
    return this.userCarts.get(userId)!;
  }

  private recalculateCartTotals(cart: Cart): void {
    cart.totalItems = cart.items.reduce((acc, item) => acc + item.quantity, 0);
    cart.totalPrice = Number(cart.items.reduce((acc, item) => acc + item.product.price * item.quantity, 0).toFixed(2));
  }

  getCart(userId: string): Cart { return this.getOrCreateCart(userId); }

  addToCart(userId: string, productId: string, quantity: number): Cart {
    if (quantity <= 0) throw new BadRequestException('Quantity must be greater than 0');
    const product = this.findOne(productId);
    const cart = this.getOrCreateCart(userId);
    const existingItem = cart.items.find(item => item.product.id === productId);
    if (existingItem) existingItem.quantity += quantity;
    else cart.items.push({ product, quantity });
    this.recalculateCartTotals(cart);
    return cart;
  }

  updateCartItem(userId: string, productId: string, quantity: number): Cart {
    const cart = this.getOrCreateCart(userId);
    const itemIndex = cart.items.findIndex(item => item.product.id === productId);
    if (itemIndex === -1) throw new NotFoundException('Product is not in your cart.');
    if (quantity <= 0) cart.items.splice(itemIndex, 1);
    else cart.items[itemIndex].quantity = quantity;
    this.recalculateCartTotals(cart);
    return cart;
  }

  // =========================================================================
  // DAY 10: PRODUCT REVIEW BUSINESS LOGIC (WITH INDEX REFINEMENTS)
  // =========================================================================

  submitReview(userId: string, productId: string, dto: ReviewProductDto): Review {
    this.findOne(productId); // Guard check: Ensure product exists

    const newReview: Review = {
      id: `rev_${Date.now()}`,
      productId,
      userId,
      comment: dto.comment,
      rating: dto.rating,
      createdAt: new Date(),
    };

    this.reviewsTable.push(newReview);
    this.rebuildReviewCacheIndex(productId); // Optimization layer: rebuild key index
    return newReview;
  }

  getReviewsByProduct(productId: string): Review[] {
    this.findOne(productId); // Guard check
    // Performance Optimization: Return directly from cache map in O(1) instead of standard table scanning loops
    return this.productReviewsIndexCache.get(productId) || [];
  }

  updateReview(userId: string, reviewId: string, dto: ReviewProductDto): Review {
    const review = this.reviewsTable.find(r => r.id === reviewId);
    if (!review) throw new NotFoundException(`Review with ID "${reviewId}" not found.`);
    if (review.userId !== userId) throw new ForbiddenException('Access Denied: You can only edit your own reviews.');

    review.comment = dto.comment;
    review.rating = dto.rating;
    
    this.rebuildReviewCacheIndex(review.productId);
    return review;
  }

  deleteReview(userId: string, reviewId: string): { deleted: boolean } {
    const index = this.reviewsTable.findIndex(r => r.id === reviewId);
    if (index === -1) throw new NotFoundException(`Review with ID "${reviewId}" not found.`);
    
    const review = this.reviewsTable[index];
    if (review.userId !== userId) throw new ForbiddenException('Access Denied: You can only delete your own reviews.');

    this.reviewsTable.splice(index, 1);
    this.rebuildReviewCacheIndex(review.productId);
    return { deleted: true };
  }

  // High-performance cache query pipeline utility
  private rebuildReviewCacheIndex(productId: string): void {
    const matchedReviews = this.reviewsTable.filter(r => r.productId === productId);
    this.productReviewsIndexCache.set(productId, matchedReviews);
  }
}