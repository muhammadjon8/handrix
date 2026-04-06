import { Injectable, Logger } from '@nestjs/common';
import * as sgMail from '@sendgrid/mail';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor() {
    const apiKey = process.env.SENDGRID_API_KEY;
    if (apiKey) {
      sgMail.setApiKey(apiKey);
      this.logger.log('✅ SendGrid API Key initialized.');
    } else {
      this.logger.warn('⚠️ SENDGRID_API_KEY is missing. Emails will only be logged to console.');
    }
  }

  async sendEmail(to: string, subject: string, text: string, html?: string) {
    const msg = {
      to,
      from: process.env.SENDGRID_FROM_EMAIL || 'notifications@handrix.app', // Must be a verified sender in SG
      subject,
      text,
      html: html || text,
    };

    if (process.env.SENDGRID_API_KEY) {
      try {
        await sgMail.send(msg);
        this.logger.log(`📧 Email sent to ${to}: ${subject}`);
      } catch (error) {
        this.logger.error(`❌ Failed to send email to ${to}`, error.response?.body || error.message);
      }
    } else {
      this.logger.log(`[MOCK EMAIL] To: ${to} | Subject: ${subject} | Body: ${text}`);
    }
  }

  async notifyNewJob(clientEmail: string, jobId: number, jobType: string) {
    await this.sendEmail(
      clientEmail,
      `Handrix: Job #${jobId} Confirmed!`,
      `Your request for ${jobType} has been received. We are searching for nearby handymen now! Check your status here: http://localhost:5173/`,
    );
  }

  async notifyJobAccepted(clientEmail: string, jobId: number, handymanName: string) {
    await this.sendEmail(
      clientEmail,
      `Handrix: Handyman Assigned!`,
      `Great news! ${handymanName} has accepted Job #${jobId} and is on their way.`,
    );
  }

  async notifyJobCompleted(clientEmail: string, jobId: number) {
    await this.sendEmail(
      clientEmail,
      `Handrix: Job #${jobId} Completed!`,
      `Your job has been marked as complete. A 90-day warranty has been issued. Thank you for using Handrix!`,
    );
  }
}
