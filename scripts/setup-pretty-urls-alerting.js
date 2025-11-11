#!/usr/bin/env node

/**
 * CloudFront Pretty URLs Alerting Setup
 * 
 * Sets up comprehensive alerting and notification system for CloudFront
 * pretty URLs monitoring with integration to existing monitoring systems.
 */

const AWS = require('aws-sdk');
const fs = require('fs').promises;

// AWS Configuration
const cloudwatch = new AWS.CloudWatch({ region: 'us-east-1' });
const sns = new AWS.SNS({ region: 'us-east-1' });

// Configuration
const CONFIG = {
    distributionId: 'E2IBMHQ3GCW6ZK',
    functionName: 'pretty-urls-rewriter',
    alarmPrefix: 'CloudFront-PrettyURLs',
    region: 'us-east-1',
    snsTopicName: 'cloudfront-pretty-urls-alerts',
    slackWebhook: process.env.SLACK_WEBHOOK_URL || null,
    emailEndpoints: (process.env.ALERT_EMAILS || '').split(',').filter(Boolean)
};

class PrettyURLsAlerting {
    constructor() {
        this.snsTopicArn = null;
        this.alarms = [];
        this.notifications = [];
    }

    /**
     * Main setup function
     */
    async setup() {
        try {
            console.log('🚨 Setting up CloudFront Pretty URLs alerting...');
            
            // Create SNS topic for alerts
            await this.createSNSTopic();
            
            // Set up email subscriptions
            await this.setupEmailNotifications();
            
            // Create CloudWatch alarms
            await this.createAlarms();
            
            // Set up custom alert handlers
            await this.setupCustomAlertHandlers();
            
            // Create alerting configuration
            await this.createAlertingConfig();
            
            // Test alerting system
            await this.testAlertingSystem();
            
            console.log('✅ Alerting setup completed successfully!');
            
        } catch (error) {
            console.error('❌ Error setting up alerting:', error);
            throw error;
        }
    }

    /**
     * Create SNS topic for alerts
     */
    async createSNSTopic() {
        console.log('📢 Creating SNS topic for alerts...');
        
        try {
            // Check if topic already exists
            const topics = await sns.listTopics().promise();
            const existingTopic = topics.Topics.find(topic => 
                topic.TopicArn.includes(CONFIG.snsTopicName)
            );

            if (existingTopic) {
                this.snsTopicArn = existingTopic.TopicArn;
                console.log(`✅ Using existing SNS topic: ${this.snsTopicArn}`);
            } else {
                // Create new topic
                const result = await sns.createTopic({
                    Name: CONFIG.snsTopicName,
                    Attributes: {
                        DisplayName: 'CloudFront Pretty URLs Alerts'
                    }
                }).promise();
                
                this.snsTopicArn = result.TopicArn;
                console.log(`✅ Created SNS topic: ${this.snsTopicArn}`);
            }

            // Set topic attributes for better delivery
            await sns.setTopicAttributes({
                TopicArn: this.snsTopicArn,
                AttributeName: 'DeliveryPolicy',
                AttributeValue: JSON.stringify({
                    http: {
                        defaultHealthyRetryPolicy: {
                            minDelayTarget: 20,
                            maxDelayTarget: 20,
                            numRetries: 3,
                            numMaxDelayRetries: 0,
                            numMinDelayRetries: 0,
                            numNoDelayRetries: 0,
                            backoffFunction: 'linear'
                        }
                    }
                })
            }).promise();

        } catch (error) {
            console.error('❌ Error creating SNS topic:', error);
            throw error;
        }
    }

    /**
     * Set up email notifications
     */
    async setupEmailNotifications() {
        if (CONFIG.emailEndpoints.length === 0) {
            console.log('⚠️ No email endpoints configured, skipping email setup');
            return;
        }

        console.log('📧 Setting up email notifications...');
        
        for (const email of CONFIG.emailEndpoints) {
            try {
                await sns.subscribe({
                    TopicArn: this.snsTopicArn,
                    Protocol: 'email',
                    Endpoint: email.trim()
                }).promise();
                
                console.log(`✅ Email subscription created for: ${email}`);
            } catch (error) {
                console.error(`❌ Error subscribing email ${email}:`, error);
            }
        }

        console.log('📧 Email notifications configured. Check inboxes for confirmation emails.');
    }

    /**
     * Create comprehensive CloudWatch alarms
     */
    async createAlarms() {
        console.log('⏰ Creating CloudWatch alarms...');
        
        const alarmConfigs = [
            // Critical: Function error rate
            {
                AlarmName: `${CONFIG.alarmPrefix}-Function-Errors-Critical`,
                AlarmDescription: 'CRITICAL: CloudFront Function error rate is critically high',
                MetricName: 'FunctionExecutionErrors',
                Namespace: 'AWS/CloudFront',
                Statistic: 'Sum',
                Period: 300,
                EvaluationPeriods: 2,
                Threshold: 10,
                ComparisonOperator: 'GreaterThanThreshold',
                Dimensions: [{ Name: 'FunctionName', Value: CONFIG.functionName }],
                TreatMissingData: 'notBreaching',
                severity: 'critical'
            },
            
            // Warning: Function performance
            {
                AlarmName: `${CONFIG.alarmPrefix}-Function-Performance-Warning`,
                AlarmDescription: 'WARNING: CloudFront Function execution time is high',
                MetricName: 'FunctionExecutionTime',
                Namespace: 'AWS/CloudFront',
                Statistic: 'Average',
                Period: 300,
                EvaluationPeriods: 3,
                Threshold: 5,
                ComparisonOperator: 'GreaterThanThreshold',
                Dimensions: [{ Name: 'FunctionName', Value: CONFIG.functionName }],
                TreatMissingData: 'notBreaching',
                severity: 'warning'
            },
            
            // Critical: High 5xx error rate
            {
                AlarmName: `${CONFIG.alarmPrefix}-5xx-Errors-Critical`,
                AlarmDescription: 'CRITICAL: High 5xx error rate detected',
                MetricName: '5xxErrorRate',
                Namespace: 'AWS/CloudFront',
                Statistic: 'Average',
                Period: 300,
                EvaluationPeriods: 2,
                Threshold: 1,
                ComparisonOperator: 'GreaterThanThreshold',
                Dimensions: [{ Name: 'DistributionId', Value: CONFIG.distributionId }],
                TreatMissingData: 'notBreaching',
                severity: 'critical'
            },
            
            // Warning: High 4xx error rate
            {
                AlarmName: `${CONFIG.alarmPrefix}-4xx-Errors-Warning`,
                AlarmDescription: 'WARNING: High 4xx error rate detected',
                MetricName: '4xxErrorRate',
                Namespace: 'AWS/CloudFront',
                Statistic: 'Average',
                Period: 300,
                EvaluationPeriods: 3,
                Threshold: 5,
                ComparisonOperator: 'GreaterThanThreshold',
                Dimensions: [{ Name: 'DistributionId', Value: CONFIG.distributionId }],
                TreatMissingData: 'notBreaching',
                severity: 'warning'
            },
            
            // Warning: Low cache hit rate
            {
                AlarmName: `${CONFIG.alarmPrefix}-Cache-Hit-Rate-Warning`,
                AlarmDescription: 'WARNING: Cache hit rate is below optimal threshold',
                MetricName: 'CacheHitRate',
                Namespace: 'AWS/CloudFront',
                Statistic: 'Average',
                Period: 900,
                EvaluationPeriods: 3,
                Threshold: 80,
                ComparisonOperator: 'LessThanThreshold',
                Dimensions: [{ Name: 'DistributionId', Value: CONFIG.distributionId }],
                TreatMissingData: 'notBreaching',
                severity: 'warning'
            },
            
            // Critical: URL accessibility failure
            {
                AlarmName: `${CONFIG.alarmPrefix}-URL-Accessibility-Critical`,
                AlarmDescription: 'CRITICAL: Pretty URLs accessibility rate is critically low',
                MetricName: 'URLAccessibilityRate',
                Namespace: 'Custom/CloudFront',
                Statistic: 'Average',
                Period: 300,
                EvaluationPeriods: 2,
                Threshold: 90,
                ComparisonOperator: 'LessThanThreshold',
                Dimensions: [{ Name: 'FunctionName', Value: CONFIG.functionName }],
                TreatMissingData: 'breaching',
                severity: 'critical'
            },
            
            // Warning: Function execution anomaly
            {
                AlarmName: `${CONFIG.alarmPrefix}-Function-Executions-Anomaly`,
                AlarmDescription: 'WARNING: Unusual function execution pattern detected',
                MetricName: 'FunctionExecutions',
                Namespace: 'AWS/CloudFront',
                Statistic: 'Sum',
                Period: 900,
                EvaluationPeriods: 2,
                Threshold: 1000,
                ComparisonOperator: 'GreaterThanThreshold',
                Dimensions: [{ Name: 'FunctionName', Value: CONFIG.functionName }],
                TreatMissingData: 'notBreaching',
                severity: 'info'
            }
        ];

        for (const config of alarmConfigs) {
            try {
                const alarmParams = {
                    ...config,
                    AlarmActions: [this.snsTopicArn],
                    OKActions: [this.snsTopicArn]
                };
                
                delete alarmParams.severity; // Remove custom property
                
                await cloudwatch.putMetricAlarm(alarmParams).promise();
                console.log(`✅ Created ${config.severity} alarm: ${config.AlarmName}`);
                
                this.alarms.push({
                    name: config.AlarmName,
                    severity: config.severity,
                    description: config.AlarmDescription
                });
                
            } catch (error) {
                console.error(`❌ Error creating alarm ${config.AlarmName}:`, error);
            }
        }
    }

    /**
     * Set up custom alert handlers
     */
    async setupCustomAlertHandlers() {
        console.log('🔧 Setting up custom alert handlers...');
        
        // Create Lambda function for custom alert processing (if needed)
        const alertHandlerCode = `
const AWS = require('aws-sdk');
const https = require('https');

exports.handler = async (event) => {
    console.log('Processing alert:', JSON.stringify(event, null, 2));
    
    try {
        // Parse SNS message
        const message = JSON.parse(event.Records[0].Sns.Message);
        const alarmName = message.AlarmName;
        const newState = message.NewStateValue;
        const reason = message.NewStateReason;
        
        // Determine severity based on alarm name
        let severity = 'info';
        if (alarmName.includes('Critical')) severity = 'critical';
        else if (alarmName.includes('Warning')) severity = 'warning';
        
        // Format alert message
        const alertMessage = {
            timestamp: new Date().toISOString(),
            alarm: alarmName,
            state: newState,
            severity: severity,
            reason: reason,
            distribution: '${CONFIG.distributionId}',
            function: '${CONFIG.functionName}'
        };
        
        // Send to Slack if configured
        if (process.env.SLACK_WEBHOOK_URL && newState === 'ALARM') {
            await sendSlackAlert(alertMessage);
        }
        
        // Log to CloudWatch for analysis
        console.log('Alert processed:', alertMessage);
        
        return { statusCode: 200, body: 'Alert processed successfully' };
        
    } catch (error) {
        console.error('Error processing alert:', error);
        return { statusCode: 500, body: 'Error processing alert' };
    }
};

async function sendSlackAlert(alert) {
    const color = alert.severity === 'critical' ? 'danger' : 
                  alert.severity === 'warning' ? 'warning' : 'good';
    
    const payload = {
        channel: '#cloudfront-alerts',
        username: 'CloudFront Monitor',
        icon_emoji: ':warning:',
        attachments: [{
            color: color,
            title: \`CloudFront Alert: \${alert.alarm}\`,
            text: alert.reason,
            fields: [
                { title: 'Severity', value: alert.severity.toUpperCase(), short: true },
                { title: 'State', value: alert.state, short: true },
                { title: 'Distribution', value: alert.distribution, short: true },
                { title: 'Function', value: alert.function, short: true }
            ],
            timestamp: Math.floor(Date.parse(alert.timestamp) / 1000)
        }]
    };
    
    return new Promise((resolve, reject) => {
        const data = JSON.stringify(payload);
        const url = new URL(process.env.SLACK_WEBHOOK_URL);
        
        const options = {
            hostname: url.hostname,
            port: 443,
            path: url.pathname,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': data.length
            }
        };
        
        const req = https.request(options, (res) => {
            resolve();
        });
        
        req.on('error', reject);
        req.write(data);
        req.end();
    });
}
        `;

        // Save alert handler code for potential Lambda deployment
        await fs.writeFile('scripts/alert-handler-lambda.js', alertHandlerCode);
        console.log('✅ Alert handler code saved to scripts/alert-handler-lambda.js');
    }

    /**
     * Create alerting configuration file
     */
    async createAlertingConfig() {
        console.log('⚙️ Creating alerting configuration...');
        
        const alertingConfig = {
            sns: {
                topicArn: this.snsTopicArn,
                topicName: CONFIG.snsTopicName,
                region: CONFIG.region
            },
            alarms: this.alarms,
            thresholds: {
                critical: {
                    functionErrors: 10,
                    errorRate5xx: 1,
                    urlAccessibility: 90
                },
                warning: {
                    functionExecutionTime: 5,
                    errorRate4xx: 5,
                    cacheHitRate: 80
                },
                info: {
                    functionExecutions: 1000
                }
            },
            notifications: {
                email: CONFIG.emailEndpoints,
                slack: CONFIG.slackWebhook ? 'configured' : 'not configured',
                lambda: 'alert-handler-lambda'
            },
            escalation: {
                critical: {
                    immediate: true,
                    channels: ['email', 'slack', 'pagerduty']
                },
                warning: {
                    delay: 300,
                    channels: ['email', 'slack']
                },
                info: {
                    delay: 900,
                    channels: ['email']
                }
            },
            monitoring: {
                healthCheckInterval: 300,
                alertSuppressionWindow: 900,
                autoRecoveryEnabled: true
            }
        };

        await fs.writeFile(
            'config/cloudfront-pretty-urls-alerting.json',
            JSON.stringify(alertingConfig, null, 2)
        );

        console.log('✅ Alerting configuration saved to config/cloudfront-pretty-urls-alerting.json');
    }

    /**
     * Test alerting system
     */
    async testAlertingSystem() {
        console.log('🧪 Testing alerting system...');
        
        try {
            // Send test notification
            const testMessage = {
                Subject: 'CloudFront Pretty URLs - Test Alert',
                Message: JSON.stringify({
                    AlarmName: 'TEST-CloudFront-PrettyURLs-System-Check',
                    NewStateValue: 'ALARM',
                    NewStateReason: 'This is a test alert to verify the alerting system is working correctly.',
                    StateChangeTime: new Date().toISOString(),
                    Region: CONFIG.region,
                    AlarmDescription: 'Test alert for CloudFront Pretty URLs monitoring system'
                }, null, 2)
            };

            await sns.publish({
                TopicArn: this.snsTopicArn,
                ...testMessage
            }).promise();

            console.log('✅ Test alert sent successfully');
            console.log('📧 Check configured email addresses for test notification');
            
        } catch (error) {
            console.error('❌ Error sending test alert:', error);
        }
    }

    /**
     * List current alarms
     */
    async listAlarms() {
        try {
            const result = await cloudwatch.describeAlarms({
                AlarmNamePrefix: CONFIG.alarmPrefix
            }).promise();

            console.log('📋 Current CloudFront Pretty URLs alarms:');
            result.MetricAlarms.forEach(alarm => {
                console.log(`  - ${alarm.AlarmName}: ${alarm.StateValue} (${alarm.StateReason})`);
            });

            return result.MetricAlarms;
        } catch (error) {
            console.error('❌ Error listing alarms:', error);
            throw error;
        }
    }

    /**
     * Delete all alarms
     */
    async deleteAlarms() {
        try {
            const alarms = await this.listAlarms();
            const alarmNames = alarms.map(alarm => alarm.AlarmName);

            if (alarmNames.length > 0) {
                await cloudwatch.deleteAlarms({
                    AlarmNames: alarmNames
                }).promise();

                console.log(`🗑️ Deleted ${alarmNames.length} alarms`);
            } else {
                console.log('ℹ️ No alarms to delete');
            }
        } catch (error) {
            console.error('❌ Error deleting alarms:', error);
            throw error;
        }
    }

    /**
     * Update alarm thresholds
     */
    async updateAlarmThresholds(thresholds) {
        console.log('🔧 Updating alarm thresholds...');
        
        const alarms = await this.listAlarms();
        
        for (const alarm of alarms) {
            try {
                // Update threshold based on alarm type
                let newThreshold = alarm.Threshold;
                
                if (alarm.AlarmName.includes('Function-Errors') && thresholds.functionErrors) {
                    newThreshold = thresholds.functionErrors;
                } else if (alarm.AlarmName.includes('Function-Performance') && thresholds.functionExecutionTime) {
                    newThreshold = thresholds.functionExecutionTime;
                } else if (alarm.AlarmName.includes('5xx-Errors') && thresholds.errorRate5xx) {
                    newThreshold = thresholds.errorRate5xx;
                } else if (alarm.AlarmName.includes('4xx-Errors') && thresholds.errorRate4xx) {
                    newThreshold = thresholds.errorRate4xx;
                } else if (alarm.AlarmName.includes('Cache-Hit-Rate') && thresholds.cacheHitRate) {
                    newThreshold = thresholds.cacheHitRate;
                }

                if (newThreshold !== alarm.Threshold) {
                    await cloudwatch.putMetricAlarm({
                        AlarmName: alarm.AlarmName,
                        AlarmDescription: alarm.AlarmDescription,
                        MetricName: alarm.MetricName,
                        Namespace: alarm.Namespace,
                        Statistic: alarm.Statistic,
                        Period: alarm.Period,
                        EvaluationPeriods: alarm.EvaluationPeriods,
                        Threshold: newThreshold,
                        ComparisonOperator: alarm.ComparisonOperator,
                        Dimensions: alarm.Dimensions,
                        AlarmActions: alarm.AlarmActions,
                        OKActions: alarm.OKActions,
                        TreatMissingData: alarm.TreatMissingData
                    }).promise();

                    console.log(`✅ Updated ${alarm.AlarmName}: ${alarm.Threshold} → ${newThreshold}`);
                }
            } catch (error) {
                console.error(`❌ Error updating alarm ${alarm.AlarmName}:`, error);
            }
        }
    }

    /**
     * Generate alerting report
     */
    async generateAlertingReport() {
        const alarms = await this.listAlarms();
        
        const report = {
            timestamp: new Date().toISOString(),
            summary: {
                totalAlarms: alarms.length,
                activeAlarms: alarms.filter(a => a.StateValue === 'ALARM').length,
                okAlarms: alarms.filter(a => a.StateValue === 'OK').length,
                insufficientDataAlarms: alarms.filter(a => a.StateValue === 'INSUFFICIENT_DATA').length
            },
            alarms: alarms.map(alarm => ({
                name: alarm.AlarmName,
                state: alarm.StateValue,
                reason: alarm.StateReason,
                threshold: alarm.Threshold,
                metric: `${alarm.Namespace}/${alarm.MetricName}`
            })),
            configuration: {
                snsTopicArn: this.snsTopicArn,
                emailSubscriptions: CONFIG.emailEndpoints.length,
                slackConfigured: !!CONFIG.slackWebhook
            }
        };

        const filename = `alerting-report-${Date.now()}.json`;
        await fs.writeFile(filename, JSON.stringify(report, null, 2));
        
        console.log(`📋 Alerting report saved to ${filename}`);
        console.log(`📊 Summary: ${report.summary.totalAlarms} total, ${report.summary.activeAlarms} active alarms`);
        
        return report;
    }
}

// CLI interface
async function main() {
    const args = process.argv.slice(2);
    const command = args[0] || 'setup';

    const alerting = new PrettyURLsAlerting();

    try {
        switch (command) {
            case 'setup':
                await alerting.setup();
                break;
            case 'list':
                await alerting.listAlarms();
                break;
            case 'test':
                await alerting.testAlertingSystem();
                break;
            case 'delete':
                await alerting.deleteAlarms();
                break;
            case 'report':
                await alerting.generateAlertingReport();
                break;
            case 'update-thresholds':
                const thresholds = JSON.parse(args[1] || '{}');
                await alerting.updateAlarmThresholds(thresholds);
                break;
            default:
                console.log('Usage: node setup-pretty-urls-alerting.js [setup|list|test|delete|report|update-thresholds]');
                console.log('  setup: Set up complete alerting system');
                console.log('  list: List current alarms');
                console.log('  test: Send test alert');
                console.log('  delete: Delete all alarms');
                console.log('  report: Generate alerting report');
                console.log('  update-thresholds: Update alarm thresholds');
                process.exit(1);
        }
    } catch (error) {
        console.error('❌ Operation failed:', error);
        process.exit(1);
    }
}

if (require.main === module) {
    main();
}

module.exports = PrettyURLsAlerting;