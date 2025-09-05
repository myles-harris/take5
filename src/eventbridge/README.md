# Take5 EventBridge Configuration

This directory contains AWS EventBridge configuration and deployment scripts for the Take5 scheduling system.

## 📋 Overview

EventBridge is used to trigger the Take5 scheduling Lambda function on a regular schedule to check for groups that are due for calls.

## 🏗️ Architecture

```
EventBridge Rule (every 5 minutes)
    ↓
Lambda Function (take5-scheduling)
    ↓
PostgreSQL Database
    ↓
Group Scheduling Logic
```

## 📁 Files

### Core Configuration
- **`eventbridgeConfig.js`** - Main EventBridge configuration class
- **`deployEventBridge.js`** - Deployment and management scripts
- **`cloudWatchAlarms.js`** - CloudWatch alarms for monitoring
- **`README.md`** - This documentation

## 🚀 Quick Start

### Prerequisites
1. AWS CLI configured with appropriate permissions
2. Take5 Lambda function deployed: `arn:aws:lambda:us-east-1:507315734938:function:take5-scheduling`
3. Node.js and npm installed

### Install Dependencies
```bash
npm install aws-sdk
```

### Deploy EventBridge
```bash
# Deploy all EventBridge rules
node src/eventbridge/deployEventBridge.js deploy

# Test current configuration
node src/eventbridge/deployEventBridge.js test

# Create test rule (runs every minute)
node src/eventbridge/deployEventBridge.js test-rule

# Clean up all rules
node src/eventbridge/deployEventBridge.js cleanup
```

## 📅 EventBridge Rules

### 1. Main Scheduling Rule
- **Name**: `take5-scheduling-rule`
- **Schedule**: Every 5 minutes
- **Purpose**: Check for groups due for calls
- **Target**: Lambda function

### 2. Hourly Check Rule
- **Name**: `take5-hourly-check`
- **Schedule**: Every hour
- **Purpose**: Additional monitoring and validation
- **Target**: Lambda function

### 3. Daily Maintenance Rule
- **Name**: `take5-daily-maintenance`
- **Schedule**: Daily at 2 AM UTC
- **Purpose**: System maintenance and cleanup
- **Target**: Lambda function

## 🔧 Configuration

### EventBridge Configuration Class

```javascript
const { EventBridgeConfig } = require('./eventbridgeConfig');

const eventBridge = new EventBridgeConfig();

// Create main scheduling rule
await eventBridge.createSchedulingRule();

// Create custom rule
await eventBridge.createCustomRule('rate(1 hour)', 'custom-rule');

// List all rules
await eventBridge.listTake5Rules();

// Delete rule
await eventBridge.deleteRule('rule-name');
```

### Available Methods

#### Rule Management
- `createSchedulingRule()` - Create main scheduling rule
- `createCustomRule(scheduleExpression, ruleName)` - Create custom rule
- `listTake5Rules()` - List all Take5 rules
- `deleteRule(ruleName)` - Delete specific rule
- `setRuleState(ruleName, enabled)` - Enable/disable rule
- `getRuleDetails(ruleName)` - Get rule details

## 📊 CloudWatch Monitoring

### Alarms Created

#### Lambda Function Alarms
- **Take5-Lambda-Errors** - High error rate
- **Take5-Lambda-Duration** - Long execution time
- **Take5-Lambda-Throttles** - Function throttling
- **Take5-Lambda-ConcurrentExecutions** - High concurrency

#### EventBridge Alarms
- **Take5-EventBridge-FailedInvocations** - Failed Lambda invocations
- **Take5-EventBridge-DLQ** - Dead letter queue events

#### Business Metrics Alarms
- **Take5-Business-SchedulingErrors** - High scheduling errors

### Setup CloudWatch Alarms

```javascript
const { CloudWatchAlarms } = require('./cloudWatchAlarms');

const alarms = new CloudWatchAlarms();

// Create all alarms
await alarms.createLambdaAlarms();
await alarms.createEventBridgeAlarms();
await alarms.createBusinessAlarms();
await alarms.setupLogMonitoring();

// List alarms
await alarms.listAlarms();

// Delete alarms
await alarms.deleteAlarms();
```

## 🧪 Testing

### Test EventBridge Configuration
```bash
node src/eventbridge/deployEventBridge.js test
```

### Create Test Rule
```bash
# Creates a rule that runs every minute for testing
node src/eventbridge/deployEventBridge.js test-rule
```

### Monitor Execution
1. Check CloudWatch logs: `/aws/lambda/take5-scheduling`
2. Monitor EventBridge metrics in AWS Console
3. Check Lambda function metrics

## 🔒 Security

### IAM Permissions Required

The AWS credentials need the following permissions:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "events:PutRule",
                "events:PutTargets",
                "events:ListRules",
                "events:ListTargetsByRule",
                "events:DescribeRule",
                "events:EnableRule",
                "events:DisableRule",
                "events:DeleteRule",
                "events:RemoveTargets"
            ],
            "Resource": "*"
        },
        {
            "Effect": "Allow",
            "Action": [
                "lambda:AddPermission",
                "lambda:RemovePermission"
            ],
                            "Resource": "arn:aws:lambda:us-east-1:507315734938:function:take5-scheduling"
        },
        {
            "Effect": "Allow",
            "Action": [
                "cloudwatch:PutMetricAlarm",
                "cloudwatch:DescribeAlarms",
                "cloudwatch:DeleteAlarms",
                "cloudwatch:PutMetricData"
            ],
            "Resource": "*"
        },
        {
            "Effect": "Allow",
            "Action": [
                "logs:CreateLogGroup",
                "logs:PutMetricFilter",
                "logs:DeleteMetricFilter"
            ],
            "Resource": "*"
        }
    ]
}
```

## 📈 Monitoring and Alerting

### CloudWatch Dashboard

Create a CloudWatch dashboard with the following widgets:

1. **Lambda Function Metrics**
   - Invocations
   - Duration
   - Errors
   - Throttles

2. **EventBridge Metrics**
   - TriggeredRules
   - Invocations
   - FailedInvocations

3. **Custom Business Metrics**
   - GroupsScheduled
   - CallsInitiated
   - SchedulingErrors

### SNS Notifications

Set up SNS topics for alarm notifications:

```bash
# Create SNS topic
aws sns create-topic --name take5-alarms

# Subscribe email
aws sns subscribe \
    --topic-arn arn:aws:sns:us-east-1:507315734938:take5-alarms \
    --protocol email \
    --notification-endpoint your-email@example.com
```

## 🚨 Troubleshooting

### Common Issues

#### 1. EventBridge Rule Not Triggering
- Check rule state (ENABLED/DISABLED)
- Verify Lambda permissions
- Check CloudWatch logs for errors

#### 2. Lambda Function Not Receiving Events
- Verify EventBridge target configuration
- Check Lambda function ARN
- Review IAM permissions

#### 3. CloudWatch Alarms Not Working
- Verify metric filters are created
- Check alarm thresholds
- Review SNS topic configuration

### Debug Commands

```bash
# Check EventBridge rules
node src/eventbridge/deployEventBridge.js test

# List CloudWatch alarms
node -e "const { CloudWatchAlarms } = require('./src/eventbridge/cloudWatchAlarms.js'); new CloudWatchAlarms().listAlarms().catch(console.error);"

# Test Lambda function directly
aws lambda invoke \
    --function-name take5-scheduling \
    --payload '{"test": true}' \
    response.json
```

## 🔄 Maintenance

### Regular Tasks

1. **Monitor CloudWatch Alarms** - Check for any alarms in ALARM state
2. **Review Logs** - Monitor Lambda execution logs for errors
3. **Update Schedules** - Adjust rule schedules as needed
4. **Clean Up** - Remove test rules after testing

### Backup and Recovery

1. **Export Configuration** - Save rule configurations
2. **Document Changes** - Keep track of modifications
3. **Test Recovery** - Verify cleanup and redeployment works

## 📚 Additional Resources

- [AWS EventBridge Documentation](https://docs.aws.amazon.com/eventbridge/)
- [AWS Lambda Documentation](https://docs.aws.amazon.com/lambda/)
- [CloudWatch Alarms Documentation](https://docs.aws.amazon.com/cloudwatch/)
- [Take5 Lambda Functions](../lambda/README.md) 