import { Controller, Post, Put, Get, Body, Param, Headers, UnauthorizedException } from '@nestjs/common';
import { OffersService } from './offers.service';
import { CreateOfferDto } from './dto/create-offer.dto';
import { UpdateOfferDto } from './dto/update-offer.dto';

@Controller('offers') // Resource route
export class OffersController {
  constructor(private readonly offersService: OffersService) {}

  @Post()
  create(@Body() createOfferDto: CreateOfferDto, @Headers('x-user-role') role: string) {
    if (role !== 'admin') {
      throw new UnauthorizedException('Access denied. Admins only.');
    }
    return this.offersService.create(createOfferDto);
  }

  @Put(':id')
  update(
    @Param('id') id: string, 
    @Body() updateOfferDto: UpdateOfferDto,
    @Headers('x-user-role') role: string
  ) {
    if (role !== 'admin') {
      throw new UnauthorizedException('Access denied. Admins only.');
    }
    return this.offersService.update(id, updateOfferDto);
  }

  @Get()
  findAll() {
    return this.offersService.findAll();
  }
}