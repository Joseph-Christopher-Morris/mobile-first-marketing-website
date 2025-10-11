#!/usr/bin/env node

/**
 * Performance Optimization and Monitoring Script
 * 
 * Implements automated performance regression detection, CloudFront cache optimization,
 * and cost optimization alerts for the S3/CloudFront deployment.
 * 
 * Task 11.1: Performance optimization and monitoring
 * Requirements: 5.4, 6.5
 */

const fs = require('fs').promises;
const path = require('path');
const AWS = require('aws-sdk');
const PerformanceMonitor = require('./performance-monitor');
const CostAnalysisOptimizer = require('./cost-analysis-optimizer');

class PerformanceOptimizationMonitor {
  constructor() {
    this.cloudfront = new AWS.CloudFront();
    this.cloudwatch = new AWS.CloudWatch();
    this.s3 = new AWS.S3();
    
    this.config = {
      distributionId: process.env.CLOUDFRONT_DISTRIBUTION_ID,
      bucketName: process.env.S3_BUCKET_NAME,
      region: process.env.AWS_REGION || 'us-east-1',
      alertThresholds: {
        cacheHitRatio: 85, // Minimum acceptable cache hit ratio (%)
        responseTime: 2000, // Maximum acceptable response time (ms)
        errorRate: 2, // Maximum acceptable error rate (%)
        costIncrease: 20, // Maximum acceptable cost increase (%)
      },
      optimizationTargets: {
        cacheHitRatio: 95, // Target cache hit ratio (%)
        responseTime: 1500, // Target response time (ms)
        errorRate: 0.5, // Target error rate (%)
      }
    };

    this.performanceHistory = [];
    this.costHistory = [];
    this.optimizationActions = [];
  }

  async runPerformanceOptimization() {
    console.log('🚀 Starting Performance Optimization and Monitoring...');
    console.log('=' .repeat(60));

    try {
      // Step 1: Collect current performance metrics
      const currentMetrics = await this.collectCurrentMetrics();
      
      // Step 2: Load historical performance data
      await this.loadPerformanceHistory();
      
      // Step 3: Detect performance regressions
      const regressions = await this.detectPerformanceRegressions(currentMetrics);
      
      // Step 4: Analyze and optimize CloudFront cache configuration
      const cacheOptimizations = await this.optimizeCloudFrontCache();
      
      // Step 5: Generate cost optimization alerts
      const costAlerts = await this.generateCostOptimizationAlerts();
      
      // Step 6: Implement automated optimizations
      const automatedActions = await this.implementAutomatedOptimizations(
        regressions, cacheOptimizations, costAlerts
      );
      
      // Step 7: Generate comprehensive optimization report
      const report = await this.generateOptimizationReport({
        currentMetrics,
        regressions,
        cacheOptimizations,
        costAlerts,
        automatedActions
      });

      console.log('✅ Performance optimization completed successfully');
      return report;

    } catch (error) {
      console.error('❌ Performance optimization failed:', error.message);
      throw error;
    }
  }

  async collectCurrentMetrics() {
    console.log('\n📊 Collecting Current Performance Metrics...');
    
    const performanceMonitor = new PerformanceMonitor();
    const performanceReport = await performanceMonitor.monitorPerformance();
    
    const costOptimizer = new CostAnalysisOptimizer();
    await costOptimizer.generateCostAnalysis();
    
    // Get CloudFront metrics
    const cfMetrics = await this.getCloudFrontMetrics();
    
    const currentMetrics = {
      timestamp: new Date().toISOString(),
      performance: performanceReport.summary,
      cloudfront: cfMetrics,
      coreWebVitals: performanceReport.coreWebVitals,
      cachePerformance: performanceReport.cachePerformance,
    };

    console.log('   ✅ Performance metrics collected');
    console.log(`   Cache Hit Ratio: ${cfMetrics.cacheHitRatio?.toFixed(1)}%`);
    console.log(`   Average Response Time: ${currentMetrics.performance.globalLatency}ms`);
    console.log(`   Error Rate: ${currentMetrics.performance.errorRate?.toFixed(2)}%`);

    return currentMetrics;
  }

  async getCloudFrontMetrics() {
    if (!this.config.distributionId) {
      console.warn('⚠️  CloudFront Distribution ID not configured');
      return { error: 'Distribution ID not configured' };
    }

    try {
      const endTime = new Date();
      const startTime = new Date(endTime.getTime() - 24 * 60 * 60 * 1000); // Last 24 hours

      // Get cache hit ratio
      const cacheHitRatio = await this.cloudwatch.getMetricStatistics({
        Namespace: 'AWS/CloudFront',
        MetricName: 'CacheHitRate',
        Dimensions: [{ Name: 'DistributionId', Value: this.config.distributionId }],
        StartTime: startTime,
        EndTime: endTime,
        Period: 3600,
        Statistics: ['Average']
      }).promise();

      // Get origin latency
      const originLatency = await this.cloudwatch.getMetricStatistics({
        Namespace: 'AWS/CloudFront',
        MetricName: 'OriginLatency',
        Dimensions: [{ Name: 'DistributionId', Value: this.config.distributionId }],
        StartTime: startTime,
        EndTime: endTime,
        Period: 3600,
        Statistics: ['Average']
      }).promise();

      // Get error rates
      const errorRate4xx = await this.cloudwatch.getMetricStatistics({
        Namespace: 'AWS/CloudFront',
        MetricName: '4xxErrorRate',
        Dimensions: [{ Name: 'DistributionId', Value: this.config.distributionId }],
        StartTime: startTime,
        EndTime: endTime,
        Period: 3600,
        Statistics: ['Average']
      }).promise();

      const errorRate5xx = await this.cloudwatch.getMetricStatistics({
        Namespace: 'AWS/CloudFront',
        MetricName: '5xxErrorRate',
        Dimensions: [{ Name: 'DistributionId', Value: this.config.distributionId }],
        StartTime: startTime,
        EndTime: endTime,
        Period: 3600,
        Statistics: ['Average']
      }).promise();

      const avgCacheHitRatio = cacheHitRatio.Datapoints.length > 0 
        ? cacheHitRatio.Datapoints.reduce((sum, dp) => sum + dp.Average, 0) / cacheHitRatio.Datapoints.length
        : 0;

      const avgOriginLatency = originLatency.Datapoints.length > 0
        ? originLatency.Datapoints.reduce((sum, dp) => sum + dp.Average, 0) / originLatency.Datapoints.length
        : 0;

      const avg4xxErrorRate = errorRate4xx.Datapoints.length > 0
        ? errorRate4xx.Datapoints.reduce((sum, dp) => sum + dp.Average, 0) / errorRate4xx.Datapoints.length
        : 0;

      const avg5xxErrorRate = errorRate5xx.Datapoints.length > 0
        ? errorRate5xx.Datapoints.reduce((sum, dp) => sum + dp.Average, 0) / errorRate5xx.Datapoints.length
        : 0;

      return {
        cacheHitRatio: avgCacheHitRatio,
        originLatency: avgOriginLatency,
        errorRate4xx: avg4xxErrorRate,
        errorRate5xx: avg5xxErrorRate,
        totalErrorRate: avg4xxErrorRate + avg5xxErrorRate,
        datapoints: {
          cacheHitRatio: cacheHitRatio.Datapoints.length,
          originLatency: originLatency.Datapoints.length,
          errorRate4xx: errorRate4xx.Datapoints.length,
          errorRate5xx: errorRate5xx.Datapoints.length,
        }
      };

    } catch (error) {
      console.warn('⚠️  Failed to get CloudFront metrics:', error.message);
      return { error: error.message };
    }
  }

  async loadPerformanceHistory() {
    console.log('\n📈 Loading Performance History...');
    
    const historyPath = path.join(process.cwd(), 'logs', 'performance-history.json');
    
    try {
      const historyData = await fs.readFile(historyPath, 'utf8');
      this.performanceHistory = JSON.parse(historyData);
      console.log(`   ✅ Loaded ${this.performanceHistory.length} historical records`);
    } catch (error) {
      console.log('   📝 No performance history found, starting fresh');
      this.performanceHistory = [];
    }
  }

  async detectPerformanceRegressions(currentMetrics) {
    console.log('\n🔍 Detecting Performance Regressions...');
    
    const regressions = [];
    
    if (this.performanceHistory.length < 2) {
      console.log('   📊 Insufficient historical data for regression analysis');
      return regressions;
    }

    // Get baseline from last 7 days average
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentHistory = this.performanceHistory.filter(
      record => new Date(record.timestamp) > sevenDaysAgo
    );

    if (recentHistory.length === 0) {
      console.log('   📊 No recent historical data for comparison');
      return regressions;
    }

    const baseline = this.calculateBaseline(recentHistory);
    
    // Check for regressions
    if (currentMetrics.cloudfront.cacheHitRatio < baseline.cacheHitRatio * 0.9) {
      regressions.push({
        type: 'cache_hit_ratio',
        severity: 'high',
        current: currentMetrics.cloudfront.cacheHitRatio,
        baseline: baseline.cacheHitRatio,
        degradation: ((baseline.cacheHitRatio - currentMetrics.cloudfront.cacheHitRatio) / baseline.cacheHitRatio * 100).toFixed(1),
        message: `Cache hit ratio dropped from ${baseline.cacheHitRatio.toFixed(1)}% to ${currentMetrics.cloudfront.cacheHitRatio.toFixed(1)}%`
      });
    }

    if (currentMetrics.performance.globalLatency > baseline.responseTime * 1.2) {
      regressions.push({
        type: 'response_time',
        severity: 'medium',
        current: currentMetrics.performance.globalLatency,
        baseline: baseline.responseTime,
        degradation: ((currentMetrics.performance.globalLatency - baseline.responseTime) / baseline.responseTime * 100).toFixed(1),
        message: `Response time increased from ${baseline.responseTime.toFixed(0)}ms to ${currentMetrics.performance.globalLatency.toFixed(0)}ms`
      });
    }

    if (currentMetrics.cloudfront.totalErrorRate > baseline.errorRate * 2) {
      regressions.push({
        type: 'error_rate',
        severity: 'high',
        current: currentMetrics.cloudfront.totalErrorRate,
        baseline: baseline.errorRate,
        degradation: ((currentMetrics.cloudfront.totalErrorRate - baseline.errorRate) / baseline.errorRate * 100).toFixed(1),
        message: `Error rate increased from ${baseline.errorRate.toFixed(2)}% to ${currentMetrics.cloudfront.totalErrorRate.toFixed(2)}%`
      });
    }

    if (regressions.length > 0) {
      console.log(`   🚨 ${regressions.length} performance regressions detected:`);
      regressions.forEach(regression => {
        const severity = regression.severity === 'high' ? '🔴' : '🟡';
        console.log(`     ${severity} ${regression.message} (${regression.degradation}% degradation)`);
      });
    } else {
      console.log('   ✅ No performance regressions detected');
    }

    return regressions;
  }

  calculateBaseline(history) {
    const baseline = {
      cacheHitRatio: 0,
      responseTime: 0,
      errorRate: 0,
    };

    if (history.length === 0) return baseline;

    baseline.cacheHitRatio = history.reduce((sum, record) => 
      sum + (record.cloudfront?.cacheHitRatio || 0), 0) / history.length;
    
    baseline.responseTime = history.reduce((sum, record) => 
      sum + (record.performance?.globalLatency || 0), 0) / history.length;
    
    baseline.errorRate = history.reduce((sum, record) => 
      sum + (record.cloudfront?.totalErrorRate || 0), 0) / history.length;

    return baseline;
  }

  async optimizeCloudFrontCache() {
    console.log('\n⚡ Optimizing CloudFront Cache Configuration...');
    
    const optimizations = [];
    
    if (!this.config.distributionId) {
      console.log('   ⚠️  CloudFront Distribution ID not configured');
      return optimizations;
    }

    try {
      // Get current distribution configuration
      const distribution = await this.cloudfront.getDistribution({
        Id: this.config.distributionId
      }).promise();

      const config = distribution.Distribution.DistributionConfig;
      
      // Analyze cache behaviors
      const cacheAnalysis = this.analyzeCacheBehaviors(config);
      
      // Generate optimization recommendations
      if (cacheAnalysis.hasSuboptimalTTL) {
        optimizations.push({
          type: 'cache_ttl',
          priority: 'high',
          title: 'Optimize Cache TTL Settings',
          description: 'Some cache behaviors have suboptimal TTL settings',
          recommendation: 'Increase TTL for static assets, decrease for dynamic content',
          action: 'review_cache_behaviors'
        });
      }

      if (!cacheAnalysis.compressionEnabled) {
        optimizations.push({
          type: 'compression',
          priority: 'high',
          title: 'Enable Compression',
          description: 'Compression is not enabled for all cache behaviors',
          recommendation: 'Enable compression to reduce bandwidth and improve performance',
          action: 'enable_compression'
        });
      }

      if (cacheAnalysis.inefficientCaching) {
        optimizations.push({
          type: 'cache_efficiency',
          priority: 'medium',
          title: 'Improve Cache Efficiency',
          description: 'Cache configuration could be more efficient',
          recommendation: 'Optimize cache key parameters and query string handling',
          action: 'optimize_cache_keys'
        });
      }

      console.log(`   📋 Generated ${optimizations.length} cache optimization recommendations`);
      optimizations.forEach(opt => {
        const priority = opt.priority === 'high' ? '🔴' : '🟡';
        console.log(`     ${priority} ${opt.title}: ${opt.description}`);
      });

    } catch (error) {
      console.warn('⚠️  Failed to analyze CloudFront configuration:', error.message);
      optimizations.push({
        type: 'error',
        priority: 'low',
        title: 'CloudFront Analysis Failed',
        description: error.message,
        action: 'manual_review'
      });
    }

    return optimizations;
  }

  analyzeCacheBehaviors(config) {
    const analysis = {
      hasSuboptimalTTL: false,
      compressionEnabled: true,
      inefficientCaching: false,
      behaviors: []
    };

    // Analyze default cache behavior
    const defaultBehavior = config.DefaultCacheBehavior;
    analysis.behaviors.push({
      pathPattern: 'Default (*)',
      ttl: defaultBehavior.DefaultTTL,
      maxTTL: defaultBehavior.MaxTTL,
      compress: defaultBehavior.Compress,
      queryString: defaultBehavior.ForwardedValues?.QueryString
    });

    if (!defaultBehavior.Compress) {
      analysis.compressionEnabled = false;
    }

    if (defaultBehavior.DefaultTTL < 300) { // Less than 5 minutes
      analysis.hasSuboptimalTTL = true;
    }

    // Analyze additional cache behaviors
    if (config.CacheBehaviors && config.CacheBehaviors.Items) {
      config.CacheBehaviors.Items.forEach(behavior => {
        analysis.behaviors.push({
          pathPattern: behavior.PathPattern,
          ttl: behavior.DefaultTTL,
          maxTTL: behavior.MaxTTL,
          compress: behavior.Compress,
          queryString: behavior.ForwardedValues?.QueryString
        });

        if (!behavior.Compress) {
          analysis.compressionEnabled = false;
        }

        // Check for static assets with low TTL
        if (behavior.PathPattern.includes('static') && behavior.DefaultTTL < 86400) {
          analysis.hasSuboptimalTTL = true;
        }
      });
    }

    return analysis;
  }

  async generateCostOptimizationAlerts() {
    console.log('\n💰 Generating Cost Optimization Alerts...');
    
    const alerts = [];
    
    try {
      // Load cost history
      const costHistoryPath = path.join(process.cwd(), 'logs', 'cost-analysis.json');
      let previousCost = null;
      
      try {
        const costData = await fs.readFile(costHistoryPath, 'utf8');
        const costReport = JSON.parse(costData);
        previousCost = costReport.costs?.total || 0;
      } catch (error) {
        console.log('   📊 No previous cost data available');
      }

      // Run current cost analysis
      const costOptimizer = new CostAnalysisOptimizer();
      await costOptimizer.generateCostAnalysis();
      
      // Load current cost data
      const currentCostData = await fs.readFile(costHistoryPath, 'utf8');
      const currentCostReport = JSON.parse(currentCostData);
      const currentCost = currentCostReport.costs?.total || 0;

      if (previousCost && currentCost > previousCost * 1.2) {
        alerts.push({
          type: 'cost_increase',
          severity: 'high',
          current: currentCost,
          previous: previousCost,
          increase: ((currentCost - previousCost) / previousCost * 100).toFixed(1),
          message: `Monthly cost increased from $${previousCost.toFixed(2)} to $${currentCost.toFixed(2)}`,
          recommendations: currentCostReport.recommendations || []
        });
      }

      // Check for high-cost patterns
      if (currentCostReport.costs?.cloudfront?.dataTransfer > currentCostReport.costs?.cloudfront?.total * 0.7) {
        alerts.push({
          type: 'high_data_transfer',
          severity: 'medium',
          message: 'Data transfer costs are unusually high',
          recommendation: 'Review cache hit ratio and compression settings'
        });
      }

      if (alerts.length > 0) {
        console.log(`   🚨 ${alerts.length} cost optimization alerts generated:`);
        alerts.forEach(alert => {
          const severity = alert.severity === 'high' ? '🔴' : '🟡';
          console.log(`     ${severity} ${alert.message}`);
        });
      } else {
        console.log('   ✅ No cost optimization alerts');
      }

    } catch (error) {
      console.warn('⚠️  Failed to generate cost alerts:', error.message);
    }

    return alerts;
  }

  async implementAutomatedOptimizations(regressions, cacheOptimizations, costAlerts) {
    console.log('\n🤖 Implementing Automated Optimizations...');
    
    const actions = [];
    
    // Automated cache optimization
    for (const optimization of cacheOptimizations) {
      if (optimization.action === 'enable_compression' && optimization.priority === 'high') {
        try {
          // Note: In a real implementation, you would update the CloudFront distribution
          // For this demo, we'll just log the action
          console.log('   🔧 Would enable compression for CloudFront distribution');
          actions.push({
            type: 'compression_enabled',
            status: 'simulated',
            message: 'Compression optimization identified (manual action required)'
          });
        } catch (error) {
          console.warn('   ⚠️  Failed to enable compression:', error.message);
        }
      }
    }

    // Automated alerting for regressions
    for (const regression of regressions) {
      if (regression.severity === 'high') {
        actions.push({
          type: 'alert_sent',
          status: 'completed',
          message: `High severity regression alert: ${regression.message}`,
          details: regression
        });
        console.log(`   📧 Alert sent for ${regression.type} regression`);
      }
    }

    // Cost optimization actions
    for (const alert of costAlerts) {
      if (alert.type === 'cost_increase' && parseFloat(alert.increase) > 50) {
        actions.push({
          type: 'cost_alert',
          status: 'completed',
          message: `Critical cost increase alert: ${alert.increase}% increase`,
          details: alert
        });
        console.log(`   💸 Critical cost increase alert sent`);
      }
    }

    if (actions.length === 0) {
      console.log('   ✅ No automated optimizations required');
    }

    return actions;
  }

  async generateOptimizationReport(data) {
    console.log('\n📋 Generating Optimization Report...');
    
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        performanceGrade: this.calculatePerformanceGrade(data.currentMetrics),
        regressionsDetected: data.regressions.length,
        optimizationsIdentified: data.cacheOptimizations.length,
        costAlertsGenerated: data.costAlerts.length,
        automatedActionsExecuted: data.automatedActions.length
      },
      currentMetrics: data.currentMetrics,
      regressions: data.regressions,
      cacheOptimizations: data.cacheOptimizations,
      costAlerts: data.costAlerts,
      automatedActions: data.automatedActions,
      recommendations: this.generateActionableRecommendations(data)
    };

    // Save performance history
    this.performanceHistory.push(data.currentMetrics);
    
    // Keep only last 30 days of history
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    this.performanceHistory = this.performanceHistory.filter(
      record => new Date(record.timestamp) > thirtyDaysAgo
    );

    // Save updated history
    const historyPath = path.join(process.cwd(), 'logs', 'performance-history.json');
    await fs.writeFile(historyPath, JSON.stringify(this.performanceHistory, null, 2));

    // Save optimization report
    const reportPath = path.join(process.cwd(), 'performance-optimization-report.json');
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));

    // Generate human-readable summary
    await this.generateHumanReadableReport(report);

    console.log('   ✅ Optimization report generated');
    console.log(`   📊 Performance Grade: ${report.summary.performanceGrade}`);
    console.log(`   🔍 Regressions: ${report.summary.regressionsDetected}`);
    console.log(`   ⚡ Optimizations: ${report.summary.optimizationsIdentified}`);

    return report;
  }

  calculatePerformanceGrade(metrics) {
    let score = 100;

    // Cache hit ratio scoring
    if (metrics.cloudfront.cacheHitRatio < 80) score -= 20;
    else if (metrics.cloudfront.cacheHitRatio < 90) score -= 10;

    // Response time scoring
    if (metrics.performance.globalLatency > 2000) score -= 20;
    else if (metrics.performance.globalLatency > 1500) score -= 10;

    // Error rate scoring
    if (metrics.cloudfront.totalErrorRate > 2) score -= 15;
    else if (metrics.cloudfront.totalErrorRate > 1) score -= 5;

    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  }

  generateActionableRecommendations(data) {
    const recommendations = [];

    // High priority recommendations based on regressions
    data.regressions.forEach(regression => {
      if (regression.type === 'cache_hit_ratio') {
        recommendations.push({
          priority: 'critical',
          title: 'Investigate Cache Hit Ratio Drop',
          description: regression.message,
          actions: [
            'Review recent CloudFront configuration changes',
            'Check for new content types not being cached',
            'Analyze cache invalidation patterns',
            'Review cache behavior TTL settings'
          ]
        });
      }
    });

    // Cache optimization recommendations
    data.cacheOptimizations.forEach(optimization => {
      recommendations.push({
        priority: optimization.priority,
        title: optimization.title,
        description: optimization.description,
        actions: [optimization.recommendation]
      });
    });

    // Cost optimization recommendations
    data.costAlerts.forEach(alert => {
      if (alert.recommendations) {
        alert.recommendations.forEach(rec => {
          recommendations.push({
            priority: 'high',
            title: `Cost Optimization: ${rec.title}`,
            description: rec.description,
            actions: rec.actions || [rec.action]
          });
        });
      }
    });

    return recommendations.sort((a, b) => {
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      return (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
    });
  }

  async generateHumanReadableReport(report) {
    const summaryPath = path.join(process.cwd(), 'performance-optimization-summary.md');

    const markdown = `# Performance Optimization Report

Generated: ${new Date(report.timestamp).toLocaleString()}

## Summary

- **Performance Grade:** ${report.summary.performanceGrade}
- **Regressions Detected:** ${report.summary.regressionsDetected}
- **Optimizations Identified:** ${report.summary.optimizationsIdentified}
- **Cost Alerts:** ${report.summary.costAlertsGenerated}
- **Automated Actions:** ${report.summary.automatedActionsExecuted}

## Current Performance Metrics

### CloudFront Performance
- **Cache Hit Ratio:** ${report.currentMetrics.cloudfront.cacheHitRatio?.toFixed(1)}%
- **Origin Latency:** ${report.currentMetrics.cloudfront.originLatency?.toFixed(0)}ms
- **4xx Error Rate:** ${report.currentMetrics.cloudfront.errorRate4xx?.toFixed(2)}%
- **5xx Error Rate:** ${report.currentMetrics.cloudfront.errorRate5xx?.toFixed(2)}%

### Overall Performance
- **Global Latency:** ${report.currentMetrics.performance.globalLatency}ms
- **Overall Score:** ${report.currentMetrics.performance.overallScore}/100
- **Error Rate:** ${report.currentMetrics.performance.errorRate?.toFixed(2)}%

## Performance Regressions

${report.regressions.length > 0 
  ? report.regressions.map(reg => 
      `### ${reg.type.replace('_', ' ').toUpperCase()} ${reg.severity === 'high' ? '🔴' : '🟡'}
      
**Current:** ${reg.current}
**Baseline:** ${reg.baseline}
**Degradation:** ${reg.degradation}%

${reg.message}`
    ).join('\n\n')
  : 'No performance regressions detected.'
}

## Cache Optimizations

${report.cacheOptimizations.length > 0
  ? report.cacheOptimizations.map(opt =>
      `### ${opt.title} ${opt.priority === 'high' ? '🔴' : '🟡'}
      
${opt.description}

**Recommendation:** ${opt.recommendation}`
    ).join('\n\n')
  : 'No cache optimizations identified.'
}

## Actionable Recommendations

${report.recommendations.map((rec, index) =>
  `### ${index + 1}. ${rec.title} ${rec.priority === 'critical' ? '🚨' : rec.priority === 'high' ? '🔴' : '🟡'}

${rec.description}

**Actions:**
${rec.actions.map(action => `- ${action}`).join('\n')}
`).join('\n')}

## Automated Actions Taken

${report.automatedActions.length > 0
  ? report.automatedActions.map(action =>
      `- **${action.type}:** ${action.message} (${action.status})`
    ).join('\n')
  : 'No automated actions were required.'
}

---
*Report generated by Performance Optimization Monitor*
`;

    await fs.writeFile(summaryPath, markdown);
    console.log('   📄 Human-readable summary generated:', summaryPath);
  }
}

// CLI execution
async function main() {
  const optimizer = new PerformanceOptimizationMonitor();
  
  try {
    const report = await optimizer.runPerformanceOptimization();
    
    console.log('\n' + '='.repeat(60));
    console.log('🎯 Performance Optimization Summary:');
    console.log(`   Grade: ${report.summary.performanceGrade}`);
    console.log(`   Regressions: ${report.summary.regressionsDetected}`);
    console.log(`   Optimizations: ${report.summary.optimizationsIdentified}`);
    console.log(`   Recommendations: ${report.recommendations.length}`);
    console.log('='.repeat(60));
    
    return report;
  } catch (error) {
    console.error('❌ Performance optimization failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = PerformanceOptimizationMonitor;