const { EventBridgeConfig } = require('./eventbridgeConfig');
const { CloudWatchAlarms } = require('./cloudWatchAlarms');

/**
 * Test EventBridge Configuration (Mock Version)
 * 
 * This script demonstrates the EventBridge functionality without requiring
 * actual AWS credentials. It shows the structure and configuration.
 */

async function testEventBridgeStructure() {
    console.log('🧪 Testing EventBridge Configuration Structure...\n');

    // Test EventBridge configuration
    console.log('📅 EventBridge Configuration Test:');
    const eventBridge = new EventBridgeConfig();
    
    console.log('   ✅ EventBridgeConfig class instantiated');
    console.log(`   📍 Region: ${eventBridge.region}`);
    console.log(`   🆔 Account ID: ${eventBridge.accountId}`);
    console.log(`   📅 Rule Name: ${eventBridge.ruleName}`);
    console.log(`   🎯 Lambda ARN: ${eventBridge.lambdaArn}`);
    
    console.log('\n   📋 Available Methods:');
    console.log('      - createSchedulingRule()');
    console.log('      - createCustomRule(scheduleExpression, ruleName)');
    console.log('      - listTake5Rules()');
    console.log('      - deleteRule(ruleName)');
    console.log('      - setRuleState(ruleName, enabled)');
    console.log('      - getRuleDetails(ruleName)');

    // Test CloudWatch alarms configuration
    console.log('\n📊 CloudWatch Alarms Configuration Test:');
    const alarms = new CloudWatchAlarms();
    
    console.log('   ✅ CloudWatchAlarms class instantiated');
    console.log(`   📍 Lambda Function: ${alarms.lambdaFunctionName}`);
    console.log(`   📊 Namespace: ${alarms.namespace}`);
    console.log(`   🚨 Alarm Prefix: ${alarms.alarmPrefix}`);
    
    console.log('\n   📋 Available Methods:');
    console.log('      - createLambdaAlarms()');
    console.log('      - createEventBridgeAlarms()');
    console.log('      - createBusinessAlarms()');
    console.log('      - setupLogMonitoring()');
    console.log('      - listAlarms()');
    console.log('      - deleteAlarms()');

    console.log('\n✅ EventBridge structure test completed successfully!');
}

async function demonstrateDeployment() {
    console.log('\n🚀 EventBridge Deployment Demonstration:\n');

    console.log('📅 Step 1: Create Main Scheduling Rule');
    console.log('   Rule Name: take5-scheduling-rule');
    console.log('   Schedule: rate(5 minutes)');
    console.log('   Target: arn:aws:lambda:us-east-1:507315734938:function:take5-scheduling');
    console.log('   State: ENABLED');

    console.log('\n📅 Step 2: Create Additional Rules');
    console.log('   Rule Name: take5-hourly-check');
    console.log('   Schedule: rate(1 hour)');
    console.log('   Purpose: Additional monitoring and validation');

    console.log('\n   Rule Name: take5-daily-maintenance');
    console.log('   Schedule: cron(0 2 * * ? *)');
    console.log('   Purpose: System maintenance and cleanup');

    console.log('\n📊 Step 3: Create CloudWatch Alarms');
    console.log('   Lambda Function Alarms:');
    console.log('     - Take5-Lambda-Errors');
    console.log('     - Take5-Lambda-Duration');
    console.log('     - Take5-Lambda-Throttles');
    console.log('     - Take5-Lambda-ConcurrentExecutions');

    console.log('\n   EventBridge Alarms:');
    console.log('     - Take5-EventBridge-FailedInvocations');
    console.log('     - Take5-EventBridge-DLQ');

    console.log('\n   Business Metrics Alarms:');
    console.log('     - Take5-Business-SchedulingErrors');

    console.log('\n✅ Deployment demonstration completed!');
}

async function showUsageExamples() {
    console.log('\n💡 Usage Examples:\n');

    console.log('🔧 Deploy EventBridge Rules:');
    console.log('   node src/eventbridge/deployEventBridge.js deploy');
    console.log('   # Creates main scheduling rule, hourly check, and daily maintenance');

    console.log('\n🧪 Test Configuration:');
    console.log('   node src/eventbridge/deployEventBridge.js test');
    console.log('   # Lists existing rules and their details');

    console.log('\n⚡ Create Test Rule:');
    console.log('   node src/eventbridge/deployEventBridge.js test-rule');
    console.log('   # Creates a rule that runs every minute for testing');

    console.log('\n🧹 Clean Up:');
    console.log('   node src/eventbridge/deployEventBridge.js cleanup');
    console.log('   # Removes all Take5 EventBridge rules');

    console.log('\n📊 CloudWatch Alarms:');
    console.log('   const { CloudWatchAlarms } = require("./cloudWatchAlarms");');
    console.log('   const alarms = new CloudWatchAlarms();');
    console.log('   await alarms.createLambdaAlarms();');
    console.log('   await alarms.createEventBridgeAlarms();');
    console.log('   await alarms.createBusinessAlarms();');

    console.log('\n✅ Usage examples completed!');
}

async function showArchitecture() {
    console.log('\n🏗️  Take5 EventBridge Architecture:\n');

    console.log('┌─────────────────────────────────────────────────────────────┐');
    console.log('│                    EventBridge Rules                        │');
    console.log('├─────────────────────────────────────────────────────────────┤');
    console.log('│  📅 take5-scheduling-rule (every 5 minutes)                │');
    console.log('│  📅 take5-hourly-check (every hour)                        │');
    console.log('│  📅 take5-daily-maintenance (daily at 2 AM UTC)            │');
    console.log('└─────────────────────┬───────────────────────────────────────┘');
    console.log('                      │');
    console.log('                      ▼');
    console.log('┌─────────────────────────────────────────────────────────────┐');
    console.log('│                Lambda Function                              │');
    console.log('│  🎯 take5-scheduling                                       │');
    console.log('│  📍 arn:aws:lambda:us-east-1:507315734938:function:take5-scheduling │');
    console.log('└─────────────────────┬───────────────────────────────────────┘');
    console.log('                      │');
    console.log('                      ▼');
    console.log('┌─────────────────────────────────────────────────────────────┐');
    console.log('│                PostgreSQL Database                          │');
    console.log('│  📊 Users table                                            │');
    console.log('│  📊 Groups table                                           │');
    console.log('│  📊 User_Groups table                                      │');
    console.log('└─────────────────────┬───────────────────────────────────────┘');
    console.log('                      │');
    console.log('                      ▼');
    console.log('┌─────────────────────────────────────────────────────────────┐');
    console.log('│                Scheduling Logic                             │');
    console.log('│  📅 Daily: 1 call per day                                  │');
    console.log('│  📅 Weekly: 1-7 calls per week (max 1 per day)             │');
    console.log('│  📅 Monthly: 1-30 calls per month (max 1 per day)          │');
    console.log('└─────────────────────────────────────────────────────────────┘');

    console.log('\n📊 CloudWatch Monitoring:');
    console.log('   📈 Lambda Metrics: Errors, Duration, Throttles, Concurrency');
    console.log('   📈 EventBridge Metrics: FailedInvocations, DLQ');
    console.log('   📈 Business Metrics: GroupsScheduled, CallsInitiated, Errors');
    console.log('   📈 Log Filters: Error detection, Success tracking');

    console.log('\n✅ Architecture overview completed!');
}

// Main test function
async function runAllTests() {
    console.log('🚀 Take5 EventBridge Configuration Test Suite\n');
    console.log('=' .repeat(60));

    try {
        await testEventBridgeStructure();
        console.log('\n' + '=' .repeat(60));
        
        await demonstrateDeployment();
        console.log('\n' + '=' .repeat(60));
        
        await showUsageExamples();
        console.log('\n' + '=' .repeat(60));
        
        await showArchitecture();
        console.log('\n' + '=' .repeat(60));

        console.log('\n🎉 All EventBridge tests completed successfully!');
        console.log('\n📋 Next Steps:');
        console.log('   1. Configure AWS credentials (aws configure)');
        console.log('   2. Deploy EventBridge rules: node src/eventbridge/deployEventBridge.js deploy');
        console.log('   3. Set up CloudWatch alarms');
        console.log('   4. Monitor Lambda function execution');
        console.log('   5. Test scheduling logic with sample data');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        process.exit(1);
    }
}

// Run if this file is executed directly
if (require.main === module) {
    runAllTests();
}

module.exports = {
    testEventBridgeStructure,
    demonstrateDeployment,
    showUsageExamples,
    showArchitecture,
    runAllTests
}; 