const { SchedulingService } = require('./schedulingService');
const { Cadence } = require('../utils/constants/cadenceType');

// Example usage and testing of the scheduling service
function demonstrateSchedulingService() {
    console.log('=== Take5 Scheduling Service Demo (Updated Logic) ===\n');

    // Example groups with different cadences
    const groups = [
        {
            id: 1,
            name: 'Daily Check-in',
            cadence: Cadence.DAILY,
            frequency: 1, // Daily cadence always has frequency of 1
            enabled: true,
            rollCall: {}
        },
        {
            id: 2,
            name: 'Weekly Team Sync',
            cadence: Cadence.WEEKLY,
            frequency: 3, // 3 calls per week (max 7)
            enabled: true,
            rollCall: {
                '2024-01-15T10:00:00.000Z': ['user1', 'user2'] // Last call was 3 days ago
            }
        },
        {
            id: 3,
            name: 'Monthly Review',
            cadence: Cadence.MONTHLY,
            frequency: 5, // 5 calls per month (max 30)
            enabled: true,
            rollCall: {
                '2024-01-01T14:00:00.000Z': ['user1', 'user2', 'user3'] // Last call was 2 weeks ago
            }
        }
    ];

    const currentTime = new Date('2024-01-18T12:00:00.000Z'); // Example current time

    console.log('Current Time:', currentTime.toISOString());
    console.log('');

    // Calculate next call times for each group
    groups.forEach(group => {
        try {
            const nextCallTime = SchedulingService.calculateNextCallTime(group, currentTime);
            const isDue = SchedulingService.isGroupDueForCall(group, currentTime);
            
            console.log(`Group: ${group.name}`);
            console.log(`  Cadence: ${group.cadence} (${group.frequency}x per ${group.cadence})`);
            console.log(`  Next Call: ${nextCallTime.toISOString()}`);
            console.log(`  Is Due: ${isDue}`);
            console.log(`  Business Hours OK: ${SchedulingService.isCallTimeAcceptable(nextCallTime)}`);
            console.log('');
        } catch (error) {
            console.error(`Error calculating for group ${group.name}:`, error.message);
        }
    });

    // Get groups due for calls
    const dueGroups = SchedulingService.getGroupsDueForCalls(groups, currentTime);
    console.log(`Groups due for calls: ${dueGroups.length}`);
    dueGroups.forEach(group => {
        console.log(`  - ${group.name}`);
    });
    console.log('');

    // Generate future schedule for a group
    const weeklyGroup = groups[1]; // Weekly Team Sync
    console.log(`Future schedule for ${weeklyGroup.name}:`);
    const schedule = SchedulingService.generateCallSchedule(weeklyGroup, 5, currentTime);
    schedule.forEach((callTime, index) => {
        console.log(`  Call ${index + 1}: ${callTime.toISOString()}`);
    });
    console.log('');

    // Demonstrate business hours adjustment
    const lateNightCall = new Date('2024-01-18T23:00:00.000Z');
    const adjustedCall = SchedulingService.adjustCallTimeToBusinessHours(lateNightCall);
    console.log('Business Hours Adjustment:');
    console.log(`  Original: ${lateNightCall.toISOString()}`);
    console.log(`  Adjusted: ${adjustedCall.toISOString()}`);
    console.log('');

    // Test frequency validation
    console.log('Frequency Validation Tests:');
    const testCases = [
        { cadence: Cadence.DAILY, frequency: 1, expected: true },
        { cadence: Cadence.DAILY, frequency: 2, expected: false },
        { cadence: Cadence.WEEKLY, frequency: 3, expected: true },
        { cadence: Cadence.WEEKLY, frequency: 8, expected: false },
        { cadence: Cadence.MONTHLY, frequency: 15, expected: true },
        { cadence: Cadence.MONTHLY, frequency: 31, expected: false }
    ];

    testCases.forEach(testCase => {
        const isValid = SchedulingService.validateFrequency(testCase.cadence, testCase.frequency);
        const status = isValid === testCase.expected ? '✅' : '❌';
        console.log(`  ${status} ${testCase.cadence} frequency ${testCase.frequency}: ${isValid} (expected: ${testCase.expected})`);
    });
    console.log('');

    // Demonstrate weekly call day generation
    console.log('Weekly Call Day Generation Example:');
    const weekStart = new Date('2024-01-20T00:00:00.000Z'); // Start of a week
    const weeklyCallDays = SchedulingService.generateWeeklyCallDays(weekStart, 3);
    console.log(`  Week starting: ${weekStart.toISOString()}`);
    console.log(`  Selected call days for frequency 3:`);
    weeklyCallDays.forEach((day, index) => {
        console.log(`    Day ${index + 1}: ${day.toISOString().split('T')[0]}`);
    });
    console.log('');

    // Demonstrate monthly call day generation
    console.log('Monthly Call Day Generation Example:');
    const monthStart = new Date('2024-02-01T00:00:00.000Z'); // Start of a month
    const monthlyCallDays = SchedulingService.generateMonthlyCallDays(monthStart, 5);
    console.log(`  Month starting: ${monthStart.toISOString()}`);
    console.log(`  Selected call days for frequency 5:`);
    monthlyCallDays.forEach((day, index) => {
        console.log(`    Day ${index + 1}: ${day.toISOString().split('T')[0]}`);
    });
}

// Run the demo if this file is executed directly
if (require.main === module) {
    demonstrateSchedulingService();
}

module.exports = { demonstrateSchedulingService }; 