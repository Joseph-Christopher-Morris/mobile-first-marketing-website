#!/usr/bin/env node

/**
 * CloudFront Pretty URLs Monitoring Systems Integration
 * 
 * Integrates CloudFront pretty URLs alarms with existing monitoring systems,
 * adds alarm widgets to current dashboards, and creates composite alarms
 * for overall system health monitoring.
 * 
 * Task 7.2.4: Integrate with existing monitoring systems
 * Requirements: 8.4, 7.4
 */

const AWS = require('aws-sdk');
const fs = require('fs').promises;
const path = require('path');

class PrettyURLsMonitoringIntegration {
    constructor() {
        this.cloudwatch = new AWS.CloudWatch({ region: 'us-east-1' });
        this.sns = new AWS.SNS({ region: 'us-east-1' });
        
        this.config = null;
        this.distributionId = 'E2IBMHQ3GCW6ZK';
        this.functionName = 'pretty-urls-rewriter';
        this.existingDashboards = [];
        this.prettyUrlsAlarms = [];
        this.compositeAlarms = [];
    }

    async loadConfiguration() {
        try {
            console.log('📋 Loading monitoring configuration...');
            
            const configPath = path.join(__dirname, '..', 'config', 'cloudfront-pretty-urls-monitoring-config.json');
            const configData = await fs.readFile(configPath, 'utf8');
            this.config = JSON.parse(configData);
            
            console.log('✅ Configuration loaded successfully');
            return this.config;
        } catch (error) {
            console.error('❌ Failed to load configuration:', error.message);
            throw error;
        }
    }

    async discoverExistingMonitoring() {
        try {
            console.log('🔍 Discovering existing monitoring systems...');
            
            // Discover existing CloudWatch dashboards
            const dashboards = await this.cloudwatch.listDashboards({}).promise();
            
            // Filter for relevant dashboards
            this.existingDashboards = dashboards.DashboardEntries.filter(dashboard => {
                const name = dashboard.DashboardName.toLowerCase();
                return name.includes('cloudfront') || 
                       name.includes('performance') || 
                       name.includes('monitoring') ||
                       name.includes('s3') ||
                       name.includes('pretty-urls');
            });

            console.log(`✅ Found ${this.existingDashboards.length} relevant dashboards:`);
            this.existingDashboards.forEach(dashboard => {
                console.log(`   - ${dashboard.DashboardName}`);
            });

            // Discover existing pretty URLs alarms
            const alarms = await this.cloudwatch.describeAlarms({
                AlarmNamePrefix: 'CloudFront-PrettyURLs-'
            }).promise();

            this.prettyUrlsAlarms = alarms.MetricAlarms;
            console.log(`✅ Found ${this.prettyUrlsAlarms.length} pretty URLs alarms`);

            return {
                dashboards: this.existingDashboards.length,
                alarms: this.prettyUrlsAlarms.length
            };

        } catch (error) {
            console.error('❌ Failed to discover existing monitoring:', error.message);
            throw error;
        }
    }

    async addAlarmWidgetsToExistingDashboards() {
        try {
            console.log('📊 Adding alarm widgets to existing dashboards...');
            
            for (const dashboard of this.existingDashboards) {
                await this.integrateWithDashboard(dashboard.DashboardName);
            }

            console.log('✅ Alarm widgets added to all existing dashboards');

        } catch (error) {
            console.error('❌ Failed to add alarm widgets:', error.message);
            throw error;
        }
    }

    async integrateWithDashboard(dashboardName) {
        try {
            console.log(`   📈 Integrating with dashboard: ${dashboardName}`);
            
            // Get existing dashboard
            const dashboard = await this.cloudwatch.getDashboard({
                DashboardName: dashboardName
            }).promise();

            const dashboardBody = JSON.parse(dashboard.DashboardBody);
            
            // Check if pretty URLs widgets already exist
            const hasAlarmWidgets = dashboardBody.widgets.some(widget => 
                widget.properties && 
                widget.properties.title && 
                widget.properties.title.includes('Pretty URLs Alarms')
            );

            if (hasAlarmWidgets) {
                console.log(`   ⚠️  Dashboard ${dashboardName} already has pretty URLs alarm widgets`);
                return;
            }

            // Calculate next widget position
            const maxY = Math.max(...dashboardBody.widgets.map(w => (w.y || 0) + (w.height || 6)), 0);
            const nextY = maxY + 1;

            // Create alarm status overview widget
            const alarmStatusWidget = {
                type: "metric",
                x: 0,
                y: nextY,
                width: 24,
                height: 6,
                properties: {
                    metrics: this.prettyUrlsAlarms.map(alarm => [
                        "AWS/CloudWatch", "AlarmState", "AlarmName", alarm.AlarmName,
                        { label: this.getAlarmDisplayName(alarm.AlarmName) }
                    ]),
                    view: "timeSeries",
                    stacked: false,
                    region: "us-east-1",
                    title: "🚨 Pretty URLs Alarms Status",
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
                                fill: "above",
                                color: "#d62728"
                            },
                            {
                                label: "OK State", 
                                value: 0,
                                fill: "below",
                                color: "#2ca02c"
                            }
                        ]
                    }
                }
            };

            // Create critical alarms widget
            const criticalAlarmsWidget = {
                type: "metric",
                x: 0,
                y: nextY + 6,
                width: 12,
                height: 6,
                properties: {
                    metrics: this.prettyUrlsAlarms
                        .filter(alarm => alarm.AlarmName.includes('Critical'))
                        .map(alarm => [
                            "AWS/CloudWatch", "AlarmState", "AlarmName", alarm.AlarmName,
                            { label: this.getAlarmDisplayName(alarm.AlarmName) }
                        ]),
                    view: "singleValue",
                    region: "us-east-1",
                    title: "🔴 Critical Alarms",
                    period: 300,
                    stat: "Maximum"
                }
            };

            // Create warning alarms widget
            const warningAlarmsWidget = {
                type: "metric",
                x: 12,
                y: nextY + 6,
                width: 12,
                height: 6,
                properties: {
                    metrics: this.prettyUrlsAlarms
                        .filter(alarm => alarm.AlarmName.includes('Warning'))
                        .map(alarm => [
                            "AWS/CloudWatch", "AlarmState", "AlarmName", alarm.AlarmName,
                            { label: this.getAlarmDisplayName(alarm.AlarmName) }
                        ]),
                    view: "singleValue",
                    region: "us-east-1",
                    title: "🟡 Warning Alarms",
                    period: 300,
                    stat: "Maximum"
                }
            };

            // Create alarm summary text widget
            const alarmSummaryWidget = {
                type: "text",
                x: 0,
                y: nextY + 12,
                width: 24,
                height: 4,
                properties: {
                    markdown: this.generateAlarmSummaryMarkdown()
                }
            };

            // Add widgets to dashboard
            dashboardBody.widgets.push(
                alarmStatusWidget,
                criticalAlarmsWidget,
                warningAlarmsWidget,
                alarmSummaryWidget
            );

            // Update dashboard
            await this.cloudwatch.putDashboard({
                DashboardName: dashboardName,
                DashboardBody: JSON.stringify(dashboardBody)
            }).promise();

            console.log(`   ✅ Added pretty URLs alarm widgets to ${dashboardName}`);

        } catch (error) {
            console.error(`   ❌ Failed to integrate with dashboard ${dashboardName}:`, error.message);
            // Continue with other dashboards
        }
    }

    getAlarmDisplayName(alarmName) {
        // Convert alarm name to display-friendly format
        return alarmName
            .replace('CloudFront-PrettyURLs-', '')
            .replace(/-/g, ' ')
            .replace(/Critical|Warning/g, match => `(${match})`);
    }

    generateAlarmSummaryMarkdown() {
        const criticalCount = this.prettyUrlsAlarms.filter(a => a.AlarmName.includes('Critical')).length;
        const warningCount = this.prettyUrlsAlarms.filter(a => a.AlarmName.includes('Warning')).length;
        
        return `
## 🚨 CloudFront Pretty URLs Monitoring

**Alarm Summary:**
- 🔴 **Critical Alarms**: ${criticalCount} (Function errors, 5xx errors, URL accessibility)
- 🟡 **Warning Alarms**: ${warningCount} (Performance, 4xx errors, cache efficiency)

**Quick Links:**
- [View All Alarms](https://us-east-1.console.aws.amazon.com/cloudwatch/home?region=us-east-1#alarmsV2:)
- [Function Logs](https://us-east-1.console.aws.amazon.com/cloudwatch/home?region=us-east-1#logsV2:log-groups)
- [Distribution Console](https://us-east-1.console.aws.amazon.com/cloudfront/v3/home?region=us-east-1#/distributions/${this.distributionId})

**Thresholds:**
- Function Errors: >10/5min (Critical)
- 5xx Error Rate: >1% (Critical)  
- URL Accessibility: <90% (Critical)
- Function Time: >5ms (Warning)
- 4xx Error Rate: >5% (Warning)
- Cache Hit Rate: <80% (Warning)

*Last Updated: ${new Date().toISOString()}*
        `.trim();
    }

    async createCompositeAlarms() {
        try {
            console.log('🔗 Creating composite alarms for system health monitoring...');
            
            // System Health Composite Alarm
            const systemHealthAlarm = {
                AlarmName: 'CloudFront-PrettyURLs-SystemHealth-Composite',
                AlarmDescription: 'COMPOSITE: Overall system health status for CloudFront Pretty URLs functionality',
                AlarmRule: this.buildSystemHealthAlarmRule(),
                ActionsEnabled: true,
                AlarmActions: await this.getSNSTopicArns(),
                OKActions: await this.getSNSTopicArns(),
                Tags: [
                    { Key: 'Severity', Value: 'Critical' },
                    { Key: 'Component', Value: 'CloudFront-PrettyURLs' },
                    { Key: 'Type', Value: 'System-Health' },
                    { Key: 'Integration', Value: 'Composite' }
                ]
            };

            // Performance Health Composite Alarm
            const performanceHealthAlarm = {
                AlarmName: 'CloudFront-PrettyURLs-PerformanceHealth-Composite',
                AlarmDescription: 'COMPOSITE: Performance health status for CloudFront Pretty URLs',
                AlarmRule: this.buildPerformanceHealthAlarmRule(),
                ActionsEnabled: true,
                AlarmActions: await this.getSNSTopicArns(),
                OKActions: await this.getSNSTopicArns(),
                Tags: [
                    { Key: 'Severity', Value: 'Warning' },
                    { Key: 'Component', Value: 'CloudFront-PrettyURLs' },
                    { Key: 'Type', Value: 'Performance-Health' },
                    { Key: 'Integration', Value: 'Composite' }
                ]
            };

            // Availability Composite Alarm
            const availabilityAlarm = {
                AlarmName: 'CloudFront-PrettyURLs-Availability-Composite',
                AlarmDescription: 'COMPOSITE: Service availability status for CloudFront Pretty URLs',
                AlarmRule: this.buildAvailabilityAlarmRule(),
                ActionsEnabled: true,
                AlarmActions: await this.getSNSTopicArns(),
                OKActions: await this.getSNSTopicArns(),
                Tags: [
                    { Key: 'Severity', Value: 'Critical' },
                    { Key: 'Component', Value: 'CloudFront-PrettyURLs' },
                    { Key: 'Type', Value: 'Availability' },
                    { Key: 'Integration', Value: 'Composite' }
                ]
            };

            const compositeAlarms = [systemHealthAlarm, performanceHealthAlarm, availabilityAlarm];

            for (const alarm of compositeAlarms) {
                try {
                    await this.cloudwatch.putCompositeAlarm(alarm).promise();
                    console.log(`   ✅ Created composite alarm: ${alarm.AlarmName}`);
                    this.compositeAlarms.push(alarm);
                } catch (error) {
                    console.error(`   ❌ Failed to create composite alarm ${alarm.AlarmName}:`, error.message);
                }
            }

            console.log(`✅ Created ${this.compositeAlarms.length} composite alarms`);
            return this.compositeAlarms;

        } catch (error) {
            console.error('❌ Failed to create composite alarms:', error.message);
            throw error;
        }
    }

    buildSystemHealthAlarmRule() {
        const criticalAlarms = this.prettyUrlsAlarms
            .filter(alarm => alarm.AlarmName.includes('Critical'))
            .map(alarm => `ALARM("${alarm.AlarmName}")`)
            .join(' OR ');
        
        return `(${criticalAlarms})`;
    }

    buildPerformanceHealthAlarmRule() {
        const performanceAlarms = this.prettyUrlsAlarms
            .filter(alarm => 
                alarm.AlarmName.includes('Performance') || 
                alarm.AlarmName.includes('ExecutionTime') ||
                alarm.AlarmName.includes('Cache-Hit-Rate')
            )
            .map(alarm => `ALARM("${alarm.AlarmName}")`)
            .join(' OR ');
        
        return performanceAlarms ? `(${performanceAlarms})` : 'FALSE';
    }

    buildAvailabilityAlarmRule() {
        const availabilityAlarms = this.prettyUrlsAlarms
            .filter(alarm => 
                alarm.AlarmName.includes('Accessibility') || 
                alarm.AlarmName.includes('5xx-Errors') ||
                alarm.AlarmName.includes('Function-Errors')
            )
            .map(alarm => `ALARM("${alarm.AlarmName}")`)
            .join(' OR ');
        
        return availabilityAlarms ? `(${availabilityAlarms})` : 'FALSE';
    }

    async getSNSTopicArns() {
        try {
            // Get SNS topics for pretty URLs alerts
            const topics = await this.sns.listTopics().promise();
            const prettyUrlsTopics = topics.Topics.filter(topic => 
                topic.TopicArn.includes('cloudfront-pretty-urls-alerts') ||
                topic.TopicArn.includes('pretty-urls')
            );
            
            return prettyUrlsTopics.map(topic => topic.TopicArn);
        } catch (error) {
            console.warn('⚠️  Could not retrieve SNS topic ARNs:', error.message);
            return [];
        }
    }

    async integrateWithExistingPerformanceMonitoring() {
        try {
            console.log('📊 Integrating with existing performance monitoring...');
            
            // Check if performance monitoring dashboard exists
            const performanceDashboards = this.existingDashboards.filter(dashboard =>
                dashboard.DashboardName.toLowerCase().includes('performance')
            );

            for (const dashboard of performanceDashboards) {
                await this.addPerformanceIntegrationWidgets(dashboard.DashboardName);
            }

            // Create performance correlation dashboard
            await this.createPerformanceCorrelationDashboard();

            console.log('✅ Performance monitoring integration completed');

        } catch (error) {
            console.error('❌ Failed to integrate with performance monitoring:', error.message);
            throw error;
        }
    }

    async addPerformanceIntegrationWidgets(dashboardName) {
        try {
            console.log(`   📈 Adding performance integration to: ${dashboardName}`);
            
            const dashboard = await this.cloudwatch.getDashboard({
                DashboardName: dashboardName
            }).promise();

            const dashboardBody = JSON.parse(dashboard.DashboardBody);
            
            // Check if integration widgets already exist
            const hasIntegrationWidgets = dashboardBody.widgets.some(widget => 
                widget.properties && 
                widget.properties.title && 
                widget.properties.title.includes('Pretty URLs Performance Impact')
            );

            if (hasIntegrationWidgets) {
                console.log(`   ⚠️  Dashboard ${dashboardName} already has integration widgets`);
                return;
            }

            const maxY = Math.max(...dashboardBody.widgets.map(w => (w.y || 0) + (w.height || 6)), 0);
            const nextY = maxY + 1;

            // Performance correlation widget
            const performanceCorrelationWidget = {
                type: "metric",
                x: 0,
                y: nextY,
                width: 24,
                height: 8,
                properties: {
                    metrics: [
                        ["AWS/CloudFront", "FunctionExecutionTime", "FunctionName", this.functionName, { label: "Function Execution Time" }],
                        [".", "OriginLatency", "DistributionId", this.distributionId, { label: "Origin Latency" }],
                        [".", "CacheHitRate", ".", ".", { label: "Cache Hit Rate", yAxis: "right" }],
                        ["Custom/CloudFront", "URLAccessibilityRate", "FunctionName", this.functionName, { label: "URL Accessibility Rate", yAxis: "right" }]
                    ],
                    view: "timeSeries",
                    stacked: false,
                    region: "us-east-1",
                    title: "🔗 Pretty URLs Performance Impact Correlation",
                    period: 300,
                    stat: "Average",
                    yAxis: {
                        left: { label: "Latency (ms)", min: 0 },
                        right: { label: "Rate (%)", min: 0, max: 100 }
                    }
                }
            };

            dashboardBody.widgets.push(performanceCorrelationWidget);

            await this.cloudwatch.putDashboard({
                DashboardName: dashboardName,
                DashboardBody: JSON.stringify(dashboardBody)
            }).promise();

            console.log(`   ✅ Added performance integration widgets to ${dashboardName}`);

        } catch (error) {
            console.error(`   ❌ Failed to add performance widgets to ${dashboardName}:`, error.message);
        }
    }

    async createPerformanceCorrelationDashboard() {
        try {
            console.log('📊 Creating performance correlation dashboard...');
            
            const correlationDashboard = {
                widgets: [
                    {
                        type: "text",
                        x: 0, y: 0, width: 24, height: 4,
                        properties: {
                            markdown: `
# 🔗 CloudFront Pretty URLs - Performance Correlation Dashboard

This dashboard shows the correlation between CloudFront Pretty URLs functionality and overall system performance.

## Key Metrics Correlation
- **Function Performance vs Origin Latency**: How URL rewriting affects response times
- **Cache Efficiency vs URL Accessibility**: Impact of pretty URLs on caching
- **Error Rates vs Function Execution**: Relationship between function health and errors

## Performance Targets
- Function Execution Time: <1ms average
- URL Accessibility Rate: >99%
- Cache Hit Rate: >85%
- Origin Latency: <200ms

*Dashboard automatically updates every 5 minutes*
                            `
                        }
                    },
                    {
                        type: "metric",
                        x: 0, y: 4, width: 12, height: 8,
                        properties: {
                            metrics: [
                                ["AWS/CloudFront", "FunctionExecutionTime", "FunctionName", this.functionName],
                                [".", "OriginLatency", "DistributionId", this.distributionId]
                            ],
                            view: "timeSeries",
                            stacked: false,
                            region: "us-east-1",
                            title: "⚡ Function Performance vs Origin Latency",
                            period: 300,
                            stat: "Average",
                            yAxis: { left: { label: "Time (ms)", min: 0 } }
                        }
                    },
                    {
                        type: "metric",
                        x: 12, y: 4, width: 12, height: 8,
                        properties: {
                            metrics: [
                                ["AWS/CloudFront", "CacheHitRate", "DistributionId", this.distributionId],
                                ["Custom/CloudFront", "URLAccessibilityRate", "FunctionName", this.functionName]
                            ],
                            view: "timeSeries",
                            stacked: false,
                            region: "us-east-1",
                            title: "📈 Cache Efficiency vs URL Accessibility",
                            period: 300,
                            stat: "Average",
                            yAxis: { left: { label: "Rate (%)", min: 0, max: 100 } }
                        }
                    },
                    {
                        type: "metric",
                        x: 0, y: 12, width: 24, height: 8,
                        properties: {
                            metrics: [
                                ["AWS/CloudFront", "4xxErrorRate", "DistributionId", this.distributionId, { label: "4xx Error Rate" }],
                                [".", "5xxErrorRate", ".", ".", { label: "5xx Error Rate" }],
                                [".", "FunctionExecutionErrors", "FunctionName", this.functionName, { label: "Function Errors", yAxis: "right" }]
                            ],
                            view: "timeSeries",
                            stacked: false,
                            region: "us-east-1",
                            title: "🚨 Error Rates vs Function Health",
                            period: 300,
                            stat: "Average",
                            yAxis: {
                                left: { label: "Error Rate (%)", min: 0 },
                                right: { label: "Function Errors", min: 0 }
                            }
                        }
                    }
                ]
            };

            await this.cloudwatch.putDashboard({
                DashboardName: 'CloudFront-PrettyURLs-Performance-Correlation',
                DashboardBody: JSON.stringify(correlationDashboard)
            }).promise();

            console.log('✅ Created performance correlation dashboard');

        } catch (error) {
            console.error('❌ Failed to create performance correlation dashboard:', error.message);
            throw error;
        }
    }

    async createIntegratedHealthDashboard() {
        try {
            console.log('🏥 Creating integrated health dashboard...');
            
            const healthDashboard = {
                widgets: [
                    {
                        type: "text",
                        x: 0, y: 0, width: 24, height: 3,
                        properties: {
                            markdown: `
# 🏥 CloudFront Pretty URLs - Integrated System Health

**Overall System Status**: Monitor the health of CloudFront Pretty URLs integration with existing systems.

**Composite Alarms**: ${this.compositeAlarms.length} composite alarms monitor overall system health
**Individual Alarms**: ${this.prettyUrlsAlarms.length} individual alarms track specific metrics
**Dashboard Integration**: ${this.existingDashboards.length} existing dashboards enhanced with pretty URLs monitoring
                            `
                        }
                    },
                    {
                        type: "metric",
                        x: 0, y: 3, width: 8, height: 6,
                        properties: {
                            metrics: this.compositeAlarms.map(alarm => [
                                "AWS/CloudWatch", "AlarmState", "AlarmName", alarm.AlarmName
                            ]),
                            view: "singleValue",
                            region: "us-east-1",
                            title: "🔗 Composite Alarms Status",
                            period: 300,
                            stat: "Maximum"
                        }
                    },
                    {
                        type: "metric",
                        x: 8, y: 3, width: 8, height: 6,
                        properties: {
                            metrics: this.prettyUrlsAlarms
                                .filter(alarm => alarm.AlarmName.includes('Critical'))
                                .map(alarm => [
                                    "AWS/CloudWatch", "AlarmState", "AlarmName", alarm.AlarmName
                                ]),
                            view: "singleValue",
                            region: "us-east-1",
                            title: "🔴 Critical Alarms",
                            period: 300,
                            stat: "Maximum"
                        }
                    },
                    {
                        type: "metric",
                        x: 16, y: 3, width: 8, height: 6,
                        properties: {
                            metrics: this.prettyUrlsAlarms
                                .filter(alarm => alarm.AlarmName.includes('Warning'))
                                .map(alarm => [
                                    "AWS/CloudWatch", "AlarmState", "AlarmName", alarm.AlarmName
                                ]),
                            view: "singleValue",
                            region: "us-east-1",
                            title: "🟡 Warning Alarms",
                            period: 300,
                            stat: "Maximum"
                        }
                    }
                ]
            };

            await this.cloudwatch.putDashboard({
                DashboardName: 'CloudFront-PrettyURLs-Integrated-Health',
                DashboardBody: JSON.stringify(healthDashboard)
            }).promise();

            console.log('✅ Created integrated health dashboard');

        } catch (error) {
            console.error('❌ Failed to create integrated health dashboard:', error.message);
            throw error;
        }
    }

    async validateIntegration() {
        try {
            console.log('🔍 Validating monitoring integration...');
            
            const validation = {
                timestamp: new Date().toISOString(),
                existingDashboards: {
                    discovered: this.existingDashboards.length,
                    integrated: 0
                },
                alarms: {
                    individual: this.prettyUrlsAlarms.length,
                    composite: this.compositeAlarms.length
                },
                dashboards: {
                    created: 0,
                    updated: 0
                },
                integration: {
                    successful: true,
                    errors: []
                }
            };

            // Validate dashboard integrations
            for (const dashboard of this.existingDashboards) {
                try {
                    const dashboardData = await this.cloudwatch.getDashboard({
                        DashboardName: dashboard.DashboardName
                    }).promise();

                    const body = JSON.parse(dashboardData.DashboardBody);
                    const hasPrettyUrlsWidgets = body.widgets.some(widget =>
                        widget.properties && 
                        widget.properties.title && 
                        (widget.properties.title.includes('Pretty URLs') ||
                         widget.properties.title.includes('Alarms Status'))
                    );

                    if (hasPrettyUrlsWidgets) {
                        validation.existingDashboards.integrated++;
                    }
                } catch (error) {
                    validation.integration.errors.push(`Dashboard validation failed: ${dashboard.DashboardName}`);
                }
            }

            // Validate composite alarms
            const compositeAlarms = await this.cloudwatch.describeAlarms({
                AlarmTypes: ['CompositeAlarm'],
                AlarmNamePrefix: 'CloudFront-PrettyURLs-'
            }).promise();

            validation.alarms.composite = compositeAlarms.CompositeAlarms.length;

            // Validate new dashboards
            const newDashboards = await this.cloudwatch.listDashboards({
                DashboardNamePrefix: 'CloudFront-PrettyURLs-'
            }).promise();

            validation.dashboards.created = newDashboards.DashboardEntries.length;

            console.log('\n📊 Integration Validation Results:');
            console.log(`   Existing Dashboards Discovered: ${validation.existingDashboards.discovered}`);
            console.log(`   Existing Dashboards Integrated: ${validation.existingDashboards.integrated}`);
            console.log(`   Individual Alarms: ${validation.alarms.individual}`);
            console.log(`   Composite Alarms: ${validation.alarms.composite}`);
            console.log(`   New Dashboards Created: ${validation.dashboards.created}`);
            console.log(`   Integration Errors: ${validation.integration.errors.length}`);

            if (validation.integration.errors.length > 0) {
                console.log('\n⚠️  Integration Errors:');
                validation.integration.errors.forEach(error => {
                    console.log(`   - ${error}`);
                });
            }

            return validation;

        } catch (error) {
            console.error('❌ Failed to validate integration:', error.message);
            throw error;
        }
    }

    async generateIntegrationReport() {
        try {
            console.log('📋 Generating integration report...');
            
            const validation = await this.validateIntegration();
            
            const report = {
                timestamp: new Date().toISOString(),
                summary: {
                    integrationStatus: validation.integration.errors.length === 0 ? 'SUCCESS' : 'PARTIAL',
                    dashboardsIntegrated: validation.existingDashboards.integrated,
                    alarmsCreated: validation.alarms.individual + validation.alarms.composite,
                    newDashboardsCreated: validation.dashboards.created
                },
                details: {
                    existingMonitoring: {
                        dashboardsDiscovered: this.existingDashboards.map(d => d.DashboardName),
                        dashboardsIntegrated: validation.existingDashboards.integrated,
                        integrationSuccess: validation.existingDashboards.integrated > 0
                    },
                    alarms: {
                        individual: this.prettyUrlsAlarms.map(alarm => ({
                            name: alarm.AlarmName,
                            state: alarm.StateValue,
                            threshold: alarm.Threshold
                        })),
                        composite: this.compositeAlarms.map(alarm => ({
                            name: alarm.AlarmName,
                            rule: alarm.AlarmRule
                        }))
                    },
                    dashboards: {
                        created: [
                            'CloudFront-PrettyURLs-Performance-Correlation',
                            'CloudFront-PrettyURLs-Integrated-Health'
                        ],
                        integrated: this.existingDashboards.map(d => d.DashboardName)
                    }
                },
                validation,
                urls: {
                    integratedHealthDashboard: 'https://us-east-1.console.aws.amazon.com/cloudwatch/home?region=us-east-1#dashboards:name=CloudFront-PrettyURLs-Integrated-Health',
                    performanceCorrelationDashboard: 'https://us-east-1.console.aws.amazon.com/cloudwatch/home?region=us-east-1#dashboards:name=CloudFront-PrettyURLs-Performance-Correlation',
                    alarmsConsole: 'https://us-east-1.console.aws.amazon.com/cloudwatch/home?region=us-east-1#alarmsV2:'
                },
                nextSteps: [
                    'Review integrated dashboards for proper widget placement',
                    'Test composite alarms by triggering individual alarm conditions',
                    'Configure additional notification channels if needed',
                    'Set up automated reporting for system health status',
                    'Schedule regular review of alarm thresholds and dashboard layouts'
                ]
            };

            // Save report
            const reportPath = path.join(__dirname, '..', 'logs', `monitoring-integration-report-${Date.now()}.json`);
            await fs.writeFile(reportPath, JSON.stringify(report, null, 2));

            console.log(`✅ Integration report saved: ${reportPath}`);
            
            // Generate summary
            console.log('\n📊 Integration Summary:');
            console.log(`   Status: ${report.summary.integrationStatus}`);
            console.log(`   Dashboards Integrated: ${report.summary.dashboardsIntegrated}`);
            console.log(`   Alarms Created: ${report.summary.alarmsCreated}`);
            console.log(`   New Dashboards: ${report.summary.newDashboardsCreated}`);

            return report;

        } catch (error) {
            console.error('❌ Failed to generate integration report:', error.message);
            throw error;
        }
    }

    async runCompleteIntegration() {
        try {
            console.log('🚀 Starting complete monitoring systems integration...\n');

            // Load configuration
            await this.loadConfiguration();

            // Discover existing monitoring
            await this.discoverExistingMonitoring();

            // Add alarm widgets to existing dashboards
            await this.addAlarmWidgetsToExistingDashboards();

            // Create composite alarms
            await this.createCompositeAlarms();

            // Integrate with performance monitoring
            await this.integrateWithExistingPerformanceMonitoring();

            // Create integrated health dashboard
            await this.createIntegratedHealthDashboard();

            // Generate integration report
            const report = await this.generateIntegrationReport();

            console.log('\n✅ Monitoring systems integration completed successfully!');
            console.log('\n🔗 Quick Links:');
            console.log(`   Integrated Health: ${report.urls.integratedHealthDashboard}`);
            console.log(`   Performance Correlation: ${report.urls.performanceCorrelationDashboard}`);
            console.log(`   Alarms Console: ${report.urls.alarmsConsole}`);

            return report;

        } catch (error) {
            console.error('\n❌ Monitoring systems integration failed:', error.message);
            throw error;
        }
    }
}

// CLI interface
async function main() {
    const args = process.argv.slice(2);
    const command = args[0] || 'integrate';

    const integration = new PrettyURLsMonitoringIntegration();

    try {
        switch (command) {
            case 'integrate':
                await integration.runCompleteIntegration();
                break;
            case 'discover':
                await integration.loadConfiguration();
                await integration.discoverExistingMonitoring();
                break;
            case 'dashboards':
                await integration.loadConfiguration();
                await integration.discoverExistingMonitoring();
                await integration.addAlarmWidgetsToExistingDashboards();
                break;
            case 'composite':
                await integration.loadConfiguration();
                await integration.discoverExistingMonitoring();
                await integration.createCompositeAlarms();
                break;
            case 'validate':
                await integration.loadConfiguration();
                await integration.discoverExistingMonitoring();
                await integration.validateIntegration();
                break;
            case 'report':
                await integration.loadConfiguration();
                await integration.discoverExistingMonitoring();
                await integration.generateIntegrationReport();
                break;
            default:
                console.log('Usage: node integrate-pretty-urls-monitoring-systems.js [integrate|discover|dashboards|composite|validate|report]');
                console.log('  integrate: Run complete integration (default)');
                console.log('  discover: Discover existing monitoring systems');
                console.log('  dashboards: Add alarm widgets to existing dashboards');
                console.log('  composite: Create composite alarms only');
                console.log('  validate: Validate integration');
                console.log('  report: Generate integration report');
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

module.exports = PrettyURLsMonitoringIntegration;