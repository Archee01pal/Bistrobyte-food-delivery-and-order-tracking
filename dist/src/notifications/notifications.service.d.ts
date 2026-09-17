import { MailerService } from '@nestjs-modules/mailer';
export declare class NotificationsService {
    private readonly mailerService;
    private readonly logger;
    constructor(mailerService: MailerService);
    sendEmail(to: string, subject: string, text: string): Promise<void>;
    notifyOrderConfirmation(customerEmail: string, orderNumber: string): Promise<void>;
    notifyOrderStatusChange(customerEmail: string, orderNumber: string, newStatus: string): Promise<void>;
    notifyDriverAssigned(driverEmail: string, orderNumber: string, deliveryAddress: string): Promise<void>;
    notifyDeliveryComplete(customerEmail: string, orderNumber: string): Promise<void>;
}
