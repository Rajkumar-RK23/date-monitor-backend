import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  console.log('Starting application...');
  const app = await NestFactory.create(AppModule);
 app.use((req, res, next) => {
    console.log('➡️ REQUEST:', req.method, req.url);
    next();
  });

  // Enable CORS
  const allowedOrigins = [
    'http://localhost:4200',
    'http://localhost:55082',
    'https://date-monitor-frontend.netlify.app',
    'https://69f01d85b3c66000076517d6--date-monitor-frontend.netlify.app',
  ];

  app.enableCors({
    origin: (origin, callback) => {
      console.log('CORS request origin:', origin);
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, false);
      }
    },
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'Accept'],
    exposedHeaders: ['Authorization'],
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });

  // Enable global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Set API prefix
  app.setGlobalPrefix('api');

  const port = parseInt(process.env.PORT || '8080', 10);
  const host = process.env.HOST || '0.0.0.0';
  console.log('NODE_ENV:', process.env.NODE_ENV);
  console.log('PORT:', process.env.PORT);
  console.log('HOST:', host);
  console.log('listen on:', host, port);

  await app.listen(port, host);
  console.log(`Application is running on: ${await app.getUrl()}`);
}

bootstrap();


        // table creation dummy
// -- date_monitor.users definition

// CREATE TABLE `users` (
//   `id` int unsigned NOT NULL AUTO_INCREMENT,
//   `email` varchar(255) NOT NULL,
//   `password` varchar(255) NOT NULL,
//   `husband_email` varchar(255) DEFAULT NULL,
//   `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
//   `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
//   `startDate` date DEFAULT NULL,
//   PRIMARY KEY (`id`),
//   UNIQUE KEY `email` (`email`)
// ) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;



// -- date_monitor.periods definition

// CREATE TABLE `periods` (
//   `id` int unsigned NOT NULL AUTO_INCREMENT,
//   `user_id` int unsigned NOT NULL,
//   `start_date` date NOT NULL,
//   `end_date` date DEFAULT NULL,
//   `next_period_date` date NOT NULL,
//   `reminder_date` date NOT NULL,
//   `is_notified` tinyint(1) DEFAULT '0',
//   `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
//   `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
//   PRIMARY KEY (`id`),
//   KEY `fk_user` (`user_id`),
//   CONSTRAINT `fk_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
// ) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;