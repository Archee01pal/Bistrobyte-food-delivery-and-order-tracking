"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var NotificationsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsService = void 0;
const common_1 = require("@nestjs/common");
const mailer_1 = require("@nestjs-modules/mailer");
let NotificationsService = NotificationsService_1 = class NotificationsService {
    constructor(mailerService) {
        this.mailerService = mailerService;
        this.logger = new common_1.Logger(NotificationsService_1.name);
    }
    async sendEmail(to, subject, text) {
        try {
            await this.mailerService.sendMail({
                to,
                subject,
                text,
            });
            this.logger.log(`[EMAIL SENT] To: ${to} | Subject: ${subject}`);
        }
        catch (error) {
            this.logger.warn(`[EMAIL MOCK LOG] To: ${to} | Subject: ${subject} | Content: ${text}`);
        }
    }
    async notifyOrderConfirmation(customerEmail, orderNumber) {
        await this.sendEmail(customerEmail, `Order Confirmed: ${orderNumber}`, `Your order ${orderNumber} has been successfully placed and paid.`);
    }
    async notifyOrderStatusChange(customerEmail, orderNumber, newStatus) {
        await this.sendEmail(customerEmail, `Order Status Update: ${orderNumber}`, `Your order ${orderNumber} is now ${newStatus}.`);
    }
    async notifyDriverAssigned(driverEmail, orderNumber, deliveryAddress) {
        await this.sendEmail(driverEmail, `New Delivery Assigned: ${orderNumber}`, `You have been assigned to deliver order ${orderNumber} to ${deliveryAddress}.`);
    }
    async notifyDeliveryComplete(customerEmail, orderNumber) {
        await this.sendEmail(customerEmail, `Order Delivered: ${orderNumber}`, `Your order ${orderNumber} has been successfully delivered. Enjoy your meal!`);
    }
};
exports.NotificationsService = NotificationsService;
exports.NotificationsService = NotificationsService = NotificationsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [mailer_1.MailerService])
], NotificationsService);
//# sourceMappingURL=notifications.service.js.map