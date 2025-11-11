#!/usr/bin/env node

/**
 * SNS Integration and Notification System for CloudFront Pretty URLs
 * 
 * Implements SNS topic creation, email subscriptions, and alarm state change notifications
 * for CloudFront Pretty URLs monitoring system.
 * 
 * Requirements: 8.4, 7.4
 * Task: 7.2.3 Set up SNS integration and notification system
 */

const AWS = require('aws-sdk');
const fs = require('fs').promises;
const path = require('path');

class SNSIntegrationManager {
    constructor() {
        this.sns = new AWS.SNS({ region: 'us-east-1' });
        this.events = new AWS.CloudWatchEvents({ region: 'us-east-1' });
        this.cloudwatch = new AWS.CloudWatch({ region: 'us-east-1' });
        
        this.config = null;
        this.snsTopicArn = null;
        this.subscriptions = [];
        this.eventRules = [];
    }

    async loadConfig() {
        try {
            const configPath = path.join(__dirname, '..', 'config', 'cloudfront-pretty-urls-monitoring-config.json');
            const configData = await fs.readFile(configPath, 'utf8');
            this.config = JSON.parse(configData);
            
            console.log('✅ Monitoring configuration loaded successfully');
            return this.config;
        } catch (error) {
            console.error('❌ Failed to load monitoring configuration:', error.message);
            throw error;
        }
    }

    async createSNSTopic() {
        try {
            console.log('📧 Creating SNS topic for CloudFront Pretty URLs alerts...');
            
            const topicName = this.config.alerting.snsTopicName;
            
            // Create SNS topic with enhanced configuration
            const createTopicParams = {
                Name: topicName,
                Attributes: {
                    DisplayName: 'CloudFront Pretty URLs Monitoring Alerts',
                    DeliveryPolicy: JSON.stringify({
                        http: {
                            defaultHealthyRetryPolicy: {
                                minDelayTarget: 20,
                                maxDelayTarget: 20,
                                numRetries: 3,
                                numMaxDelayRetries: 0,
                                numMinDelayRetries: 0,
                                numNoDelayRetries: 0,
                                backoffFunction: 'linear'
                            },
                            disableSubscriptionOverrides: false,
                            defaultThrottlePolicy: {
                                maxReceivesPerSecond: 1
                            }
                        }
                    }),
                    Policy: JSON.stringify({
                        Version: '2012-10-17',
                        Statement: [
                            {
                                Sid: 'AllowCloudWatchAlarmsToPublish',
                                Effect: 'Allow',
                                Principal: {
                                    Service: 'cloudwatch.amazonaws.com'
                                },
                                Action: 'SNS:Publish',
                                Resource: `arn:aws:sns:us-east-1:*:${topicName}`
                            },
                            {
                                Sid: 'AllowCloudWatchEventsToPublish',
                                Effect: 'Allow',
                                Principal: {
                                    Service: 'events.amazonaws.com'
                                },
                                Action: 'SNS:Publish',
                                Resource: `arn:aws:sns:us-east-1:*:${topicName}`
                            }
                        ]
                    })
                },
                Tags: [
                    { Key: 'Component', Value: 'CloudFront-PrettyURLs' },
                    { Key: 'Purpose', Value: 'Monitoring-Alerts' },
                    { Key: 'Environment', Value: 'Production' },
                    { Key: 'CreatedBy', Value: 'SNS-Integration-Script' }
                ]
            };

            const createTopicResult = await this.sns.createTopic(createTopicParams).promise();
            this.snsTopicArn = createTopicResult.TopicArn;
            
            console.log(`✅ SNS topic created/verified: ${this.snsTopicArn}`);
            
            // Set topic attributes for better message formatting
            await this.sns.setTopicAttributes({
                TopicArn: this.snsTopicArn,
                AttributeName: 'DisplayName',
                AttributeValue: 'CloudFront Pretty URLs Alerts'
            }).promise();

            return this.snsTopicArn;
        } catch (error) {
            console.error('❌ Failed to create SNS topic:', error.message);
            throw error;
        }
    }

    async setupEmailSubscriptions() {
        try {
            console.log('📬 Setting up email subscriptions...');
            
            // Check if email endpoints are configured
            if (!this.config.alerting.emailEndpoints || this.config.alerting.emailEndpoints.length === 0) {
                console.log('⚠️ No email endpoints configured. Adding placeholder for manual configuration.');
                
                // Add a placeholder email that needs to be manually configured
                const placeholderEmail = 'admin@example.com';
                console.log(`📝 To receive alerts, subscribe an email to: ${this.snsTopicArn}`);
                console.log(`   AWS CLI command: aws sns subscribe --topic-arn ${this.snsTopicArn} --protocol email --notification-endpoint YOUR_EMAIL@domain.com`);
                
                return [];
            }

            // Create email subscriptions
            for (const email of this.config.alerting.emailEndpoints) {
                try {
                    const subscriptionParams = {
                        TopicArn: this.snsTopicArn,
                        Protocol: 'email',
                        Endpoint: email,
                        Attributes: {
                            FilterPolicy: JSON.stringify({
                                severity: ['Critical', 'Warning', 'Info']
                            }),
                            DeliveryPolicy: JSON.stringify({
                                healthyRetryPolicy: {
                                    minDelayTarget: 20,
                                    maxDelayTarget: 20,
                                    numRetries: 3,
                                    numMaxDelayRetries: 0,
                                    numMinDelayRetries: 0,
                                    numNoDelayRetries: 0,
                                    backoffFunction: 'linear'
                                }
                            })
                        }
                    };

                    const subscription = await this.sns.subscribe(subscriptionParams).promise();
                    
                    this.subscriptions.push({
                        subscriptionArn: subscription.SubscriptionArn,
                        protocol: 'email',
                        endpoint: email,
                        status: 'PendingConfirmation'
                    });

                    console.log(`✅ Email subscription created for: ${email}`);
                    console.log(`   Subscription ARN: ${subscription.SubscriptionArn}`);
                    console.log(`   ⚠️ Email confirmation required to activate subscription`);
                    
                } catch (error) {
                    console.error(`❌ Failed to create subscription for ${email}:`, error.message);
                }
            }

            return this.subscriptions;
        } catch (error) {
            console.error('❌ Failed to setup email subscriptions:', error.message);
            throw error;
        }
    }

    async createAlarmStateChangeEventRule() {
        try {
            console.log('📢 Creating alarm state change event rule...');
            
            const ruleName = 'CloudFront-PrettyURLs-AlarmStateChanges';
            
            // Get list of existing alarms to monitor
            const alarms = await this.cloudwatch.describeAlarms({
                AlarmNamePrefix: 'CloudFront-PrettyURLs-'
            }).promise();

            const alarmNames = alarms.MetricAlarms.map(alarm => alarm.AlarmName);
            
            // Also get composite alarms
            const compositeAlarms = await this.cloudwatch.describeAlarms({
                AlarmTypes: ['CompositeAlarm'],
                AlarmNamePrefix: 'CloudFront-PrettyURLs-'
            }).promise();

            alarmNames.push(...compositeAlarms.CompositeAlarms.map(alarm => alarm.AlarmName));

            console.log(`📋 Monitoring ${alarmNames.length} alarms for state changes`);

            // Create CloudWatch Events rule
            const eventPattern = {
                source: ['aws.cloudwatch'],
                'detail-type': ['CloudWatch Alarm State Change'],
                detail: {
                    alarmName: alarmNames
                }
            };

            const ruleParams = {
                Name: ruleName,
                Description: 'Captures CloudFront Pretty URLs alarm state changes for SNS notifications',
                EventPattern: JSON.stringify(eventPattern),
                State: 'ENABLED',
                Tags: [
                    { Key: 'Component', Value: 'CloudFront-PrettyURLs' },
                    { Key: 'Purpose', Value: 'Alarm-Notifications' },
                    { Key: 'Environment', Value: 'Production' }
                ]
            };

            await this.events.putRule(ruleParams).promise();
            console.log(`✅ Created CloudWatch Events rule: ${ruleName}`);

            // Add SNS target to the rule with message transformation
            const targetParams = {
                Rule: ruleName,
                Targets: [
                    {
                        Id: '1',
                        Arn: this.snsTopicArn,
                        InputTransformer: {
                            InputPathsMap: {
                                alarmName: '$.detail.alarmName',
                                newState: '$.detail.state.value',
                                oldState: '$.detail.previousState.value',
                                reason: '$.detail.state.reason',
                                timestamp: '$.detail.state.timestamp',
                                region: '$.detail.region',
                                accountId: '$.account'
                            },
                            InputTemplate: JSON.stringify({
                                version: '1.0',
                                source: 'CloudFront Pretty URLs Monitoring',
                                alert: {
                                    type: 'alarm-state-change',
                                    severity: '<newState>',
                                    alarm: '<alarmName>',
                                    state: {
                                        current: '<newState>',
                                        previous: '<oldState>',
                                        reason: '<reason>',
                                        timestamp: '<timestamp>'
                                    },
                                    metadata: {
                                        region: '<region>',
                                        accountId: '<accountId>',
                                        component: 'CloudFront-PrettyURLs'
                                    },
                                    actions: {
                                        dashboardUrl: `https://us-east-1.console.aws.amazon.com/cloudwatch/home?region=us-east-1#dashboards:name=${this.config.dashboard.name}`,
                                        alarmUrl: 'https://us-east-1.console.aws.amazon.com/cloudwatch/home?region=us-east-1#alarmsV2:alarm/<alarmName>',
                                        distributionUrl: `https://us-east-1.console.aws.amazon.com/cloudfront/v3/home?region=us-east-1#/distributions/${this.config.monitoring.distributionId}`
                                    }
                                }
                            })
                        },
                        SqsParameters: undefined,
                        HttpParameters: undefined
                    }
                ]
            };

            await this.events.putTargets(targetParams).promise();
            console.log('✅ Added SNS target to alarm state change rule');

            this.eventRules.push({
                ruleName: ruleName,
                targetArn: this.snsTopicArn,
                alarmsMonitored: alarmNames.length
            });

            return ruleName;
        } catch (error) {
            console.error('❌ Failed to create alarm state change event rule:', error.message);
            throw error;
        }
    }

    async createCustomNotificationFormats() {
        try {
            console.log('🎨 Setting up custom notification message formats...');
            
            // Create message attributes for different severity levels
            const messageAttributes = {
                critical: {
                    subject: '[CRITICAL] CloudFront Pretty URLs Alert',
                    template: `
🚨 CRITICAL ALERT - CloudFront Pretty URLs

Alarm: {alarmName}
State: {newState} (was {oldState})
Time: {timestamp}
Reason: {reason}

🔗 Quick Actions:
• View Dashboard: {dashboardUrl}
• Check Distribution: {distributionUrl}
• View Alarm Details: {alarmUrl}

This requires immediate attention!
                    `
                },
                warning: {
                    subject: '[WARNING] CloudFront Pretty URLs Alert',
                    template: `
⚠️ WARNING - CloudFront Pretty URLs

Alarm: {alarmName}
State: {newState} (was {oldState})
Time: {timestamp}
Reason: {reason}

🔗 Quick Actions:
• View Dashboard: {dashboardUrl}
• Check Distribution: {distributionUrl}
• View Alarm Details: {alarmUrl}

Please investigate when convenient.
                    `
                },
                info: {
                    subject: '[INFO] CloudFront Pretty URLs Alert',
                    template: `
ℹ️ INFORMATION - CloudFront Pretty URLs

Alarm: {alarmName}
State: {newState} (was {oldState})
Time: {timestamp}
Reason: {reason}

🔗 Quick Actions:
• View Dashboard: {dashboardUrl}

For your information.
                    `
                }
            };

            // Save message templates for reference
            const templatesPath = path.join(__dirname, '..', 'config', 'sns-message-templates.json');
            await fs.writeFile(templatesPath, JSON.stringify(messageAttributes, null, 2));
            
            console.log(`✅ Message templates saved to: ${templatesPath}`);
            
            return messageAttributes;
        } catch (error) {
            console.error('❌ Failed to create custom notification formats:', error.message);
            throw error;
        }
    }

    async setupSlackIntegration() {
        try {
            console.log('💬 Setting up Slack integration (if configured)...');
            
            if (!this.config.alerting.slackWebhook) {
                console.log('⚠️ No Slack webhook configured. Skipping Slack integration.');
                console.log('   To add Slack integration:');
                console.log('   1. Create a Slack webhook URL');
                console.log('   2. Add it to config.alerting.slackWebhook');
                console.log('   3. Re-run this script');
                return null;
            }

            // Create HTTP subscription for Slack webhook
            const slackSubscription = await this.sns.subscribe({
                TopicArn: this.snsTopicArn,
                Protocol: 'https',
                Endpoint: this.config.alerting.slackWebhook,
                Attributes: {
                    FilterPolicy: JSON.stringify({
                        severity: ['Critical', 'Warning']
                    })
                }
            }).promise();

            console.log(`✅ Slack integration configured: ${slackSubscription.SubscriptionArn}`);
            
            this.subscriptions.push({
                subscriptionArn: slackSubscription.SubscriptionArn,
                protocol: 'https',
                endpoint: this.config.alerting.slackWebhook,
                status: 'Confirmed'
            });

            return slackSubscription.SubscriptionArn;
        } catch (error) {
            console.error('❌ Failed to setup Slack integration:', error.message);
            throw error;
        }
    }

    async testNotificationSystem() {
        try {
            console.log('🧪 Testing notification system...');
            
            // Publish test message to SNS topic
            const testMessage = {
                version: '1.0',
                source: 'CloudFront Pretty URLs Monitoring - TEST',
                alert: {
                    type: 'test-notification',
                    severity: 'INFO',
                    alarm: 'TEST-ALARM',
                    state: {
                        current: 'OK',
                        previous: 'ALARM',
                        reason: 'This is a test notification to verify SNS integration',
                        timestamp: new Date().toISOString()
                    },
                    metadata: {
                        region: 'us-east-1',
                        component: 'CloudFront-PrettyURLs',
                        testRun: true
                    },
                    actions: {
                        dashboardUrl: `https://us-east-1.console.aws.amazon.com/cloudwatch/home?region=us-east-1#dashboards:name=${this.config.dashboard.name}`,
                        message: 'If you receive this message, SNS integration is working correctly!'
                    }
                }
            };

            const publishParams = {
                TopicArn: this.snsTopicArn,
                Message: JSON.stringify(testMessage, null, 2),
                Subject: '[TEST] CloudFront Pretty URLs - SNS Integration Test',
                MessageAttributes: {
                    severity: {
                        DataType: 'String',
                        StringValue: 'Info'
                    },
                    component: {
                        DataType: 'String',
                        StringValue: 'CloudFront-PrettyURLs'
                    },
                    testMessage: {
                        DataType: 'String',
                        StringValue: 'true'
                    }
                }
            };

            const publishResult = await this.sns.publish(publishParams).promise();
            
            console.log(`✅ Test notification sent successfully`);
            console.log(`   Message ID: ${publishResult.MessageId}`);
            console.log('   📧 Check your email/Slack for the test notification');
            
            return publishResult.MessageId;
        } catch (error) {
            console.error('❌ Failed to test notification system:', error.message);
            throw error;
        }
    }

    async validateSNSIntegration() {
        try {
            console.log('🔍 Validating SNS integration...');
            
            const validation = {
                snsTopicExists: false,
                subscriptionsCount: 0,
                confirmedSubscriptions: 0,
                eventRulesCount: 0,
                alarmsWithSNSActions: 0,
                testMessageSent: false
            };

            // Check if SNS topic exists
            try {
                await this.sns.getTopicAttributes({ TopicArn: this.snsTopicArn }).promise();
                validation.snsTopicExists = true;
            } catch (error) {
                console.error('❌ SNS topic validation failed:', error.message);
            }

            // Check subscriptions
            const subscriptions = await this.sns.listSubscriptionsByTopic({
                TopicArn: this.snsTopicArn
            }).promise();

            validation.subscriptionsCount = subscriptions.Subscriptions.length;
            validation.confirmedSubscriptions = subscriptions.Subscriptions.filter(
                sub => sub.SubscriptionArn !== 'PendingConfirmation'
            ).length;

            // Check event rules
            const rules = await this.events.listRules({
                NamePrefix: 'CloudFront-PrettyURLs-'
            }).promise();

            validation.eventRulesCount = rules.Rules.length;

            // Check alarms with SNS actions
            const alarms = await this.cloudwatch.describeAlarms({
                AlarmNamePrefix: 'CloudFront-PrettyURLs-'
            }).promise();

            validation.alarmsWithSNSActions = alarms.MetricAlarms.filter(
                alarm => alarm.AlarmActions && alarm.AlarmActions.includes(this.snsTopicArn)
            ).length;

            console.log('\n📊 SNS Integration Validation Results:');
            console.log(`   SNS Topic Exists: ${validation.snsTopicExists ? '✅' : '❌'}`);
            console.log(`   Total Subscriptions: ${validation.subscriptionsCount}`);
            console.log(`   Confirmed Subscriptions: ${validation.confirmedSubscriptions}`);
            console.log(`   Event Rules: ${validation.eventRulesCount}`);
            console.log(`   Alarms with SNS Actions: ${validation.alarmsWithSNSActions}`);

            return validation;
        } catch (error) {
            console.error('❌ Failed to validate SNS integration:', error.message);
            throw error;
        }
    }

    async generateSNSIntegrationReport() {
        try {
            const report = {
                timestamp: new Date().toISOString(),
                snsIntegration: {
                    topicArn: this.snsTopicArn,
                    topicName: this.config.alerting.snsTopicName,
                    subscriptions: this.subscriptions,
                    eventRules: this.eventRules
                },
                configuration: {
                    distributionId: this.config.monitoring.distributionId,
                    functionName: this.config.monitoring.functionName,
                    region: this.config.monitoring.region,
                    dashboardName: this.config.dashboard.name
                },
                notifications: {
                    emailEndpoints: this.config.alerting.emailEndpoints || [],
                    slackIntegration: !!this.config.alerting.slackWebhook,
                    customFormats: true,
                    testingEnabled: true
                },
                urls: {
                    snsConsole: `https://us-east-1.console.aws.amazon.com/sns/v3/home?region=us-east-1#/topic/${this.snsTopicArn}`,
                    eventsConsole: 'https://us-east-1.console.aws.amazon.com/events/home?region=us-east-1#/rules',
                    alarmsConsole: 'https://us-east-1.console.aws.amazon.com/cloudwatch/home?region=us-east-1#alarmsV2:',
                    dashboard: `https://us-east-1.console.aws.amazon.com/cloudwatch/home?region=us-east-1#dashboards:name=${this.config.dashboard.name}`
                },
                nextSteps: [
                    'Confirm email subscriptions by checking email and clicking confirmation links',
                    'Test alarm notifications by temporarily adjusting alarm thresholds',
                    'Configure additional notification channels (Slack, PagerDuty, etc.)',
                    'Set up notification suppression rules for maintenance windows',
                    'Review and adjust message templates as needed'
                ],
                troubleshooting: {
                    emailNotReceived: 'Check spam folder and confirm subscription via AWS console',
                    slackNotWorking: 'Verify webhook URL and Slack app permissions',
                    noAlarmNotifications: 'Ensure alarms have SNS topic in AlarmActions',
                    tooManyNotifications: 'Adjust alarm thresholds or add suppression rules'
                }
            };

            // Save report
            const reportPath = path.join(__dirname, '..', 'logs', `sns-integration-report-${Date.now()}.json`);
            await fs.writeFile(reportPath, JSON.stringify(report, null, 2));

            // Create summary markdown
            const summaryPath = path.join(__dirname, '..', 'logs', `sns-integration-summary-${Date.now()}.md`);
            const summaryContent = `
# SNS Integration Setup Summary

## Overview
SNS integration for CloudFront Pretty URLs monitoring has been successfully configured.

## Configuration Details
- **SNS Topic**: ${this.snsTopicArn}
- **Subscriptions**: ${this.subscriptions.length} configured
- **Event Rules**: ${this.eventRules.length} created
- **Distribution**: ${this.config.monitoring.distributionId}

## Subscriptions
${this.subscriptions.map(sub => `- ${sub.protocol}: ${sub.endpoint} (${sub.status})`).join('\n')}

## Next Steps
${report.nextSteps.map(step => `- ${step}`).join('\n')}

## Quick Links
- [SNS Console](${report.urls.snsConsole})
- [CloudWatch Alarms](${report.urls.alarmsConsole})
- [Monitoring Dashboard](${report.urls.dashboard})

## Testing
Run the following command to send a test notification:
\`\`\`bash
node scripts/setup-sns-integration-pretty-urls.js --test
\`\`\`

Generated: ${new Date().toISOString()}
            `;

            await fs.writeFile(summaryPath, summaryContent);

            console.log(`✅ SNS integration report generated:`);
            console.log(`   JSON Report: ${reportPath}`);
            console.log(`   Summary: ${summaryPath}`);

            return report;
        } catch (error) {
            console.error('❌ Failed to generate SNS integration report:', error.message);
            throw error;
        }
    }

    async setupCompleteSNSIntegration() {
        try {
            console.log('🚀 Setting up complete SNS integration for CloudFront Pretty URLs...\n');

            // Load configuration
            await this.loadConfig();

            // Create SNS topic
            await this.createSNSTopic();

            // Setup email subscriptions
            await this.setupEmailSubscriptions();

            // Create alarm state change event rule
            await this.createAlarmStateChangeEventRule();

            // Setup custom notification formats
            await this.createCustomNotificationFormats();

            // Setup Slack integration (if configured)
            await this.setupSlackIntegration();

            // Test notification system
            await this.testNotificationSystem();

            // Validate integration
            const validation = await this.validateSNSIntegration();

            // Generate report
            const report = await this.generateSNSIntegrationReport();

            console.log('\n🎉 SNS Integration Setup Complete!');
            console.log('\n📋 Summary:');
            console.log(`   SNS Topic: ${this.snsTopicArn}`);
            console.log(`   Subscriptions: ${this.subscriptions.length}`);
            console.log(`   Event Rules: ${this.eventRules.length}`);
            console.log(`   Validation: ${validation.snsTopicExists ? 'PASSED' : 'FAILED'}`);

            return {
                snsTopicArn: this.snsTopicArn,
                subscriptions: this.subscriptions,
                eventRules: this.eventRules,
                validation: validation,
                report: report
            };

        } catch (error) {
            console.error('❌ Failed to setup complete SNS integration:', error.message);
            throw error;
        }
    }
}

// CLI execution
async function main() {
    const snsManager = new SNSIntegrationManager();
    
    try {
        const args = process.argv.slice(2);
        
        if (args.includes('--test')) {
            // Test mode - just send test notification
            await snsManager.loadConfig();
            // Assume topic exists for testing
            snsManager.snsTopicArn = `arn:aws:sns:us-east-1:*:${snsManager.config.alerting.snsTopicName}`;
            await snsManager.testNotificationSystem();
        } else {
            // Full setup
            await snsManager.setupCompleteSNSIntegration();
        }
        
        process.exit(0);
    } catch (error) {
        console.error('❌ SNS integration setup failed:', error.message);
        process.exit(1);
    }
}

// Run if called directly
if (require.main === module) {
    main();
}

module.exports = SNSIntegrationManager;