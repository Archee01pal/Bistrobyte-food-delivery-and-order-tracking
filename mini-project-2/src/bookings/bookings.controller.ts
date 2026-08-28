import { Controller, Get, Post, Body, Param, Patch, Query, Delete, BadRequestException } from '@nestjs/common';
import { BookingsService, BookingRecord, ReviewRecord } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingStatusDto } from './dto/update-booking-status.dto';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';

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
  getEventAttendees(@Param('eventId') eventId: string, @Query('status') status?: string) {
    return this.bookingsService.getAttendeesForEvent(eventId, status);
  }

  @Patch('bookings/:bookingId/checkin')
  markAttendance(@Param('bookingId') bookingId: string, @Body('checkedIn') checkedIn: boolean) {
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

  // --- Day 09: Cancellations & Refunds ---
  @Patch('bookings/:id/cancel')
  cancelBooking(@Param('id') id: string) {
    return this.bookingsService.cancelBookingByUser(id);
  }

  @Patch('bookings/:id/refund')
  refundBooking(@Param('id') id: string) {
    return this.bookingsService.processAdminRefund(id);
  }

  // --- Day 10: Reviews & Ratings ---
  @Post('reviews')
  submitReview(@Body() dto: CreateReviewDto): ReviewRecord {
    return this.bookingsService.createReview(dto);
  }

  @Patch('reviews/:id')
  editReview(@Param('id') id: string, @Body() dto: UpdateReviewDto): ReviewRecord {
    return this.bookingsService.updateReview(id, dto);
  }

  @Delete('reviews/:id')
  removeReview(@Param('id') id: string) {
    return this.bookingsService.deleteReview(id);
  }

  @Get('events/:eventId/reviews')
  getEventReviews(
    @Param('eventId') eventId: string,
    @Query('sortBy') sortBy?: 'rating' | 'date',
  ): ReviewRecord[] {
    return this.bookingsService.getReviewsForEvent(eventId, sortBy);
  }
}