const AWS = require('aws-sdk');

// Configure AWS SDK
AWS.config.update({
    region: 'us-east-1'
});

const cloudwatch = new AWS.CloudWatch();
const logs = new AWS.CloudWatchLogs();

/**
 * CloudWatch Alarms Configuration for Take5
 * 
 * This module creates CloudWatch alarms to monitor the health and performance
 * of the Take5 scheduling system.
 */

class CloudWatchAlarms {
    constructor() {
        this.lambdaFunctionName = 'take5-scheduling';
        this.namespace = 'Take5/Scheduling';
        this.alarmPrefix = 'Take5';
    }

    /**
     * Create CloudWatch alarms for Lambda function monitoring
     */
    async createLambdaAlarms() {
        console.log('📊 Creating CloudWatch alarms for Lambda function...');

        const alarms = [
            // Error rate alarm
            {
                AlarmName: `${this.alarmPrefix}-Lambda-Errors`,
                AlarmDescription: 'Lambda function error rate is high',
                MetricName: 'Errors',
                Namespace: 'AWS/Lambda',
                Statistic: 'Sum',
                Period: 300, // 5 minutes
                EvaluationPeriods: 2,
                Threshold: 1,
                ComparisonOperator: 'GreaterThanThreshold',
                Dimensions: [
                    {
                        Name: 'FunctionName',
                        Value: this.lambdaFunctionName
                    }
                ],
                TreatMissingData: 'notBreaching'
            },
            // Duration alarm
            {
                AlarmName: `${this.alarmPrefix}-Lambda-Duration`,
                AlarmDescription: 'Lambda function execution time is too long',
                MetricName: 'Duration',
                Namespace: 'AWS/Lambda',
                Statistic: 'Average',
                Period: 300, // 5 minutes
                EvaluationPeriods: 2,
                Threshold: 25000, // 25 seconds
                ComparisonOperator: 'GreaterThanThreshold',
                Dimensions: [
                    {
                        Name: 'FunctionName',
                        Value: this.lambdaFunctionName
                    }
                ],
                TreatMissingData: 'notBreaching'
            },
            // Throttles alarm
            {
                AlarmName: `${this.alarmPrefix}-Lambda-Throttles`,
                AlarmDescription: 'Lambda function is being throttled',
                MetricName: 'Throttles',
                Namespace: 'AWS/Lambda',
                Statistic: 'Sum',
                Period: 300, // 5 minutes
                EvaluationPeriods: 1,
                Threshold: 1,
                ComparisonOperator: 'GreaterThanThreshold',
                Dimensions: [
                    {
                        Name: 'FunctionName',
                        Value: this.lambdaFunctionName
                    }
                ],
                TreatMissingData: 'notBreaching'
            },
            // Concurrent executions alarm
            {
                AlarmName: `${this.alarmPrefix}-Lambda-ConcurrentExecutions`,
                AlarmDescription: 'Lambda function concurrent executions are high',
                MetricName: 'ConcurrentExecutions',
                Namespace: 'AWS/Lambda',
                Statistic: 'Maximum',
                Period: 300, // 5 minutes
                EvaluationPeriods: 2,
                Threshold: 50, // Adjust based on your limits
                ComparisonOperator: 'GreaterThanThreshold',
                Dimensions: [
                    {
                        Name: 'FunctionName',
                        Value: this.lambdaFunctionName
                    }
                ],
                TreatMissingData: 'notBreaching'
            }
        ];

        const results = [];
        for (const alarm of alarms) {
            try {
                await cloudwatch.putMetricAlarm(alarm).promise();
                console.log(`✅ Created alarm: ${alarm.AlarmName}`);
                results.push({ name: alarm.AlarmName, status: 'created' });
            } catch (error) {
                console.error(`❌ Failed to create alarm ${alarm.AlarmName}:`, error.message);
                results.push({ name: alarm.AlarmName, status: 'failed', error: error.message });
            }
        }

        return results;
    }

    /**
     * Create CloudWatch alarms for EventBridge monitoring
     */
    async createEventBridgeAlarms() {
        console.log('📊 Creating CloudWatch alarms for EventBridge...');

        const alarms = [
            // Failed invocations alarm
            {
                AlarmName: `${this.alarmPrefix}-EventBridge-FailedInvocations`,
                AlarmDescription: 'EventBridge failed to invoke Lambda function',
                MetricName: 'FailedInvocations',
                Namespace: 'AWS/Events',
                Statistic: 'Sum',
                Period: 300, // 5 minutes
                EvaluationPeriods: 1,
                Threshold: 1,
                ComparisonOperator: 'GreaterThanThreshold',
                Dimensions: [
                    {
                        Name: 'RuleName',
                        Value: 'take5-scheduling-rule'
                    }
                ],
                TreatMissingData: 'notBreaching'
            },
            // Dead letter queue alarm (if using DLQ)
            {
                AlarmName: `${this.alarmPrefix}-EventBridge-DLQ`,
                AlarmDescription: 'Events are being sent to dead letter queue',
                MetricName: 'DeadLetterInvocations',
                Namespace: 'AWS/Events',
                Statistic: 'Sum',
                Period: 300, // 5 minutes
                EvaluationPeriods: 1,
                Threshold: 1,
                ComparisonOperator: 'GreaterThanThreshold',
                Dimensions: [
                    {
                        Name: 'RuleName',
                        Value: 'take5-scheduling-rule'
                    }
                ],
                TreatMissingData: 'notBreaching'
            }
        ];

        const results = [];
        for (const alarm of alarms) {
            try {
                await cloudwatch.putMetricAlarm(alarm).promise();
                console.log(`✅ Created alarm: ${alarm.AlarmName}`);
                results.push({ name: alarm.AlarmName, status: 'created' });
            } catch (error) {
                console.error(`❌ Failed to create alarm ${alarm.AlarmName}:`, error.message);
                results.push({ name: alarm.AlarmName, status: 'failed', error: error.message });
            }
        }

        return results;
    }

    /**
     * Create custom CloudWatch alarms for business metrics
     */
    async createBusinessAlarms() {
        console.log('📊 Creating custom business metric alarms...');

        // Create custom metrics for business KPIs
        const customMetrics = [
            {
                MetricName: 'GroupsScheduled',
                Value: 0,
                Unit: 'Count',
                Dimensions: [
                    {
                        Name: 'Service',
                        Value: 'Take5'
                    },
                    {
                        Name: 'Environment',
                        Value: 'Production'
                    }
                ]
            },
            {
                MetricName: 'CallsInitiated',
                Value: 0,
                Unit: 'Count',
                Dimensions: [
                    {
                        Name: 'Service',
                        Value: 'Take5'
                    },
                    {
                        Name: 'Environment',
                        Value: 'Production'
                    }
                ]
            },
            {
                MetricName: 'SchedulingErrors',
                Value: 0,
                Unit: 'Count',
                Dimensions: [
                    {
                        Name: 'Service',
                        Value: 'Take5'
                    },
                    {
                        Name: 'Environment',
                        Value: 'Production'
                    }
                ]
            }
        ];

        // Publish initial metrics
        for (const metric of customMetrics) {
            try {
                await cloudwatch.putMetricData({
                    Namespace: this.namespace,
                    MetricData: [metric]
                }).promise();
                console.log(`✅ Published metric: ${metric.MetricName}`);
            } catch (error) {
                console.error(`❌ Failed to publish metric ${metric.MetricName}:`, error.message);
            }
        }

        // Create alarms for custom metrics
        const alarms = [
            {
                AlarmName: `${this.alarmPrefix}-Business-SchedulingErrors`,
                AlarmDescription: 'High number of scheduling errors detected',
                MetricName: 'SchedulingErrors',
                Namespace: this.namespace,
                Statistic: 'Sum',
                Period: 300, // 5 minutes
                EvaluationPeriods: 2,
                Threshold: 5,
                ComparisonOperator: 'GreaterThanThreshold',
                Dimensions: [
                    {
                        Name: 'Service',
                        Value: 'Take5'
                    },
                    {
                        Name: 'Environment',
                        Value: 'Production'
                    }
                ],
                TreatMissingData: 'notBreaching'
            }
        ];

        const results = [];
        for (const alarm of alarms) {
            try {
                await cloudwatch.putMetricAlarm(alarm).promise();
                console.log(`✅ Created business alarm: ${alarm.AlarmName}`);
                results.push({ name: alarm.AlarmName, status: 'created' });
            } catch (error) {
                console.error(`❌ Failed to create business alarm ${alarm.AlarmName}:`, error.message);
                results.push({ name: alarm.AlarmName, status: 'failed', error: error.message });
            }
        }

        return results;
    }

    /**
     * Create CloudWatch log group and subscription filters
     */
    async setupLogMonitoring() {
        console.log('📊 Setting up CloudWatch log monitoring...');

        const logGroupName = `/aws/lambda/${this.lambdaFunctionName}`;

        try {
            // Create log group if it doesn't exist
            await logs.createLogGroup({
                logGroupName: logGroupName
            }).promise();
            console.log(`✅ Created log group: ${logGroupName}`);
        } catch (error) {
            if (error.code !== 'ResourceAlreadyExistsException') {
                console.error(`❌ Failed to create log group: ${error.message}`);
                throw error;
            }
            console.log(`✅ Log group already exists: ${logGroupName}`);
        }

        // Create metric filter for error detection
        const errorFilter = {
            logGroupName: logGroupName,
            filterName: `${this.alarmPrefix}-ErrorFilter`,
            filterPattern: 'ERROR',
            metricTransformations: [
                {
                    metricName: 'ErrorCount',
                    metricNamespace: this.namespace,
                    metricValue: '1',
                    defaultValue: 0
                }
            ]
        };

        try {
            await logs.putMetricFilter(errorFilter).promise();
            console.log('✅ Created error metric filter');
        } catch (error) {
            console.error('❌ Failed to create error metric filter:', error.message);
        }

        // Create metric filter for successful scheduling
        const successFilter = {
            logGroupName: logGroupName,
            filterName: `${this.alarmPrefix}-SuccessFilter`,
            filterPattern: 'Groups scheduled successfully',
            metricTransformations: [
                {
                    metricName: 'SuccessfulSchedules',
                    metricNamespace: this.namespace,
                    metricValue: '1',
                    defaultValue: 0
                }
            ]
        };

        try {
            await logs.putMetricFilter(successFilter).promise();
            console.log('✅ Created success metric filter');
        } catch (error) {
            console.error('❌ Failed to create success metric filter:', error.message);
        }
    }

    /**
     * List all Take5-related CloudWatch alarms
     */
    async listAlarms() {
        console.log('📋 Listing Take5 CloudWatch alarms...');

        try {
            const alarms = await cloudwatch.describeAlarms({
                AlarmNamePrefix: this.alarmPrefix
            }).promise();

            console.log(`✅ Found ${alarms.MetricAlarms.length} alarms:`);
            
            alarms.MetricAlarms.forEach(alarm => {
                const status = alarm.StateValue === 'OK' ? '✅' : '❌';
                console.log(`   ${status} ${alarm.AlarmName}: ${alarm.StateValue}`);
                console.log(`      Description: ${alarm.AlarmDescription}`);
                console.log(`      Metric: ${alarm.MetricName} (${alarm.Statistic})`);
                console.log(`      Threshold: ${alarm.Threshold} ${alarm.Unit || ''}`);
            });

            return alarms.MetricAlarms;

        } catch (error) {
            console.error('❌ Error listing alarms:', error);
            throw error;
        }
    }

    /**
     * Delete all Take5-related CloudWatch alarms
     */
    async deleteAlarms() {
        console.log('🗑️  Deleting Take5 CloudWatch alarms...');

        try {
            const alarms = await cloudwatch.describeAlarms({
                AlarmNamePrefix: this.alarmPrefix
            }).promise();

            if (alarms.MetricAlarms.length === 0) {
                console.log('✅ No alarms found to delete');
                return;
            }

            const alarmNames = alarms.MetricAlarms.map(alarm => alarm.AlarmName);
            await cloudwatch.deleteAlarms({
                AlarmNames: alarmNames
            }).promise();

            console.log(`✅ Deleted ${alarmNames.length} alarms:`, alarmNames);

        } catch (error) {
            console.error('❌ Error deleting alarms:', error);
            throw error;
        }
    }
}

module.exports = { CloudWatchAlarms }; 