import { Injectable, NotFoundException } from '@nestjs/common';
import { GetEventsQueryDto } from './dto/get-events-query.dto';

export interface EventRecord {
  id: string;
  name: string;
  location: string;
  category: string;
  date: Date;
  price: number;
  popularity: number;
  totalTickets: number;
  ticketsBooked: number;
}

@Injectable()
export class EventsService {
  private eventsTable: Map<string, EventRecord> = new Map([
    ['evt_1', { id: 'evt_1', name: 'Tech Conference 2026', location: 'New York', category: 'Tech', date: new Date('2026-09-15'), price: 299, popularity: 95, totalTickets: 100, ticketsBooked: 98 }],
    ['evt_2', { id: 'evt_2', name: 'Rock Concert', location: 'Los Angeles', category: 'Music', date: new Date('2026-10-20'), price: 85, popularity: 120, totalTickets: 500, ticketsBooked: 150 }],
    ['evt_3', { id: 'evt_3', name: 'Art Gallery Opening', location: 'New York', category: 'Art', date: new Date('2026-08-30'), price: 0, popularity: 40, totalTickets: 50, ticketsBooked: 50 }],
  ]);

  findAll(query: GetEventsQueryDto): EventRecord[] {
    let events = Array.from(this.eventsTable.values());

    if (query.search) {
      const s = query.search.toLowerCase();
      events = events.filter(e => e.name.toLowerCase().includes(s));
    }
    if (query.location) {
      events = events.filter(e => e.location.toLowerCase() === query.location.toLowerCase());
    }
    if (query.category) {
      events = events.filter(e => e.category.toLowerCase() === query.category.toLowerCase());
    }
    if (query.startDate) {
      events = events.filter(e => e.date >= new Date(query.startDate));
    }
    if (query.endDate) {
      events = events.filter(e => e.date <= new Date(query.endDate));
    }
    if (query.availableOnly === 'true') {
      events = events.filter(e => e.totalTickets - e.ticketsBooked > 0);
    }

    const sortBy = query.sortBy || 'date';
    const sortOrder = query.sortOrder || 'asc';
    events.sort((a, b) => {
      let valA: any = a[sortBy];
      let valB: any = b[sortBy];
      if (valA instanceof Date) {
        valA = valA.getTime();
        valB = valB.getTime();
      }
      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return events;
  }

  findOne(id: string): EventRecord {
    const event = this.eventsTable.get(id);
    if (!event) throw new NotFoundException('Event not found');
    return event;
  }

  updateTickets(id: string, count: number): void {
    const event = this.findOne(id);
    event.ticketsBooked += count;
    this.eventsTable.set(id, event);
  }
}