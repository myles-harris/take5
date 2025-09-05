const AWS = require('aws-sdk');

// Configure AWS SDK
AWS.config.update({
    region: 'us-east-1'
});

const lambda = new AWS.Lambda();

/**
 * Test Lambda Function Invocation
 * 
 * This script properly invokes the Take5 scheduling Lambda function
 * with correct JSON formatting to avoid encoding issues.
 */

async function testLambdaInvocation() {
    console.log('🧪 Testing Lambda Function Invocation...\n');

    try {
        // Test payload
        const payload = {
            test: true,
            source: 'manual-test',
            timestamp: new Date().toISOString(),
            description: 'Test invocation from EventBridge deployment'
        };

        console.log('📤 Invoking Lambda function...');
        console.log(`   Function: take5-scheduling`);
        console.log(`   Region: us-east-1`);
        console.log(`   Payload:`, JSON.stringify(payload, null, 2));

        const params = {
            FunctionName: 'take5-scheduling',
            Payload: JSON.stringify(payload),
            InvocationType: 'RequestResponse'
        };

        const result = await lambda.invoke(params).promise();
        
        console.log('\n✅ Lambda invocation successful!');
        console.log(`   Status Code: ${result.StatusCode}`);
        console.log(`   Log Result: ${result.LogResult || 'No logs'}`);
        
        // Parse and display the response
        if (result.Payload) {
            const response = JSON.parse(result.Payload.toString());
            console.log('\n📥 Response:');
            console.log(JSON.stringify(response, null, 2));
        }

        return result;

    } catch (error) {
        console.error('❌ Lambda invocation failed:', error.message);
        
        if (error.code === 'ResourceNotFoundException') {
            console.log('\n💡 Troubleshooting:');
            console.log('   - Verify the Lambda function exists in us-east-1');
            console.log('   - Check the function name: take5-scheduling');
            console.log('   - Ensure AWS credentials are configured');
        } else if (error.code === 'AccessDeniedException') {
            console.log('\n💡 Troubleshooting:');
            console.log('   - Check IAM permissions for Lambda invoke');
            console.log('   - Verify AWS credentials have proper access');
        }
        
        throw error;
    }
}

async function testEventBridgePayload() {
    console.log('\n📅 Testing EventBridge-style payload...\n');

    try {
        // Simulate EventBridge payload
        const eventBridgePayload = {
            source: 'eventbridge',
            timestamp: new Date().toISOString(),
            description: 'Take5 scheduling check',
            ruleName: 'take5-scheduling-rule',
            scheduleExpression: 'rate(5 minutes)'
        };

        console.log('📤 Invoking with EventBridge payload...');
        console.log(`   Payload:`, JSON.stringify(eventBridgePayload, null, 2));

        const params = {
            FunctionName: 'take5-scheduling',
            Payload: JSON.stringify(eventBridgePayload),
            InvocationType: 'RequestResponse'
        };

        const result = await lambda.invoke(params).promise();
        
        console.log('\n✅ EventBridge payload test successful!');
        console.log(`   Status Code: ${result.StatusCode}`);
        
        if (result.Payload) {
            const response = JSON.parse(result.Payload.toString());
            console.log('\n📥 Response:');
            console.log(JSON.stringify(response, null, 2));
        }

        return result;

    } catch (error) {
        console.error('❌ EventBridge payload test failed:', error.message);
        throw error;
    }
}

async function testSchedulingLogic() {
    console.log('\n🧮 Testing Scheduling Logic...\n');

    try {
        // Test payload with scheduling-specific data
        const schedulingPayload = {
            test: true,
            source: 'scheduling-test',
            currentTime: new Date().toISOString(),
            description: 'Test scheduling logic with sample groups',
            groups: [
                {
                    id: 1,
                    name: 'Daily Test Group',
                    cadence: 'daily',
                    frequency: 1,
                    enabled: true,
                    rollCall: {}
                },
                {
                    id: 2,
                    name: 'Weekly Test Group',
                    cadence: 'weekly',
                    frequency: 3,
                    enabled: true,
                    rollCall: {
                        '2024-01-15T10:00:00.000Z': ['user1']
                    }
                }
            ]
        };

        console.log('📤 Testing scheduling logic...');
        console.log(`   Payload:`, JSON.stringify(schedulingPayload, null, 2));

        const params = {
            FunctionName: 'take5-scheduling',
            Payload: JSON.stringify(schedulingPayload),
            InvocationType: 'RequestResponse'
        };

        const result = await lambda.invoke(params).promise();
        
        console.log('\n✅ Scheduling logic test successful!');
        console.log(`   Status Code: ${result.StatusCode}`);
        
        if (result.Payload) {
            const response = JSON.parse(result.Payload.toString());
            console.log('\n📥 Response:');
            console.log(JSON.stringify(response, null, 2));
        }

        return result;

    } catch (error) {
        console.error('❌ Scheduling logic test failed:', error.message);
        throw error;
    }
}

// CLI interface
async function main() {
    const command = process.argv[2] || 'all';

    try {
        switch (command) {
            case 'basic':
                await testLambdaInvocation();
                break;
            case 'eventbridge':
                await testEventBridgePayload();
                break;
            case 'scheduling':
                await testSchedulingLogic();
                break;
            case 'all':
                await testLambdaInvocation();
                await testEventBridgePayload();
                await testSchedulingLogic();
                break;
            default:
                console.log('🧪 Take5 Lambda Function Test Tool\n');
                console.log('Usage:');
                console.log('  node src/eventbridge/testLambda.js basic        - Test basic Lambda invocation');
                console.log('  node src/eventbridge/testLambda.js eventbridge - Test EventBridge-style payload');
                console.log('  node src/eventbridge/testLambda.js scheduling  - Test scheduling logic');
                console.log('  node src/eventbridge/testLambda.js all         - Run all tests (default)');
                console.log('\nExamples:');
                console.log('  node src/eventbridge/testLambda.js');
                console.log('  node src/eventbridge/testLambda.js basic');
        }
    } catch (error) {
        console.error('\n❌ Test failed:', error.message);
        process.exit(1);
    }
}

// Run if this file is executed directly
if (require.main === module) {
    main();
}

module.exports = {
    testLambdaInvocation,
    testEventBridgePayload,
    testSchedulingLogic
}; 