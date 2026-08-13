import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { SearchProductsDto } from './dto/search-product.dto';

export interface Product {
  id: string;
  name: string;
  price: number;
  city: string;
  description?: string;
  imageUrl?: string;
}

export interface FavoriteRecord {
  userId: string;
  productIds: string[];
}

@Injectable()
export class ProductsService {
  // In-memory products database (Accumulated Days 4-7)
  private products: Product[] = [
    { id: '1', name: 'Wireless Mouse', price: 25, city: 'New York', description: 'Ergonomic mouse', imageUrl: 'uploads/mouse.jpg' },
    { id: '2', name: 'Mechanical Keyboard', price: 75, city: 'San Francisco', description: 'RGB Keyboard', imageUrl: '' },
    { id: '3', name: 'Gaming Monitor', price: 200, city: 'New York', description: '144Hz Monitor', imageUrl: '' },
    { id: '4', name: 'Laptop Stand', price: 15, city: 'Los Angeles', description: 'Aluminum stand', imageUrl: '' },
  ];

  // DAY 08: In-memory Favorites database schema keyed by User ID
  private favorites: FavoriteRecord[] = [];

  // DAY 07: Get All Products with Search, Filter, and Sort
  findAll(query: SearchProductsDto): Product[] {
    let filteredProducts = [...this.products];
    const { name, city, maxPrice, sortBy, sortOrder } = query;

    if (name) {
      filteredProducts = filteredProducts.filter(product =>
        product.name.toLowerCase().includes(name.toLowerCase())
      );
    }

    if (city) {
      filteredProducts = filteredProducts.filter(product =>
        product.city.toLowerCase().includes(city.toLowerCase())
      );
    }

    if (maxPrice) {
      const limit = parseFloat(maxPrice);
      filteredProducts = filteredProducts.filter(product => product.price < limit);
    }

    if (sortBy) {
      filteredProducts.sort((a, b) => {
        let valA = a[sortBy];
        let valB = b[sortBy];

        if (typeof valA === 'string') {
          valA = valA.toLowerCase();
          valB = (valB as string).toLowerCase();
        }

        if (valA < valB) return sortOrder === 'desc' ? 1 : -1;
        if (valA > valB) return sortOrder === 'desc' ? -1 : 1;
        return 0;
      });
    }

    return filteredProducts;
  }

  // DAY 04: Get Product By ID
  findOne(id: string): Product {
    const product = this.products.find(p => p.id === id);
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return product;
  }

  // DAY 04: Delete Product from Main Catalog
  remove(id: string): { deleted: boolean } {
    const initialLength = this.products.length;
    this.products = this.products.filter(p => p.id !== id);
    if (this.products.length === initialLength) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    
    // Also remove this product from all user favorite records cleanly
    this.favorites = this.favorites.map(f => ({
      ...f,
      productIds: f.productIds.filter(pId => pId !== id),
    }));

    return { deleted: true };
  }

  // DAY 06: Update Product Image URL
  updateImage(id: string, imageUrl: string): Product {
    const product = this.findOne(id);
    product.imageUrl = imageUrl;
    return product;
  }

  // ==========================================
  // DAY 08: FAVORITE PRODUCTS FEATURES
  // ==========================================

  // Mark a product as favorite for a specific logged-in user
  markAsFavorite(userId: string, productId: string): { message: string; favorites: string[] } {
    // 1. Verify product exists in catalog first
    this.findOne(productId);

    let userFav = this.favorites.find(f => f.userId === userId);

    if (!userFav) {
      userFav = { userId, productIds: [] };
      this.favorites.push(userFav);
    }

    // Prevent adding duplicate entries
    if (userFav.productIds.includes(productId)) {
      throw new BadRequestException('Product is already in your favorites list');
    }

    userFav.productIds.push(productId);
    return {
      message: 'Product added to favorites successfully',
      favorites: userFav.productIds,
    };
  }

  // Fetch all favorite product items for a logged-in user
  getFavorites(userId: string): Product[] {
    const userFav = this.favorites.find(f => f.userId === userId);
    if (!userFav || userFav.productIds.length === 0) {
      return [];
    }
    // Map the array of string IDs back to the actual structural product objects
    return this.products.filter(product => userFav.productIds.includes(product.id));
  }

  // Delete favorite products (removes specific ID or drops all if no ID passed)
  removeFavorites(userId: string, productId?: string): { message: string } {
    const userFav = this.favorites.find(f => f.userId === userId);
    
    if (!userFav) {
      throw new NotFoundException('No favorites record found for this user');
    }

    if (productId) {
      // Remove specific target favorite product
      const initialLength = userFav.productIds.length;
      userFav.productIds = userFav.productIds.filter(id => id !== productId);
      
      if (userFav.productIds.length === initialLength) {
        throw new NotFoundException(`Product with ID ${productId} not found in your favorites`);
      }
      return { message: `Product ${productId} removed from your favorites list` };
    } else {
      // Remove ALL favorites for this user
      userFav.productIds = [];
      return { message: 'All products removed from your favorites list' };
    }
  }
}