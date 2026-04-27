import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Request,
  ValidationPipe,
} from '@nestjs/common';
import { PeriodsService } from './periods.service';
import { CreatePeriodDto } from './dto/create-period.dto';
import { JwtGuard } from '../auth/guards/jwt.guard';

@Controller('periods')
export class PeriodsController {
  constructor(private periodsService: PeriodsService) {}

  @Post()
  @UseGuards(JwtGuard)
  async createPeriod(
    @Request() req,
    @Body(ValidationPipe) createPeriodDto: CreatePeriodDto,
  ) {
    const period = await this.periodsService.createPeriod(
      req.user.id,
      createPeriodDto,
    );

    return {
      message: 'Period created successfully',
      data: period,
    };
  }

  @Get()
  @UseGuards(JwtGuard)
  async getPeriods(@Request() req) {
    const periods = await this.periodsService.getPeriodsByUserId(req.user.id);

    return {
      message: 'Periods retrieved successfully',
      data: periods,
    };
  }
}
