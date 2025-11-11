#!/usr/bin/env node

/**
 * CloudFront Pretty URLs Dashboard
 * 
 * Creates and manages a comprehensive monitoring dashboard for CloudFront
 * pretty URLs functionality with real-time metrics and health status.
 */

const AWS = require('aws-sdk');
const fs = require('fs').promises;
const path = require('path');

// AWS Configuration
const cloudwatch = new AWS.CloudWatch({ region: 'us-east-1' });

// Configuration
const CONFIG = {
    distributionId: 'E2IBMHQ3GCW6ZK',
    functionName: 'pretty-urls-rewriter',
    dashboardName: 'CloudFront-PrettyURLs-Comprehensive',
    region: 'us-east-1'
};

class PrettyURLsDashboard {
    constructor() {
        this.widgets = [];
        this.annotations = [];
    }

    /**
     * Create comprehensive dashboard
     */
    async createDashboard() {
        try {
            console.log('📊 Creating comprehensive pretty URLs dashboard...');
            
            // Build all dashboard widgets
            this.buildOverviewWidgets();
            this.buildFunctionWidgets();
            this.buildPerformanceWidgets();
            this.buildErrorWidgets();
            this.buildCacheWidgets();
            this.buildCustomMetricsWidgets();
            this.buildHealthWidgets();
            
            // Create dashboard
            await this.deployDashboard();
            
            // Generate dashboard documentation
            await this.generateDashboardDocs();
            
            console.log('✅ Dashboard created successfully!');
            
        } catch (error) {
            console.error('❌ Error creating dashboard:', error);
            throw error;
        }
    }

    /**
     * Build overview widgets
     */
    buildOverviewWidgets() {
        // System overview widget
        this.widgets.push({
            type: "metric",
            x: 0, y: 0, width: 24, height: 6,
            properties: {
                metrics: [
                    ["AWS/CloudFront", "Requests", "DistributionId", CONFIG.distributionId],
                    ["Custom/CloudFront", "PrettyURLRequests", "FunctionName", CONFIG.functionName],
                    ["AWS/CloudFront", "FunctionExecutions", "FunctionName", CONFIG.functionName]
                ],
                view: "timeSeries",
                stacked: false,
                region: CONFIG.region,
                title: "📈 System Overview - Request Volume",
                period: 300,
                stat: "Sum",
                yAxis: {
                    left: { min: 0 }
                },
                annotations: {
                    horizontal: [
                        {
                            label: "High Traffic Threshold",
                            value: 1000
                        }
                    ]
                }
            }
        });

        // Health status widget
        this.widgets.push({
            type: "metric",
            x: 0, y: 6, width: 12, height: 6,
            properties: {
                metrics: [
                    ["Custom/CloudFront", "URLAccessibilityRate", "FunctionName", CONFIG.functionName],
                    ["AWS/CloudFront", "CacheHitRate", "DistributionId", CONFIG.distributionId]
                ],
                view: "timeSeries",
                stacked: false,
                region: CONFIG.region,
                title: "🏥 System Health Indicators",
                period: 300,
                stat: "Average",
                yAxis: {
                    left: { min: 0, max: 100 }
                },
                annotations: {
                    horizontal: [
                        {
                            label: "Healthy Threshold (95%)",
                            value: 95,
                            fill: "above"
                        },
                        {
                            label: "Warning Threshold (90%)",
                            value: 90
                        }
                    ]
                }
            }
        });

        // Error rate overview
        this.widgets.push({
            type: "metric",
            x: 12, y: 6, width: 12, height: 6,
            properties: {
                metrics: [
                    ["AWS/CloudFront", "4xxErrorRate", "DistributionId", CONFIG.distributionId],
                    ["AWS/CloudFront", "5xxErrorRate", "DistributionId", CONFIG.distributionId],
                    ["Custom/CloudFront", "URLRewriteErrors", "FunctionName", CONFIG.functionName]
                ],
                view: "timeSeries",
                stacked: false,
                region: CONFIG.region,
                title: "🚨 Error Rate Overview",
                period: 300,
                stat: "Average",
                yAxis: {
                    left: { min: 0 }
                },
                annotations: {
                    horizontal: [
                        {
                            label: "Error Rate Alert (5%)",
                            value: 5
                        }
                    ]
                }
            }
        });
    }

    /**
     * Build function-specific widgets
     */
    buildFunctionWidgets() {
        // Function execution metrics
        this.widgets.push({
            type: "metric",
            x: 0, y: 12, width: 12, height: 6,
            properties: {
                metrics: [
                    ["AWS/CloudFront", "FunctionExecutions", "FunctionName", CONFIG.functionName],
                    [".", "FunctionExecutionErrors", ".", "."],
                    ["Custom/CloudFront", "URLRewriteSuccess", ".", "."]
                ],
                view: "timeSeries",
                stacked: false,
                region: CONFIG.region,
                title: "⚡ Function Execution Metrics",
                period: 300,
                stat: "Sum"
            }
        });

        // Function performance
        this.widgets.push({
            type: "metric",
            x: 12, y: 12, width: 12, height: 6,
            properties: {
                metrics: [
                    ["AWS/CloudFront", "FunctionExecutionTime", "FunctionName", CONFIG.functionName, { stat: "Average" }],
                    [".", ".", ".", ".", { stat: "Maximum" }],
                    ["Custom/CloudFront", "FunctionAvgExecutionTime", ".", "."]
                ],
                view: "timeSeries",
                stacked: false,
                region: CONFIG.region,
                title: "⏱️ Function Performance",
                period: 300,
                yAxis: {
                    left: { min: 0 }
                },
                annotations: {
                    horizontal: [
                        {
                            label: "Performance Target (1ms)",
                            value: 1,
                            fill: "below"
                        },
                        {
                            label: "Warning Threshold (5ms)",
                            value: 5
                        },
                        {
                            label: "Critical Threshold (10ms)",
                            value: 10
                        }
                    ]
                }
            }
        });

        // Function execution distribution
        this.widgets.push({
            type: "metric",
            x: 0, y: 18, width: 24, height: 6,
            properties: {
                metrics: [
                    ["AWS/CloudFront", "FunctionExecutionTime", "FunctionName", CONFIG.functionName, { stat: "p50" }],
                    [".", ".", ".", ".", { stat: "p90" }],
                    [".", ".", ".", ".", { stat: "p95" }],
                    [".", ".", ".", ".", { stat: "p99" }]
                ],
                view: "timeSeries",
                stacked: false,
                region: CONFIG.region,
                title: "📊 Function Execution Time Distribution (Percentiles)",
                period: 300,
                yAxis: {
                    left: { min: 0 }
                }
            }
        });
    }

    /**
     * Build performance widgets
     */
    buildPerformanceWidgets() {
        // Response time analysis
        this.widgets.push({
            type: "metric",
            x: 0, y: 24, width: 12, height: 6,
            properties: {
                metrics: [
                    ["AWS/CloudFront", "OriginLatency", "DistributionId", CONFIG.distributionId, { stat: "Average" }],
                    [".", ".", ".", ".", { stat: "Maximum" }],
                    ["Custom/CloudFront", "PrettyURLsOriginLatency", "FunctionName", CONFIG.functionName]
                ],
                view: "timeSeries",
                stacked: false,
                region: CONFIG.region,
                title: "🚀 Response Time Analysis",
                period: 300,
                yAxis: {
                    left: { min: 0 }
                },
                annotations: {
                    horizontal: [
                        {
                            label: "Fast Response (100ms)",
                            value: 100,
                            fill: "below"
                        },
                        {
                            label: "Slow Response (500ms)",
                            value: 500
                        }
                    ]
                }
            }
        });

        // Throughput analysis
        this.widgets.push({
            type: "metric",
            x: 12, y: 24, width: 12, height: 6,
            properties: {
                metrics: [
                    ["AWS/CloudFront", "BytesDownloaded", "DistributionId", CONFIG.distributionId],
                    [".", "BytesUploaded", ".", "."]
                ],
                view: "timeSeries",
                stacked: false,
                region: CONFIG.region,
                title: "📊 Data Throughput",
                period: 300,
                stat: "Sum"
            }
        });
    }

    /**
     * Build error analysis widgets
     */
    buildErrorWidgets() {
        // Error breakdown
        this.widgets.push({
            type: "metric",
            x: 0, y: 30, width: 8, height: 6,
            properties: {
                metrics: [
                    ["AWS/CloudFront", "4xxErrorRate", "DistributionId", CONFIG.distributionId],
                    [".", "5xxErrorRate", ".", "."]
                ],
                view: "timeSeries",
                stacked: true,
                region: CONFIG.region,
                title: "🚨 HTTP Error Rates",
                period: 300,
                stat: "Average",
                yAxis: {
                    left: { min: 0 }
                }
            }
        });

        // Function errors
        this.widgets.push({
            type: "metric",
            x: 8, y: 30, width: 8, height: 6,
            properties: {
                metrics: [
                    ["AWS/CloudFront", "FunctionExecutionErrors", "FunctionName", CONFIG.functionName],
                    ["Custom/CloudFront", "URLRewriteErrors", ".", "."],
                    [".", "MetricsPublishingError", ".", "."]
                ],
                view: "timeSeries",
                stacked: true,
                region: CONFIG.region,
                title: "⚠️ Function Errors",
                period: 300,
                stat: "Sum"
            }
        });

        // Error rate gauge
        this.widgets.push({
            type: "metric",
            x: 16, y: 30, width: 8, height: 6,
            properties: {
                metrics: [
                    ["AWS/CloudFront", "4xxErrorRate", "DistributionId", CONFIG.distributionId],
                    [".", "5xxErrorRate", ".", "."]
                ],
                view: "singleValue",
                region: CONFIG.region,
                title: "🎯 Current Error Rate",
                period: 300,
                stat: "Average"
            }
        });
    }

    /**
     * Build cache performance widgets
     */
    buildCacheWidgets() {
        // Cache hit rate
        this.widgets.push({
            type: "metric",
            x: 0, y: 36, width: 12, height: 6,
            properties: {
                metrics: [
                    ["AWS/CloudFront", "CacheHitRate", "DistributionId", CONFIG.distributionId],
                    ["Custom/CloudFront", "PrettyURLsCacheHitRate", "FunctionName", CONFIG.functionName]
                ],
                view: "timeSeries",
                stacked: false,
                region: CONFIG.region,
                title: "💾 Cache Performance",
                period: 300,
                stat: "Average",
                yAxis: {
                    left: { min: 0, max: 100 }
                },
                annotations: {
                    horizontal: [
                        {
                            label: "Excellent Cache Rate (90%)",
                            value: 90,
                            fill: "above"
                        },
                        {
                            label: "Good Cache Rate (80%)",
                            value: 80
                        }
                    ]
                }
            }
        });

        // Cache efficiency gauge
        this.widgets.push({
            type: "metric",
            x: 12, y: 36, width: 12, height: 6,
            properties: {
                metrics: [
                    ["AWS/CloudFront", "CacheHitRate", "DistributionId", CONFIG.distributionId]
                ],
                view: "singleValue",
                region: CONFIG.region,
                title: "🎯 Current Cache Hit Rate",
                period: 300,
                stat: "Average"
            }
        });
    }

    /**
     * Build custom metrics widgets
     */
    buildCustomMetricsWidgets() {
        // URL accessibility tracking
        this.widgets.push({
            type: "metric",
            x: 0, y: 42, width: 12, height: 6,
            properties: {
                metrics: [
                    ["Custom/CloudFront", "URLAccessibilityRate", "FunctionName", CONFIG.functionName],
                    [".", "URLRewriteSuccess", ".", "."],
                    [".", "URLRewriteErrors", ".", "."]
                ],
                view: "timeSeries",
                stacked: false,
                region: CONFIG.region,
                title: "🔗 URL Accessibility Metrics",
                period: 300,
                stat: "Average"
            }
        });

        // Pretty URLs success rate
        this.widgets.push({
            type: "metric",
            x: 12, y: 42, width: 12, height: 6,
            properties: {
                metrics: [
                    ["Custom/CloudFront", "URLAccessibilityRate", "FunctionName", CONFIG.functionName]
                ],
                view: "singleValue",
                region: CONFIG.region,
                title: "🎯 Pretty URLs Success Rate",
                period: 300,
                stat: "Average"
            }
        });
    }

    /**
     * Build health monitoring widgets
     */
    buildHealthWidgets() {
        // Overall system health
        this.widgets.push({
            type: "metric",
            x: 0, y: 48, width: 24, height: 6,
            properties: {
                metrics: [
                    ["Custom/CloudFront", "URLAccessibilityRate", "FunctionName", CONFIG.functionName, { label: "URL Accessibility" }],
                    ["AWS/CloudFront", "CacheHitRate", "DistributionId", CONFIG.distributionId, { label: "Cache Performance" }],
                    ["AWS/CloudFront", "FunctionExecutionTime", "FunctionName", CONFIG.functionName, { label: "Function Performance", stat: "Average" }]
                ],
                view: "timeSeries",
                stacked: false,
                region: CONFIG.region,
                title: "🏥 System Health Dashboard",
                period: 300,
                annotations: {
                    horizontal: [
                        {
                            label: "Healthy System (95%)",
                            value: 95,
                            fill: "above"
                        }
                    ]
                }
            }
        });

        // Health score text widget
        this.widgets.push({
            type: "text",
            x: 0, y: 54, width: 24, height: 3,
            properties: {
                markdown: `
# 🏥 CloudFront Pretty URLs Health Status

## Key Performance Indicators
- **URL Accessibility**: Target >95% success rate
- **Function Performance**: Target <1ms execution time
- **Cache Hit Rate**: Target >80% cache efficiency
- **Error Rate**: Target <1% error rate

## Alert Thresholds
- 🔴 **Critical**: URL accessibility <90% OR Function errors >10/5min
- 🟡 **Warning**: Cache hit rate <80% OR Function time >5ms
- 🟢 **Healthy**: All metrics within target ranges

## Quick Actions
- [View Alarms](https://us-east-1.console.aws.amazon.com/cloudwatch/home?region=us-east-1#alarmsV2:)
- [Function Logs](https://us-east-1.console.aws.amazon.com/cloudwatch/home?region=us-east-1#logsV2:log-groups/log-group/$252Faws$252Fcloudfront$252Ffunction$252Fpretty-urls-rewriter)
- [Distribution Settings](https://us-east-1.console.aws.amazon.com/cloudfront/v3/home?region=us-east-1#/distributions/${CONFIG.distributionId})
                `
            }
        });
    }

    /**
     * Deploy dashboard to CloudWatch
     */
    async deployDashboard() {
        const dashboardBody = {
            widgets: this.widgets
        };

        const params = {
            DashboardName: CONFIG.dashboardName,
            DashboardBody: JSON.stringify(dashboardBody)
        };

        try {
            await cloudwatch.putDashboard(params).promise();
            console.log(`✅ Dashboard '${CONFIG.dashboardName}' deployed successfully`);
            
            const dashboardUrl = `https://${CONFIG.region}.console.aws.amazon.com/cloudwatch/home?region=${CONFIG.region}#dashboards:name=${CONFIG.dashboardName}`;
            console.log(`🔗 Dashboard URL: ${dashboardUrl}`);
            
        } catch (error) {
            console.error('❌ Error deploying dashboard:', error);
            throw error;
        }
    }

    /**
     * Generate dashboard documentation
     */
    async generateDashboardDocs() {
        const documentation = `# CloudFront Pretty URLs Dashboard Documentation

## Dashboard Overview

The **${CONFIG.dashboardName}** provides comprehensive monitoring for CloudFront pretty URLs functionality.

### Dashboard URL
\`https://${CONFIG.region}.console.aws.amazon.com/cloudwatch/home?region=${CONFIG.region}#dashboards:name=${CONFIG.dashboardName}\`

## Widget Descriptions

### System Overview (Row 1)
- **Request Volume**: Total requests vs pretty URL requests vs function executions
- **Health Indicators**: URL accessibility rate and cache hit rate
- **Error Overview**: HTTP error rates and function errors

### Function Metrics (Row 2-3)
- **Execution Metrics**: Function invocations, errors, and successes
- **Performance**: Average and maximum execution times
- **Distribution**: Execution time percentiles (p50, p90, p95, p99)

### Performance Analysis (Row 4)
- **Response Times**: Origin latency and pretty URLs latency
- **Throughput**: Data transfer metrics

### Error Analysis (Row 5)
- **HTTP Errors**: 4xx and 5xx error rates
- **Function Errors**: Function execution and URL rewrite errors
- **Current Status**: Real-time error rate gauge

### Cache Performance (Row 6)
- **Cache Metrics**: Hit rates and efficiency
- **Current Status**: Real-time cache hit rate

### Custom Metrics (Row 7)
- **URL Accessibility**: Pretty URLs success tracking
- **Success Rate**: Current accessibility percentage

### Health Dashboard (Row 8-9)
- **System Health**: Combined health indicators
- **Status Guide**: Health thresholds and quick actions

## Key Metrics Explained

### URL Accessibility Rate
- **Source**: Custom metric from URL testing
- **Target**: >95%
- **Alert**: <90%

### Function Execution Time
- **Source**: AWS CloudFront metrics
- **Target**: <1ms average
- **Alert**: >5ms average

### Cache Hit Rate
- **Source**: AWS CloudFront metrics
- **Target**: >80%
- **Alert**: <70%

### Error Rates
- **4xx Errors**: Client errors (target <2%)
- **5xx Errors**: Server errors (target <0.5%)
- **Function Errors**: Execution failures (target 0)

## Monitoring Best Practices

### Daily Checks
1. Review overall health status
2. Check error rates and trends
3. Verify function performance
4. Monitor cache efficiency

### Weekly Reviews
1. Analyze performance trends
2. Review error patterns
3. Check capacity utilization
4. Update alert thresholds if needed

### Monthly Analysis
1. Performance optimization opportunities
2. Cost analysis and optimization
3. Capacity planning
4. Documentation updates

## Troubleshooting Guide

### High Error Rates
1. Check function logs for errors
2. Verify distribution configuration
3. Test URL patterns manually
4. Review recent deployments

### Poor Performance
1. Analyze function execution times
2. Check cache hit rates
3. Review origin latency
4. Consider function optimization

### Low Cache Hit Rate
1. Review cache behaviors
2. Check invalidation patterns
3. Analyze request patterns
4. Optimize cache policies

## Alert Integration

### CloudWatch Alarms
- Function error rate >10 errors/5min
- Function execution time >5ms average
- 4xx error rate >5%
- 5xx error rate >1%
- Cache hit rate <80%

### Notification Channels
- SNS topics for critical alerts
- Email notifications for warnings
- Slack integration for team alerts

## Dashboard Maintenance

### Regular Updates
- Review widget configurations monthly
- Update thresholds based on performance
- Add new metrics as needed
- Remove obsolete widgets

### Version Control
- Document dashboard changes
- Backup dashboard configurations
- Test changes in development first
- Maintain rollback procedures

---

*Generated: ${new Date().toISOString()}*
*Dashboard: ${CONFIG.dashboardName}*
*Region: ${CONFIG.region}*
`;

        await fs.writeFile('docs/cloudfront-pretty-urls-dashboard-guide.md', documentation);
        console.log('📚 Dashboard documentation generated');
    }

    /**
     * Update existing dashboard
     */
    async updateDashboard() {
        console.log('🔄 Updating existing dashboard...');
        await this.createDashboard();
    }

    /**
     * Delete dashboard
     */
    async deleteDashboard() {
        try {
            await cloudwatch.deleteDashboards({
                DashboardNames: [CONFIG.dashboardName]
            }).promise();
            console.log(`🗑️ Dashboard '${CONFIG.dashboardName}' deleted successfully`);
        } catch (error) {
            console.error('❌ Error deleting dashboard:', error);
            throw error;
        }
    }

    /**
     * List all dashboards
     */
    async listDashboards() {
        try {
            const result = await cloudwatch.listDashboards().promise();
            console.log('📋 Available dashboards:');
            result.DashboardEntries.forEach(dashboard => {
                console.log(`  - ${dashboard.DashboardName} (${dashboard.Size} bytes)`);
            });
        } catch (error) {
            console.error('❌ Error listing dashboards:', error);
            throw error;
        }
    }
}

// CLI interface
async function main() {
    const args = process.argv.slice(2);
    const command = args[0] || 'create';

    const dashboard = new PrettyURLsDashboard();

    try {
        switch (command) {
            case 'create':
                await dashboard.createDashboard();
                break;
            case 'update':
                await dashboard.updateDashboard();
                break;
            case 'delete':
                await dashboard.deleteDashboard();
                break;
            case 'list':
                await dashboard.listDashboards();
                break;
            default:
                console.log('Usage: node cloudfront-pretty-urls-dashboard.js [create|update|delete|list]');
                console.log('  create: Create new dashboard');
                console.log('  update: Update existing dashboard');
                console.log('  delete: Delete dashboard');
                console.log('  list: List all dashboards');
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

module.exports = PrettyURLsDashboard;