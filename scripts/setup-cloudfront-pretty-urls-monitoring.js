#!/usr/bin/env node

/**
 * CloudFront Pretty URLs Monitoring Setup
 * 
 * Sets up comprehensive monitoring and alerting for CloudFront Functions
 * and pretty URL functionality.
 */

const AWS = require('aws-sdk');
const fs = require('fs').promises;
const path = require('path');

// AWS Configuration
const cloudwatch = new AWS.CloudWatch({ region: 'us-east-1' });
const cloudfront = new AWS.CloudFront({ region: 'us-east-1' });

// Configuration
const CONFIG = {
    distributionId: 'E2IBMHQ3GCW6ZK',
    functionName: 'pretty-urls-rewriter',
    dashboardName: 'CloudFront-PrettyURLs-Dashboard',
    alarmPrefix: 'CloudFront-PrettyURLs',
    snsTopicArn: process.env.SNS_TOPIC_ARN || null,
    region: 'us-east-1'
};

class CloudFrontMonitoringSetup {
    constructor() {
        this.metrics = [];
        this.alarms = [];
        this.dashboardWidgets = [];
    }

    /**
     * Main setup function
     */
    async setup() {
        try {
            console.log('🚀 Setting up CloudFront Pretty URLs monitoring...');
            
            // Create CloudWatch dashboard
            await this.createDashboard();
            
            // Set up CloudWatch alarms
            await this.createAlarms();
            
            // Set up custom metrics
            await this.setupCustomMetrics();
            
            // Create monitoring configuration file
            await this.createMonitoringConfig();
            
            console.log('✅ Monitoring setup completed successfully!');
            
            // Generate setup report
            await this.generateSetupReport();
            
        } catch (error) {
            console.error('❌ Error setting up monitoring:', error);
            throw error;
        }
    }

    /**
     * Create CloudWatch dashboard for pretty URLs monitoring
     */
    async createDashboard() {
        console.log('📊 Creating CloudWatch dashboard...');
        
        const dashboardBody = {
            widgets: [
                // Function execution metrics
                {
                    type: "metric",
                    x: 0, y: 0, width: 12, height: 6,
                    properties: {
                        metrics: [
                            ["AWS/CloudFront", "FunctionExecutions", "FunctionName", CONFIG.functionName],
                            [".", "FunctionExecutionTime", ".", "."],
                            [".", "FunctionExecutionErrors", ".", "."]
                        ],
                        view: "timeSeries",
                        stacked: false,
                        region: CONFIG.region,
                        title: "CloudFront Function Metrics",
                        period: 300,
                        stat: "Sum"
                    }
                },
                
                // Distribution metrics
                {
                    type: "metric",
                    x: 12, y: 0, width: 12, height: 6,
                    properties: {
                        metrics: [
                            ["AWS/CloudFront", "Requests", "DistributionId", CONFIG.distributionId],
                            [".", "BytesDownloaded", ".", "."],
                            [".", "4xxErrorRate", ".", "."],
                            [".", "5xxErrorRate", ".", "."]
                        ],
                        view: "timeSeries",
                        stacked: false,
                        region: CONFIG.region,
                        title: "CloudFront Distribution Metrics",
                        period: 300
                    }
                },
                
                // Cache performance
                {
                    type: "metric",
                    x: 0, y: 6, width: 12, height: 6,
                    properties: {
                        metrics: [
                            ["AWS/CloudFront", "CacheHitRate", "DistributionId", CONFIG.distributionId],
                            [".", "OriginLatency", ".", "."]
                        ],
                        view: "timeSeries",
                        stacked: false,
                        region: CONFIG.region,
                        title: "Cache Performance",
                        period: 300,
                        yAxis: {
                            left: { min: 0, max: 100 }
                        }
                    }
                },
                
                // Custom pretty URLs metrics
                {
                    type: "metric",
                    x: 12, y: 6, width: 12, height: 6,
                    properties: {
                        metrics: [
                            ["Custom/CloudFront", "PrettyURLRequests", "FunctionName", CONFIG.functionName],
                            [".", "URLRewriteSuccess", ".", "."],
                            [".", "URLRewriteErrors", ".", "."]
                        ],
                        view: "timeSeries",
                        stacked: false,
                        region: CONFIG.region,
                        title: "Pretty URLs Metrics",
                        period: 300
                    }
                },
                
                // Function performance distribution
                {
                    type: "metric",
                    x: 0, y: 12, width: 24, height: 6,
                    properties: {
                        metrics: [
                            ["AWS/CloudFront", "FunctionExecutionTime", "FunctionName", CONFIG.functionName]
                        ],
                        view: "timeSeries",
                        stacked: false,
                        region: CONFIG.region,
                        title: "Function Execution Time Distribution",
                        period: 300,
                        stat: "Average",
                        annotations: {
                            horizontal: [
                                {
                                    label: "Performance Target (1ms)",
                                    value: 1
                                },
                                {
                                    label: "Warning Threshold (5ms)",
                                    value: 5
                                }
                            ]
                        }
                    }
                }
            ]
        };

        const params = {
            DashboardName: CONFIG.dashboardName,
            DashboardBody: JSON.stringify(dashboardBody)
        };

        try {
            await cloudwatch.putDashboard(params).promise();
            console.log(`✅ Dashboard '${CONFIG.dashboardName}' created successfully`);
        } catch (error) {
            console.error('❌ Error creating dashboard:', error);
            throw error;
        }
    }

    /**
     * Create CloudWatch alarms for monitoring
     */
    async createAlarms() {
        console.log('🚨 Creating CloudWatch alarms...');
        
        const alarms = [
            // Function error rate alarm
            {
                AlarmName: `${CONFIG.alarmPrefix}-Function-Errors`,
                AlarmDescription: 'CloudFront Function error rate is too high',
                MetricName: 'FunctionExecutionErrors',
                Namespace: 'AWS/CloudFront',
                Statistic: 'Sum',
                Period: 300,
                EvaluationPeriods: 2,
                Threshold: 10,
                ComparisonOperator: 'GreaterThanThreshold',
                Dimensions: [
                    {
                        Name: 'FunctionName',
                        Value: CONFIG.functionName
                    }
                ],
                AlarmActions: CONFIG.snsTopicArn ? [CONFIG.snsTopicArn] : [],
                TreatMissingData: 'notBreaching'
            },
            
            // Function execution time alarm
            {
                AlarmName: `${CONFIG.alarmPrefix}-Function-Performance`,
                AlarmDescription: 'CloudFront Function execution time is too high',
                MetricName: 'FunctionExecutionTime',
                Namespace: 'AWS/CloudFront',
                Statistic: 'Average',
                Period: 300,
                EvaluationPeriods: 3,
                Threshold: 5,
                ComparisonOperator: 'GreaterThanThreshold',
                Dimensions: [
                    {
                        Name: 'FunctionName',
                        Value: CONFIG.functionName
                    }
                ],
                AlarmActions: CONFIG.snsTopicArn ? [CONFIG.snsTopicArn] : [],
                TreatMissingData: 'notBreaching'
            },
            
            // Distribution 4xx error rate alarm
            {
                AlarmName: `${CONFIG.alarmPrefix}-4xx-Errors`,
                AlarmDescription: 'CloudFront 4xx error rate is too high',
                MetricName: '4xxErrorRate',
                Namespace: 'AWS/CloudFront',
                Statistic: 'Average',
                Period: 300,
                EvaluationPeriods: 2,
                Threshold: 5,
                ComparisonOperator: 'GreaterThanThreshold',
                Dimensions: [
                    {
                        Name: 'DistributionId',
                        Value: CONFIG.distributionId
                    }
                ],
                AlarmActions: CONFIG.snsTopicArn ? [CONFIG.snsTopicArn] : [],
                TreatMissingData: 'notBreaching'
            },
            
            // Distribution 5xx error rate alarm
            {
                AlarmName: `${CONFIG.alarmPrefix}-5xx-Errors`,
                AlarmDescription: 'CloudFront 5xx error rate is too high',
                MetricName: '5xxErrorRate',
                Namespace: 'AWS/CloudFront',
                Statistic: 'Average',
                Period: 300,
                EvaluationPeriods: 2,
                Threshold: 1,
                ComparisonOperator: 'GreaterThanThreshold',
                Dimensions: [
                    {
                        Name: 'DistributionId',
                        Value: CONFIG.distributionId
                    }
                ],
                AlarmActions: CONFIG.snsTopicArn ? [CONFIG.snsTopicArn] : [],
                TreatMissingData: 'notBreaching'
            },
            
            // Cache hit rate alarm
            {
                AlarmName: `${CONFIG.alarmPrefix}-Cache-Hit-Rate`,
                AlarmDescription: 'CloudFront cache hit rate is too low',
                MetricName: 'CacheHitRate',
                Namespace: 'AWS/CloudFront',
                Statistic: 'Average',
                Period: 900,
                EvaluationPeriods: 3,
                Threshold: 80,
                ComparisonOperator: 'LessThanThreshold',
                Dimensions: [
                    {
                        Name: 'DistributionId',
                        Value: CONFIG.distributionId
                    }
                ],
                AlarmActions: CONFIG.snsTopicArn ? [CONFIG.snsTopicArn] : [],
                TreatMissingData: 'notBreaching'
            }
        ];

        for (const alarm of alarms) {
            try {
                await cloudwatch.putMetricAlarm(alarm).promise();
                console.log(`✅ Alarm '${alarm.AlarmName}' created successfully`);
                this.alarms.push(alarm.AlarmName);
            } catch (error) {
                console.error(`❌ Error creating alarm '${alarm.AlarmName}':`, error);
            }
        }
    }

    /**
     * Set up custom metrics for pretty URLs monitoring
     */
    async setupCustomMetrics() {
        console.log('📈 Setting up custom metrics...');
        
        // Create custom metric definitions
        const customMetrics = [
            {
                MetricName: 'PrettyURLRequests',
                Namespace: 'Custom/CloudFront',
                Dimensions: [
                    {
                        Name: 'FunctionName',
                        Value: CONFIG.functionName
                    }
                ],
                Description: 'Number of requests processed by pretty URLs function'
            },
            {
                MetricName: 'URLRewriteSuccess',
                Namespace: 'Custom/CloudFront',
                Dimensions: [
                    {
                        Name: 'FunctionName',
                        Value: CONFIG.functionName
                    }
                ],
                Description: 'Number of successful URL rewrites'
            },
            {
                MetricName: 'URLRewriteErrors',
                Namespace: 'Custom/CloudFront',
                Dimensions: [
                    {
                        Name: 'FunctionName',
                        Value: CONFIG.functionName
                    }
                ],
                Description: 'Number of URL rewrite errors'
            }
        ];

        // Store custom metrics configuration
        const customMetricsConfig = {
            namespace: 'Custom/CloudFront',
            metrics: customMetrics,
            publishingScript: 'scripts/publish-pretty-urls-metrics.js'
        };

        await fs.writeFile(
            'config/custom-metrics-config.json',
            JSON.stringify(customMetricsConfig, null, 2)
        );

        console.log('✅ Custom metrics configuration created');
    }

    /**
     * Create monitoring configuration file
     */
    async createMonitoringConfig() {
        console.log('⚙️ Creating monitoring configuration...');
        
        const monitoringConfig = {
            cloudfront: {
                distributionId: CONFIG.distributionId,
                functionName: CONFIG.functionName,
                region: CONFIG.region
            },
            dashboard: {
                name: CONFIG.dashboardName,
                url: `https://${CONFIG.region}.console.aws.amazon.com/cloudwatch/home?region=${CONFIG.region}#dashboards:name=${CONFIG.dashboardName}`
            },
            alarms: this.alarms.map(alarmName => ({
                name: alarmName,
                url: `https://${CONFIG.region}.console.aws.amazon.com/cloudwatch/home?region=${CONFIG.region}#alarmsV2:alarm/${encodeURIComponent(alarmName)}`
            })),
            metrics: {
                standard: [
                    'FunctionExecutions',
                    'FunctionExecutionTime',
                    'FunctionExecutionErrors',
                    'Requests',
                    '4xxErrorRate',
                    '5xxErrorRate',
                    'CacheHitRate'
                ],
                custom: [
                    'PrettyURLRequests',
                    'URLRewriteSuccess',
                    'URLRewriteErrors'
                ]
            },
            thresholds: {
                functionErrors: 10,
                functionExecutionTime: 5,
                errorRate4xx: 5,
                errorRate5xx: 1,
                cacheHitRate: 80
            },
            monitoring: {
                healthCheckInterval: 300,
                performanceCheckInterval: 900,
                reportingInterval: 3600
            }
        };

        await fs.writeFile(
            'config/cloudfront-pretty-urls-monitoring.json',
            JSON.stringify(monitoringConfig, null, 2)
        );

        console.log('✅ Monitoring configuration saved to config/cloudfront-pretty-urls-monitoring.json');
    }

    /**
     * Generate setup report
     */
    async generateSetupReport() {
        const report = {
            timestamp: new Date().toISOString(),
            setup: {
                dashboard: CONFIG.dashboardName,
                alarms: this.alarms.length,
                customMetrics: 3,
                distribution: CONFIG.distributionId,
                function: CONFIG.functionName
            },
            urls: {
                dashboard: `https://${CONFIG.region}.console.aws.amazon.com/cloudwatch/home?region=${CONFIG.region}#dashboards:name=${CONFIG.dashboardName}`,
                alarms: `https://${CONFIG.region}.console.aws.amazon.com/cloudwatch/home?region=${CONFIG.region}#alarmsV2:`,
                metrics: `https://${CONFIG.region}.console.aws.amazon.com/cloudwatch/home?region=${CONFIG.region}#metricsV2:`
            },
            nextSteps: [
                'Configure SNS topic for alarm notifications',
                'Set up automated health checks',
                'Configure log aggregation',
                'Set up performance baselines'
            ]
        };

        await fs.writeFile(
            `monitoring-setup-report-${Date.now()}.json`,
            JSON.stringify(report, null, 2)
        );

        console.log('\n📋 Setup Report:');
        console.log(`Dashboard: ${report.urls.dashboard}`);
        console.log(`Alarms created: ${report.setup.alarms}`);
        console.log(`Custom metrics configured: ${report.setup.customMetrics}`);
        console.log('\n📝 Next steps:');
        report.nextSteps.forEach((step, index) => {
            console.log(`${index + 1}. ${step}`);
        });
    }

    /**
     * Validate monitoring setup
     */
    async validateSetup() {
        console.log('🔍 Validating monitoring setup...');
        
        try {
            // Check dashboard exists
            const dashboard = await cloudwatch.getDashboard({
                DashboardName: CONFIG.dashboardName
            }).promise();
            console.log('✅ Dashboard validation passed');

            // Check alarms exist
            const alarms = await cloudwatch.describeAlarms({
                AlarmNamePrefix: CONFIG.alarmPrefix
            }).promise();
            console.log(`✅ Found ${alarms.MetricAlarms.length} alarms`);

            // Check function exists
            const functions = await cloudfront.listFunctions().promise();
            const functionExists = functions.FunctionList.Items.some(
                item => item.Name === CONFIG.functionName
            );
            
            if (functionExists) {
                console.log('✅ CloudFront Function validation passed');
            } else {
                console.log('⚠️ CloudFront Function not found');
            }

            return true;
        } catch (error) {
            console.error('❌ Validation failed:', error);
            return false;
        }
    }
}

// CLI interface
async function main() {
    const args = process.argv.slice(2);
    const command = args[0] || 'setup';

    const monitor = new CloudFrontMonitoringSetup();

    try {
        switch (command) {
            case 'setup':
                await monitor.setup();
                break;
            case 'validate':
                await monitor.validateSetup();
                break;
            case 'dashboard':
                await monitor.createDashboard();
                break;
            case 'alarms':
                await monitor.createAlarms();
                break;
            default:
                console.log('Usage: node setup-cloudfront-pretty-urls-monitoring.js [setup|validate|dashboard|alarms]');
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

module.exports = CloudFrontMonitoringSetup;