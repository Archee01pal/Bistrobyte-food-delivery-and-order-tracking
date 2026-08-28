import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingStatusDto } from './dto/update-booking-status.dto';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { EventsService, EventRecord } from '../events/events.service';
import { MailService } from '../mail/mail.service';
import { v4 as uuidv4 } from 'uuid';

export interface BookingRecord {
  id: string;
  eventId: string;
  userId: string;
  status: 'confirmed' | 'canceled';
  checkedIn: boolean;
  ticketCount: number;
  refundProcessed: boolean; // Day 09 Tracker
  refundAmount: number;     // Day 09 Tracker
  createdAt: Date;
}

export interface ReviewRecord {
  id: string;
  userId: string;
  eventId: string;
  rating: number;
  message: string;
  createdAt: Date;
}

@Injectable()
export class BookingsService {
  private bookingsTable: Map<string, BookingRecord> = new Map();
  private userFavoritesTable: Map<string, Set<string>> = new Map();
  private reviewsTable: Map<string, ReviewRecord> = new Map(); // Day 10 Data Layer

  constructor(
    private readonly eventsService: EventsService,
    private readonly mailService: MailService,
  ) {}

  async create(dto: CreateBookingDto): Promise<BookingRecord> {
    const event = this.eventsService.findOne(dto.eventId);
    const availableTickets = event.totalTickets - event.ticketsBooked;
    if (dto.ticketCount > availableTickets) {
      throw new BadRequestException(`Sold out! Only ${availableTickets} ticket(s) remain.`);
    }

    this.eventsService.updateTickets(dto.eventId, dto.ticketCount);

    const newBooking: BookingRecord = {
      id: `bk_${uuidv4().substring(0, 8)}`,
      eventId: dto.eventId,
      userId: dto.userId,
      status: 'confirmed',
      checkedIn: false,
      ticketCount: dto.ticketCount,
      refundProcessed: false,
      refundAmount: 0,
      createdAt: new Date(),
    };

    this.bookingsTable.set(newBooking.id, newBooking);
    await this.mailService.sendBookingConfirmation('user@customer-domain.com', newBooking);
    return newBooking;
  }

  findAll(): BookingRecord[] {
    return Array.from(this.bookingsTable.values());
  }

  updateStatus(id: string, dto: UpdateBookingStatusDto): BookingRecord {
    const booking = this.bookingsTable.get(id);
    if (!booking) throw new NotFoundException('Booking record not found');

    if (booking.status === 'confirmed' && dto.status === 'canceled') {
      this.eventsService.updateTickets(booking.eventId, -booking.ticketCount);
    } else if (booking.status === 'canceled' && dto.status === 'confirmed') {
      const event = this.eventsService.findOne(booking.eventId);
      if (event.totalTickets - event.ticketsBooked < booking.ticketCount) {
        throw new BadRequestException('Cannot restore order. Event capacity reached.');
      }
      this.eventsService.updateTickets(booking.eventId, booking.ticketCount);
    }

    booking.status = dto.status;
    this.bookingsTable.set(id, booking);
    return booking;
  }

  // --- Day 07: Attendee Engine ---
  getAttendeesForEvent(eventId: string, statusFilter?: string): any[] {
    this.eventsService.findOne(eventId);
    let bookings = Array.from(this.bookingsTable.values()).filter(b => b.eventId === eventId);
    if (statusFilter) {
      bookings = bookings.filter(b => b.status === statusFilter);
    }
    return bookings.map(b => ({
      bookingId: b.id,
      userId: b.userId,
      ticketCount: b.ticketCount,
      status: b.status,
      checkedIn: b.checkedIn,
    }));
  }

  toggleCheckIn(bookingId: string, checkedIn: boolean): BookingRecord {
    const booking = this.bookingsTable.get(bookingId);
    if (!booking) throw new NotFoundException('Attendee booking matching ID not found.');
    if (booking.status === 'canceled') throw new BadRequestException('Cannot check-in a canceled ticket order.');

    booking.checkedIn = checkedIn;
    this.bookingsTable.set(bookingId, booking);
    return booking;
  }

  // --- Day 08: Favorites Engine ---
  toggleFavorite(userId: string, eventId: string, action: 'mark' | 'unmark'): string[] {
    this.eventsService.findOne(eventId);
    if (!this.userFavoritesTable.has(userId)) {
      this.userFavoritesTable.set(userId, new Set());
    }
    const favorites = this.userFavoritesTable.get(userId)!;
    if (action === 'mark') {
      favorites.add(eventId);
    } else {
      favorites.delete(eventId);
    }
    return Array.from(favorites);
  }

  getUserFavorites(userId: string): EventRecord[] {
    const favoritedIds = this.userFavoritesTable.get(userId);
    if (!favoritedIds || favoritedIds.size === 0) return [];
    return Array.from(favoritedIds).map(id => this.eventsService.findOne(id));
  }

  // --- Day 09: Cancellations & Refunds Engine ---
  async cancelBookingByUser(bookingId: string): Promise<BookingRecord> {
    const booking = this.bookingsTable.get(bookingId);
    if (!booking) throw new NotFoundException('Booking record not found.');
    if (booking.status === 'canceled') throw new BadRequestException('This booking has already been canceled.');

    // Release event tickets
    this.eventsService.updateTickets(booking.eventId, -booking.ticketCount);
    booking.status = 'canceled';
    this.bookingsTable.set(bookingId, booking);

    await this.mailService.sendCancellationNotification('user@customer-domain.com', bookingId, 'Pending Admin Processing');
    return booking;
  }

  async processAdminRefund(bookingId: string): Promise<BookingRecord> {
    const booking = this.bookingsTable.get(bookingId);
    if (!booking) throw new NotFoundException('Booking record not found.');
    if (booking.status !== 'canceled') throw new BadRequestException('Cannot refund an active, confirmed booking. Cancel it first.');
    if (booking.refundProcessed) throw new BadRequestException('A refund has already been authorized and processed for this order.');

    const event = this.eventsService.findOne(booking.eventId);
    
    booking.refundProcessed = true;
    booking.refundAmount = event.price * booking.ticketCount;
    this.bookingsTable.set(bookingId, booking);

    await this.mailService.sendCancellationNotification('user@customer-domain.com', bookingId, `Fully Processed ($${booking.refundAmount})`);
    return booking;
  }

  // --- Day 10: Event Reviews Engine ---
  createReview(dto: CreateReviewDto): ReviewRecord {
    this.eventsService.findOne(dto.eventId); // Ensure event exists
    
    const reviewId = `rev_${uuidv4().substring(0, 8)}`;
    const newReview: ReviewRecord = {
      id: reviewId,
      userId: dto.userId,
      eventId: dto.eventId,
      rating: dto.rating,
      message: dto.message,
      createdAt: new Date(),
    };

    this.reviewsTable.set(reviewId, newReview);
    return newReview;
  }

  updateReview(reviewId: string, dto: UpdateReviewDto): ReviewRecord {
    const review = this.reviewsTable.get(reviewId);
    if (!review) throw new NotFoundException('Review not found.');

    if (dto.rating !== undefined) review.rating = dto.rating;
    if (dto.message !== undefined) review.message = dto.message;

    this.reviewsTable.set(reviewId, review);
    return review;
  }

  deleteReview(reviewId: string): { message: string } {
    if (!this.reviewsTable.has(reviewId)) throw new NotFoundException('Review not found.');
    this.reviewsTable.delete(reviewId);
    return { message: 'Review successfully removed.' };
  }

  getReviewsForEvent(eventId: string, sortBy: 'rating' | 'date' = 'date'): ReviewRecord[] {
    let reviews = Array.from(this.reviewsTable.values()).filter(r => r.eventId === eventId);

    if (sortBy === 'rating') {
      reviews.sort((a, b) => b.rating - a.rating); // Highest score first
    } else {
      reviews.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()); // Newest first
    }

    return reviews;
  }
}