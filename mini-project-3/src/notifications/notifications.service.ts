import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private readonly mailerService: MailerService) {}

  async sendEmail(to: string, subject: string, text: string): Promise<void> {
    try {
      await this.mailerService.sendMail({
        to,
        subject,
        text,
      });
      this.logger.log(`[EMAIL SENT] To: ${to} | Subject: ${subject}`);
    } catch (error) {
      // Gracefully logs error so non-configured SMTP doesn't crash the application during local testing
      this.logger.warn(`[EMAIL MOCK LOG] To: ${to} | Subject: ${subject} | Content: ${text}`);
    }
  }

  async notifyOrderConfirmation(customerEmail: string, orderNumber: string) {
    await this.sendEmail(
      customerEmail,
      `Order Confirmed: ${orderNumber}`,
      `Your order ${orderNumber} has been successfully placed and paid.`,
    );
  }

  async notifyOrderStatusChange(customerEmail: string, orderNumber: string, newStatus: string) {
    await this.sendEmail(
      customerEmail,
      `Order Status Update: ${orderNumber}`,
      `Your order ${orderNumber} is now ${newStatus}.`,
    );
  }

  async notifyDriverAssigned(driverEmail: string, orderNumber: string, deliveryAddress: string) {
    await this.sendEmail(
      driverEmail,
      `New Delivery Assigned: ${orderNumber}`,
      `You have been assigned to deliver order ${orderNumber} to ${deliveryAddress}.`,
    );
  }

  async notifyDeliveryComplete(customerEmail: string, orderNumber: string) {
    await this.sendEmail(
      customerEmail,
      `Order Delivered: ${orderNumber}`,
      `Your order ${orderNumber} has been successfully delivered. Enjoy your meal!`,
    );
  }
}