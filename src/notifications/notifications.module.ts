import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer'; 
import { NotificationsService } from './notifications.service';

@Module({
  imports: [
    MailerModule.forRoot({
      transport: {
        host: 'smtp.ethereal.email',
        port: 587,
        auth: {
          user: 'mock@ethereal.email',
          pass: 'mockpassword',
        },
      },
      defaults: {
        from: '"Food App" <no-reply@fooddelivery.com>',
      },
    }),
  ],
  providers: [NotificationsService],
  exports: [NotificationsService],
})
export class NotificationsModule {}