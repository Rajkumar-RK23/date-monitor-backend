import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Period } from './entities/period.entity';
import { CreatePeriodDto } from './dto/create-period.dto';

@Injectable()
export class PeriodsService {
  private readonly logger = new Logger(PeriodsService.name);

  constructor(
    @InjectRepository(Period)
    private periodsRepository: Repository<Period>,
  ) {}

  /**
   * Calculate next period date (current start date + 28 days)
   */
  private calculateNextPeriodDate(startDate: Date): Date {
    const nextDate = new Date(startDate);
    nextDate.setDate(nextDate.getDate() + 28);
    return nextDate;
  }

  /**
   * Calculate reminder date (next period date - 5 days)
   */
  private calculateReminderDate(nextPeriodDate: Date): Date {
    const reminderDate = new Date(nextPeriodDate);
    reminderDate.setDate(reminderDate.getDate() - 5);
    return reminderDate;
  }

  async createPeriod(userId: number, createPeriodDto: CreatePeriodDto) {
    const { startDate, endDate } = createPeriodDto;

    // Parse start date
    const parsedStartDate = new Date(startDate);

    // Get the last unnotified period to close it
    const lastPeriod = await this.periodsRepository.findOne({
      where: { userId, isNotified: false },
      order: { createdAt: 'DESC' },
    });

    // If there's a previous period, update its end date and mark as notified
    if (lastPeriod) {
      this.logger.log(
        `📌 Closing previous period ${lastPeriod.id} - setting endDate to new period start date`,
      );
      await this.periodsRepository.update(lastPeriod.id, {
        endDate: parsedStartDate,
        isNotified: true,
      });
      this.logger.log(
        `✅ Previous period ${lastPeriod.id} closed and marked as notified`,
      );
    }

    // Calculate next period and reminder dates for NEW period
    const nextPeriodDate = this.calculateNextPeriodDate(parsedStartDate);
    const reminderDate = this.calculateReminderDate(nextPeriodDate);

    // Create new period record
    const period = this.periodsRepository.create({
      user: { id: userId },
      startDate: parsedStartDate,
      endDate: endDate ? new Date(endDate) : null,
      nextPeriodDate,
      reminderDate,
      isNotified: false,
    });

    const savedPeriod = await this.periodsRepository.save(period);
    this.logger.log(
      `📝 New period ${savedPeriod.id} created - reminderDate: ${reminderDate.toDateString()}, nextPeriodDate: ${nextPeriodDate.toDateString()}`,
    );

    return savedPeriod;
  }

  async getPeriodsByUserId(userId: number) {
    return this.periodsRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async getPeriodById(id: number, userId: number) {
    return this.periodsRepository.findOne({
      where: { id, userId },
    });
  }

  async findUpcomingReminderPeriods() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return this.periodsRepository.find({
      where: {
        reminderDate: today,
        isNotified: false,
      },
      relations: ['user'],
    });
  }

  async markAsNotified(periodId: number) {
    return this.periodsRepository.update(periodId, { isNotified: true });
  }

  /**
   * Get periods where nextPeriodDate has passed but not yet marked as notified
   * These old periods will be automatically superseded by new periods
   * No need for cleanup - new periods take priority
   */
  async getOldUnnotifiedPeriods() {
    // This method is no longer needed since we keep sending notifications
    // until a new period is created
    return [];
  }

  /**
   * Get all periods for notification
   * Sends reminders continuously from reminderDate onwards
   * Continues sending UNTIL a new period is added
   * Example: If period is 30th April, reminderDate is 25th
   * Notifications sent: 25th, 26th, 27th, 28th, 29th, 30th, 1st May, 2nd May... (continues indefinitely)
   * Stops when user creates a new period or isNotified is marked true
   */
  async getAllPeriodsForNotification() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Find periods where:
    // reminderDate <= today AND isNotified === false
    // This sends notifications every day starting from reminderDate
    // and continues indefinitely until a new period is added
    const periods = await this.periodsRepository
      .createQueryBuilder('period')
      .where('period.reminderDate <= :today', { today })
      .andWhere('period.isNotified = :isNotified', { isNotified: false })
      .leftJoinAndSelect('period.user', 'user')
      .orderBy('period.reminderDate', 'ASC')
      .getMany();

    this.logger.log(
      `Found ${periods.length} periods in reminder notification (reminderDate <= today AND isNotified === false)`,
    );

    return periods;
  }
}
