import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { SearchProductsDto } from './dto/search-product.dto';

export interface Product {
  id: string;
  name: string;
  price: number;
  city: string;
}

@Injectable()
export class ProductsService {
  // Mock data array for demonstration
  private products: Product[] = [
    { id: '1', name: 'Wireless Mouse', price: 25, city: 'New York' },
    { id: '2', name: 'Mechanical Keyboard', price: 75, city: 'San Francisco' },
    { id: '3', name: 'Gaming Monitor', price: 200, city: 'New York' },
    { id: '4', name: 'Laptop Stand', price: 15, city: 'Los Angeles' },
  ];

  findAll(query: SearchProductsDto): Product[] {
    let filteredProducts = [...this.products];
    const { name, city, maxPrice, sortBy, sortOrder } = query;

    // 1. Search by Name (Case-insensitive match)
    if (name) {
      filteredProducts = filteredProducts.filter(product =>
        product.name.toLowerCase().includes(name.toLowerCase())
      );
    }

    // 2. Search by City (Case-insensitive match)
    if (city) {
      filteredProducts = filteredProducts.filter(product =>
        product.city.toLowerCase().includes(city.toLowerCase())
      );
    }

    // 3. Filter by Max Base Price (Less than a given base price)
    if (maxPrice) {
      const limit = parseFloat(maxPrice);
      filteredProducts = filteredProducts.filter(product => product.price < limit);
    }

    // 4. Sorting logic
    if (sortBy) {
      filteredProducts.sort((a, b) => {
        let valA = a[sortBy];
        let valB = b[sortBy];

        // Handle string comparison for names safely
        if (typeof valA === 'string') {
          valA = valA.toLowerCase();
          valB = (valB as string).toLowerCase();
        }

        if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
        if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filteredProducts;
  }
}