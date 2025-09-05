# Take5 Lambda Function Deployment Guide

This guide provides instructions for deploying the Take5 scheduling Lambda function with ES module support.

## 🚀 Prerequisites

### 1. AWS CLI Configuration
```bash
# Configure AWS credentials for us-east-1
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
                "lambda:*",
                "logs:*",
                "iam:PassRole"
            ],
            "Resource": "*"
        }
    ]
}
```

## 📦 Lambda Function Files

### ES Module Files (Required)
- **`schedulingLambda.mjs`** - Main Lambda function handler
- **`schedulingService.mjs`** - Scheduling logic service
- **`groupRepository.mjs`** - Mock data repository
- **`cadenceType.mjs`** - Cadence constants

### Test Files
- **`testESModule.mjs`** - Local testing script
- **`schedulingLambda.test.js`** - Unit tests

## 🔧 Deployment Steps

### Step 1: Test Locally
```bash
# Test the ES module Lambda function locally
node src/lambda/testESModule.mjs
```

**Expected Output:**
```
🧪 Testing ES Module Lambda Function...

📤 Test 1: Basic handler function
✅ Handler function executed successfully
📥 Response: {
  "statusCode": 200,
  "body": "{\"timestamp\":\"2025-08-27T05:45:54.060Z\",\"groupsDue\":0,\"schedule\":[],\"summary\":{\"dailyGroups\":0,\"weeklyGroups\":0,\"monthlyGroups\":0,\"totalUsers\":0}}"
}

📤 Test 2: Test scheduling function
✅ Test scheduling function executed successfully
```

### Step 2: Create Deployment Package
```bash
# Create a deployment directory
mkdir -p lambda-deployment

# Copy ES module files
cp src/lambda/schedulingLambda.mjs lambda-deployment/
cp src/services/schedulingService.mjs lambda-deployment/
cp src/db/groupRepository.mjs lambda-deployment/
cp src/utils/constants/cadenceType.mjs lambda-deployment/

# Create package.json for ES modules
cat > lambda-deployment/package.json << EOF
{
  "name": "take5-scheduling-lambda",
  "version": "1.0.0",
  "type": "module",
  "description": "Take5 Scheduling Lambda Function",
  "main": "schedulingLambda.mjs",
  "engines": {
    "node": ">=18.0.0"
  }
}
EOF

# Create deployment zip
cd lambda-deployment
zip -r ../take5-scheduling-lambda.zip .
cd ..
```

### Step 3: Deploy to AWS Lambda
```bash
# Create Lambda function
aws lambda create-function \
    --function-name take5-scheduling \
    --runtime nodejs18.x \
    --handler schedulingLambda.handler \
    --role arn:aws:iam::507315734938:role/lambda-execution-role \
    --zip-file fileb://take5-scheduling-lambda.zip \
    --region us-east-1 \
    --timeout 30 \
    --memory-size 512 \
    --environment Variables='{
      "NODE_ENV":"production",
      "LOG_LEVEL":"info"
    }'

# Or update existing function
aws lambda update-function-code \
    --function-name take5-scheduling \
    --zip-file fileb://take5-scheduling-lambda.zip \
    --region us-east-1
```

### Step 4: Configure Function Settings
```bash
# Update function configuration
aws lambda update-function-configuration \
    --function-name take5-scheduling \
    --region us-east-1 \
    --timeout 30 \
    --memory-size 512 \
    --environment Variables='{
      "NODE_ENV":"production",
      "LOG_LEVEL":"info"
    }'
```

## 🧪 Testing

### Test Lambda Function
```bash
# Test basic invocation
aws lambda invoke \
    --function-name take5-scheduling \
    --payload '{"source": "test", "description": "Test invocation"}' \
    --region us-east-1 \
    response.json

# Check response
cat response.json
```

### Test with EventBridge Payload
```bash
# Test EventBridge-style payload
aws lambda invoke \
    --function-name take5-scheduling \
    --payload '{"source": "eventbridge", "timestamp": "2025-08-27T05:45:54.060Z", "description": "Take5 scheduling check"}' \
    --region us-east-1 \
    response.json

# Check response
cat response.json
```

### Test Scheduling Logic
```bash
# Test scheduling function directly
aws lambda invoke \
    --function-name take5-scheduling \
    --payload '{"test": true, "source": "scheduling-test"}' \
    --region us-east-1 \
    response.json

# Check response
cat response.json
```

## 📊 Monitoring

### CloudWatch Logs
```bash
# View Lambda logs
aws logs describe-log-groups \
    --log-group-name-prefix /aws/lambda/take5-scheduling \
    --region us-east-1

# Get recent log events
aws logs filter-log-events \
    --log-group-name /aws/lambda/take5-scheduling \
    --start-time $(date -d '1 hour ago' +%s)000 \
    --region us-east-1
```

### Lambda Metrics
```bash
# Get function metrics
aws cloudwatch get-metric-statistics \
    --namespace AWS/Lambda \
    --metric-name Invocations \
    --dimensions Name=FunctionName,Value=take5-scheduling \
    --start-time $(date -d '1 hour ago' -u +%Y-%m-%dT%H:%M:%S) \
    --end-time $(date -u +%Y-%m-%dT%H:%M:%S) \
    --period 300 \
    --statistics Sum \
    --region us-east-1
```

## 🔧 Configuration Options

### Environment Variables
```bash
# Set environment variables
aws lambda update-function-configuration \
    --function-name take5-scheduling \
    --region us-east-1 \
    --environment Variables='{
      "NODE_ENV":"production",
      "LOG_LEVEL":"info",
      "BUSINESS_HOURS_START":"9",
      "BUSINESS_HOURS_END":"20",
      "TIMEZONE":"UTC"
    }'
```

### Function Settings
```bash
# Update timeout and memory
aws lambda update-function-configuration \
    --function-name take5-scheduling \
    --region us-east-1 \
    --timeout 60 \
    --memory-size 1024

# Update concurrency
aws lambda put-function-concurrency \
    --function-name take5-scheduling \
    --region us-east-1 \
    --reserved-concurrent-executions 10
```

## 🚨 Troubleshooting

### Common Issues

#### 1. "require is not defined" Error
**Problem**: Lambda function is using CommonJS instead of ES modules
**Solution**: Ensure all files use `.mjs` extension and `import/export` syntax

#### 2. "Module not found" Error
**Problem**: Missing dependencies or incorrect import paths
**Solution**: Check import paths and ensure all required files are included in deployment package

#### 3. "Timeout" Error
**Problem**: Function execution takes too long
**Solution**: Increase timeout or optimize code performance

#### 4. "Memory exceeded" Error
**Problem**: Function uses more memory than allocated
**Solution**: Increase memory allocation or optimize memory usage

### Debug Commands
```bash
# Check function configuration
aws lambda get-function \
    --function-name take5-scheduling \
    --region us-east-1

# Check function code
aws lambda get-function-code \
    --function-name take5-scheduling \
    --region us-east-1

# List function versions
aws lambda list-versions-by-function \
    --function-name take5-scheduling \
    --region us-east-1

# Check function aliases
aws lambda list-aliases \
    --function-name take5-scheduling \
    --region us-east-1
```

## 🔄 Updates and Maintenance

### Update Function Code
```bash
# Create new deployment package
cd lambda-deployment
zip -r ../take5-scheduling-lambda-v2.zip .
cd ..

# Update function
aws lambda update-function-code \
    --function-name take5-scheduling \
    --zip-file fileb://take5-scheduling-lambda-v2.zip \
    --region us-east-1
```

### Create Function Version
```bash
# Publish new version
aws lambda publish-version \
    --function-name take5-scheduling \
    --description "v1.1.0 - Updated scheduling logic" \
    --region us-east-1
```

### Create Function Alias
```bash
# Create production alias
aws lambda create-alias \
    --function-name take5-scheduling \
    --name production \
    --function-version 1 \
    --region us-east-1

# Update alias to new version
aws lambda update-alias \
    --function-name take5-scheduling \
    --name production \
    --function-version 2 \
    --region us-east-1
```

## 🧹 Cleanup

### Remove Lambda Function
```bash
# Delete function
aws lambda delete-function \
    --function-name take5-scheduling \
    --region us-east-1

# Remove log group
aws logs delete-log-group \
    --log-group-name /aws/lambda/take5-scheduling \
    --region us-east-1
```

### Remove Deployment Files
```bash
# Clean up local files
rm -rf lambda-deployment/
rm take5-scheduling-lambda.zip
rm response.json
```

## 📚 Additional Resources

- [AWS Lambda Documentation](https://docs.aws.amazon.com/lambda/)
- [Node.js ES Modules](https://nodejs.org/api/esm.html)
- [Lambda Runtime](https://docs.aws.amazon.com/lambda/latest/dg/lambda-runtimes.html)
- [CloudWatch Logs](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/)
- [EventBridge Integration](../eventbridge/README.md) 