#!/usr/bin/env node

/**
 * Update Existing CloudWatch Alarms with SNS Actions
 * 
 * Updates all CloudFront Pretty URLs alarms to include SNS topic in their actions
 * for proper notification delivery.
 * 
 * Requirements: 8.4, 7.4
 * Task: 7.2.3 Set up SNS integration and notification system
 */

const AWS = require('aws-sdk');
const fs = require('fs').promises;
const path = require('path');

class AlarmSNSUpdater {
    constructor() {
        this.cloudwatch = new AWS.CloudWatch({ region: 'us-east-1' });
        this.sns = new AWS.SNS({ region: 'us-east-1' });
        
        this.config = null;
        this.snsTopicArn = null;
        this.updatedAlarms = [];
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

    async getSNSTopicArn() {
        try {
            const topicName = this.config.alerting.snsTopicName;
            
            // List topics to find the ARN
            const topics = await this.sns.listTopics().promise();
            const topic = topics.Topics.find(t => t.TopicArn.includes(topicName));
            
            if (!topic) {
                throw new Error(`SNS topic '${topicName}' not found. Please run setup-sns-integration-pretty-urls.js first.`);
            }
            
            this.snsTopicArn = topic.TopicArn;
            console.log(`✅ Found SNS topic: ${this.snsTopicArn}`);
            
            return this.snsTopicArn;
        } catch (error) {
            console.error('❌ Failed to get SNS topic ARN:', error.message);
            throw error;
        }
    }

    async updateMetricAlarms() {
        try {
            console.log('🔄 Updating metric alarms with SNS actions...');
            
            // Get all CloudFront Pretty URLs alarms
            const alarms = await this.cloudwatch.describeAlarms({
                AlarmNamePrefix: 'CloudFront-PrettyURLs-'
            }).promise();

            console.log(`📋 Found ${alarms.MetricAlarms.length} metric alarms to update`);

            for (const alarm of alarms.MetricAlarms) {
                try {
                    // Check if alarm already has SNS topic in actions
                    const hasSnsTopic = alarm.AlarmActions && alarm.AlarmActions.includes(this.snsTopicArn);
                    
                    if (hasSnsTopic) {
                        console.log(`⏭️ Alarm ${alarm.AlarmName} already has SNS topic configured`);
                        continue;
                    }

                    // Prepare updated alarm actions
                    const alarmActions = alarm.AlarmActions || [];
                    const okActions = alarm.OKActions || [];
                    
                    // Add SNS topic to actions if not present
                    if (!alarmActions.includes(this.snsTopicArn)) {
                        alarmActions.push(this.snsTopicArn);
                    }
                    if (!okActions.includes(this.snsTopicArn)) {
                        okActions.push(this.snsTopicArn);
                    }

                    // Update alarm with SNS actions
                    const updateParams = {
                        AlarmName: alarm.AlarmName,
                        AlarmDescription: alarm.AlarmDescription,
                        ActionsEnabled: true,
                        AlarmActions: alarmActions,
                        OKActions: okActions,
                        MetricName: alarm.MetricName,
                        Namespace: alarm.Namespace,
                        Statistic: alarm.Statistic,
                        Dimensions: alarm.Dimensions,
                        Period: alarm.Period,
                        EvaluationPeriods: alarm.EvaluationPeriods,
                        Threshold: alarm.Threshold,
                        ComparisonOperator: alarm.ComparisonOperator,
                        TreatMissingData: alarm.TreatMissingData || 'notBreaching'
                    };

                    await this.cloudwatch.putMetricAlarm(updateParams).promise();
                    
                    console.log(`✅ Updated alarm: ${alarm.AlarmName}`);
                    
                    this.updatedAlarms.push({
                        name: alarm.AlarmName,
                        type: 'MetricAlarm',
                        previousActions: alarm.AlarmActions || [],
                        newActions: alarmActions,
                        severity: alarm.AlarmName.includes('Critical') ? 'Critical' : 'Warning'
                    });

                } catch (error) {
                    console.error(`❌ Failed to update alarm ${alarm.AlarmName}:`, error.message);
                }
            }

            return this.updatedAlarms.filter(a => a.type === 'MetricAlarm');
        } catch (error) {
            console.error('❌ Failed to update metric alarms:', error.message);
            throw error;
        }
    }

    async updateCompositeAlarms() {
        try {
            console.log('🔗 Updating composite alarms with SNS actions...');
            
            // Get all CloudFront Pretty URLs composite alarms
            const compositeAlarms = await this.cloudwatch.describeAlarms({
                AlarmTypes: ['CompositeAlarm'],
                AlarmNamePrefix: 'CloudFront-PrettyURLs-'
            }).promise();

            console.log(`📋 Found ${compositeAlarms.CompositeAlarms.length} composite alarms to update`);

            for (const alarm of compositeAlarms.CompositeAlarms) {
                try {
                    // Check if alarm already has SNS topic in actions
                    const hasSnsTopic = alarm.AlarmActions && alarm.AlarmActions.includes(this.snsTopicArn);
                    
                    if (hasSnsTopic) {
                        console.log(`⏭️ Composite alarm ${alarm.AlarmName} already has SNS topic configured`);
                        continue;
                    }

                    // Prepare updated alarm actions
                    const alarmActions = alarm.AlarmActions || [];
                    const okActions = alarm.OKActions || [];
                    
                    // Add SNS topic to actions if not present
                    if (!alarmActions.includes(this.snsTopicArn)) {
                        alarmActions.push(this.snsTopicArn);
                    }
                    if (!okActions.includes(this.snsTopicArn)) {
                        okActions.push(this.snsTopicArn);
                    }

                    // Update composite alarm with SNS actions
                    const updateParams = {
                        AlarmName: alarm.AlarmName,
                        AlarmDescription: alarm.AlarmDescription,
                        ActionsEnabled: true,
                        AlarmActions: alarmActions,
                        OKActions: okActions,
                        AlarmRule: alarm.AlarmRule
                    };

                    await this.cloudwatch.putCompositeAlarm(updateParams).promise();
                    
                    console.log(`✅ Updated composite alarm: ${alarm.AlarmName}`);
                    
                    this.updatedAlarms.push({
                        name: alarm.AlarmName,
                        type: 'CompositeAlarm',
                        previousActions: alarm.AlarmActions || [],
                        newActions: alarmActions,
                        severity: 'Critical'
                    });

                } catch (error) {
                    console.error(`❌ Failed to update composite alarm ${alarm.AlarmName}:`, error.message);
                }
            }

            return this.updatedAlarms.filter(a => a.type === 'CompositeAlarm');
        } catch (error) {
            console.error('❌ Failed to update composite alarms:', error.message);
            throw error;
        }
    }

    async validateAlarmUpdates() {
        try {
            console.log('🔍 Validating alarm updates...');
            
            const validation = {
                totalAlarmsChecked: 0,
                alarmsWithSNS: 0,
                alarmsWithoutSNS: 0,
                criticalAlarms: 0,
                warningAlarms: 0,
                compositeAlarms: 0
            };

            // Check metric alarms
            const metricAlarms = await this.cloudwatch.describeAlarms({
                AlarmNamePrefix: 'CloudFront-PrettyURLs-'
            }).promise();

            for (const alarm of metricAlarms.MetricAlarms) {
                validation.totalAlarmsChecked++;
                
                if (alarm.AlarmActions && alarm.AlarmActions.includes(this.snsTopicArn)) {
                    validation.alarmsWithSNS++;
                } else {
                    validation.alarmsWithoutSNS++;
                }

                if (alarm.AlarmName.includes('Critical')) {
                    validation.criticalAlarms++;
                } else if (alarm.AlarmName.includes('Warning')) {
                    validation.warningAlarms++;
                }
            }

            // Check composite alarms
            const compositeAlarms = await this.cloudwatch.describeAlarms({
                AlarmTypes: ['CompositeAlarm'],
                AlarmNamePrefix: 'CloudFront-PrettyURLs-'
            }).promise();

            for (const alarm of compositeAlarms.CompositeAlarms) {
                validation.totalAlarmsChecked++;
                validation.compositeAlarms++;
                
                if (alarm.AlarmActions && alarm.AlarmActions.includes(this.snsTopicArn)) {
                    validation.alarmsWithSNS++;
                } else {
                    validation.alarmsWithoutSNS++;
                }
            }

            console.log('\n📊 Alarm Update Validation Results:');
            console.log(`   Total Alarms Checked: ${validation.totalAlarmsChecked}`);
            console.log(`   Alarms with SNS: ${validation.alarmsWithSNS}`);
            console.log(`   Alarms without SNS: ${validation.alarmsWithoutSNS}`);
            console.log(`   Critical Alarms: ${validation.criticalAlarms}`);
            console.log(`   Warning Alarms: ${validation.warningAlarms}`);
            console.log(`   Composite Alarms: ${validation.compositeAlarms}`);

            return validation;
        } catch (error) {
            console.error('❌ Failed to validate alarm updates:', error.message);
            throw error;
        }
    }

    async generateUpdateReport() {
        try {
            const report = {
                timestamp: new Date().toISOString(),
                snsTopicArn: this.snsTopicArn,
                updates: {
                    totalAlarmsUpdated: this.updatedAlarms.length,
                    metricAlarms: this.updatedAlarms.filter(a => a.type === 'MetricAlarm').length,
                    compositeAlarms: this.updatedAlarms.filter(a => a.type === 'CompositeAlarm').length,
                    criticalAlarms: this.updatedAlarms.filter(a => a.severity === 'Critical').length,
                    warningAlarms: this.updatedAlarms.filter(a => a.severity === 'Warning').length
                },
                updatedAlarms: this.updatedAlarms,
                configuration: {
                    distributionId: this.config.monitoring.distributionId,
                    functionName: this.config.monitoring.functionName,
                    region: this.config.monitoring.region
                },
                urls: {
                    alarmsConsole: 'https://us-east-1.console.aws.amazon.com/cloudwatch/home?region=us-east-1#alarmsV2:',
                    snsConsole: `https://us-east-1.console.aws.amazon.com/sns/v3/home?region=us-east-1#/topic/${this.snsTopicArn}`,
                    dashboard: `https://us-east-1.console.aws.amazon.com/cloudwatch/home?region=us-east-1#dashboards:name=${this.config.dashboard.name}`
                },
                nextSteps: [
                    'Test alarm notifications by triggering test conditions',
                    'Verify email subscriptions are confirmed',
                    'Monitor alarm state changes in CloudWatch Events',
                    'Adjust alarm thresholds if needed based on notification volume'
                ]
            };

            // Save report
            const reportPath = path.join(__dirname, '..', 'logs', `alarm-sns-update-report-${Date.now()}.json`);
            await fs.writeFile(reportPath, JSON.stringify(report, null, 2));

            console.log(`✅ Alarm update report generated: ${reportPath}`);
            return report;
        } catch (error) {
            console.error('❌ Failed to generate update report:', error.message);
            throw error;
        }
    }

    async updateAllAlarmsWithSNS() {
        try {
            console.log('🚀 Updating all CloudFront Pretty URLs alarms with SNS integration...\n');

            // Load configuration
            await this.loadConfig();

            // Get SNS topic ARN
            await this.getSNSTopicArn();

            // Update metric alarms
            await this.updateMetricAlarms();

            // Update composite alarms
            await this.updateCompositeAlarms();

            // Validate updates
            const validation = await this.validateAlarmUpdates();

            // Generate report
            const report = await this.generateUpdateReport();

            console.log('\n🎉 Alarm SNS Integration Update Complete!');
            console.log('\n📋 Summary:');
            console.log(`   SNS Topic: ${this.snsTopicArn}`);
            console.log(`   Alarms Updated: ${this.updatedAlarms.length}`);
            console.log(`   Validation: ${validation.alarmsWithoutSNS === 0 ? 'PASSED' : 'NEEDS ATTENTION'}`);

            if (validation.alarmsWithoutSNS > 0) {
                console.log(`   ⚠️ ${validation.alarmsWithoutSNS} alarms still need SNS configuration`);
            }

            return {
                snsTopicArn: this.snsTopicArn,
                updatedAlarms: this.updatedAlarms,
                validation: validation,
                report: report
            };

        } catch (error) {
            console.error('❌ Failed to update alarms with SNS integration:', error.message);
            throw error;
        }
    }
}

// CLI execution
async function main() {
    const updater = new AlarmSNSUpdater();
    
    try {
        await updater.updateAllAlarmsWithSNS();
        process.exit(0);
    } catch (error) {
        console.error('❌ Alarm SNS update failed:', error.message);
        process.exit(1);
    }
}

// Run if called directly
if (require.main === module) {
    main();
}

module.exports = AlarmSNSUpdater;