import { SchedulingService } from './schedulingService.mjs';
import { GroupRepository } from './groupRepository.mjs';

/**
 * AWS Lambda function to determine which groups are due for calls
 * This function would be triggered by EventBridge on a schedule
 * 
 * Updated to enforce 1-call-per-day rule:
 * - Daily cadence: Always 1 call per day
 * - Weekly cadence: 1-7 calls per week (max 1 per day)
 * - Monthly cadence: 1-30 calls per month (max 1 per day)
 */
export const handler = async (event, context) => {
    try {
        console.log('Scheduling Lambda triggered:', JSON.stringify(event, null, 2));
        
        // Initialize database connection (in production, this would use connection pooling)
        const groupRepository = new GroupRepository();
        
        // Get all enabled groups from the database
        const allGroups = await groupRepository.findAll();
        console.log(`Found ${allGroups.length} total groups`);
        
        // Get current time (could be passed in event for testing)
        const currentTime = event.currentTime ? new Date(event.currentTime) : new Date();
        console.log('Current time:', currentTime.toISOString());
        
        // Find groups that are due for calls
        const dueGroups = SchedulingService.getGroupsDueForCalls(allGroups, currentTime);
        console.log(`Found ${dueGroups.length} groups due for calls`);
        
        // Prepare response for each due group
        const callSchedule = dueGroups.map(group => {
            const nextCallTime = SchedulingService.calculateNextCallTime(group, currentTime);
            
            // Validate frequency based on cadence
            const isValidFrequency = SchedulingService.validateFrequency(group.cadence, group.frequency);
            if (!isValidFrequency) {
                console.warn(`Group ${group.name} (ID: ${group.id}) has invalid frequency ${group.frequency} for cadence ${group.cadence}`);
            }
            
            return {
                groupId: group.id,
                groupName: group.name,
                nextCallTime: nextCallTime.toISOString(),
                duration: group.duration,
                cadence: group.cadence,
                frequency: group.frequency,
                isValidFrequency: isValidFrequency,
                users: group.users.map(user => ({
                    id: user.id,
                    phoneNumber: user.phoneNumber,
                    timezone: user.timezone
                })),
                // Additional scheduling info for monitoring
                schedulingInfo: {
                    businessHoursOK: SchedulingService.isCallTimeAcceptable(nextCallTime),
                    lastCallTime: SchedulingService.getLastCallTime(group)?.toISOString() || null
                }
            };
        });
        
        // Log the schedule for monitoring
        callSchedule.forEach(schedule => {
            console.log(`Group ${schedule.groupName} (ID: ${schedule.groupId}) scheduled for: ${schedule.nextCallTime}`);
            console.log(`  Cadence: ${schedule.cadence} (${schedule.frequency}x per ${schedule.cadence})`);
            console.log(`  Duration: ${schedule.duration} minutes`);
            console.log(`  Users: ${schedule.users.length}`);
            console.log(`  Business Hours OK: ${schedule.schedulingInfo.businessHoursOK}`);
            console.log(`  Valid Frequency: ${schedule.isValidFrequency}`);
        });
        
        // Return the schedule for further processing (e.g., AWS Chime call initiation)
        return {
            statusCode: 200,
            body: JSON.stringify({
                timestamp: currentTime.toISOString(),
                groupsDue: callSchedule.length,
                schedule: callSchedule,
                summary: {
                    dailyGroups: callSchedule.filter(s => s.cadence === 'daily').length,
                    weeklyGroups: callSchedule.filter(s => s.cadence === 'weekly').length,
                    monthlyGroups: callSchedule.filter(s => s.cadence === 'monthly').length,
                    totalUsers: callSchedule.reduce((sum, s) => sum + s.users.length, 0)
                }
            })
        };
        
    } catch (error) {
        console.error('Error in scheduling lambda:', error);
        
        return {
            statusCode: 500,
            body: JSON.stringify({
                error: 'Internal server error',
                message: error.message
            })
        };
    }
};

/**
 * Helper function to generate future schedules for a specific group
 * Useful for testing and admin purposes
 * Updated to show the new scheduling logic
 */
export const generateGroupSchedule = async (event, context) => {
    try {
        const { groupId, numberOfCalls = 5 } = event;
        
        if (!groupId) {
            throw new Error('groupId is required');
        }
        
        const groupRepository = new GroupRepository();
        const group = await groupRepository.findById(groupId);
        
        if (!group) {
            throw new Error(`Group with ID ${groupId} not found`);
        }
        
        // Validate frequency
        const isValidFrequency = SchedulingService.validateFrequency(group.cadence, group.frequency);
        if (!isValidFrequency) {
            throw new Error(`Invalid frequency ${group.frequency} for cadence ${group.cadence}`);
        }
        
        const currentTime = new Date();
        const schedule = SchedulingService.generateCallSchedule(group, numberOfCalls, currentTime);
        
        // Generate additional scheduling info
        const schedulingInfo = {
            cadence: group.cadence,
            frequency: group.frequency,
            maxCallsPerDay: 1, // Enforced rule
            businessHours: '9 AM - 8 PM (daily/weekly), 10 AM - 6 PM (monthly)',
            randomization: 'Random time within business hours, random days for weekly/monthly'
        };
        
        return {
            statusCode: 200,
            body: JSON.stringify({
                groupId: group.id,
                groupName: group.name,
                schedule: schedule.map(time => time.toISOString()),
                schedulingInfo: schedulingInfo,
                validation: {
                    isValidFrequency: isValidFrequency,
                    frequencyRules: {
                        daily: 'Must be 1',
                        weekly: 'Must be 1-7',
                        monthly: 'Must be 1-30'
                    }
                }
            })
        };
        
    } catch (error) {
        console.error('Error generating group schedule:', error);
        
        return {
            statusCode: 500,
            body: JSON.stringify({
                error: 'Internal server error',
                message: error.message
            })
        };
    }
};

/**
 * Test function to validate scheduling logic
 * Updated to test the new 1-call-per-day rule
 */
export const testScheduling = async (event, context) => {
    try {
        const testGroups = [
            {
                id: 1,
                name: 'Daily Test',
                cadence: 'daily',
                frequency: 1, // Must be 1 for daily
                enabled: true,
                rollCall: {}
            },
            {
                id: 2,
                name: 'Weekly Test',
                cadence: 'weekly',
                frequency: 3, // 1-7 allowed
                enabled: true,
                rollCall: {
                    '2024-01-15T10:00:00.000Z': ['user1']
                }
            },
            {
                id: 3,
                name: 'Monthly Test',
                cadence: 'monthly',
                frequency: 5, // 1-30 allowed
                enabled: true,
                rollCall: {
                    '2024-01-01T14:00:00.000Z': ['user1']
                }
            },
            {
                id: 4,
                name: 'Invalid Daily Test',
                cadence: 'daily',
                frequency: 2, // Invalid - should be 1
                enabled: true,
                rollCall: {}
            }
        ];
        
        const currentTime = new Date('2024-01-18T12:00:00.000Z');
        const dueGroups = SchedulingService.getGroupsDueForCalls(testGroups, currentTime);
        
        const results = testGroups.map(group => {
            const nextCallTime = SchedulingService.calculateNextCallTime(group, currentTime);
            const isValidFrequency = SchedulingService.validateFrequency(group.cadence, group.frequency);
            
            return {
                groupId: group.id,
                groupName: group.name,
                cadence: group.cadence,
                frequency: group.frequency,
                nextCallTime: nextCallTime.toISOString(),
                isDue: dueGroups.some(dg => dg.id === group.id),
                isValidFrequency: isValidFrequency,
                businessHoursOK: SchedulingService.isCallTimeAcceptable(nextCallTime)
            };
        });
        
        // Test frequency validation
        const frequencyTests = [
            { cadence: 'daily', frequency: 1, expected: true },
            { cadence: 'daily', frequency: 2, expected: false },
            { cadence: 'weekly', frequency: 3, expected: true },
            { cadence: 'weekly', frequency: 8, expected: false },
            { cadence: 'monthly', frequency: 15, expected: true },
            { cadence: 'monthly', frequency: 31, expected: false }
        ];
        
        const frequencyResults = frequencyTests.map(test => ({
            ...test,
            actual: SchedulingService.validateFrequency(test.cadence, test.frequency),
            passed: SchedulingService.validateFrequency(test.cadence, test.frequency) === test.expected
        }));
        
        return {
            statusCode: 200,
            body: JSON.stringify({
                testTime: currentTime.toISOString(),
                groups: results,
                frequencyValidation: frequencyResults,
                summary: {
                    totalGroups: testGroups.length,
                    dueGroups: dueGroups.length,
                    validFrequencies: results.filter(r => r.isValidFrequency).length,
                    invalidFrequencies: results.filter(r => !r.isValidFrequency).length
                }
            })
        };
        
    } catch (error) {
        console.error('Error in test scheduling:', error);
        
        return {
            statusCode: 500,
            body: JSON.stringify({
                error: 'Internal server error',
                message: error.message
            })
        };
    }
};

/**
 * Function to validate all groups in the database
 * Useful for data integrity checks
 */
export const validateAllGroups = async (event, context) => {
    try {
        const groupRepository = new GroupRepository();
        const allGroups = await groupRepository.findAll();
        
        const validationResults = allGroups.map(group => {
            const isValidFrequency = SchedulingService.validateFrequency(group.cadence, group.frequency);
            const nextCallTime = SchedulingService.calculateNextCallTime(group, new Date());
            
            return {
                groupId: group.id,
                groupName: group.name,
                cadence: group.cadence,
                frequency: group.frequency,
                isValidFrequency: isValidFrequency,
                nextCallTime: nextCallTime.toISOString(),
                businessHoursOK: SchedulingService.isCallTimeAcceptable(nextCallTime),
                issues: []
            };
        });
        
        // Add issues for invalid configurations
        validationResults.forEach(result => {
            if (!result.isValidFrequency) {
                result.issues.push(`Invalid frequency ${result.frequency} for cadence ${result.cadence}`);
            }
            if (!result.businessHoursOK) {
                result.issues.push('Next call time is outside business hours');
            }
        });
        
        const summary = {
            totalGroups: allGroups.length,
            validGroups: validationResults.filter(r => r.issues.length === 0).length,
            invalidGroups: validationResults.filter(r => r.issues.length > 0).length,
            totalIssues: validationResults.reduce((sum, r) => sum + r.issues.length, 0)
        };
        
        return {
            statusCode: 200,
            body: JSON.stringify({
                validationResults: validationResults,
                summary: summary
            })
        };
        
    } catch (error) {
        console.error('Error validating groups:', error);
        
        return {
            statusCode: 500,
            body: JSON.stringify({
                error: 'Internal server error',
                message: error.message
            })
        };
    }
}; 