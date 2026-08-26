import { Controller, Get, Param, Query } from '@nestjs/common';
import { EventsService, EventRecord } from './events.service';
import { GetEventsQueryDto } from './dto/get-events-query.dto';

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Get()
  getAllEvents(@Query() query: GetEventsQueryDto): EventRecord[] {
    return this.eventsService.findAll(query);
  }

  @Get(':id')
  getEventById(@Param('id') id: string): EventRecord {
    return this.eventsService.findOne(id);
  }
}