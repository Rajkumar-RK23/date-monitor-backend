import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { SchedulerService } from './scheduler.service';
import { PeriodsModule } from '../periods/periods.module';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [ScheduleModule.forRoot(), PeriodsModule, EmailModule],
  providers: [SchedulerService],
})
export class SchedulerModule {}
