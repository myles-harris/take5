# Take5 - Group Video Calling App

A Node.js application for scheduling and managing group video calls with automatic notifications.

## Architecture

- **Backend**: Express.js with PostgreSQL database
- **Video Calling**: Twilio Video API
- **SMS Notifications**: Twilio SMS
- **Scheduling**: Local scheduling service (no AWS Lambda/EventBridge)
- **Database**: PostgreSQL with connection pooling

## Features

- User and Group management
- Automated call scheduling based on cadence (daily, weekly, monthly)
- Video call creation with Twilio Video
- SMS notifications for call invitations
- Local scheduling service with in-memory call tracking
- RESTful API endpoints

## Quick Start

### Prerequisites

- Node.js (v14 or higher)
- PostgreSQL database
- Twilio account with Video and SMS capabilities

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd take5
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Set up the database:
```bash
# Create PostgreSQL database
createdb take5

# The app will automatically create tables on first run
```

5. Start the server:
```bash
npm start
```

The API will be available at `http://localhost:3000`

## Environment Variables

See `.env.example` for all required environment variables:

- **Database**: `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`
- **Twilio**: `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER`
- **Optional**: `TWILIO_API_KEY_SID`, `TWILIO_API_KEY_SECRET`, `TWILIO_WEBHOOK_URL`

## API Endpoints

### Users
- `GET /api/user` - Get all users
- `GET /api/user/:id` - Get user by ID
- `POST /api/user` - Create new user
- `PUT /api/user/:id` - Update user
- `DELETE /api/user/:id` - Delete user

### Groups
- `GET /api/group` - Get all groups
- `GET /api/group/:id` - Get group by ID
- `POST /api/group` - Create new group
- `PUT /api/group/:id` - Update group
- `DELETE /api/group/:id` - Delete group
- `POST /api/group/:id/users` - Add user to group
- `DELETE /api/group/:id/users/:userId` - Remove user from group

### Twilio Video Calls
- `POST /api/twilio/call` - Create video call
- `GET /api/twilio/call/:roomSid` - Get call status
- `DELETE /api/twilio/call/:roomSid` - End call
- `POST /api/twilio/call/:roomSid/participants` - Add participant
- `DELETE /api/twilio/call/:roomSid/participants/:participantSid` - Remove participant
- `POST /api/twilio/sms` - Send SMS notification
- `GET /api/twilio/analytics/:roomSid` - Get call analytics

### Scheduling
- `GET /api/scheduling/calls` - Get all scheduled calls
- `GET /api/scheduling/calls/group/:groupId` - Get group scheduled calls
- `POST /api/scheduling/schedule` - Schedule a call
- `DELETE /api/scheduling/calls/:callId` - Cancel scheduled call
- `GET /api/scheduling/stats` - Get scheduling statistics
- `GET /api/scheduling/next/:groupId` - Get next call time for group
- `POST /api/scheduling/validate` - Validate group scheduling
- `POST /api/scheduling/check` - Force check scheduled calls
- `POST /api/scheduling/start` - Start scheduling service
- `POST /api/scheduling/stop` - Stop scheduling service

## Scheduling Logic

The local scheduling service automatically:

1. **Calculates next call times** based on group cadence and frequency
2. **Enforces business rules**:
   - Daily cadence: frequency must be 1 (one call per day)
   - Weekly cadence: frequency 1-7 (calls per week)
   - Monthly cadence: frequency 1-30 (calls per month)
   - Maximum 1 call per day per group
3. **Schedules calls** in memory with automatic execution
4. **Sends notifications** via Twilio SMS
5. **Tracks call history** in group roll call data

## Database Schema

### Users Table
- `id` (SERIAL PRIMARY KEY)
- `given_name` (VARCHAR)
- `family_name` (VARCHAR)
- `phone_number` (VARCHAR, UNIQUE)
- `timezone` (VARCHAR)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### Groups Table
- `id` (SERIAL PRIMARY KEY)
- `name` (VARCHAR)
- `cadence` (VARCHAR: daily, weekly, monthly)
- `frequency` (INTEGER)
- `duration` (INTEGER)
- `enabled` (BOOLEAN)
- `roll_call` (JSONB)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### User Groups Table (Many-to-Many)
- `user_id` (INTEGER, FOREIGN KEY)
- `group_id` (INTEGER, FOREIGN KEY)
- `created_at` (TIMESTAMP)

## Development

### Running Tests
```bash
npm test
```

### Database Migrations
The database schema is automatically created on first run. To reset:
```bash
# Drop and recreate database
dropdb take5 && createdb take5
npm start
```

### Local Development
```bash
# Start with auto-reload
npm run dev

# Or start normally
npm start
```

## Deployment

### Environment Setup
1. Set up PostgreSQL database
2. Configure Twilio account and get credentials
3. Set all required environment variables
4. Start the application

### Production Considerations
- Use connection pooling for database
- Set up proper logging
- Configure Twilio webhooks for call status updates
- Consider using Redis for scheduling service persistence
- Set up monitoring and alerting

## Troubleshooting

### Common Issues

1. **Database Connection**: Ensure PostgreSQL is running and credentials are correct
2. **Twilio Configuration**: Verify all Twilio credentials are set correctly
3. **SMS Notifications**: Check Twilio account limits and phone number format
4. **Scheduling**: Ensure scheduling service is running (`GET /api/scheduling/stats`)

### Logs
Check application logs for detailed error information. The scheduling service logs all activities.

## License

ISC
