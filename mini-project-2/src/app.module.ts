import { Module } from '@nestjs/common';
import { MailModule } from './mail/mail.module';
import { EventsModule } from './events/events.module';
import { BookingsModule } from './bookings/bookings.module';

@Module({
  imports: [MailModule, EventsModule, BookingsModule],
})
export class AppModule {}