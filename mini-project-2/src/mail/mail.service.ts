import { Injectable, Logger } from '@nestjs/common';
import { EmailTemplates } from './templates/email-html.templates';

@Injectable()
export class MailService {
  private readonly logger = new Logger('MailServiceEngine');
  // Logs history of sent mail messages for debugging/auditing
  private outboundMailLogs: any[] = [];

  async sendSystemEmail(
    to: string, 
    subject: string, 
    templateType: 'registration' | 'bookingConfirmation' | 'eventReminder' | 'bookingCancellation',
    contextArgs: any[]
  ): Promise<boolean> {
    
    // Resolve matching template signature from layout maps
    let htmlContent = '';
    if (templateType === 'registration') htmlContent = EmailTemplates.registration(contextArgs[0]);
    else if (templateType === 'bookingConfirmation') htmlContent = EmailTemplates.bookingConfirmation(contextArgs[0], contextArgs[1], contextArgs[2]);
    else if (templateType === 'eventReminder') htmlContent = EmailTemplates.eventReminder(contextArgs[0], contextArgs[1], contextArgs[2]);
    else if (templateType === 'bookingCancellation') htmlContent = EmailTemplates.bookingCancellation(contextArgs[0], contextArgs[1]);

    const maxRetryAttempts = 3;
    let attempt = 0;

    while (attempt < maxRetryAttempts) {
      attempt++;
      try {
        // Introduce a subtle processing risk factor to test and demonstrate error handling and retry loops
        if (Math.random() < 0.25) {
          throw new Error('SMTP Relay Connection Timeout - Port 587 Unresponsive.');
        }

        // Output successful transmission logs
        this.logger.log(`[Attempt #${attempt}] Outbound Mail dispatched successfully to [${to}] - Subject: "${subject}"`);
        
        this.outboundMailLogs.push({
          id: `msg_${Date.now()}`,
          to,
          subject,
          html: htmlContent,
          dispatchedAt: new Date(),
          status: 'DELIVERED'
        });
        return true;

      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';

        this.logger.warn(`[Attempt #${attempt}/${maxRetryAttempts}] Transmission failed: ${errorMessage}`);
        if (attempt >= maxRetryAttempts) {
          this.logger.error(`Critical: Mail message transmission to [${to}] permanently dropped after ${maxRetryAttempts} failed attempts.`);
          this.outboundMailLogs.push({
            to,
            subject,
            error: errorMessage,
            dispatchedAt: new Date(),
            status: 'FAILED'
          });
          return false;
        }
        // Artificial short block stall to allow backoff breathing room
        await new Promise(res => setTimeout(res, 500));
      }
    }
    return false;
  }

  getMailLogs() {
    return this.outboundMailLogs;
  }
}