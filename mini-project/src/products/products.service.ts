import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  city: string;
  state: string;
  country: string;
}

@Injectable()
export class ProductsService {
  // Mock Database Array for Product Assets
  private products: Product[] = [];

  async create(createProductDto: CreateProductDto): Promise<Product> {
    // 🔒 Rule: Ensure product names are completely unique (Case-insensitive)
    const nameExists = this.products.some(
      (product) => product.name.toLowerCase() === createProductDto.name.toLowerCase()
    );

    if (nameExists) {
      throw new ConflictException(`A product with the name "${createProductDto.name}" already exists.`);
    }

    const newProduct: Product = {
      id: `prod-${Date.now()}`,
      ...createProductDto,
    };

    this.products.push(newProduct);
    return newProduct;
  }

  async findAll(): Promise<Product[]> {
    return this.products;
  }

  async update(id: string, updateProductDto: UpdateProductDto): Promise<Product> {
    const product = this.products.find((p) => p.id === id);

    if (!product) {
      throw new NotFoundException(`Product with ID "${id}" not found.`);
    }

    // 🔒 Rule: If name is being updated, verify the new name isn't already taken by another product
    if (updateProductDto.name && updateProductDto.name.toLowerCase() !== product.name.toLowerCase()) {
      const nameExists = this.products.some(
        (p) => p.name.toLowerCase() === updateProductDto.name.toLowerCase()
      );
      if (nameExists) {
        throw new ConflictException(`A product with the name "${updateProductDto.name}" already exists.`);
      }
    }

    // Modify fields safely via payload assignment updates
    Object.assign(product, updateProductDto);
    return product;
  }
}