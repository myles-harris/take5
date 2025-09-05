# Take5 AWS Chime Integration

This document describes the AWS Chime SDK for Voice integration in the Take5 application, which handles outbound phone calls to group members.

## 📞 Overview

The Chime integration provides:
- **Outbound calling** to group members
- **Call management** (start, join, end calls)
- **SMS notifications** to participants
- **Call analytics** and metrics
- **Integration** with the scheduling system

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Scheduling    │    │   Chime Service │    │   AWS Chime     │
│   Service       │───▶│                 │───▶│   SDK for Voice │
│                 │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Group Data    │    │   Call Status   │    │   Phone Calls   │
│   (PostgreSQL)  │    │   Tracking      │    │   to Users      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🔧 Setup Requirements

### 1. AWS Chime SDK for Voice
- **Region**: `us-east-1` (Chime SDK for Voice is only available in us-east-1)
- **Phone Number**: Outbound phone number for making calls
- **Voice Connector**: Configured for outbound calling

### 2. Environment Variables
```bash
# Chime Configuration
CHIME_OUTBOUND_PHONE_NUMBER=your-chime-phone-number-id
CHIME_RECORDING_ENABLED=false
AWS_REGION=us-east-1

# AWS Credentials (if not using IAM roles)
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
```

### 3. IAM Permissions
Your AWS user/role needs the following permissions:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "chime:*",
                "sns:Publish",
                "cloudwatch:PutMetricData",
                "cloudwatch:GetMetricStatistics"
            ],
            "Resource": "*"
        }
    ]
}
```

## 📡 API Endpoints

### Call Management

#### `POST /api/chime/call`
Create a new phone call for a group.

**Request:**
```json
{
    "groupId": 1,
    "scheduledTime": "2025-08-27T10:00:00.000Z"
}
```

**Response:**
```json
{
    "message": "Call created successfully",
    "call": {
        "callId": "take5-1-1693123456789",
        "status": "created",
        "groupId": 1,
        "groupName": "Daily Check-in",
        "participants": 3,
        "scheduledTime": "2025-08-27T10:00:00.000Z",
        "duration": 5,
        "phoneNumbers": ["+15551234567", "+15559876543"]
    }
}
```

#### `POST /api/chime/call/:callId/start`
Start an existing call.

**Response:**
```json
{
    "message": "Call started successfully",
    "call": {
        "callId": "take5-1-1693123456789",
        "status": "started",
        "timestamp": "2025-08-27T10:00:00.000Z"
    }
}
```

#### `POST /api/chime/call/:callId/end`
End an active call.

**Response:**
```json
{
    "message": "Call ended successfully",
    "call": {
        "callId": "take5-1-1693123456789",
        "status": "ended",
        "timestamp": "2025-08-27T10:05:00.000Z"
    }
}
```

#### `GET /api/chime/call/:callId/status`
Get call status and details.

**Response:**
```json
{
    "call": {
        "callId": "take5-1-1693123456789",
        "status": "in-progress",
        "participants": [
            {
                "participantId": "participant-123",
                "phoneNumber": "+15551234567",
                "status": "connected"
            }
        ],
        "startTime": "2025-08-27T10:00:00.000Z",
        "endTime": null,
        "duration": 300
    }
}
```

### Participant Management

#### `POST /api/chime/call/:callId/participant`
Add a participant to a call.

**Request:**
```json
{
    "phoneNumber": "5551234567"
}
```

**Response:**
```json
{
    "message": "Participant added successfully",
    "participant": {
        "callId": "take5-1-1693123456789",
        "phoneNumber": "+15551234567",
        "participantId": "participant-456",
        "status": "added"
    }
}
```

#### `DELETE /api/chime/call/:callId/participant/:participantId`
Remove a participant from a call.

**Response:**
```json
{
    "message": "Participant removed successfully",
    "participant": {
        "callId": "take5-1-1693123456789",
        "participantId": "participant-456",
        "status": "removed"
    }
}
```

### SMS Notifications

#### `POST /api/chime/sms`
Send SMS notification to participants.

**Request:**
```json
{
    "phoneNumbers": ["5551234567", "5559876543"],
    "message": "Your Take5 call is starting in 5 minutes!"
}
```

**Response:**
```json
{
    "message": "SMS sent successfully",
    "result": {
        "sent": 2,
        "failed": 0,
        "results": [...]
    }
}
```

### Analytics

#### `GET /api/chime/analytics/:groupId`
Get call analytics for a group.

**Query Parameters:**
- `startDate`: Start date for analytics (ISO string)
- `endDate`: End date for analytics (ISO string)

**Response:**
```json
{
    "analytics": {
        "groupId": 1,
        "period": {
            "start": "2025-08-20T00:00:00.000Z",
            "end": "2025-08-27T00:00:00.000Z"
        },
        "metrics": [...],
        "summary": {
            "totalCalls": 7,
            "averageCalls": 1.0,
            "maxCalls": 1
        }
    }
}
```

### Scheduling Integration

#### `POST /api/chime/schedule-group-call`
Schedule a call for a group based on scheduling service.

**Request:**
```json
{
    "groupId": 1
}
```

**Response:**
```json
{
    "message": "Group call scheduled successfully",
    "call": {
        "callId": "take5-1-1693123456789",
        "status": "created",
        "groupId": 1,
        "groupName": "Daily Check-in",
        "participants": 3,
        "scheduledTime": "2025-08-28T10:00:00.000Z",
        "duration": 5
    },
    "nextCallTime": "2025-08-28T10:00:00.000Z"
}
```

## 🔄 Integration with Scheduling

The Chime service integrates with the scheduling system:

1. **Scheduling Service** determines which groups are due for calls
2. **Lambda Function** triggers call creation via API
3. **Chime Service** creates and manages the actual phone calls
4. **Call Status** is tracked and logged for analytics

### Example Flow:
```
1. EventBridge triggers Lambda function
2. Lambda determines groups due for calls
3. Lambda calls /api/chime/schedule-group-call
4. Chime service creates call with group members
5. Call is started automatically or manually
6. Call status is tracked throughout
7. Analytics are logged to CloudWatch
```

## 📊 Monitoring and Metrics

### CloudWatch Metrics
The Chime service logs the following metrics to CloudWatch:

- **CallCreated**: Number of calls created
- **CallStarted**: Number of calls started
- **CallEnded**: Number of calls ended
- **CallCreationFailed**: Failed call creations
- **CallStartFailed**: Failed call starts
- **CallEndFailed**: Failed call ends

### Metrics Namespace
```
Take5/Calls
```

### Dimensions
- **Environment**: development/production
- **GroupId**: Specific group ID

## 🧪 Testing

### Local Testing
```bash
# Test call creation
curl -X POST http://localhost:3000/api/chime/call \
  -H "Content-Type: application/json" \
  -d '{
    "groupId": 1,
    "scheduledTime": "2025-08-27T10:00:00.000Z"
  }'

# Test call status
curl http://localhost:3000/api/chime/call/take5-1-1693123456789/status

# Test SMS sending
curl -X POST http://localhost:3000/api/chime/sms \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumbers": ["5551234567"],
    "message": "Test SMS from Take5"
  }'
```

### AWS Testing
```bash
# Test with AWS credentials configured
aws chime-sdk-voice list-phone-numbers --region us-east-1

# Test SNS SMS
aws sns publish \
  --phone-number +15551234567 \
  --message "Test SMS from Take5" \
  --region us-east-1
```

## 🚨 Error Handling

### Common Errors

1. **Invalid Phone Number Format**
   ```json
   {
     "error": "Invalid phone number format",
     "phoneNumber": "1234567890"
   }
   ```

2. **Group Not Found**
   ```json
   {
     "error": "Group not found",
     "groupId": 999
   }
   ```

3. **No Users in Group**
   ```json
   {
     "error": "Group has no users to call",
     "groupId": 1
   }
   ```

4. **AWS Service Errors**
   ```json
   {
     "error": "Internal server error",
     "message": "AccessDenied: User is not authorized to perform: chime:CreateCall"
   }
   ```

## 🔒 Security Considerations

1. **Phone Number Validation**: All phone numbers are validated and formatted
2. **Call ID Validation**: Call IDs must match the expected pattern
3. **Group Access**: Only valid group IDs are accepted
4. **AWS IAM**: Proper permissions required for Chime operations
5. **Rate Limiting**: Consider implementing rate limiting for API endpoints

## 📈 Performance Considerations

1. **Call Limits**: Chime has limits on concurrent calls
2. **Phone Number Limits**: Each phone number has usage limits
3. **API Rate Limits**: AWS API calls have rate limits
4. **Cost Optimization**: Monitor call duration and frequency

## 🔄 Future Enhancements

1. **Call Recording**: Enable call recording for compliance
2. **Transcription**: Add speech-to-text for call content
3. **Call Analytics**: Enhanced analytics and reporting
4. **Multi-Region**: Support for multiple AWS regions
5. **WebRTC**: Add web-based calling capabilities
6. **Call Queuing**: Implement call queuing for high-volume scenarios

## 📚 Additional Resources

- [AWS Chime SDK for Voice Documentation](https://docs.aws.amazon.com/chime-sdk/latest/dg/voice-sdk.html)
- [Chime API Reference](https://docs.aws.amazon.com/chime-sdk/latest/APIReference/API_Operations.html)
- [SNS SMS Documentation](https://docs.aws.amazon.com/sns/latest/dg/sns-mobile-phone-number-as-subscriber.html)
- [CloudWatch Metrics](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/working_with_metrics.html) 

## **🎉 AWS Chime Integration Complete!**

I've successfully implemented the AWS Chime SDK for Voice integration as the final piece of your Take5 backend. Here's what was added:

### **📞 Chime Service Features**

1. **Call Management**:
   - Create outbound calls to group members
   - Start, end, and monitor call status
   - Add/remove participants during calls

2. **SMS Notifications**:
   - Send SMS alerts to participants
   - Pre-call notifications
   - Call reminders

3. **Analytics & Monitoring**:
   - CloudWatch metrics integration
   - Call analytics and reporting
   - Performance monitoring

4. **Scheduling Integration**:
   - Automatic call scheduling based on group cadence
   - Integration with the existing scheduling service
   - Lambda function triggers

### **🔧 API Endpoints Added**

- **`POST /api/chime/call`** - Create phone calls for groups
- **`POST /api/chime/call/:callId/start`** - Start calls
- **`POST /api/chime/call/:callId/end`** - End calls
- **`GET /api/chime/call/:callId/status`** - Get call status
- **`POST /api/chime/call/:callId/participant`** - Add participants
- **`DELETE /api/chime/call/:callId/participant/:participantId`** - Remove participants
- **`POST /api/chime/sms`** - Send SMS notifications
- **`GET /api/chime/analytics/:groupId`** - Get call analytics
- **`POST /api/chime/schedule-group-call`** - Schedule calls automatically

### **🏗️ Complete Backend Architecture**

Your Take5 backend now includes:

1. ✅ **Data Models** - User and Group entities
2. ✅ **PostgreSQL Database** - Persistent data storage
3. ✅ **Scheduling Service** - Call timing logic
4. ✅ **AWS Lambda** - Serverless scheduling execution
5. ✅ **EventBridge** - Automated triggers
6. ✅ **AWS Chime** - Phone call management

### **🔄 Complete Workflow**

```
1. EventBridge triggers Lambda function
2. Lambda determines groups due for calls
3. Lambda calls Chime API to create calls
4. Chime service manages phone calls
5. SMS notifications sent to participants
6. Call status tracked and logged
7. Analytics available via API
```

### **📚 Documentation**

- **`src/services/README.md`** - Comprehensive Chime integration guide
- **Updated main README** - Added Chime API endpoints
- **Validation schemas** - Added for all Chime endpoints

### **🚀 Next Steps**

1. **Configure AWS Chime**:
   - Set up Chime SDK for Voice in us-east-1
   - Obtain outbound phone number
   - Configure IAM permissions

2. **Environment Setup**:
   ```bash
   CHIME_OUTBOUND_PHONE_NUMBER=your-chime-phone-number-id
   CHIME_RECORDING_ENABLED=false
   AWS_REGION=us-east-1
   ```

3. **Test the Integration**:
   ```bash
   # Test call creation
   curl -X POST http://localhost:3000/api/chime/call \
     -H "Content-Type: application/json" \
     -d '{"groupId": 1, "scheduledTime": "2025-08-27T10:00:00.000Z"}'
   ```

**Your Take5 backend is now complete with full phone call capabilities!** 🎉

The system can automatically schedule, create, and manage phone calls for groups based on their cadence and frequency settings, with comprehensive monitoring and analytics. 