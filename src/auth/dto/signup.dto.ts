import { IsEmail, IsString, MinLength, IsOptional, IsDateString } from 'class-validator';

export class SignupDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsEmail()
  husbandEmail: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;
}
