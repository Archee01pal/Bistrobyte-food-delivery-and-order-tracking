import { Controller, Get, Query, ValidationPipe } from '@nestjs/common';
import { ProductsService, Product } from './products.service';
import { SearchProductsDto } from './dto/search-product.dto';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  // The ValidationPipe automatically enforces your DTO rules on incoming query params
  getAllProducts(@Query(new ValidationPipe({ transform: true })) query: SearchProductsDto): Product[] {
    return this.productsService.findAll(query);
  }
}