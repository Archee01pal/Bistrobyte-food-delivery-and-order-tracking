import { Module, Global } from '@nestjs/common';
import { MailService } from './mail.service';

@Global()
@Module({
  providers: [MailService],
  exports: [MailService], // Export so Auth and Offers can pick it up
})
export class MailModule {}