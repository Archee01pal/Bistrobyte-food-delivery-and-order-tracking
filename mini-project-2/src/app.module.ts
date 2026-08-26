import { Module } from '@nestjs/common';
import { MailModule } from './mail/mail.module';
import { UsersModule } from './users/users.module';
import { EventsModule } from './events/events.module';
import { BookingsModule } from './bookings/bookings.module';

@Module({
  imports: [MailModule, UsersModule, EventsModule, BookingsModule],
})
export class AppModule {}