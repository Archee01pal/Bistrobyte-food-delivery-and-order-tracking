import { Module, Global } from '@nestjs/common';
import { MailService } from './mail.service';

@Global() // Makes the MailService instantly available to Auth and Booking modules without manual importing
@Module({
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}