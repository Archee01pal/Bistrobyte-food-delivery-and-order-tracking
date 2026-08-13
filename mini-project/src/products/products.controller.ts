import { 
  Controller, 
  Get, 
  Post, 
  Delete, 
  Param, 
  Query, 
  Headers, 
  UnauthorizedException, 
  BadRequestException, 
  UseInterceptors, 
  UploadedFile, 
  ValidationPipe 
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Express } from 'express';
import { ProductsService, Product } from './products.service';
import { SearchProductsDto } from './dto/search-product.dto';
import { diskStorage, Multer } from 'multer';
import { extname } from 'path';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  // DAY 07: Get All Products with Sorting, Searching, and Filtering
  @Get()
  getAllProducts(@Query(new ValidationPipe({ transform: true })) query: SearchProductsDto): Product[] {
    return this.productsService.findAll(query);
  }

  // ==========================================
  // DAY 08: FAVORITE ROUTES (REQUIRES HEADERS)
  // ==========================================

  // Fetch logged-in user's favorite product objects
  @Get('favorites')
  getUserFavorites(@Headers('x-user-id') userId: string): Product[] {
    this.validateUserSession(userId);
    return this.productsService.getFavorites(userId);
  }

  // Add a product to the user's personal favorites array
  @Post(':id/favorite')
  addToFavorites(
    @Headers('x-user-id') userId: string,
    @Param('id') productId: string
  ) {
    this.validateUserSession(userId);
    return this.productsService.markAsFavorite(userId, productId);
  }

  // Remove ALL favorites from a user's record
  @Delete('favorites/clear-all')
  clearAllFavorites(@Headers('x-user-id') userId: string) {
    this.validateUserSession(userId);
    return this.productsService.removeFavorites(userId);
  }

  // Remove ONE specific product from favorites list
  @Delete(':id/favorite')
  removeSingleFavorite(
    @Headers('x-user-id') userId: string,
    @Param('id') productId: string
  ) {
    this.validateUserSession(userId);
    return this.productsService.removeFavorites(userId, productId);
  }

  // ==========================================
  // CONTINUOUS DAY 04 & 06 BASE ROUTES
  // ==========================================

  // DAY 04: Get Single Product by ID
  @Get(':id')
  getProductById(@Param('id') id: string): Product {
    return this.productsService.findOne(id);
  }

  // DAY 04: Delete Product from Catalog
  @Delete(':id')
  deleteProduct(@Param('id') id: string) {
    return this.productsService.remove(id);
  }

  // DAY 06: File Upload Engine for Product Images
  @Post(':id/upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        // FIX: Using a callback function prevents multer from trying to run mkdir on a folder that already exists
        destination: (req, file, callback) => {
          callback(null, './uploads');
        },
        filename: (req, file, callback) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          callback(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
        },
      }),
    }),
  )
  uploadProductImage(
    @Param('id') id: string, 
    @UploadedFile() file: Express.Multer.File
  ): Product {
    const fileUrl = `uploads/${file.filename}`;
    return this.productsService.updateImage(id, fileUrl);
  }

  // Helper validation utility simulating logged-in guard conditions
  private validateUserSession(userId: string): void {
    if (!userId || userId.trim() === '') {
      throw new UnauthorizedException('Access Denied: Missing "x-user-id" session identification header.');
    }
  }
}