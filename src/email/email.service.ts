import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { SentMessageInfo } from 'nodemailer/lib/stream-transport';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter | null;
  private readonly logger = new Logger(EmailService.name);
  private emailEnabled = false;

  constructor() {
    const emailHost = process.env.EMAIL_HOST || 'sandbox.smtp.mailtrap.io';
    const emailPort = parseInt(process.env.EMAIL_PORT || '2525', 10);
    const emailUser = process.env.EMAIL_USER;
    const emailPassword = process.env.EMAIL_PASSWORD;
    console.log('EMAIL_USER:', process.env.EMAIL_USER);
    console.log('EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD);
    console.log('EMAIL_HOST:', process.env.EMAIL_HOST);
    // Check if credentials are configured (not placeholders)
    if (
      !emailUser ||
      !emailPassword ||
      emailUser === 'your-mailtrap-username' ||
      emailPassword === 'your-mailtrap-password'
    ) {
      this.logger.warn(
        '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
      );
      this.logger.warn(
        '⚠️  EMAIL CREDENTIALS NOT CONFIGURED - RUNNING IN DEVELOPMENT MODE',
      );
      this.logger.warn(
        'Emails will be logged to console instead of actually sent.',
      );
      this.logger.warn('');
      this.logger.warn(
        'To enable real email sending, update your .env file with:',
      );
      this.logger.warn('  EMAIL_HOST=sandbox.smtp.mailtrap.io');
      this.logger.warn('  EMAIL_PORT=2525 (or 465, 587, 25)');
      this.logger.warn('  EMAIL_USER=<your-mailtrap-username>');
      this.logger.warn('  EMAIL_PASSWORD=<your-mailtrap-password>');
      this.logger.warn('  EMAIL_FROM=noreply@period-monitor.local');
      this.logger.warn('');
      this.logger.warn('Get free Mailtrap account: https://mailtrap.io');
      this.logger.warn(
        '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
      );
      this.emailEnabled = false;
      this.transporter = null;
      return;
    }

    // Create SMTP transporter with proper configuration
    this.transporter = nodemailer.createTransport({
      host: emailHost,
      port: emailPort,
      secure: false,
      requireTLS: true,
      auth: {
        user: emailUser,
        pass: emailPassword,
      },
      logger: true,
      debug: true,
    });

    // Verify connection on init
    this.transporter.verify((error, success) => {
      if (error) {
        this.logger.error(
          `❌ Email transporter verification failed: ${error.message}`,
        );
        this.emailEnabled = false;
      } else if (success) {
        this.logger.log(
          '✅ Email transporter connected and ready to send emails',
        );
        this.emailEnabled = true;
      }
    });
  }

  /**
   * Send period reminder email
   */
  async sendPeriodReminder(
    userEmail: string,
    husbandEmail: string | null,
    nextPeriodDate: Date | string,
    frontendUrl: string = process.env.FRONTEND_URL || 'http://localhost:4200',
  ) {
    const formattedDate = new Date(nextPeriodDate).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const emailFrom = process.env.EMAIL_FROM || 'noreply@period-monitor.local';

    // Personalized HTML for the user
    const userHtml = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">📅 Period Reminder</h1>
        </div>
        <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px;">
          <p style="color: #333; font-size: 16px; margin: 0 0 15px 0;">Hi,</p>
          <p style="color: #555; font-size: 15px; line-height: 1.6; margin: 0 0 20px 0;">
            Your next period is expected on <strong>${formattedDate}</strong>.
          </p>
          <p style="color: #555; font-size: 15px; line-height: 1.6; margin: 0 0 25px 0;">
            Please visit the portal to log any changes and keep your records updated:
          </p>
          <div style="text-align: center; margin: 25px 0;">
            <a href="${frontendUrl}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 14px;">
              Open Portal →
            </a>
          </div>
          <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 25px 0;" />
          <p style="color: #999; font-size: 12px; margin: 0; text-align: center;">
            This is an automated reminder from Period Monitor.
          </p>
        </div>
      </div>
    `;

    // Partner email HTML
    const husbandHtml = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">👨‍👩‍👧 Partner Notification</h1>
        </div>
        <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px;">
          <p style="color: #333; font-size: 16px; margin: 0 0 15px 0;">Hi,</p>
          <p style="color: #555; font-size: 15px; line-height: 1.6; margin: 0 0 20px 0;">
            This is a reminder that your partner's next period is expected on <strong>${formattedDate}</strong>.
          </p>
          <p style="color: #555; font-size: 15px; line-height: 1.6; margin: 0 0 25px 0;">
            You can help support and keep track by visiting the portal:
          </p>
          <div style="text-align: center; margin: 25px 0;">
            <a href="${frontendUrl}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 14px;">
              Open Portal →
            </a>
          </div>
          <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 25px 0;" />
          <p style="color: #999; font-size: 12px; margin: 0; text-align: center;">
            This message was sent on behalf of your partner by Period Monitor.
          </p>
        </div>
      </div>
    `;

    // Development mode: Log to console instead of sending
    if (!this.emailEnabled) {
      this.logger.log('📧 [DEV MODE] Period reminder email details:');
      this.logger.log(`   To: ${userEmail}`);
      this.logger.log(`   Subject: 📅 Period Reminder — ${formattedDate}`);
      this.logger.log(`   Expected Date: ${formattedDate}`);
      this.logger.log(
        `   [HTML content would be rendered here in production]`,
      );

      if (husbandEmail) {
        this.logger.log('');
        this.logger.log('📧 [DEV MODE] Partner notification email details:');
        this.logger.log(`   To: ${husbandEmail}`);
        this.logger.log(
          `   Subject: 👨‍👩‍👧 Partner Period Reminder — ${formattedDate}`,
        );
        this.logger.log(`   Expected Date: ${formattedDate}`);
        this.logger.log(
          `   [HTML content would be rendered here in production]`,
        );
      }

      return {
        success: true,
        message: '[DEV MODE] Emails logged to console',
        userMessageId: 'dev-mode-user-' + Date.now(),
        husbandMessageId: husbandEmail
          ? 'dev-mode-husband-' + Date.now()
          : null,
      };
    }

    try {
      this.logger.log(`Sending period reminder email to ${userEmail}`);

      // Send to user

      const userResult = await this.transporter!.sendMail({
        from: emailFrom,
        to: userEmail,
        subject: `📅 Period Reminder — ${formattedDate}`,
        html: userHtml,
      });

      this.logger.log(
        `✅ User email sent successfully (ID: ${userResult.messageId})`,
      );

      // If husband email provided, send a separate tailored email
      let husbandResult: SentMessageInfo | null = null;
      if (husbandEmail) {
        this.logger.log(`Sending partner email to ${husbandEmail}`);
        husbandResult = await this.transporter!.sendMail({
          from: emailFrom,
          to: husbandEmail,
          subject: `👨‍👩‍👧 Partner Period Reminder — ${formattedDate}`,
          html: husbandHtml,
        });
        this.logger.log(
          `✅ Partner email sent successfully (ID: ${husbandResult?.messageId})`,
        );
      }

      return {
        success: true,
        message: 'Emails sent successfully',
        userMessageId: userResult.messageId,
        husbandMessageId: husbandResult ? husbandResult.messageId : null,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(
        `❌ Failed to send period reminder email: ${errorMessage}`,
      );

      return {
        success: false,
        message: 'Failed to send reminder emails',
        error: errorMessage,
      };
    }
  }
}
