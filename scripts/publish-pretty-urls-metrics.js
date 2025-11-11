#!/usr/bin/env node

/**
 * Publish Pretty URLs Custom Metrics
 * 
 * Collects and publishes custom metrics for CloudFront pretty URLs functionality
 * to CloudWatch for monitoring and alerting.
 */

const AWS = require('aws-sdk');
const https = require('https');
const fs = require('fs').promises;

// AWS Configuration
const cloudwatch = new AWS.CloudWatch({ region: 'us-east-1' });
const cloudfront = new AWS.CloudFront({ region: 'us-east-1' });

// Configuration
const CONFIG = {
    distributionId: 'E2IBMHQ3GCW6ZK',
    functionName: 'pretty-urls-rewriter',
    domain: 'https://d15sc9fc739ev2.cloudfront.net',
    namespace: 'Custom/CloudFront',
    region: 'us-east-1'
};

class PrettyURLsMetricsPublisher {
    constructor() {
        this.metrics = [];
        this.testResults = {};
    }

    /**
     * Main metrics collection and publishing function
     */
    async publishMetrics() {
        try {
            console.log('📊 Collecting pretty URLs metrics...');
            
            // Collect URL accessibility metrics
            await this.collectURLAccessibilityMetrics();
            
            // Collect function performance metrics
            await this.collectFunctionMetrics();
            
            // Collect cache performance metrics
            await this.collectCacheMetrics();
            
            // Publish all metrics to CloudWatch
            await this.publishToCloudWatch();
            
            // Generate metrics report
            await this.generateMetricsReport();
            
            console.log('✅ Metrics published successfully!');
            
        } catch (error) {
            console.error('❌ Error publishing metrics:', error);
            await this.publishErrorMetric(error);
            throw error;
        }
    }

    /**
     * Collect URL accessibility metrics by testing pretty URLs
     */
    async collectURLAccessibilityMetrics() {
        console.log('🔗 Testing URL accessibility...');
        
        const testUrls = [
            { url: '/', type: 'root', expected: 200 },
            { url: '/privacy-policy/', type: 'directory', expected: 200 },
            { url: '/about/', type: 'directory', expected: 200 },
            { url: '/contact/', type: 'directory', expected: 200 },
            { url: '/services/', type: 'directory', expected: 200 },
            { url: '/blog/', type: 'directory', expected: 200 },
            { url: '/about', type: 'extensionless', expected: 200 },
            { url: '/contact', type: 'extensionless', expected: 200 }
        ];

        let successCount = 0;
        let errorCount = 0;
        let totalRequests = 0;

        for (const test of testUrls) {
            try {
                const fullUrl = `${CONFIG.domain}${test.url}`;
                const result = await this.testUrl(fullUrl);
                
                totalRequests++;
                
                if (result.statusCode === test.expected) {
                    successCount++;
                    console.log(`✅ ${test.url} (${test.type}): ${result.statusCode}`);
                } else {
                    errorCount++;
                    console.log(`❌ ${test.url} (${test.type}): ${result.statusCode} (expected ${test.expected})`);
                }

                // Store detailed results
                this.testResults[test.url] = {
                    type: test.type,
                    statusCode: result.statusCode,
                    responseTime: result.responseTime,
                    success: result.statusCode === test.expected
                };

            } catch (error) {
                errorCount++;
                totalRequests++;
                console.log(`❌ ${test.url} (${test.type}): Error - ${error.message}`);
                
                this.testResults[test.url] = {
                    type: test.type,
                    error: error.message,
                    success: false
                };
            }
        }

        // Add metrics
        this.addMetric('PrettyURLRequests', totalRequests, 'Count');
        this.addMetric('URLRewriteSuccess', successCount, 'Count');
        this.addMetric('URLRewriteErrors', errorCount, 'Count');
        this.addMetric('URLAccessibilityRate', (successCount / totalRequests) * 100, 'Percent');

        console.log(`📈 URL Metrics: ${successCount}/${totalRequests} successful, ${errorCount} errors`);
    }

    /**
     * Test individual URL and measure response time
     */
    async testUrl(url) {
        return new Promise((resolve, reject) => {
            const startTime = Date.now();
            
            const request = https.get(url, {
                timeout: 10000,
                headers: {
                    'User-Agent': 'PrettyURLs-Monitor/1.0'
                }
            }, (response) => {
                const responseTime = Date.now() - startTime;
                
                // Consume response data to free up memory
                response.on('data', () => {});
                response.on('end', () => {
                    resolve({
                        statusCode: response.statusCode,
                        responseTime: responseTime,
                        headers: response.headers
                    });
                });
            });

            request.on('timeout', () => {
                request.destroy();
                reject(new Error('Request timeout'));
            });

            request.on('error', (error) => {
                reject(error);
            });
        });
    }

    /**
     * Collect CloudFront Function performance metrics
     */
    async collectFunctionMetrics() {
        console.log('⚡ Collecting function performance metrics...');
        
        try {
            // Get function execution metrics from CloudWatch
            const endTime = new Date();
            const startTime = new Date(endTime.getTime() - 15 * 60 * 1000); // Last 15 minutes

            const params = {
                Namespace: 'AWS/CloudFront',
                MetricName: 'FunctionExecutions',
                Dimensions: [
                    {
                        Name: 'FunctionName',
                        Value: CONFIG.functionName
                    }
                ],
                StartTime: startTime,
                EndTime: endTime,
                Period: 300,
                Statistics: ['Sum']
            };

            const executionData = await cloudwatch.getMetricStatistics(params).promise();
            
            if (executionData.Datapoints.length > 0) {
                const totalExecutions = executionData.Datapoints.reduce(
                    (sum, point) => sum + point.Sum, 0
                );
                this.addMetric('FunctionExecutionsLast15Min', totalExecutions, 'Count');
            }

            // Get function execution time metrics
            const timeParams = {
                ...params,
                MetricName: 'FunctionExecutionTime',
                Statistics: ['Average', 'Maximum']
            };

            const timeData = await cloudwatch.getMetricStatistics(timeParams).promise();
            
            if (timeData.Datapoints.length > 0) {
                const avgTime = timeData.Datapoints.reduce(
                    (sum, point) => sum + point.Average, 0
                ) / timeData.Datapoints.length;
                
                const maxTime = Math.max(...timeData.Datapoints.map(point => point.Maximum));
                
                this.addMetric('FunctionAvgExecutionTime', avgTime, 'Milliseconds');
                this.addMetric('FunctionMaxExecutionTime', maxTime, 'Milliseconds');
            }

            console.log('✅ Function metrics collected');

        } catch (error) {
            console.error('❌ Error collecting function metrics:', error);
            this.addMetric('FunctionMetricsError', 1, 'Count');
        }
    }

    /**
     * Collect cache performance metrics
     */
    async collectCacheMetrics() {
        console.log('💾 Collecting cache performance metrics...');
        
        try {
            const endTime = new Date();
            const startTime = new Date(endTime.getTime() - 15 * 60 * 1000); // Last 15 minutes

            // Get cache hit rate
            const cacheParams = {
                Namespace: 'AWS/CloudFront',
                MetricName: 'CacheHitRate',
                Dimensions: [
                    {
                        Name: 'DistributionId',
                        Value: CONFIG.distributionId
                    }
                ],
                StartTime: startTime,
                EndTime: endTime,
                Period: 300,
                Statistics: ['Average']
            };

            const cacheData = await cloudwatch.getMetricStatistics(cacheParams).promise();
            
            if (cacheData.Datapoints.length > 0) {
                const avgCacheHitRate = cacheData.Datapoints.reduce(
                    (sum, point) => sum + point.Average, 0
                ) / cacheData.Datapoints.length;
                
                this.addMetric('PrettyURLsCacheHitRate', avgCacheHitRate, 'Percent');
            }

            // Get origin latency
            const latencyParams = {
                ...cacheParams,
                MetricName: 'OriginLatency',
                Statistics: ['Average', 'Maximum']
            };

            const latencyData = await cloudwatch.getMetricStatistics(latencyParams).promise();
            
            if (latencyData.Datapoints.length > 0) {
                const avgLatency = latencyData.Datapoints.reduce(
                    (sum, point) => sum + point.Average, 0
                ) / latencyData.Datapoints.length;
                
                this.addMetric('PrettyURLsOriginLatency', avgLatency, 'Milliseconds');
            }

            console.log('✅ Cache metrics collected');

        } catch (error) {
            console.error('❌ Error collecting cache metrics:', error);
            this.addMetric('CacheMetricsError', 1, 'Count');
        }
    }

    /**
     * Add metric to collection
     */
    addMetric(name, value, unit) {
        this.metrics.push({
            MetricName: name,
            Value: value,
            Unit: unit,
            Timestamp: new Date(),
            Dimensions: [
                {
                    Name: 'FunctionName',
                    Value: CONFIG.functionName
                },
                {
                    Name: 'DistributionId',
                    Value: CONFIG.distributionId
                }
            ]
        });
    }

    /**
     * Publish all collected metrics to CloudWatch
     */
    async publishToCloudWatch() {
        console.log('📤 Publishing metrics to CloudWatch...');
        
        if (this.metrics.length === 0) {
            console.log('⚠️ No metrics to publish');
            return;
        }

        // CloudWatch allows max 20 metrics per request
        const batchSize = 20;
        const batches = [];
        
        for (let i = 0; i < this.metrics.length; i += batchSize) {
            batches.push(this.metrics.slice(i, i + batchSize));
        }

        for (const batch of batches) {
            try {
                const params = {
                    Namespace: CONFIG.namespace,
                    MetricData: batch
                };

                await cloudwatch.putMetricData(params).promise();
                console.log(`✅ Published ${batch.length} metrics to CloudWatch`);

            } catch (error) {
                console.error('❌ Error publishing metrics batch:', error);
            }
        }
    }

    /**
     * Publish error metric when something goes wrong
     */
    async publishErrorMetric(error) {
        try {
            const errorMetric = {
                MetricName: 'MetricsPublishingError',
                Value: 1,
                Unit: 'Count',
                Timestamp: new Date(),
                Dimensions: [
                    {
                        Name: 'FunctionName',
                        Value: CONFIG.functionName
                    },
                    {
                        Name: 'ErrorType',
                        Value: error.name || 'UnknownError'
                    }
                ]
            };

            await cloudwatch.putMetricData({
                Namespace: CONFIG.namespace,
                MetricData: [errorMetric]
            }).promise();

        } catch (publishError) {
            console.error('❌ Failed to publish error metric:', publishError);
        }
    }

    /**
     * Generate metrics report
     */
    async generateMetricsReport() {
        const report = {
            timestamp: new Date().toISOString(),
            config: {
                distributionId: CONFIG.distributionId,
                functionName: CONFIG.functionName,
                domain: CONFIG.domain
            },
            metrics: {
                published: this.metrics.length,
                summary: this.getMetricsSummary()
            },
            urlTests: this.testResults,
            health: this.calculateHealthScore()
        };

        const filename = `pretty-urls-metrics-report-${Date.now()}.json`;
        await fs.writeFile(filename, JSON.stringify(report, null, 2));
        
        console.log(`📋 Metrics report saved to ${filename}`);
        
        // Log summary
        console.log('\n📊 Metrics Summary:');
        Object.entries(report.metrics.summary).forEach(([key, value]) => {
            console.log(`  ${key}: ${value}`);
        });
        
        console.log(`\n🏥 Overall Health Score: ${report.health.score}%`);
    }

    /**
     * Get summary of collected metrics
     */
    getMetricsSummary() {
        const summary = {};
        
        this.metrics.forEach(metric => {
            if (!summary[metric.MetricName]) {
                summary[metric.MetricName] = {
                    value: metric.Value,
                    unit: metric.Unit
                };
            }
        });
        
        return summary;
    }

    /**
     * Calculate overall health score based on metrics
     */
    calculateHealthScore() {
        let score = 100;
        const issues = [];
        
        // Check URL accessibility
        const urlTests = Object.values(this.testResults);
        const successRate = urlTests.filter(test => test.success).length / urlTests.length;
        
        if (successRate < 1.0) {
            const penalty = (1 - successRate) * 50;
            score -= penalty;
            issues.push(`URL accessibility: ${(successRate * 100).toFixed(1)}%`);
        }
        
        // Check function performance
        const avgTimeMetric = this.metrics.find(m => m.MetricName === 'FunctionAvgExecutionTime');
        if (avgTimeMetric && avgTimeMetric.Value > 5) {
            score -= 20;
            issues.push(`Function execution time: ${avgTimeMetric.Value.toFixed(2)}ms`);
        }
        
        // Check cache performance
        const cacheHitMetric = this.metrics.find(m => m.MetricName === 'PrettyURLsCacheHitRate');
        if (cacheHitMetric && cacheHitMetric.Value < 80) {
            score -= 15;
            issues.push(`Cache hit rate: ${cacheHitMetric.Value.toFixed(1)}%`);
        }
        
        return {
            score: Math.max(0, Math.round(score)),
            issues: issues
        };
    }

    /**
     * Run continuous monitoring
     */
    async startContinuousMonitoring(intervalMinutes = 5) {
        console.log(`🔄 Starting continuous monitoring (${intervalMinutes} minute intervals)...`);
        
        const interval = setInterval(async () => {
            try {
                await this.publishMetrics();
            } catch (error) {
                console.error('❌ Error in continuous monitoring:', error);
            }
        }, intervalMinutes * 60 * 1000);

        // Handle graceful shutdown
        process.on('SIGINT', () => {
            console.log('\n🛑 Stopping continuous monitoring...');
            clearInterval(interval);
            process.exit(0);
        });

        // Initial run
        await this.publishMetrics();
    }
}

// CLI interface
async function main() {
    const args = process.argv.slice(2);
    const command = args[0] || 'publish';

    const publisher = new PrettyURLsMetricsPublisher();

    try {
        switch (command) {
            case 'publish':
                await publisher.publishMetrics();
                break;
            case 'monitor':
                const interval = parseInt(args[1]) || 5;
                await publisher.startContinuousMonitoring(interval);
                break;
            case 'test-urls':
                await publisher.collectURLAccessibilityMetrics();
                break;
            case 'test-function':
                await publisher.collectFunctionMetrics();
                break;
            case 'test-cache':
                await publisher.collectCacheMetrics();
                break;
            default:
                console.log('Usage: node publish-pretty-urls-metrics.js [publish|monitor|test-urls|test-function|test-cache]');
                console.log('  publish: Collect and publish all metrics once');
                console.log('  monitor [interval]: Start continuous monitoring (default: 5 minutes)');
                console.log('  test-urls: Test URL accessibility only');
                console.log('  test-function: Collect function metrics only');
                console.log('  test-cache: Collect cache metrics only');
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

module.exports = PrettyURLsMetricsPublisher;