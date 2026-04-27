import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PeriodsService } from '../periods/periods.service';
import { EmailService } from '../email/email.service';

@Injectable()
export class SchedulerService {
  private readonly logger = new Logger(SchedulerService.name);

  constructor(
    private periodsService: PeriodsService,
    private emailService: EmailService,
  ) {}

  /**
   * Send period reminders every day at 9 PM (21:00)
   * Sends notifications continuously starting from reminderDate
   * Continues indefinitely until user adds a new period
   * Example: If period is 30th April (reminderDate 25th), notifications sent:
   * 25th May 9 PM, 26th May 9 PM, 27th May 9 PM... (continues daily at 9 PM)
   * Only stops when a new period is created or isNotified is manually marked true
   */
  @Cron(CronExpression.EVERY_DAY_AT_9PM) // 9 PM every day (21:00)
  async sendPeriodReminders() {
    this.logger.debug(
      '🕘 [9 PM] Running period reminder job...',
    );

    try {
      // Get all periods in notification window (reminderDate <= today, isNotified = false)
      const periods = await this.periodsService.getAllPeriodsForNotification();

      if (periods.length === 0) {
        this.logger.debug('No periods to notify - all reminders are current');
        return;
      }

      this.logger.log(
        `📧 Found ${periods.length} periods to notify at 9 PM`,
      );

      // Send emails for each period
      await Promise.allSettled(
        periods.map(async (period) => {
          try {
            // Convert nextPeriodDate to Date object if it's a string
            const nextPeriodDate = new Date(period.nextPeriodDate);

            const result = await this.emailService.sendPeriodReminder(
              period.user.email,
              period.user.husbandEmail,
              nextPeriodDate,
            );

            if (result.success) {
              this.logger.log(
                `✅ Email sent for period ${period.id} (nextPeriodDate: ${nextPeriodDate.toDateString()})`,
              );
            } else {
              this.logger.error(
                `❌ Failed to send email for period ${period.id}: ${result.message}`,
              );
            }
          } catch (error) {
            this.logger.error(
              `❌ Error sending email for period ${period.id}: ${error?.message}`,
            );
          }
        }),
      );
    } catch (error) {
      this.logger.error(`❌ Error in sendPeriodReminders: ${error?.message}`);
    }
  }

  /**
   * Mark reminders as notified after the period date has passed
   * Runs daily at 11 PM (23:00)
   * NOTE: This method is kept for backwards compatibility but is no longer active
   * Reminders continue indefinitely until a new period is created
   */
  @Cron('0 23 * * *') // 11 PM every day (23:00)
  async markOldRemindersAsNotified() {
    this.logger.debug('🌙 [11 PM] Skipping cleanup - reminders continue until new period is added');
    // No longer needed - reminders continue indefinitely
  }
}
