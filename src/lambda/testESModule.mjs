/**
 * Test script for ES Module Lambda Function
 * 
 * This script tests the Lambda function locally to ensure
 * the ES module conversion works correctly.
 */

import { handler, testScheduling } from './schedulingLambda.mjs';

async function testLambdaFunction() {
    console.log('🧪 Testing ES Module Lambda Function...\n');

    try {
        // Test 1: Basic handler function
        console.log('📤 Test 1: Basic handler function');
        const event = {
            source: 'test',
            timestamp: new Date().toISOString(),
            description: 'Test event'
        };

        const result = await handler(event, {});
        console.log('✅ Handler function executed successfully');
        console.log('📥 Response:', JSON.stringify(result, null, 2));

    } catch (error) {
        console.error('❌ Handler function failed:', error.message);
    }

    console.log('\n' + '='.repeat(50) + '\n');

    try {
        // Test 2: Test scheduling function
        console.log('📤 Test 2: Test scheduling function');
        const testEvent = {};

        const result = await testScheduling(testEvent, {});
        console.log('✅ Test scheduling function executed successfully');
        console.log('📥 Response:', JSON.stringify(result, null, 2));

    } catch (error) {
        console.error('❌ Test scheduling function failed:', error.message);
    }

    console.log('\n🎉 ES Module Lambda function tests completed!');
}

// Run the test
testLambdaFunction().catch(console.error); 