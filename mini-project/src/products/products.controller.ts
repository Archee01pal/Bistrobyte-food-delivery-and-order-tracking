import { Controller, Get, Post, Body, Patch, Param, ValidationPipe } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  // POST /products (Add Product)
  @Post()
  async addProduct(@Body(new ValidationPipe({ whitelist: true })) createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  // GET /products (View Catalog List)
  @Get()
  async getCatalog() {
    return this.productsService.findAll();
  }

  // PATCH /products/:id (Update Details)
  @Patch(':id')
  async updateProduct(
    @Param('id') id: string,
    @Body(new ValidationPipe({ whitelist: true })) updateProductDto: UpdateProductDto
  ) {
    return this.productsService.update(id, updateProductDto);
  }
}