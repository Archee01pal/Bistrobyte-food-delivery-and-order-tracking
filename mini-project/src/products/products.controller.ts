import { 
  Controller, Get, Post, Patch, Param, Body, Query, UseInterceptors, UploadedFile, Headers, UnauthorizedException 
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { Product, Cart } from './products.model';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import * as Express from 'express';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  // Helper validation to shield endpoints from anonymous mutations
  private verifySession(userId: string): string {
    if (!userId) {
      throw new UnauthorizedException('Access Denied: Missing "x-user-id" session identification header.');
    }
    return userId;
  }

  // --- DAY 03 - 07 Endpoints ---
  @Get()
  getAll(
    @Query('search') search?: string,
    @Query('minPrice') minPrice?: string,
    @Query('maxPrice') maxPrice?: string,
  ): Product[] {
    return this.productsService.findAll(
      search,
      minPrice ? parseFloat(minPrice) : undefined,
      maxPrice ? parseFloat(maxPrice) : undefined,
    );
  }

  @Get('favorites')
  getFavorites(@Headers('x-user-id') userId: string): Product[] {
    this.verifySession(userId);
    return this.productsService.getFavorites(userId);
  }

  @Get(':id')
  getOne(@Param('id') id: string): Product {
    return this.productsService.findOne(id);
  }

  @Post()
  createProduct(
    @Body('title') title: string,
    @Body('description') description: string,
    @Body('price') price: number,
  ): Product {
    return this.productsService.create(title, description, price);
  }

  @Post(':id/upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req, file, callback) => callback(null, './uploads'),
        filename: (req, file, callback) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          callback(null, `${file.fieldname}-${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  uploadProductImage(@Param('id') id: string, @UploadedFile() file: Express.Multer.File): Product {
    return this.productsService.updateImage(id, `uploads/${file.filename}`);
  }

  @Post(':id/favorite')
  toggleProductFavorite(@Param('id') id: string, @Headers('x-user-id') userId: string): string[] {
    this.verifySession(userId);
    return this.productsService.toggleFavorite(userId, id);
  }

  // =========================================================================
  // DAY 09: SHOPPING CART APP GATEWAYS
  // =========================================================================

  @Get('cart/view')
  viewCart(@Headers('x-user-id') userId: string): Cart {
    this.verifySession(userId);
    return this.productsService.getCart(userId);
  }

  @Post('cart/add')
  addItemToCart(
    @Headers('x-user-id') userId: string,
    @Body('productId') productId: string,
    @Body('quantity') quantity: number,
  ): Cart {
    this.verifySession(userId);
    return this.productsService.addToCart(userId, productId, quantity || 1);
  }

  @Patch('cart/update')
  modifyItemQuantity(
    @Headers('x-user-id') userId: string,
    @Body('productId') productId: string,
    @Body('quantity') quantity: number,
  ): Cart {
    this.verifySession(userId);
    return this.productsService.updateCartItem(userId, productId, quantity);
  }
}