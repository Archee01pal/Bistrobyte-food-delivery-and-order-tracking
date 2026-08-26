import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingStatusDto } from './dto/update-booking-status.dto';
import { EventsService } from '../events/events.service';
import { MailService } from '../mail/mail.service';
import { v4 as uuidv4 } from 'uuid';

export interface BookingRecord {
  id: string;
  eventId: string;
  userId: string;
  status: 'confirmed' | 'canceled';
  ticketCount: number;
  createdAt: Date;
}

@Injectable()
export class BookingsService {
  private bookingsTable: Map<string, BookingRecord> = new Map();

  constructor(
    private readonly eventsService: EventsService,
    private readonly mailService: MailService,
  ) {}

  async create(dto: CreateBookingDto): Promise<BookingRecord> {
    const event = this.eventsService.findOne(dto.eventId);

    // Enforce real-time inventory limits
    const availableTickets = event.totalTickets - event.ticketsBooked;
    if (dto.ticketCount > availableTickets) {
      throw new BadRequestException(`Sold out! Only ${availableTickets} ticket(s) remain.`);
    }

    // Deduct inventory allocation balance
    this.eventsService.updateTickets(dto.eventId, dto.ticketCount);

    const newBooking: BookingRecord = {
      id: `bk_${uuidv4().substring(0, 8)}`,
      eventId: dto.eventId,
      userId: dto.userId,
      status: 'confirmed',
      ticketCount: dto.ticketCount,
      createdAt: new Date(),
    };

    this.bookingsTable.set(newBooking.id, newBooking);

    // Trigger transactional background notification routine
    await this.mailService.sendBookingConfirmation('user@customer-domain.com', newBooking);

    return newBooking;
  }

  findAll(): BookingRecord[] {
    return Array.from(this.bookingsTable.values());
  }

  updateStatus(id: string, dto: UpdateBookingStatusDto): BookingRecord {
    const booking = this.bookingsTable.get(id);
    if (!booking) throw new NotFoundException('Booking record not found');

    // If canceling an active ticket order, return allocation to the inventory pool
    if (booking.status === 'confirmed' && dto.status === 'canceled') {
      this.eventsService.updateTickets(booking.eventId, -booking.ticketCount);
    } 
    // If restoring a canceled order, ensure room exists
    else if (booking.status === 'canceled' && dto.status === 'confirmed') {
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
}