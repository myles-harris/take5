# Take5 Lambda Functions

This directory contains AWS Lambda functions for the Take5 scheduling system.

## 📋 Overview

The Lambda functions handle the core scheduling logic for Take5, determining when groups should receive calls based on their cadence and frequency settings.

## 🚀 Lambda Functions

### 1. `handler` - Main Scheduling Function
**Purpose**: Determines which groups are due for calls
**Trigger**: EventBridge (cron schedule)
**Input**: EventBridge event
**Output**: Groups scheduled for calls

**Features**:
- Enforces 1-call-per-day rule
- Validates frequency based on cadence
- Ensures business hours compliance
- Provides detailed scheduling information

**Example Response**:
```json
{
  "statusCode": 200,
  "body": {
    "timestamp": "2024-01-18T12:00:00.000Z",
    "groupsDue": 2,
    "schedule": [
      {
        "groupId": 1,
        "groupName": "Daily Check-in",
        "nextCallTime": "2024-01-19T14:30:00.000Z",
        "duration": 5,
        "cadence": "daily",
        "frequency": 1,
        "isValidFrequency": true,
        "users": [...],
        "schedulingInfo": {
          "businessHoursOK": true,
          "lastCallTime": "2024-01-18T14:30:00.000Z"
        }
      }
    ],
    "summary": {
      "dailyGroups": 1,
      "weeklyGroups": 1,
      "monthlyGroups": 0,
      "totalUsers": 5
    }
  }
}
```

### 2. `generateGroupSchedule` - Future Schedule Generator
**Purpose**: Generate future call schedule for a specific group
**Input**: `{ groupId: number, numberOfCalls: number }`
**Output**: Array of scheduled call times

**Example Input**:
```json
{
  "groupId": 1,
  "numberOfCalls": 5
}
```

**Example Response**:
```json
{
  "statusCode": 200,
  "body": {
    "groupId": 1,
    "groupName": "Weekly Team Sync",
    "schedule": [
      "2024-01-19T14:30:00.000Z",
      "2024-01-22T11:15:00.000Z",
      "2024-01-25T16:45:00.000Z"
    ],
    "schedulingInfo": {
      "cadence": "weekly",
      "frequency": 3,
      "maxCallsPerDay": 1,
      "businessHours": "9 AM - 8 PM (daily/weekly), 10 AM - 6 PM (monthly)",
      "randomization": "Random time within business hours, random days for weekly/monthly"
    }
  }
}
```

### 3. `testScheduling` - Testing Function
**Purpose**: Test scheduling logic with sample data
**Input**: Empty event
**Output**: Test results and validation

**Features**:
- Tests frequency validation
- Validates scheduling logic
- Provides detailed test results

### 4. `validateAllGroups` - Data Integrity Check
**Purpose**: Validate all groups in the database
**Input**: Empty event
**Output**: Validation results for all groups

**Features**:
- Checks frequency validity
- Validates business hours compliance
- Reports issues and summary

## 📅 Scheduling Rules

### Daily Cadence
- **Frequency**: Always `1` (no other options)
- **Logic**: 1 call per day, randomized time within business hours
- **Business Hours**: 9 AM - 8 PM

### Weekly Cadence
- **Frequency**: `1-7` calls per week (max 1 per day)
- **Logic**: Randomly selects N different days within 7-day period
- **Business Hours**: 9 AM - 8 PM

### Monthly Cadence
- **Frequency**: `1-30` calls per month (max 1 per day)
- **Logic**: Randomly selects N different days within 30-day period
- **Business Hours**: 10 AM - 6 PM

## 🧪 Testing

### Run Lambda Tests
```bash
node src/lambda/testLambda.js
```

### Test Individual Functions
```bash
# Test scheduling logic
node -e "const { testScheduling } = require('./src/lambda/schedulingLambda.js'); testScheduling({}, {}).then(console.log).catch(console.error);"

# Test group validation
node -e "const { validateAllGroups } = require('./src/lambda/schedulingLambda.js'); validateAllGroups({}, {}).then(console.log).catch(console.error);"
```

## 🔧 Deployment

### AWS Lambda Setup
1. **Create Lambda Function**:
   ```bash
   aws lambda create-function \
     --function-name take5-scheduling \
     --runtime nodejs18.x \
     --handler schedulingLambda.handler \
     --role arn:aws:iam::YOUR_ACCOUNT:role/lambda-execution-role \
     --zip-file fileb://schedulingLambda.zip
   ```

2. **Set Environment Variables**:
   ```bash
   aws lambda update-function-configuration \
     --function-name take5-scheduling \
     --environment Variables='{
       "DB_USER":"postgres",
       "DB_HOST":"your-rds-endpoint",
       "DB_NAME":"take5",
       "DB_PASSWORD":"your-password",
       "DB_PORT":"5432"
     }'
   ```

3. **Create EventBridge Rule**:
   ```bash
   aws events put-rule \
     --name take5-scheduling-rule \
     --schedule-expression "rate(5 minutes)" \
     --state ENABLED
   ```

4. **Add Lambda Permission**:
   ```bash
   aws lambda add-permission \
     --function-name take5-scheduling \
     --statement-id EventBridgeInvoke \
     --action lambda:InvokeFunction \
     --principal events.amazonaws.com \
     --source-arn arn:aws:events:REGION:ACCOUNT:rule/take5-scheduling-rule
   ```

5. **Create EventBridge Target**:
   ```bash
   aws events put-targets \
     --rule take5-scheduling-rule \
     --targets "Id"="1","Arn"="arn:aws:lambda:REGION:ACCOUNT:function:take5-scheduling"
   ```

## 📊 Monitoring

### CloudWatch Metrics
- `calls_scheduled` - Number of calls scheduled
- `calls_started` - Number of calls initiated
- `calls_ended` - Number of calls completed
- `dial_failures` - Number of failed call attempts
- `avg_setup_ms` - Average call setup time

### CloudWatch Logs
- Structured JSON logging with correlation IDs
- PII redaction (phone numbers masked)
- Error tracking and debugging information

## 🔒 Security

### IAM Permissions
The Lambda execution role needs:
- **RDS**: Connect to PostgreSQL database
- **CloudWatch**: Write logs and metrics
- **SNS**: Send notifications (if implemented)
- **Chime**: Initiate calls (if implemented)

### Environment Variables
- Database credentials
- API keys (if using external services)
- Feature flags

## 🚨 Error Handling

### Common Errors
- **Database Connection**: Retry with exponential backoff
- **Invalid Frequency**: Log warning, skip group
- **Business Hours**: Adjust call time automatically
- **User Not Found**: Log error, continue with other users

### Retry Logic
- Database connection failures: 3 retries
- API timeouts: 2 retries
- Invalid data: Skip and log

## 📈 Performance

### Optimization
- Connection pooling for database
- Batch processing for multiple groups
- Caching for frequently accessed data
- Async processing for non-critical operations

### Limits
- **Timeout**: 30 seconds
- **Memory**: 512 MB (adjustable)
- **Concurrent Executions**: 1000 (adjustable)
- **Database Connections**: 10 per instance 