# Take5 EventBridge Deployment Guide

This guide provides step-by-step instructions for deploying the EventBridge configuration for the Take5 scheduling system.

## 🚀 Prerequisites

### 1. AWS CLI Configuration
```bash
# Install AWS CLI (if not already installed)
# macOS: brew install awscli
# Ubuntu: sudo apt-get install awscli

# Configure AWS credentials
aws configure

# Enter your AWS credentials:
# AWS Access Key ID: [your-access-key]
# AWS Secret Access Key: [your-secret-key]
# Default region name: us-east-1
# Default output format: json
```

### 2. Required IAM Permissions
Your AWS user/role needs the following permissions:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "events:*",
                "lambda:AddPermission",
                "lambda:RemovePermission",
                "cloudwatch:*",
                "logs:*"
            ],
            "Resource": "*"
        }
    ]
}
```

### 3. Lambda Function
Ensure the Lambda function is deployed:
- **Function Name**: `take5-scheduling`
- **ARN**: `arn:aws:lambda:us-east-1:507315734938:function:take5-scheduling`

## 📋 Deployment Steps

### Step 1: Install Dependencies
```bash
# Navigate to project directory
cd /path/to/take5

# Install AWS SDK
npm install aws-sdk
```

### Step 2: Test Configuration
```bash
# Test EventBridge structure (no AWS credentials required)
node src/eventbridge/testEventBridge.js
```

### Step 3: Deploy EventBridge Rules
```bash
# Deploy all EventBridge rules
node src/eventbridge/deployEventBridge.js deploy
```

**Expected Output:**
```
🚀 Deploying EventBridge for Take5 Scheduling...

📅 Step 1: Creating main scheduling rule...
✅ EventBridge rule created successfully: arn:aws:events:us-east-1:507315734938:rule/take5-scheduling-rule
✅ EventBridge target created successfully
✅ Lambda permission added successfully

📅 Step 2: Creating additional scheduling rules...
✅ Custom EventBridge rule created: take5-hourly-check
✅ Custom EventBridge rule created: take5-daily-maintenance

📋 Step 3: Listing all Take5 rules...
✅ Found Take5 rules: 3

🎉 EventBridge Deployment Complete!
```

### Step 4: Set Up CloudWatch Alarms
```bash
# Create a script to set up CloudWatch alarms
node -e "
const { CloudWatchAlarms } = require('./src/eventbridge/cloudWatchAlarms.js');
const alarms = new CloudWatchAlarms();

async function setupAlarms() {
    try {
        console.log('Setting up CloudWatch alarms...');
        await alarms.createLambdaAlarms();
        await alarms.createEventBridgeAlarms();
        await alarms.createBusinessAlarms();
        await alarms.setupLogMonitoring();
        console.log('✅ All CloudWatch alarms created successfully');
    } catch (error) {
        console.error('❌ Error setting up alarms:', error.message);
    }
}

setupAlarms();
"
```

### Step 5: Verify Deployment
```bash
# Test current configuration
node src/eventbridge/deployEventBridge.js test

# List CloudWatch alarms
node -e "
const { CloudWatchAlarms } = require('./src/eventbridge/cloudWatchAlarms.js');
new CloudWatchAlarms().listAlarms().catch(console.error);
"
```

## 🧪 Testing

### Test Lambda Function
```bash
# Option 1: Use the test script (recommended)
node src/eventbridge/testLambda.js

# Option 2: Test specific functionality
node src/eventbridge/testLambda.js basic        # Basic invocation
node src/eventbridge/testLambda.js eventbridge # EventBridge payload
node src/eventbridge/testLambda.js scheduling  # Scheduling logic

# Option 3: Use AWS CLI (if you prefer)
aws lambda invoke \
    --function-name take5-scheduling \
    --payload '{"test": true, "source": "manual-test"}' \
    --region us-east-1 \
    response.json

# Check response
cat response.json
```

### Monitor Execution
1. **CloudWatch Logs**: Check `/aws/lambda/take5-scheduling`
2. **EventBridge Metrics**: Monitor in AWS Console
3. **Lambda Metrics**: Check function performance

## 📊 Monitoring Setup

### 1. CloudWatch Dashboard
Create a CloudWatch dashboard with these widgets:

**Lambda Function Metrics:**
- Invocations
- Duration
- Errors
- Throttles

**EventBridge Metrics:**
- TriggeredRules
- Invocations
- FailedInvocations

**Custom Business Metrics:**
- GroupsScheduled
- CallsInitiated
- SchedulingErrors

### 2. SNS Notifications
```bash
# Create SNS topic
aws sns create-topic --name take5-alarms

# Subscribe email
aws sns subscribe \
    --topic-arn arn:aws:sns:us-east-1:507315734938:take5-alarms \
    --protocol email \
    --notification-endpoint your-email@example.com
```

### 3. CloudWatch Alarms
The deployment script creates these alarms:
- **Take5-Lambda-Errors**: High error rate
- **Take5-Lambda-Duration**: Long execution time
- **Take5-Lambda-Throttles**: Function throttling
- **Take5-EventBridge-FailedInvocations**: Failed Lambda invocations
- **Take5-Business-SchedulingErrors**: High scheduling errors

## 🔧 Configuration Options

### Customize Schedules
Edit `src/eventbridge/eventbridgeConfig.js` to modify schedules:

```javascript
// Main scheduling rule (default: every 5 minutes)
ScheduleExpression: 'rate(5 minutes)'

// Hourly check (default: every hour)
ScheduleExpression: 'rate(1 hour)'

// Daily maintenance (default: 2 AM UTC)
ScheduleExpression: 'cron(0 2 * * ? *)'
```

### Customize Alarm Thresholds
Edit `src/eventbridge/cloudWatchAlarms.js` to adjust thresholds:

```javascript
// Lambda duration threshold (default: 25 seconds)
Threshold: 25000

// Error rate threshold (default: 1 error)
Threshold: 1

// Concurrent executions threshold (default: 50)
Threshold: 50
```

## 🚨 Troubleshooting

### Common Issues

#### 1. "Missing credentials" Error
```bash
# Solution: Configure AWS credentials
aws configure
```

#### 2. "Access Denied" Error
```bash
# Solution: Check IAM permissions
aws iam get-user
aws iam list-attached-user-policies --user-name YOUR_USERNAME
```

#### 3. Lambda Function Not Found
```bash
# Solution: Verify Lambda function exists
aws lambda get-function --function-name take5-scheduling
```

#### 4. EventBridge Rule Not Triggering
```bash
# Check rule state
aws events describe-rule --name take5-scheduling-rule

# Check Lambda permissions
aws lambda get-policy --function-name take5-scheduling
```

### Debug Commands
```bash
# List all EventBridge rules
aws events list-rules --name-prefix take5

# Check Lambda logs
aws logs describe-log-groups --log-group-name-prefix /aws/lambda/take5-scheduling

# Test EventBridge manually
aws events put-events --entries '[{"Source":"manual.test","DetailType":"Test","Detail":"{\"test\":true}","EventBusName":"default"}]'

# Test Lambda function with proper JSON handling
node src/eventbridge/testLambda.js
```

## 🧹 Cleanup

### Remove EventBridge Rules
```bash
# Remove all Take5 rules
node src/eventbridge/deployEventBridge.js cleanup
```

### Remove CloudWatch Alarms
```bash
# Remove all Take5 alarms
node -e "
const { CloudWatchAlarms } = require('./src/eventbridge/cloudWatchAlarms.js');
new CloudWatchAlarms().deleteAlarms().catch(console.error);
"
```

### Remove SNS Topic
```bash
# Remove SNS topic (if created)
aws sns delete-topic --topic-arn arn:aws:sns:us-east-1:507315734938:take5-alarms
```

## 📈 Performance Optimization

### Lambda Function Settings
- **Memory**: 512 MB (adjust based on workload)
- **Timeout**: 30 seconds
- **Concurrency**: 1000 (adjust based on needs)

### EventBridge Optimization
- **Batch Size**: 1 (single Lambda invocation per event)
- **Retry Policy**: Default (2 retries)
- **Dead Letter Queue**: Optional (for failed events)

### Database Connection
- **Connection Pooling**: Configured in Lambda
- **Max Connections**: 10 per Lambda instance
- **Connection Timeout**: 30 seconds

## 🔒 Security Considerations

### IAM Best Practices
1. **Principle of Least Privilege**: Grant minimum required permissions
2. **Role-Based Access**: Use IAM roles instead of access keys
3. **Regular Rotation**: Rotate access keys regularly
4. **Audit Logging**: Enable CloudTrail for API calls

### Network Security
1. **VPC Configuration**: Place Lambda in VPC if needed
2. **Security Groups**: Restrict database access
3. **Encryption**: Enable encryption at rest and in transit

### Data Protection
1. **PII Handling**: Mask sensitive data in logs
2. **Data Retention**: Configure log retention policies
3. **Backup Strategy**: Regular database backups

## 📞 Support

For issues or questions:
1. Check CloudWatch logs for error details
2. Review AWS documentation
3. Test with simplified configuration
4. Monitor EventBridge metrics

## 📚 Additional Resources

- [AWS EventBridge Documentation](https://docs.aws.amazon.com/eventbridge/)
- [AWS Lambda Documentation](https://docs.aws.amazon.com/lambda/)
- [CloudWatch Alarms Documentation](https://docs.aws.amazon.com/cloudwatch/)
- [Take5 Lambda Functions](../lambda/README.md)
- [Take5 EventBridge Configuration](./README.md) 