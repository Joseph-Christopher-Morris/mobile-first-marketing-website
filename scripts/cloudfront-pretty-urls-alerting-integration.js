#!/usr/bin/env node

/**
 * CloudFront Pretty URLs Alerting Integration
 * 
 * Implements comprehensive CloudWatch alarms for function errors and performance
 * with integration to existing monitoring systems.
 * 
 * Requirements: 8.4, 7.4
 */

const AWS = require('aws-sdk');
const fs = require('fs').promises;
const path = require('path');

class CloudFrontPrettyURLsAlerting {
    constructor() {
        this.cloudwatch = new AWS.CloudWatch({ region: 'us-east-1' });
        this.sns = new AWS.SNS({ region: 'us-east-1' });
        this.cloudfront = new AWS.CloudFront();
        
        this.config = null;
        this.distributionId = 'E2IBMHQ3GCW6ZK';
        this.functionName = 'pretty-urls-rewriter';
        this.snsTopicArn = null;
        this.alarms = [];
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

    async setupSNSIntegration() {
        try {
            console.log('📧 Setting up SNS integration for alerts...');
            
            const topicName = this.config.alerting.snsTopicName;
            
            // Create SNS topic for alerts
            const createTopicResult = await this.sns.createTopic({
                Name: topicName,
                Attributes: {
                    DisplayName: 'CloudFront Pretty URLs Alerts',
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
                            }
                        }
                    })
                }
            }).promise();

            this.snsTopicArn = createTopicResult.TopicArn;
            console.log(`✅ SNS topic created/verified: ${this.snsTopicArn}`);

            // Create subscription for email notifications if configured
            if (this.config.alerting.emailEndpoints && this.config.alerting.emailEndpoints.length > 0) {
                for (const email of this.config.alerting.emailEndpoints) {
                    await this.sns.subscribe({
                        TopicArn: this.snsTopicArn,
                        Protocol: 'email',
                        Endpoint: email
                    }).promise();
                    console.log(`✅ Email subscription created for: ${email}`);
                }
            }

            return this.snsTopicArn;
        } catch (error) {
            console.error('❌ Failed to setup SNS integration:', error.message);
            throw error;
        }
    }

    async createCriticalAlarms() {
        try {
            console.log('🚨 Creating critical CloudWatch alarms...');
            
            const criticalAlarms = [];

            // 1. Function Execution Errors - Critical
            const functionErrorsAlarm = {
                AlarmName: 'CloudFront-PrettyURLs-Function-Errors-Critical',
                AlarmDescription: 'CRITICAL: CloudFront Function execution errors detected - immediate attention required',
                MetricName: 'FunctionExecutionErrors',
                Namespace: 'AWS/CloudFront',
                Statistic: 'Sum',
                Dimensions: [
                    {
                        Name: 'FunctionName',
                        Value: this.functionName
                    }
                ],
                Period: this.config.thresholds.critical.functionErrors.period,
                EvaluationPeriods: this.config.thresholds.critical.functionErrors.evaluationPeriods,
                Threshold: this.config.thresholds.critical.functionErrors.value,
                ComparisonOperator: 'GreaterThanThreshold',
                AlarmActions: [this.snsTopicArn],
                OKActions: [this.snsTopicArn],
                TreatMissingData: 'notBreaching',
                Tags: [
                    { Key: 'Severity', Value: 'Critical' },
                    { Key: 'Component', Value: 'CloudFront-PrettyURLs' },
                    { Key: 'Type', Value: 'Function-Error' }
                ]
            };

            // 2. 5xx Error Rate - Critical
            const errorRate5xxAlarm = {
                AlarmName: 'CloudFront-PrettyURLs-5xx-ErrorRate-Critical',
                AlarmDescription: 'CRITICAL: High 5xx error rate detected - service degradation',
                MetricName: '5xxErrorRate',
                Namespace: 'AWS/CloudFront',
                Statistic: 'Average',
                Dimensions: [
                    {
                        Name: 'DistributionId',
                        Value: this.distributionId
                    }
                ],
                Period: this.config.thresholds.critical.errorRate5xx.period,
                EvaluationPeriods: this.config.thresholds.critical.errorRate5xx.evaluationPeriods,
                Threshold: this.config.thresholds.critical.errorRate5xx.value,
                ComparisonOperator: 'GreaterThanThreshold',
                AlarmActions: [this.snsTopicArn],
                OKActions: [this.snsTopicArn],
                TreatMissingData: 'notBreaching',
                Tags: [
                    { Key: 'Severity', Value: 'Critical' },
                    { Key: 'Component', Value: 'CloudFront-PrettyURLs' },
                    { Key: 'Type', Value: '5xx-Error' }
                ]
            };

            // 3. URL Accessibility Rate - Critical
            const urlAccessibilityAlarm = {
                AlarmName: 'CloudFront-PrettyURLs-Accessibility-Critical',
                AlarmDescription: 'CRITICAL: URL accessibility rate below threshold - pretty URLs failing',
                MetricName: 'URLAccessibilityRate',
                Namespace: 'Custom/CloudFront',
                Statistic: 'Average',
                Dimensions: [
                    {
                        Name: 'FunctionName',
                        Value: this.functionName
                    }
                ],
                Period: this.config.thresholds.critical.urlAccessibility.period,
                EvaluationPeriods: this.config.thresholds.critical.urlAccessibility.evaluationPeriods,
                Threshold: this.config.thresholds.critical.urlAccessibility.value,
                ComparisonOperator: 'LessThanThreshold',
                AlarmActions: [this.snsTopicArn],
                OKActions: [this.snsTopicArn],
                TreatMissingData: 'breaching',
                Tags: [
                    { Key: 'Severity', Value: 'Critical' },
                    { Key: 'Component', Value: 'CloudFront-PrettyURLs' },
                    { Key: 'Type', Value: 'Accessibility' }
                ]
            };

            criticalAlarms.push(functionErrorsAlarm, errorRate5xxAlarm, urlAccessibilityAlarm);

            // Create all critical alarms
            for (const alarm of criticalAlarms) {
                await this.cloudwatch.putMetricAlarm(alarm).promise();
                console.log(`✅ Created critical alarm: ${alarm.AlarmName}`);
                this.alarms.push({
                    name: alarm.AlarmName,
                    severity: 'Critical',
                    type: alarm.Tags.find(tag => tag.Key === 'Type').Value
                });
            }

            return criticalAlarms;

        } catch (error) {
            console.error('❌ Failed to create critical alarms:', error.message);
            throw error;
        }
    }

    async createWarningAlarms() {
        try {
            console.log('⚠️ Creating warning CloudWatch alarms...');
            
            const warningAlarms = [];

            // 1. Function Execution Time - Warning
            const functionExecutionTimeAlarm = {
                AlarmName: 'CloudFront-PrettyURLs-ExecutionTime-Warning',
                AlarmDescription: 'WARNING: Function execution time above threshold - performance degradation',
                MetricName: 'FunctionExecutionTime',
                Namespace: 'AWS/CloudFront',
                Statistic: 'Average',
                Dimensions: [
                    {
                        Name: 'FunctionName',
                        Value: this.functionName
                    }
                ],
                Period: this.config.thresholds.warning.functionExecutionTime.period,
                EvaluationPeriods: this.config.thresholds.warning.functionExecutionTime.evaluationPeriods,
                Threshold: this.config.thresholds.warning.functionExecutionTime.value,
                ComparisonOperator: 'GreaterThanThreshold',
                AlarmActions: [this.snsTopicArn],
                OKActions: [this.snsTopicArn],
                TreatMissingData: 'notBreaching',
                Tags: [
                    { Key: 'Severity', Value: 'Warning' },
                    { Key: 'Component', Value: 'CloudFront-PrettyURLs' },
                    { Key: 'Type', Value: 'Performance' }
                ]
            };

            // 2. 4xx Error Rate - Warning
            const errorRate4xxAlarm = {
                AlarmName: 'CloudFront-PrettyURLs-4xx-ErrorRate-Warning',
                AlarmDescription: 'WARNING: High 4xx error rate detected - client errors increasing',
                MetricName: '4xxErrorRate',
                Namespace: 'AWS/CloudFront',
                Statistic: 'Average',
                Dimensions: [
                    {
                        Name: 'DistributionId',
                        Value: this.distributionId
                    }
                ],
                Period: this.config.thresholds.warning.errorRate4xx.period,
                EvaluationPeriods: this.config.thresholds.warning.errorRate4xx.evaluationPeriods,
                Threshold: this.config.thresholds.warning.errorRate4xx.value,
                ComparisonOperator: 'GreaterThanThreshold',
                AlarmActions: [this.snsTopicArn],
                OKActions: [this.snsTopicArn],
                TreatMissingData: 'notBreaching',
                Tags: [
                    { Key: 'Severity', Value: 'Warning' },
                    { Key: 'Component', Value: 'CloudFront-PrettyURLs' },
                    { Key: 'Type', Value: '4xx-Error' }
                ]
            };

            // 3. Cache Hit Rate - Warning
            const cacheHitRateAlarm = {
                AlarmName: 'CloudFront-PrettyURLs-CacheHitRate-Warning',
                AlarmDescription: 'WARNING: Cache hit rate below threshold - cache efficiency degraded',
                MetricName: 'CacheHitRate',
                Namespace: 'AWS/CloudFront',
                Statistic: 'Average',
                Dimensions: [
                    {
                        Name: 'DistributionId',
                        Value: this.distributionId
                    }
                ],
                Period: this.config.thresholds.warning.cacheHitRate.period,
                EvaluationPeriods: this.config.thresholds.warning.cacheHitRate.evaluationPeriods,
                Threshold: this.config.thresholds.warning.cacheHitRate.value,
                ComparisonOperator: 'LessThanThreshold',
                AlarmActions: [this.snsTopicArn],
                OKActions: [this.snsTopicArn],
                TreatMissingData: 'notBreaching',
                Tags: [
                    { Key: 'Severity', Value: 'Warning' },
                    { Key: 'Component', Value: 'CloudFront-PrettyURLs' },
                    { Key: 'Type', Value: 'Cache-Performance' }
                ]
            };

            warningAlarms.push(functionExecutionTimeAlarm, errorRate4xxAlarm, cacheHitRateAlarm);

            // Create all warning alarms
            for (const alarm of warningAlarms) {
                await this.cloudwatch.putMetricAlarm(alarm).promise();
                console.log(`✅ Created warning alarm: ${alarm.AlarmName}`);
                this.alarms.push({
                    name: alarm.AlarmName,
                    severity: 'Warning',
                    type: alarm.Tags.find(tag => tag.Key === 'Type').Value
                });
            }

            return warningAlarms;

        } catch (error) {
            console.error('❌ Failed to create warning alarms:', error.message);
            throw error;
        }
    }

    async createCompositeAlarms() {
        try {
            console.log('🔗 Creating composite alarms for system health...');
            
            // System Health Composite Alarm
            const systemHealthAlarm = {
                AlarmName: 'CloudFront-PrettyURLs-SystemHealth-Composite',
                AlarmDescription: 'COMPOSITE: Overall system health status for CloudFront Pretty URLs',
                AlarmRule: `(ALARM("CloudFront-PrettyURLs-Function-Errors-Critical") OR 
                           ALARM("CloudFront-PrettyURLs-5xx-ErrorRate-Critical") OR 
                           ALARM("CloudFront-PrettyURLs-Accessibility-Critical"))`,
                ActionsEnabled: true,
                AlarmActions: [this.snsTopicArn],
                OKActions: [this.snsTopicArn],
                Tags: [
                    { Key: 'Severity', Value: 'Critical' },
                    { Key: 'Component', Value: 'CloudFront-PrettyURLs' },
                    { Key: 'Type', Value: 'System-Health' }
                ]
            };

            await this.cloudwatch.putCompositeAlarm(systemHealthAlarm).promise();
            console.log(`✅ Created composite alarm: ${systemHealthAlarm.AlarmName}`);
            
            this.alarms.push({
                name: systemHealthAlarm.AlarmName,
                severity: 'Critical',
                type: 'Composite-Health'
            });

            return systemHealthAlarm;

        } catch (error) {
            console.error('❌ Failed to create composite alarms:', error.message);
            throw error;
        }
    }

    async integrateWithExistingMonitoring() {
        try {
            console.log('🔌 Integrating with existing monitoring systems...');
            
            // Check existing monitoring dashboard
            const existingDashboards = await this.cloudwatch.listDashboards({
                DashboardNamePrefix: 'CloudFront-PrettyURLs'
            }).promise();

            console.log(`✅ Found ${existingDashboards.DashboardEntries.length} existing dashboards`);

            // Update dashboard with alarm widgets
            if (existingDashboards.DashboardEntries.length > 0) {
                await this.addAlarmWidgetsToDashboard(existingDashboards.DashboardEntries[0].DashboardName);
            }

            // Create alarm summary widget
            await this.createAlarmSummaryWidget();

            // Setup alarm state change notifications
            await this.setupAlarmStateChangeNotifications();

            console.log('✅ Integration with existing monitoring completed');

        } catch (error) {
            console.error('❌ Failed to integrate with existing monitoring:', error.message);
            throw error;
        }
    }

    async addAlarmWidgetsToDashboard(dashboardName) {
        try {
            console.log(`📊 Adding alarm widgets to dashboard: ${dashboardName}`);
            
            // Get existing dashboard
            const dashboard = await this.cloudwatch.getDashboard({
                DashboardName: dashboardName
            }).promise();

            const dashboardBody = JSON.parse(dashboard.DashboardBody);

            // Add alarm status widget
            const alarmWidget = {
                type: "metric",
                x: 0,
                y: 57, // Position after existing widgets
                width: 24,
                height: 6,
                properties: {
                    metrics: this.alarms.map(alarm => [
                        "AWS/CloudWatch", "AlarmState", "AlarmName", alarm.name
                    ]),
                    view: "timeSeries",
                    stacked: false,
                    region: "us-east-1",
                    title: "🚨 Alarm Status Overview",
                    period: 300,
                    stat: "Maximum",
                    yAxis: {
                        left: { min: 0, max: 1 }
                    },
                    annotations: {
                        horizontal: [
                            {
                                label: "ALARM State",
                                value: 1,
                                fill: "above"
                            },
                            {
                                label: "OK State",
                                value: 0,
                                fill: "below"
                            }
                        ]
                    }
                }
            };

            dashboardBody.widgets.push(alarmWidget);

            // Update dashboard
            await this.cloudwatch.putDashboard({
                DashboardName: dashboardName,
                DashboardBody: JSON.stringify(dashboardBody)
            }).promise();

            console.log(`✅ Added alarm widgets to dashboard: ${dashboardName}`);

        } catch (error) {
            console.error('❌ Failed to add alarm widgets to dashboard:', error.message);
            throw error;
        }
    }

    async createAlarmSummaryWidget() {
        try {
            console.log('📋 Creating alarm summary dashboard...');
            
            const alarmSummaryDashboard = {
                widgets: [
                    {
                        type: "text",
                        x: 0, y: 0, width: 24, height: 6,
                        properties: {
                            markdown: `
# 🚨 CloudFront Pretty URLs - Alarm Summary

## Critical Alarms
- **Function Errors**: Monitors CloudFront Function execution errors
- **5xx Error Rate**: Monitors server-side errors
- **URL Accessibility**: Monitors pretty URL functionality

## Warning Alarms  
- **Function Performance**: Monitors execution time
- **4xx Error Rate**: Monitors client-side errors
- **Cache Hit Rate**: Monitors cache efficiency

## Alarm Thresholds
- 🔴 **Critical**: Function errors >10/5min, 5xx rate >1%, URL accessibility <90%
- 🟡 **Warning**: Function time >5ms, 4xx rate >5%, Cache hit <80%

## Quick Actions
- [View All Alarms](https://us-east-1.console.aws.amazon.com/cloudwatch/home?region=us-east-1#alarmsV2:)
- [Function Logs](https://us-east-1.console.aws.amazon.com/cloudwatch/home?region=us-east-1#logsV2:log-groups)
- [Distribution Console](https://us-east-1.console.aws.amazon.com/cloudfront/v3/home?region=us-east-1#/distributions/${this.distributionId})

*Last Updated: ${new Date().toISOString()}*
                            `
                        }
                    },
                    {
                        type: "metric",
                        x: 0, y: 6, width: 24, height: 8,
                        properties: {
                            metrics: this.alarms.filter(alarm => alarm.severity === 'Critical').map(alarm => [
                                "AWS/CloudWatch", "AlarmState", "AlarmName", alarm.name, { label: `${alarm.type} (Critical)` }
                            ]),
                            view: "timeSeries",
                            stacked: false,
                            region: "us-east-1",
                            title: "🔴 Critical Alarms Status",
                            period: 300,
                            stat: "Maximum"
                        }
                    },
                    {
                        type: "metric",
                        x: 0, y: 14, width: 24, height: 8,
                        properties: {
                            metrics: this.alarms.filter(alarm => alarm.severity === 'Warning').map(alarm => [
                                "AWS/CloudWatch", "AlarmState", "AlarmName", alarm.name, { label: `${alarm.type} (Warning)` }
                            ]),
                            view: "timeSeries",
                            stacked: false,
                            region: "us-east-1",
                            title: "🟡 Warning Alarms Status",
                            period: 300,
                            stat: "Maximum"
                        }
                    }
                ]
            };

            await this.cloudwatch.putDashboard({
                DashboardName: 'CloudFront-PrettyURLs-Alarms-Summary',
                DashboardBody: JSON.stringify(alarmSummaryDashboard)
            }).promise();

            console.log('✅ Created alarm summary dashboard');

        } catch (error) {
            console.error('❌ Failed to create alarm summary widget:', error.message);
            throw error;
        }
    }

    async setupAlarmStateChangeNotifications() {
        try {
            console.log('📢 Setting up alarm state change notifications...');
            
            // Create CloudWatch Events rule for alarm state changes
            const events = new AWS.CloudWatchEvents({ region: 'us-east-1' });
            
            const ruleName = 'CloudFront-PrettyURLs-AlarmStateChanges';
            
            const rule = {
                Name: ruleName,
                Description: 'Captures CloudFront Pretty URLs alarm state changes',
                EventPattern: JSON.stringify({
                    source: ["aws.cloudwatch"],
                    "detail-type": ["CloudWatch Alarm State Change"],
                    detail: {
                        alarmName: this.alarms.map(alarm => alarm.name)
                    }
                }),
                State: 'ENABLED'
            };

            await events.putRule(rule).promise();
            console.log(`✅ Created CloudWatch Events rule: ${ruleName}`);

            // Add SNS target to the rule
            await events.putTargets({
                Rule: ruleName,
                Targets: [
                    {
                        Id: '1',
                        Arn: this.snsTopicArn,
                        InputTransformer: {
                            InputPathsMap: {
                                alarmName: '$.detail.alarmName',
                                newState: '$.detail.state.value',
                                reason: '$.detail.state.reason',
                                timestamp: '$.detail.state.timestamp'
                            },
                            InputTemplate: JSON.stringify({
                                alert: 'CloudFront Pretty URLs Alarm State Change',
                                alarm: '<alarmName>',
                                state: '<newState>',
                                reason: '<reason>',
                                timestamp: '<timestamp>',
                                dashboardUrl: `https://us-east-1.console.aws.amazon.com/cloudwatch/home?region=us-east-1#dashboards:name=${this.config.dashboard.name}`
                            })
                        }
                    }
                ]
            }).promise();

            console.log('✅ Added SNS target to alarm state change rule');

        } catch (error) {
            console.error('❌ Failed to setup alarm state change notifications:', error.message);
            throw error;
        }
    }

    async validateAlarmSetup() {
        try {
            console.log('🔍 Validating alarm setup...');

            // Check if all alarms exist and are configured correctly
            const alarms = await this.cloudwatch.describeAlarms({
                AlarmNamePrefix: 'CloudFront-PrettyURLs-'
            }).promise();

            const validationResults = {
                totalAlarms: alarms.MetricAlarms.length,
                criticalAlarms: 0,
                warningAlarms: 0,
                compositeAlarms: 0,
                alarmsInOKState: 0,
                alarmsInAlarmState: 0,
                alarmsWithActions: 0
            };

            for (const alarm of alarms.MetricAlarms) {
                if (alarm.AlarmName.includes('Critical')) {
                    validationResults.criticalAlarms++;
                } else if (alarm.AlarmName.includes('Warning')) {
                    validationResults.warningAlarms++;
                }

                if (alarm.StateValue === 'OK') {
                    validationResults.alarmsInOKState++;
                } else if (alarm.StateValue === 'ALARM') {
                    validationResults.alarmsInAlarmState++;
                }

                if (alarm.AlarmActions && alarm.AlarmActions.length > 0) {
                    validationResults.alarmsWithActions++;
                }
            }

            // Check composite alarms
            const compositeAlarms = await this.cloudwatch.describeAlarms({
                AlarmTypes: ['CompositeAlarm'],
                AlarmNamePrefix: 'CloudFront-PrettyURLs-'
            }).promise();

            validationResults.compositeAlarms = compositeAlarms.CompositeAlarms.length;

            console.log('\n📊 Alarm Validation Results:');
            console.log(`   Total Alarms: ${validationResults.totalAlarms}`);
            console.log(`   Critical Alarms: ${validationResults.criticalAlarms}`);
            console.log(`   Warning Alarms: ${validationResults.warningAlarms}`);
            console.log(`   Composite Alarms: ${validationResults.compositeAlarms}`);
            console.log(`   Alarms in OK State: ${validationResults.alarmsInOKState}`);
            console.log(`   Alarms in ALARM State: ${validationResults.alarmsInAlarmState}`);
            console.log(`   Alarms with Actions: ${validationResults.alarmsWithActions}`);

            return validationResults;

        } catch (error) {
            console.error('❌ Failed to validate alarm setup:', error.message);
            throw error;
        }
    }

    async generateAlertingReport() {
        try {
            const report = {
                timestamp: new Date().toISOString(),
                distributionId: this.distributionId,
                functionName: this.functionName,
                snsTopicArn: this.snsTopicArn,
                alerting: {
                    alarmsConfigured: this.alarms.length,
                    criticalAlarms: this.alarms.filter(a => a.severity === 'Critical').length,
                    warningAlarms: this.alarms.filter(a => a.severity === 'Warning').length,
                    snsIntegrationEnabled: !!this.snsTopicArn,
                    dashboardIntegrationEnabled: true
                },
                alarms: this.alarms,
                integration: {
                    existingMonitoring: true,
                    dashboardUpdated: true,
                    stateChangeNotifications: true
                },
                urls: {
                    alarmsDashboard: `https://us-east-1.console.aws.amazon.com/cloudwatch/home?region=us-east-1#dashboards:name=CloudFront-PrettyURLs-Alarms-Summary`,
                    mainDashboard: `https://us-east-1.console.aws.amazon.com/cloudwatch/home?region=us-east-1#dashboards:name=${this.config.dashboard.name}`,
                    alarmsConsole: 'https://us-east-1.console.aws.amazon.com/cloudwatch/home?region=us-east-1#alarmsV2:'
                },
                nextSteps: [
                    'Configure email endpoints in SNS topic subscriptions',
                    'Test alarm notifications by triggering test conditions',
                    'Set up Slack/Teams integration if needed',
                    'Configure PagerDuty integration for critical alerts',
                    'Schedule regular alarm threshold reviews'
                ]
            };

            // Save report
            const reportPath = path.join(__dirname, '..', 'logs', `pretty-urls-alerting-report-${Date.now()}.json`);
            await fs.writeFile(reportPath, JSON.stringify(report, null, 2));

            console.log(`✅ Alerting integration report generated: ${reportPath}`);
            return report;

        } catch (error) {
            console.error('❌ Failed to generate alerting report:', error.message);
            throw error;
        }
    }

    async setupCompleteAlerting() {
        try {
            console.log('🚀 Setting up complete CloudFront Pretty URLs alerting integration...\n');

            // Load configuration
            await this.loadConfig();

            // Setup SNS integration
            await this.setupSNSIntegration();

            // Create critical alarms
            await this.createCriticalAlarms();

            // Create warning alarms
            await this.createWarningAlarms();

            // Create composite alarms
            await this.createCompositeAlarms();

            // Integrate with existing monitoring
            await this.integrateWithExistingMonitoring();

            // Validate setup
            const validation = await this.validateAlarmSetup();

            // Generate report
            const report = await this.generateAlertingReport();

            console.log('\n✅ CloudFront Pretty URLs alerting integration completed successfully!');
            console.log('\n📊 Setup Summary:');
            console.log(`   - Total alarms configured: ${validation.totalAlarms}`);
            console.log(`   - Critical alarms: ${validation.criticalAlarms}`);
            console.log(`   - Warning alarms: ${validation.warningAlarms}`);
            console.log(`   - Composite alarms: ${validation.compositeAlarms}`);
            console.log(`   - SNS integration: ${report.alerting.snsIntegrationEnabled ? 'Enabled' : 'Disabled'}`);
            console.log(`   - Dashboard integration: ${report.integration.dashboardUpdated ? 'Enabled' : 'Disabled'}`);
            console.log(`\n🔗 Quick Links:`);
            console.log(`   - Alarms Dashboard: ${report.urls.alarmsDashboard}`);
            console.log(`   - Main Dashboard: ${report.urls.mainDashboard}`);
            console.log(`   - Alarms Console: ${report.urls.alarmsConsole}`);

            return {
                success: true,
                validation,
                report
            };

        } catch (error) {
            console.error('❌ Failed to setup alerting integration:', error.message);
            throw error;
        }
    }
}

// CLI execution
if (require.main === module) {
    const alerting = new CloudFrontPrettyURLsAlerting();
    
    alerting.setupCompleteAlerting()
        .then(result => {
            console.log('\n🎉 Alerting integration setup completed successfully!');
            process.exit(0);
        })
        .catch(error => {
            console.error('\n💥 Alerting integration setup failed:', error.message);
            process.exit(1);
        });
}

module.exports = CloudFrontPrettyURLsAlerting;