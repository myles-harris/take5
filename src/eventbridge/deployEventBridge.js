const { EventBridgeConfig } = require('./eventbridgeConfig');

/**
 * EventBridge Deployment Script for Take5
 * 
 * This script creates and configures EventBridge rules to trigger
 * the Take5 scheduling Lambda function.
 */

async function deployEventBridge() {
    console.log('🚀 Deploying EventBridge for Take5 Scheduling...\n');

    const eventBridge = new EventBridgeConfig();

    try {
        // Step 1: Create the main scheduling rule
        console.log('📅 Step 1: Creating main scheduling rule...');
        const mainRule = await eventBridge.createSchedulingRule();
        console.log(`✅ Main rule created: ${mainRule.ruleArn}\n`);

        // Step 2: Create additional rules for different scenarios
        console.log('📅 Step 2: Creating additional scheduling rules...');

        // Rule for hourly checks (for testing)
        const hourlyRule = await eventBridge.createCustomRule(
            'rate(1 hour)',
            'take5-hourly-check'
        );
        console.log(`✅ Hourly rule created: ${hourlyRule.ruleName}\n`);

        // Rule for daily maintenance (runs at 2 AM UTC)
        const dailyRule = await eventBridge.createCustomRule(
            'cron(0 2 * * ? *)',
            'take5-daily-maintenance'
        );
        console.log(`✅ Daily maintenance rule created: ${dailyRule.ruleName}\n`);

        // Step 3: List all created rules
        console.log('📋 Step 3: Listing all Take5 rules...');
        const allRules = await eventBridge.listTake5Rules();
        console.log(`✅ Total Take5 rules: ${allRules.length}\n`);

        // Step 4: Display deployment summary
        console.log('🎉 EventBridge Deployment Complete!\n');
        console.log('📊 Deployment Summary:');
        console.log('   📅 Main Scheduling Rule: take5-scheduling-rule');
        console.log('   📅 Hourly Check Rule: take5-hourly-check');
        console.log('   📅 Daily Maintenance Rule: take5-daily-maintenance');
        console.log('   🎯 Lambda Target: arn:aws:lambda:us-east-1:507315734938:function:take5-scheduling');
        console.log('   ⏰ Schedule: Every 5 minutes (main), Every hour (hourly), Daily at 2 AM UTC (maintenance)');
        console.log('\n🔧 Next Steps:');
        console.log('   1. Monitor CloudWatch logs for Lambda execution');
        console.log('   2. Set up CloudWatch alarms for failures');
        console.log('   3. Configure SNS notifications if needed');
        console.log('   4. Test the scheduling logic with sample data');

        return {
            success: true,
            rules: allRules,
            mainRule: mainRule,
            hourlyRule: hourlyRule,
            dailyRule: dailyRule
        };

    } catch (error) {
        console.error('❌ EventBridge deployment failed:', error);
        throw error;
    }
}

/**
 * Clean up EventBridge rules (for testing/development)
 */
async function cleanupEventBridge() {
    console.log('🧹 Cleaning up EventBridge rules...\n');

    const eventBridge = new EventBridgeConfig();

    try {
        // List all Take5 rules
        const rules = await eventBridge.listTake5Rules();
        
        if (rules.length === 0) {
            console.log('✅ No Take5 rules found to clean up');
            return;
        }

        // Delete each rule
        for (const rule of rules) {
            console.log(`🗑️  Deleting rule: ${rule.Name}`);
            await eventBridge.deleteRule(rule.Name);
        }

        console.log('✅ All Take5 EventBridge rules cleaned up successfully');

    } catch (error) {
        console.error('❌ Cleanup failed:', error);
        throw error;
    }
}

/**
 * Test EventBridge configuration
 */
async function testEventBridge() {
    console.log('🧪 Testing EventBridge configuration...\n');

    const eventBridge = new EventBridgeConfig();

    try {
        // List existing rules
        console.log('📋 Current Take5 rules:');
        const rules = await eventBridge.listTake5Rules();
        
        if (rules.length === 0) {
            console.log('   No rules found');
        } else {
            rules.forEach(rule => {
                console.log(`   📅 ${rule.Name}: ${rule.ScheduleExpression} (${rule.State})`);
            });
        }

        // Test rule details (if rules exist)
        if (rules.length > 0) {
            console.log('\n📊 Rule details:');
            for (const rule of rules.slice(0, 2)) { // Show first 2 rules
                const details = await eventBridge.getRuleDetails(rule.Name);
                console.log(`   📅 ${rule.Name}:`);
                console.log(`      Description: ${details.rule.Description}`);
                console.log(`      State: ${details.rule.State}`);
                console.log(`      Targets: ${details.targets.length}`);
                details.targets.forEach(target => {
                    console.log(`        🎯 ${target.Id}: ${target.Arn}`);
                });
            }
        }

        console.log('\n✅ EventBridge test completed successfully');

    } catch (error) {
        console.error('❌ EventBridge test failed:', error);
        throw error;
    }
}

/**
 * Create a test rule for immediate execution
 */
async function createTestRule() {
    console.log('🧪 Creating test rule for immediate execution...\n');

    const eventBridge = new EventBridgeConfig();

    try {
        // Create a rule that runs every minute for testing
        const testRule = await eventBridge.createCustomRule(
            'rate(1 minute)',
            'take5-test-rule'
        );

        console.log('✅ Test rule created successfully');
        console.log(`   Rule Name: ${testRule.ruleName}`);
        console.log(`   Schedule: Every 1 minute`);
        console.log(`   Lambda: ${eventBridge.lambdaArn}`);
        
        console.log('\n⚠️  Remember to delete this test rule after testing!');
        console.log('   Use: node src/eventbridge/deployEventBridge.js cleanup');

        return testRule;

    } catch (error) {
        console.error('❌ Test rule creation failed:', error);
        throw error;
    }
}

// CLI interface
async function main() {
    const command = process.argv[2];

    try {
        switch (command) {
            case 'deploy':
                await deployEventBridge();
                break;
            case 'cleanup':
                await cleanupEventBridge();
                break;
            case 'test':
                await testEventBridge();
                break;
            case 'test-rule':
                await createTestRule();
                break;
            default:
                console.log('🚀 Take5 EventBridge Deployment Tool\n');
                console.log('Usage:');
                console.log('  node src/eventbridge/deployEventBridge.js deploy     - Deploy all EventBridge rules');
                console.log('  node src/eventbridge/deployEventBridge.js cleanup   - Remove all Take5 rules');
                console.log('  node src/eventbridge/deployEventBridge.js test      - Test current configuration');
                console.log('  node src/eventbridge/deployEventBridge.js test-rule - Create test rule (runs every minute)');
                console.log('\nExamples:');
                console.log('  node src/eventbridge/deployEventBridge.js deploy');
                console.log('  node src/eventbridge/deployEventBridge.js test');
        }
    } catch (error) {
        console.error('❌ Command failed:', error.message);
        process.exit(1);
    }
}

// Run if this file is executed directly
if (require.main === module) {
    main();
}

module.exports = {
    deployEventBridge,
    cleanupEventBridge,
    testEventBridge,
    createTestRule
}; 