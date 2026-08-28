import { Injectable } from '@nestjs/common';

@Injectable()
export class MailService {
  async sendBookingConfirmation(email: string, bookingDetails: any): Promise<void> {
    console.log(`---------------------------------------------------------`);
    console.log(`📧 SYSTEM: Dispatching Background Confirmation Email...`);
    console.log(`To: ${email}`);
    console.log(`Subject: Ticket Confirmation for Booking #${bookingDetails.id}`);
    console.log(`Message: Your order for ${bookingDetails.ticketCount} ticket(s) is CONFIRMED.`);
    console.log(`---------------------------------------------------------`);
  }

  async sendCancellationNotification(email: string, bookingId: string, refundStatus: string): Promise<void> {
    console.log(`---------------------------------------------------------`);
    console.log(`📧 SYSTEM: Dispatching Cancellation & Refund Notification...`);
    console.log(`To: ${email}`);
    console.log(`Subject: Cancellation Notice for Booking #${bookingId}`);
    console.log(`Message: Your booking has been canceled. Refund status: ${refundStatus}.`);
    console.log(`---------------------------------------------------------`);
  }
}