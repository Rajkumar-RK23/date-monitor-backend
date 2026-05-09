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
  app.enableCors();

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

  // const port = process.env.PORT || 3001;
  const port =  process.env.PORT || 3000;
  console.log('port:', port)
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}/api`);
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