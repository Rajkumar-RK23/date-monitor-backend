  import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PeriodsModule } from './periods/periods.module';
import { SchedulerModule } from './scheduler/scheduler.module';
import { EmailModule } from './email/email.module';
import { ConfigModule } from '@nestjs/config'; // ✅ import this

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env', // ✅ ADD HERE
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST || 'turntable.proxy.rlwy.net',
      port: parseInt(process.env.DB_PORT || '29943'),
      username: process.env.DB_USERNAME || 'root',
      password: process.env.DB_PASSWORD || 'sUjUoSIHSAsLOWyEKLYQArUWsxkIXwrW',
      database: process.env.DB_DATABASE || 'railway',
      autoLoadEntities: true,
      synchronize: false,
      logging: true,
    }),

    AuthModule,
    UsersModule,
    PeriodsModule,
    SchedulerModule,
    EmailModule,
  ],
})
export class AppModule {}