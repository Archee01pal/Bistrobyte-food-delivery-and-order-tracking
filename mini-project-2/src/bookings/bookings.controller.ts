import { Controller, Get, Post, Body, Param, Patch } from '@nestjs/common';
import { BookingsService, BookingRecord } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingStatusDto } from './dto/update-booking-status.dto';

@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  // User Action: Create a booking
  @Post()
  async createBooking(@Body() dto: CreateBookingDto): Promise<BookingRecord> {
    return this.bookingsService.create(dto);
  }

  // Admin Action: Review all orders
  @Get()
  getAllBookings(): BookingRecord[] {
    return this.bookingsService.findAll();
  }

  // Admin Action: Modify/Cancel an order status
  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateBookingStatusDto,
  ): BookingRecord {
    return this.bookingsService.updateStatus(id, dto);
  }
}