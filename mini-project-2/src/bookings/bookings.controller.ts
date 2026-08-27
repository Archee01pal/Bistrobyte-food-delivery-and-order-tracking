import { Controller, Get, Post, Body, Param, Patch, Query, Delete, BadRequestException } from '@nestjs/common';
import { BookingsService, BookingRecord } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingStatusDto } from './dto/update-booking-status.dto';

@Controller()
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post('bookings')
  async createBooking(@Body() dto: CreateBookingDto): Promise<BookingRecord> {
    return this.bookingsService.create(dto);
  }

  @Get('bookings')
  getAllBookings(): BookingRecord[] {
    return this.bookingsService.findAll();
  }

  @Patch('bookings/:id/status')
  updateStatus(@Param('id') id: string, @Body() dto: UpdateBookingStatusDto): BookingRecord {
    return this.bookingsService.updateStatus(id, dto);
  }

  // --- Day 07: Attendee Controls ---
  @Get('events/:eventId/attendees')
  getEventAttendees(
    @Param('eventId') eventId: string,
    @Query('status') status?: string,
  ) {
    return this.bookingsService.getAttendeesForEvent(eventId, status);
  }

  @Patch('bookings/:bookingId/checkin')
  markAttendance(
    @Param('bookingId') bookingId: string,
    @Body('checkedIn') checkedIn: boolean,
  ) {
    if (typeof checkedIn !== 'boolean') {
      throw new BadRequestException('checkedIn body attribute must be explicit boolean value.');
    }
    return this.bookingsService.toggleCheckIn(bookingId, checkedIn);
  }

  // --- Day 08: Favorite Controls ---
  @Post('users/:userId/favorites/:eventId')
  addFavorite(@Param('userId') userId: string, @Param('eventId') eventId: string) {
    return this.bookingsService.toggleFavorite(userId, eventId, 'mark');
  }

  @Delete('users/:userId/favorites/:eventId')
  removeFavorite(@Param('userId') userId: string, @Param('eventId') eventId: string) {
    return this.bookingsService.toggleFavorite(userId, eventId, 'unmark');
  }

  @Get('users/:userId/favorites')
  getFavorites(@Param('userId') userId: string) {
    return this.bookingsService.getUserFavorites(userId);
  }
}