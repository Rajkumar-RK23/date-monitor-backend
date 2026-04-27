import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../users/entities/user.entity';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { Period } from '../periods/entities/period.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Period)
    private periodsRepository: Repository<Period>,
    private jwtService: JwtService,
  ) {}

  async signup(signupDto: SignupDto) {
    console.log('signup:', signupDto)
    const { email, password, husbandEmail, startDate } = signupDto;
    console.log('signupDto:', signupDto)

    // Check if user already exists
    const existingUser = await this.usersRepository.findOne({
      where: { email },
    });

    if (existingUser) {
      throw new BadRequestException('Email already registered');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const user = this.usersRepository.create({
      email,
      password: hashedPassword,
      husbandEmail,
      startDate: startDate ? new Date(startDate) : null,
    });

    console.log('user:', user)
    await this.usersRepository.save(user);

    // If startDate provided, create initial period record
    if (startDate) {
      const s = new Date(startDate);
      const next = new Date(s);
      next.setDate(next.getDate() + 28);
      const reminder = new Date(next);
      reminder.setDate(reminder.getDate() - 5);

      const period = this.periodsRepository.create({
        userId: user.id,
        startDate: s,
        nextPeriodDate: next,
        reminderDate: reminder,
        isNotified: false,
      });

      await this.periodsRepository.save(period);
    }

    // Generate JWT token
    const token = this.jwtService.sign({ id: user.id, email: user.email });

    return {
      message: 'User created successfully',
      access_token: token,
      user: {
        id: user.id,
        email: user.email,
        husbandEmail: user.husbandEmail,
      },
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // Find user by email
    const user = await this.usersRepository.findOne({ where: { email } });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Compare passwords
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Generate JWT token
    const token = this.jwtService.sign({ id: user.id, email: user.email });

    return {
      message: 'Login successful',
      access_token: token,
      user: {
        id: user.id,
        email: user.email,
        husbandEmail: user.husbandEmail,
      },
    };
  }

  async changePassword(userId: number, changePasswordDto: ChangePasswordDto) {
    const { currentPassword, newPassword } = changePasswordDto;

    // Find user
    const user = await this.usersRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password,
    );

    if (!isPasswordValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user password
    await this.usersRepository.update(userId, {
      password: hashedPassword,
    });

    return {
      message: 'Password changed successfully',
    };
  }

  async validateUser(id: number, email: string) {
    const user = await this.usersRepository.findOne({ where: { id, email } });
    if (!user) {
      console.error(`[JWT] User validation failed - User not found: id=${id}, email=${email}`);
      return null;
    }
    console.log(`[JWT] User validated successfully: id=${id}, email=${email}`);
    return user;
  }
}
