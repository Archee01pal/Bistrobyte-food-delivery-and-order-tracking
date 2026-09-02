import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { CartService } from './cart.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  getCart(@Request() req) {
    return this.cartService.getCart(req.user.userId);
  }

  @Post('items')
  addToCart(@Request() req, @Body() dto: AddToCartDto) {
    return this.cartService.addToCart(req.user.userId, dto);
  }

  @Patch('items/:menuItemId')
  updateQuantity(
    @Request() req,
    @Param('menuItemId') menuItemId: string,
    @Body() dto: UpdateCartItemDto,
  ) {
    return this.cartService.updateItemQuantity(req.user.userId, menuItemId, dto);
  }

  @Delete('items/:menuItemId')
  removeItem(@Request() req, @Param('menuItemId') menuItemId: string) {
    return this.cartService.removeItem(req.user.userId, menuItemId);
  }

  @Delete()
  clearCart(@Request() req) {
    return this.cartService.clearCart(req.user.userId);
  }
}