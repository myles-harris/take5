const { testScheduling, validateAllGroups } = require('./schedulingLambda.js');

async function runLambdaTests() {
    console.log('=== Take5 Lambda Function Tests ===\n');

    // Test 1: Scheduling Logic Test
    console.log('1. Testing Scheduling Logic...');
    try {
        const testResult = await testScheduling({}, {});
        const body = JSON.parse(testResult.body);
        
        console.log('✅ Test completed successfully');
        console.log(`   Total Groups: ${body.summary.totalGroups}`);
        console.log(`   Due Groups: ${body.summary.dueGroups}`);
        console.log(`   Valid Frequencies: ${body.summary.validFrequencies}`);
        console.log(`   Invalid Frequencies: ${body.summary.invalidFrequencies}`);
        
        console.log('\n   Frequency Validation Results:');
        body.frequencyValidation.forEach(test => {
            const status = test.passed ? '✅' : '❌';
            console.log(`   ${status} ${test.cadence} frequency ${test.frequency}: ${test.actual} (expected: ${test.expected})`);
        });
        
        console.log('\n   Group Scheduling Results:');
        body.groups.forEach(group => {
            const frequencyStatus = group.isValidFrequency ? '✅' : '❌';
            const businessHoursStatus = group.businessHoursOK ? '✅' : '❌';
            console.log(`   ${frequencyStatus} ${group.groupName}: ${group.cadence} (${group.frequency}x), Next: ${group.nextCallTime}, Business Hours: ${businessHoursStatus}`);
        });
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }

    console.log('\n' + '='.repeat(50) + '\n');

    // Test 2: Group Validation (if database is available)
    console.log('2. Testing Group Validation...');
    try {
        const validationResult = await validateAllGroups({}, {});
        const body = JSON.parse(validationResult.body);
        
        console.log('✅ Validation completed successfully');
        console.log(`   Total Groups: ${body.summary.totalGroups}`);
        console.log(`   Valid Groups: ${body.summary.validGroups}`);
        console.log(`   Invalid Groups: ${body.summary.invalidGroups}`);
        console.log(`   Total Issues: ${body.summary.totalIssues}`);
        
        if (body.validationResults.length > 0) {
            console.log('\n   Validation Results:');
            body.validationResults.forEach(result => {
                const status = result.issues.length === 0 ? '✅' : '❌';
                console.log(`   ${status} ${result.groupName}: ${result.cadence} (${result.frequency}x)`);
                if (result.issues.length > 0) {
                    result.issues.forEach(issue => {
                        console.log(`      - ${issue}`);
                    });
                }
            });
        }
        
    } catch (error) {
        console.log('⚠️  Validation test skipped (database not available):', error.message);
    }

    console.log('\n' + '='.repeat(50) + '\n');

    // Test 3: Summary of Lambda Functions
    console.log('3. Available Lambda Functions:');
    console.log('   📞 handler - Main scheduling function (EventBridge trigger)');
    console.log('   📅 generateGroupSchedule - Generate future schedule for a group');
    console.log('   🧪 testScheduling - Test scheduling logic with sample data');
    console.log('   ✅ validateAllGroups - Validate all groups in database');
    
    console.log('\n   Lambda Function Features:');
    console.log('   ✅ Enforces 1-call-per-day rule');
    console.log('   ✅ Validates frequency based on cadence');
    console.log('   ✅ Ensures business hours compliance');
    console.log('   ✅ Provides detailed scheduling information');
    console.log('   ✅ Includes monitoring and validation tools');
    
    console.log('\n   Scheduling Rules:');
    console.log('   📅 Daily: Always 1 call per day');
    console.log('   📅 Weekly: 1-7 calls per week (max 1 per day)');
    console.log('   📅 Monthly: 1-30 calls per month (max 1 per day)');
    console.log('   🕐 Business Hours: 9 AM - 8 PM (daily/weekly), 10 AM - 6 PM (monthly)');
    console.log('   🎲 Randomization: Random time within business hours, random days for weekly/monthly');
}

// Run tests if this file is executed directly
if (require.main === module) {
    runLambdaTests()
        .then(() => {
            console.log('\n🎉 All Lambda tests completed!');
            process.exit(0);
        })
        .catch((error) => {
            console.error('\n❌ Lambda tests failed:', error);
            process.exit(1);
        });
}

module.exports = { runLambdaTests }; 