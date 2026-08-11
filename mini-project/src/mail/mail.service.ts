import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(MailService.name);

  constructor() {
    // Standard Mailtrap/SMTP development configuration
    // In production, swap these with process.env variables for AWS SES / SendGrid
    this.transporter = nodemailer.createTransport({
      host: 'sandbox.smtp.mailtrap.io', 
      port: 2525,
      auth: {
        user: 'YOUR_MAILTRAP_USER_ID', // Replace with your credentials or dummy text
        pass: 'YOUR_MAILTRAP_PASSWORD',
      },
    });
  }

  /**
   * Dispatches email workflows with a 3-turn auto-retry fallback infrastructure.
   */
  async sendEmail(to: string, subject: string, htmlContent: string, maxRetries = 3): Promise<boolean> {
    let attempts = 0;

    while (attempts < maxRetries) {
      attempts++;
      try {
        this.logger.log(`Attempting email delivery to [${to}] - Run (${attempts}/${maxRetries})...`);
        
        await this.transporter.sendMail({
          from: '"Churnetwork Admin System" <noreply@churnetwork.com>',
          to,
          subject,
          html: htmlContent,
        });

        // SUCCESS ROUTE LOGGING
        this.logger.log(`✅ [SUCCESS] Email successfully delivered to [${to}] on attempt #${attempts}`);
        return true;
      } catch (error) {
        // ERROR HANDLING & RETRY ENGINE LOGGING
        this.logger.error(`❌ [FAILURE] Run #${attempts} failed for [${to}]. Error Details: ${error instanceof Error ? error.message : String(error)}`);
        
        if (attempts < maxRetries) {
          const delayTime = attempts * 1000; // Exponential delay (1s, 2s...)
          this.logger.warn(`Waiting ${delayTime / 1000}s before executing next retry...`);
          await new Promise((resolve) => setTimeout(resolve, delayTime));
        }
      }
    }

    this.logger.error(`🚨 [CRITICAL ERROR] All ${maxRetries} delivery attempts completely exhausted for [${to}]. Transmission dropped.`);
    return false;
  }
}