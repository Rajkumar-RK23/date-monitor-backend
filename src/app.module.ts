  import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PeriodsModule } from './periods/periods.module';
import { SchedulerModule } from './scheduler/scheduler.module';
import { EmailModule } from './email/email.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      ignoreEnvFile: process.env.NODE_ENV === 'production',
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const dbHost = config.get<string>('MYSQLHOST') || config.get<string>('DB_HOST') || config.get<string>('MYSQL_HOST');
        const dbPort = config.get<string>('MYSQLPORT') || config.get<string>('DB_PORT') || config.get<string>('MYSQL_PORT');
        const dbUser = config.get<string>('MYSQLUSER') || config.get<string>('DB_USERNAME') || config.get<string>('MYSQL_USER');
        const dbPassword = config.get<string>('MYSQLPASSWORD') || config.get<string>('DB_PASSWORD') || config.get<string>('MYSQL_PASSWORD');
        const dbName = config.get<string>('MYSQLDATABASE') || config.get<string>('DB_DATABASE') || config.get<string>('MYSQL_DATABASE');

        return {
          type: 'mysql',
          host: dbHost || 'turntable.proxy.rlwy.net',
          port: parseInt(dbPort || '29943', 10),
          username: dbUser || 'root',
          password: dbPassword || 'sUjUoSIHSAsLOWyEKLYQArUWsxkIXwrW',
          database: dbName || 'railway',
          autoLoadEntities: true,
          synchronize: false,
          logging: true,
        };
      },
    }),

    AuthModule,
    UsersModule,
    PeriodsModule,
    SchedulerModule,
    EmailModule,
  ],
})
export class AppModule {}