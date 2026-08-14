import { 
  Controller, Get, Post, Put, Delete, Param, Body, Query, UseInterceptors, UploadedFile, Headers, UnauthorizedException, ValidationPipe 
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { Product, Cart, Review } from './products.model';
import { SearchProductsDto } from './dto/search-product.dto';
import { ReviewProductDto } from './dto/review-product.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage, type Multer } from 'multer';
import { extname } from 'path';
import type { Request, Express } from 'express';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  private verifySession(userId: string): string {
    if (!userId) {
      throw new UnauthorizedException('Access Denied: Missing "x-user-id" session identification header.');
    }
    return userId;
  }

  @Get()
  getAll(@Query(new ValidationPipe({ transform: true })) query: SearchProductsDto): Product[] {
    return this.productsService.findAll(query);
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

  @Post('cart/update')
  modifyItemQuantity(
    @Headers('x-user-id') userId: string,
    @Body('productId') productId: string,
    @Body('quantity') quantity: number,
  ): Cart {
    this.verifySession(userId);
    return this.productsService.updateCartItem(userId, productId, quantity);
  }

  @Get(':productId/reviews')
  getProductReviews(@Param('productId') productId: string): Review[] {
    return this.productsService.getReviewsByProduct(productId);
  }

  @Post(':productId/reviews')
  createReview(
    @Headers('x-user-id') userId: string,
    @Param('productId') productId: string,
    @Body(new ValidationPipe()) reviewDto: ReviewProductDto,
  ): Review {
    this.verifySession(userId);
    return this.productsService.submitReview(userId, productId, reviewDto);
  }

  @Put('reviews/:reviewId')
  editReview(
    @Headers('x-user-id') userId: string,
    @Param('reviewId') reviewId: string,
    @Body(new ValidationPipe()) reviewDto: ReviewProductDto,
  ): Review {
    this.verifySession(userId);
    return this.productsService.updateReview(userId, reviewId, reviewDto);
  }

  @Delete('reviews/:reviewId')
  removeReview(
    @Headers('x-user-id') userId: string,
    @Param('reviewId') reviewId: string,
  ) {
    this.verifySession(userId);
    return this.productsService.deleteReview(userId, reviewId);
  }
}