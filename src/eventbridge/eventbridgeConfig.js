const AWS = require('aws-sdk');

// Configure AWS SDK
AWS.config.update({
    region: 'us-east-1'
});

const eventbridge = new AWS.EventBridge();
const lambda = new AWS.Lambda();

/**
 * EventBridge Configuration for Take5 Scheduling
 * 
 * This module provides functions to create and manage EventBridge rules
 * that trigger the Take5 scheduling Lambda function.
 */

class EventBridgeConfig {
    constructor() {
        this.ruleName = 'take5-scheduling-rule';
        this.lambdaArn = 'arn:aws:lambda:us-east-1:507315734938:function:take5-scheduling';
        this.region = 'us-east-1';
        this.accountId = '507315734938';
    }

    /**
     * Create the EventBridge rule for Take5 scheduling
     * Runs every 5 minutes to check for groups due for calls
     */
    async createSchedulingRule() {
        try {
            console.log('Creating EventBridge rule for Take5 scheduling...');

            // Create the rule
            const ruleParams = {
                Name: this.ruleName,
                ScheduleExpression: 'rate(5 minutes)',
                State: 'ENABLED',
                Description: 'Triggers Take5 scheduling Lambda every 5 minutes to check for groups due for calls',
                EventBusName: 'default'
            };

            const ruleResult = await eventbridge.putRule(ruleParams).promise();
            console.log('✅ EventBridge rule created successfully:', ruleResult.RuleArn);

            // Create the target
            const targetParams = {
                Rule: this.ruleName,
                EventBusName: 'default',
                Targets: [
                    {
                        Id: '1',
                        Arn: this.lambdaArn,
                        Input: JSON.stringify({
                            source: 'eventbridge',
                            timestamp: new Date().toISOString(),
                            description: 'Take5 scheduling check'
                        })
                    }
                ]
            };

            const targetResult = await eventbridge.putTargets(targetParams).promise();
            console.log('✅ EventBridge target created successfully');

            // Add permission for EventBridge to invoke Lambda
            const permissionParams = {
                FunctionName: this.lambdaArn,
                StatementId: 'EventBridgeInvoke',
                Action: 'lambda:InvokeFunction',
                Principal: 'events.amazonaws.com',
                SourceArn: ruleResult.RuleArn
            };

            const permissionResult = await lambda.addPermission(permissionParams).promise();
            console.log('✅ Lambda permission added successfully');

            return {
                ruleArn: ruleResult.RuleArn,
                targetResult: targetResult,
                permissionResult: permissionResult
            };

        } catch (error) {
            console.error('❌ Error creating EventBridge rule:', error);
            throw error;
        }
    }

    /**
     * Create a custom rule with specific schedule
     * @param {string} scheduleExpression - Cron or rate expression
     * @param {string} ruleName - Custom rule name
     */
    async createCustomRule(scheduleExpression, ruleName = null) {
        try {
            const customRuleName = ruleName || `take5-custom-${Date.now()}`;
            console.log(`Creating custom EventBridge rule: ${customRuleName}`);

            // Create the rule
            const ruleParams = {
                Name: customRuleName,
                ScheduleExpression: scheduleExpression,
                State: 'ENABLED',
                Description: `Custom Take5 scheduling rule: ${scheduleExpression}`,
                EventBusName: 'default'
            };

            const ruleResult = await eventbridge.putRule(ruleParams).promise();
            console.log('✅ Custom EventBridge rule created:', ruleResult.RuleArn);

            // Create the target
            const targetParams = {
                Rule: customRuleName,
                EventBusName: 'default',
                Targets: [
                    {
                        Id: '1',
                        Arn: this.lambdaArn,
                        Input: JSON.stringify({
                            source: 'eventbridge',
                            ruleName: customRuleName,
                            scheduleExpression: scheduleExpression,
                            timestamp: new Date().toISOString(),
                            description: 'Custom Take5 scheduling check'
                        })
                    }
                ]
            };

            const targetResult = await eventbridge.putTargets(targetParams).promise();
            console.log('✅ Custom EventBridge target created');

            return {
                ruleName: customRuleName,
                ruleArn: ruleResult.RuleArn,
                targetResult: targetResult
            };

        } catch (error) {
            console.error('❌ Error creating custom EventBridge rule:', error);
            throw error;
        }
    }

    /**
     * List all Take5-related EventBridge rules
     */
    async listTake5Rules() {
        try {
            console.log('Listing Take5 EventBridge rules...');

            const rules = await eventbridge.listRules({
                NamePrefix: 'take5'
            }).promise();

            console.log('✅ Found Take5 rules:', rules.Rules.length);
            
            for (const rule of rules.Rules) {
                console.log(`  📅 ${rule.Name}: ${rule.ScheduleExpression} (${rule.State})`);
                
                // Get targets for this rule
                const targets = await eventbridge.listTargetsByRule({
                    Rule: rule.Name
                }).promise();
                
                targets.Targets.forEach(target => {
                    console.log(`    🎯 Target: ${target.Id} -> ${target.Arn}`);
                });
            }

            return rules.Rules;

        } catch (error) {
            console.error('❌ Error listing EventBridge rules:', error);
            throw error;
        }
    }

    /**
     * Delete a specific EventBridge rule
     * @param {string} ruleName - Name of the rule to delete
     */
    async deleteRule(ruleName) {
        try {
            console.log(`Deleting EventBridge rule: ${ruleName}`);

            // Remove targets first
            const targets = await eventbridge.listTargetsByRule({
                Rule: ruleName
            }).promise();

            if (targets.Targets.length > 0) {
                const targetIds = targets.Targets.map(target => target.Id);
                await eventbridge.removeTargets({
                    Rule: ruleName,
                    Ids: targetIds
                }).promise();
                console.log('✅ Targets removed');
            }

            // Delete the rule
            await eventbridge.deleteRule({
                Name: ruleName
            }).promise();
            console.log('✅ Rule deleted successfully');

        } catch (error) {
            console.error('❌ Error deleting EventBridge rule:', error);
            throw error;
        }
    }

    /**
     * Enable/disable a rule
     * @param {string} ruleName - Name of the rule
     * @param {boolean} enabled - Whether to enable or disable
     */
    async setRuleState(ruleName, enabled) {
        try {
            const state = enabled ? 'ENABLED' : 'DISABLED';
            console.log(`${enabled ? 'Enabling' : 'Disabling'} EventBridge rule: ${ruleName}`);

            await eventbridge.enableRule({
                Name: ruleName
            }).promise();

            console.log(`✅ Rule ${ruleName} ${state.toLowerCase()}`);

        } catch (error) {
            console.error('❌ Error setting rule state:', error);
            throw error;
        }
    }

    /**
     * Get rule details and status
     * @param {string} ruleName - Name of the rule
     */
    async getRuleDetails(ruleName) {
        try {
            console.log(`Getting details for rule: ${ruleName}`);

            const rule = await eventbridge.describeRule({
                Name: ruleName
            }).promise();

            const targets = await eventbridge.listTargetsByRule({
                Rule: ruleName
            }).promise();

            return {
                rule: rule,
                targets: targets.Targets
            };

        } catch (error) {
            console.error('❌ Error getting rule details:', error);
            throw error;
        }
    }
}

module.exports = { EventBridgeConfig }; 