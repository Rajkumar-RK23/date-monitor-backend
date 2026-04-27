# Date Monitor - Backend API

A production-ready NestJS backend for a Period Monitor System with JWT authentication, MySQL database, and automated email notifications.

## Features

✅ **Authentication Module**
- User signup with email validation
- User login with JWT tokens
- Change password functionality
- Password hashing with bcrypt

✅ **User Management**
- User profile management
- Husband email for notifications

✅ **Period Tracking**
- Add period start date
- Optional end date
- Automatic calculation of next period date (start date + 28 days)
- Automatic calculation of reminder date (next period - 5 days)
- Period history tracking

✅ **Email Notifications**
- Daily cron job (9 AM) to check for upcoming reminders
- Send emails to user and husband (if provided)
- Automatic marking of notifications as sent
- HTML email templates

✅ **Security**
- JWT authentication
- bcrypt password hashing
- Protected routes with JWT Guard
- Input validation with class-validator
- CORS enabled

## Tech Stack

- **Runtime**: Node.js
- **Framework**: NestJS 11
- **Database**: MySQL 8+
- **ORM**: TypeORM
- **Authentication**: JWT + Passport.js
- **Password Hashing**: bcrypt
- **Email**: Nodemailer
- **Task Scheduling**: @nestjs/schedule
- **Validation**: class-validator & class-transformer

## Prerequisites

- Node.js 18+
- MySQL 8+
- npm or yarn

## Installation

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Create Database Tables

Run the SQL scripts to create the required tables:

```sql
CREATE TABLE date_monitor.users (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    husband_email VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE date_monitor.periods (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNSIGNED NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    next_period_date DATE NOT NULL,
    reminder_date DATE NOT NULL,
    is_notified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);
```

### 3. Environment Setup

Create a `.env` file in the backend directory with the following variables:

```bash
# Copy from .env.example
cp .env.example .env
```

Update `.env` with your actual values:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=root
DB_DATABASE=date_monitor

# JWT Configuration
JWT_SECRET=your-super-secret-key-change-in-production

# Email Configuration
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# Application
PORT=3001
NODE_ENV=development
```

**Note for Gmail**: You need to create an [App Password](https://support.google.com/accounts/answer/185833) in your Google Account settings.

## Running the Application

### Development Mode (with hot reload)

```bash
npm run start:dev
```

### Production Mode

```bash
npm run build
npm run start:prod
```

### Run Tests

```bash
# Unit tests
npm run test

# Watch mode
npm run test:watch

# Coverage
npm run test:cov

# E2E tests
npm run test:e2e
```

## API Endpoints

### Authentication

#### Sign Up
```http
POST /api/auth/signup
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123",
  "husbandEmail": "husband@example.com"
}

Response:
{
  "message": "User created successfully",
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "husbandEmail": "husband@example.com"
  }
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123"
}

Response:
{
  "message": "Login successful",
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "husbandEmail": "husband@example.com"
  }
}
```

#### Change Password
```http
PUT /api/auth/change-password
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "currentPassword": "oldPassword123",
  "newPassword": "newPassword456"
}

Response:
{
  "message": "Password changed successfully"
}
```

### Users

#### Get Profile
```http
GET /api/users/profile
Authorization: Bearer {access_token}

Response:
{
  "id": 1,
  "email": "user@example.com",
  "husbandEmail": "husband@example.com",
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

### Periods

#### Add Period
```http
POST /api/periods
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "startDate": "2024-04-24",
  "endDate": "2024-04-29"
}

Response:
{
  "message": "Period created successfully",
  "data": {
    "id": 1,
    "userId": 1,
    "startDate": "2024-04-24",
    "endDate": "2024-04-29",
    "nextPeriodDate": "2024-05-22",
    "reminderDate": "2024-05-17",
    "isNotified": false,
    "createdAt": "2024-04-24T10:30:00Z",
    "updatedAt": "2024-04-24T10:30:00Z"
  }
}
```

#### Get Periods
```http
GET /api/periods
Authorization: Bearer {access_token}

Response:
{
  "message": "Periods retrieved successfully",
  "data": [
    {
      "id": 1,
      "userId": 1,
      "startDate": "2024-04-24",
      "endDate": "2024-04-29",
      "nextPeriodDate": "2024-05-22",
      "reminderDate": "2024-05-17",
      "isNotified": false,
      "createdAt": "2024-04-24T10:30:00Z",
      "updatedAt": "2024-04-24T10:30:00Z"
    }
  ]
}
```

## Project Structure

```
src/
├── auth/
│   ├── dto/
│   │   ├── signup.dto.ts
│   │   ├── login.dto.ts
│   │   └── change-password.dto.ts
│   ├── guards/
│   │   └── jwt.guard.ts
│   ├── strategies/
│   │   └── jwt.strategy.ts
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   └── auth.module.ts
├── users/
│   ├── entities/
│   │   └── user.entity.ts
│   ├── users.controller.ts
│   ├── users.service.ts
│   └── users.module.ts
├── periods/
│   ├── dto/
│   │   └── create-period.dto.ts
│   ├── entities/
│   │   └── period.entity.ts
│   ├── periods.controller.ts
│   ├── periods.service.ts
│   └── periods.module.ts
├── scheduler/
│   ├── scheduler.service.ts
│   └── scheduler.module.ts
├── email/
│   ├── email.service.ts
│   └── email.module.ts
├── app.module.ts
└── main.ts
```

## Key Features Implementation

### Auto-calculated Dates

When a period is created:
- **nextPeriodDate** = startDate + 28 days
- **reminderDate** = nextPeriodDate - 5 days

Example:
- Period starts: April 24
- Next period: May 22 (April 24 + 28 days)
- Reminder: May 17 (May 22 - 5 days)

### Email Notifications

The system runs a cron job **every day at 9 AM** that:
1. Finds all periods where reminderDate equals today and isNotified = false
2. Sends HTML email to user and husband (if provided)
3. Marks the period as notified after successful email send
4. Logs all activities for monitoring

### Security

- All passwords are hashed using bcrypt with salt rounds of 10
- JWT tokens expire after 24 hours
- Protected routes require valid JWT in Authorization header
- Input validation on all endpoints
- CORS is enabled for frontend integration

## Environment Variables Explained

| Variable | Description | Default |
|----------|-------------|---------|
| `DB_HOST` | MySQL server host | localhost |
| `DB_PORT` | MySQL server port | 3306 |
| `DB_USERNAME` | MySQL username | root |
| `DB_PASSWORD` | MySQL password | root |
| `DB_DATABASE` | Database name | date_monitor |
| `JWT_SECRET` | Secret key for JWT signing | your-secret-key |
| `EMAIL_SERVICE` | Email service provider | gmail |
| `EMAIL_USER` | Email account | - |
| `EMAIL_PASSWORD` | Email password/app password | - |
| `PORT` | Application port | 3001 |
| `NODE_ENV` | Environment (development/production) | development |

## Troubleshooting

### Email not sending?

1. Ensure you're using an App Password (not your regular Gmail password)
2. Check that EMAIL_USER and EMAIL_PASSWORD are correct in .env
3. For non-Gmail: Update EMAIL_SERVICE and SMTP settings

### Database connection error?

1. Verify MySQL is running
2. Check database credentials in .env
3. Ensure database `date_monitor` exists
4. Run the SQL schema creation scripts

### JWT Guard not working?

1. Ensure token is sent in Authorization header as `Bearer {token}`
2. Check JWT_SECRET is consistent between signup and protected routes
3. Verify token hasn't expired (24 hour expiry)

## Development Notes

- Database synchronization is disabled (`synchronize: false`) - always run migrations
- Logging is enabled in development mode
- CORS is enabled for all origins in development
- ValidationPipe whitelist is enabled to prevent unexpected properties

## License

UNLICENSED

## Support

For issues or questions, please check the database logs and application console output for detailed error messages.
