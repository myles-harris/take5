# take5
app for staying connected

## Database Setup

This application uses PostgreSQL for data persistence. Follow these steps to set up the database:

### 1. Install PostgreSQL
Make sure you have PostgreSQL installed and running on your system.

### 2. Create Database
Create a new database for the application:
```sql
CREATE DATABASE take5;
```

### 3. Environment Configuration
Set up your environment variables. Create a `.env` file in the root directory with the following variables:

```
DB_USER=postgres
DB_HOST=localhost
DB_NAME=take5
DB_PASSWORD=your_password_here
DB_PORT=5432
SEED_DATABASE=false
```

### 4. Initialize Database
The database schema will be automatically created when you start the application. If you want to seed the database with initial data, set `SEED_DATABASE=true` in your environment variables.

### 5. Start the Application
```bash
npm install
node app.js
```

The application will automatically:
- Connect to the PostgreSQL database
- Create the necessary tables and indexes
- Seed the database if `SEED_DATABASE=true`
- Start the API server on port 3000

## API Endpoints

- `GET /api/user` - Get all users
- `GET /api/user/:id` - Get user by ID
- `POST /api/user` - Create new user
- `PUT /api/user/:id` - Update user
- `DELETE /api/user/:id` - Delete user

- `GET /api/group` - Get all groups
- `GET /api/group/:id` - Get group by ID
- `POST /api/group` - Create new group
- `PUT /api/group/:id` - Update group
- `DELETE /api/group/:id` - Delete group

### Chime (Phone Calls)
- `POST /api/chime/call` - Create a new phone call for a group
- `POST /api/chime/call/:callId/start` - Start an existing call
- `POST /api/chime/call/:callId/end` - End an active call
- `GET /api/chime/call/:callId/status` - Get call status and details
- `POST /api/chime/call/:callId/participant` - Add a participant to a call
- `DELETE /api/chime/call/:callId/participant/:participantId` - Remove a participant from a call
- `POST /api/chime/sms` - Send SMS notification to participants
- `GET /api/chime/analytics/:groupId` - Get call analytics for a group
- `POST /api/chime/schedule-group-call` - Schedule a call for a group based on scheduling service
