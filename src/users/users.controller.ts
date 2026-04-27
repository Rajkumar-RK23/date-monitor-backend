import { Controller, Get, UseGuards, Request, Put, Body, ValidationPipe } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('profile')
  @UseGuards(JwtGuard)
  async getProfile(@Request() req) {
    return this.usersService.getProfile(req.user.id);
  }

  @Put('profile')
  @UseGuards(JwtGuard)
  async updateProfile(@Request() req, @Body(ValidationPipe) dto: UpdateProfileDto) {
    return this.usersService.updateProfile(req.user.id, dto as any);
  }
}
