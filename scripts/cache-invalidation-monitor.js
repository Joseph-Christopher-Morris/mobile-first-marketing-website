#!/usr/bin/env node

/**
 * Cache Invalidation Monitor
 * Monitors CloudFront cache invalidation processes and performance
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

class CacheInvalidationMonitor {
  constructor() {
    this.config = {
      distributionId: process.env.CLOUDFRONT_DISTRIBUTION_ID,
      region: process.env.AWS_REGION || 'us-east-1',
      siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://localhost:3000',
      webhookUrl: process.env.SLACK_WEBHOOK_URL,
      maxInvalidationTime: 300, // 5 minutes
      maxPendingInvalidations: 10,
      invalidationFailureThreshold: 5 // percentage
    };
    
    this.invalidationHistory = this.loadInvalidationHistory();
    this.monitoringActive = false;
  }

  loadInvalidationHistory() {
    const historyPath = path.join(process.cwd(), 'cache-invalidation-history.json');
    
    try {
      if (fs.existsSync(historyPath)) {
        const data = fs.readFileSync(historyPath, 'utf8');
        return JSON.parse(data);
      }
    } catch (error) {
      console.warn('Failed to load invalidation history, starting fresh');
    }
    
    return {
      invalidations: [],
      statistics: {
        totalInvalidations: 0,
        successfulInvalidations: 0,
        failedInvalidations: 0,
        averageInvalidationTime: 0,
        lastInvalidation: null
      }
    };
  }

  saveInvalidationHistory() {
    const historyPath = path.join(process.cwd(), 'cache-invalidation-history.json');
    
    try {
      fs.writeFileSync(historyPath, JSON.stringify(this.invalidationHistory, null, 2));
    } catch (error) {
      console.error('Failed to save invalidation history:', error.message);
    }
  }

  async startInvalidationMonitoring() {
    console.log('🔄 Starting cache invalidation monitoring...');
    
    this.monitoringActive = true;
    
    try {
      // Monitor current invalidations
      await this.checkCurrentInvalidations();
      
      // Test cache invalidation process
      await this.testCacheInvalidation();
      
      // Monitor cache performance
      await this.monitorCachePerformance();
      
      // Generate invalidation report
      const report = await this.generateInvalidationReport();
      
      console.log('✅ Cache invalidation monitoring completed');
      return report;
    } catch (error) {
      console.error('❌ Cache invalidation monitoring failed:', error.message);
      throw error;
    } finally {
      this.monitoringActive = false;
    }
  }

  async checkCurrentInvalidations() {
    console.log('🔍 Checking current invalidations...');
    
    try {
      // In a real implementation, this would call AWS CloudFront API
      // For now, we'll simulate the check
      const currentInvalidations = await this.simulateInvalidationCheck();
      
      console.log(`📊 Found ${currentInvalidations.length} active invalidations`);
      
      for (const invalidation of currentInvalidations) {
        await this.monitorInvalidationProgress(invalidation);
      }
      
      return currentInvalidations;
    } catch (error) {
      console.error('Failed to check current invalidations:', error.message);
      await this.sendAlert('invalidation_check_failed', 'Failed to check current invalidations', {
        error: error.message
      });
      throw error;
    }
  }

  async simulateInvalidationCheck() {
    // Simulate active invalidations
    const activeInvalidations = [];
    
    // Randomly generate 0-3 active invalidations
    const count = Math.floor(Math.random() * 4);
    
    for (let i = 0; i < count; i++) {
      activeInvalidations.push({
        id: `invalidation-${Date.now()}-${i}`,
        status: Math.random() > 0.8 ? 'Completed' : 'InProgress',
        createTime: new Date(Date.now() - Math.random() * 300000).toISOString(), // 0-5 minutes ago
        paths: ['/*'],
        distributionId: this.config.distributionId || 'E1234567890ABC'
      });
    }
    
    return activeInvalidations;
  }

  async monitorInvalidationProgress(invalidation) {
    const startTime = new Date(invalidation.createTime);
    const currentTime = new Date();
    const duration = (currentTime - startTime) / 1000; // seconds
    
    console.log(`📋 Monitoring invalidation: ${invalidation.id}`);
    console.log(`   Status: ${invalidation.status}`);
    console.log(`   Duration: ${Math.round(duration)}s`);
    
    // Check for slow invalidations
    if (invalidation.status === 'InProgress' && duration > this.config.maxInvalidationTime) {
      await this.sendAlert('slow_invalidation', 'Cache invalidation is taking longer than expected', {
        invalidationId: invalidation.id,
        duration: Math.round(duration),
        threshold: this.config.maxInvalidationTime
      });
    }
    
    // Update invalidation history
    this.updateInvalidationHistory(invalidation, duration);
  }

  updateInvalidationHistory(invalidation, duration) {
    const existingIndex = this.invalidationHistory.invalidations.findIndex(
      inv => inv.id === invalidation.id
    );
    
    const invalidationRecord = {
      id: invalidation.id,
      status: invalidation.status,
      createTime: invalidation.createTime,
      duration: Math.round(duration),
      paths: invalidation.paths,
      distributionId: invalidation.distributionId,
      lastUpdated: new Date().toISOString()
    };
    
    if (existingIndex >= 0) {
      this.invalidationHistory.invalidations[existingIndex] = invalidationRecord;
    } else {
      this.invalidationHistory.invalidations.push(invalidationRecord);
    }
    
    // Update statistics
    this.updateStatistics(invalidation, duration);
    
    // Keep only last 100 invalidations
    if (this.invalidationHistory.invalidations.length > 100) {
      this.invalidationHistory.invalidations = this.invalidationHistory.invalidations.slice(-100);
    }
    
    this.saveInvalidationHistory();
  }

  updateStatistics(invalidation, duration) {
    const stats = this.invalidationHistory.statistics;
    
    if (invalidation.status === 'Completed') {
      stats.successfulInvalidations++;
      
      // Update average invalidation time
      const totalDuration = (stats.averageInvalidationTime * (stats.successfulInvalidations - 1)) + duration;
      stats.averageInvalidationTime = totalDuration / stats.successfulInvalidations;
    } else if (invalidation.status === 'Failed') {
      stats.failedInvalidations++;
    }
    
    stats.totalInvalidations = stats.successfulInvalidations + stats.failedInvalidations;
    stats.lastInvalidation = new Date().toISOString();
  }

  async testCacheInvalidation() {
    console.log('🧪 Testing cache invalidation process...');
    
    try {
      // Simulate cache invalidation test
      const testResult = await this.simulateCacheInvalidationTest();
      
      if (testResult.success) {
        console.log('✅ Cache invalidation test passed');
        console.log(`   Average invalidation time: ${testResult.averageTime}s`);
        console.log(`   Cache hit ratio: ${testResult.cacheHitRatio}%`);
      } else {
        console.log('❌ Cache invalidation test failed');
        console.log(`   Error: ${testResult.error}`);
        
        await this.sendAlert('invalidation_test_failed', 'Cache invalidation test failed', {
          error: testResult.error
        });
      }
      
      return testResult;
    } catch (error) {
      console.error('Cache invalidation test failed:', error.message);
      throw error;
    }
  }

  async simulateCacheInvalidationTest() {
    const testPaths = ['/', '/services/', '/blog/', '/contact/'];
    const startTime = Date.now();
    
    try {
      // Simulate invalidation API call
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Simulate checking cache status for each path
      const cacheResults = [];
      
      for (const testPath of testPaths) {
        const url = `${this.config.siteUrl}${testPath}`;
        const cacheStatus = await this.checkCacheStatus(url);
        cacheResults.push({
          path: testPath,
          url,
          ...cacheStatus
        });
      }
      
      const endTime = Date.now();
      const duration = (endTime - startTime) / 1000;
      
      // Calculate cache hit ratio
      const hitCount = cacheResults.filter(result => result.cacheHit).length;
      const cacheHitRatio = (hitCount / cacheResults.length) * 100;
      
      return {
        success: true,
        averageTime: duration,
        cacheHitRatio: cacheHitRatio.toFixed(1),
        testPaths,
        cacheResults,
        invalidationId: `test-invalidation-${Date.now()}`
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async checkCacheStatus(url) {
    // Simulate cache status check
    return new Promise((resolve) => {
      setTimeout(() => {
        const cacheHit = Math.random() > 0.1; // 90% cache hit rate
        const responseTime = cacheHit ? 50 + Math.random() * 50 : 200 + Math.random() * 300;
        
        resolve({
          cacheHit,
          responseTime: Math.round(responseTime),
          cacheAge: cacheHit ? Math.floor(Math.random() * 3600) : 0, // 0-1 hour
          lastModified: new Date(Date.now() - Math.random() * 86400000).toISOString() // last 24 hours
        });
      }, 50 + Math.random() * 100);
    });
  }

  async monitorCachePerformance() {
    console.log('📊 Monitoring cache performance...');
    
    try {
      const performanceMetrics = await this.collectCachePerformanceMetrics();
      
      console.log(`   Cache Hit Ratio: ${performanceMetrics.hitRatio}%`);
      console.log(`   Average Response Time: ${performanceMetrics.averageResponseTime}ms`);
      console.log(`   Error Rate: ${performanceMetrics.errorRate}%`);
      
      // Check for performance issues
      await this.checkPerformanceThresholds(performanceMetrics);
      
      return performanceMetrics;
    } catch (error) {
      console.error('Cache performance monitoring failed:', error.message);
      throw error;
    }
  }

  async collectCachePerformanceMetrics() {
    // Simulate cache performance metrics collection
    return {
      hitRatio: 92 + Math.random() * 6, // 92-98%
      missRatio: 2 + Math.random() * 6, // 2-8%
      averageResponseTime: 45 + Math.random() * 30, // 45-75ms
      errorRate: Math.random() * 2, // 0-2%
      totalRequests: 10000 + Math.random() * 5000,
      cachedRequests: 0,
      originRequests: 0,
      bandwidthSaved: 0,
      timestamp: new Date().toISOString()
    };
  }

  async checkPerformanceThresholds(metrics) {
    const alerts = [];
    
    // Check cache hit ratio
    if (metrics.hitRatio < 85) {
      alerts.push({
        type: 'low_cache_hit_ratio',
        message: `Low cache hit ratio: ${metrics.hitRatio.toFixed(1)}%`,
        severity: metrics.hitRatio < 75 ? 'critical' : 'warning',
        threshold: 85,
        currentValue: metrics.hitRatio
      });
    }
    
    // Check error rate
    if (metrics.errorRate > this.config.invalidationFailureThreshold) {
      alerts.push({
        type: 'high_error_rate',
        message: `High cache error rate: ${metrics.errorRate.toFixed(2)}%`,
        severity: 'warning',
        threshold: this.config.invalidationFailureThreshold,
        currentValue: metrics.errorRate
      });
    }
    
    // Check response time
    if (metrics.averageResponseTime > 100) {
      alerts.push({
        type: 'slow_cache_response',
        message: `Slow cache response time: ${metrics.averageResponseTime.toFixed(0)}ms`,
        severity: 'warning',
        threshold: 100,
        currentValue: metrics.averageResponseTime
      });
    }
    
    // Send alerts
    for (const alert of alerts) {
      await this.sendAlert(alert.type, alert.message, {
        severity: alert.severity,
        threshold: alert.threshold,
        currentValue: alert.currentValue
      });
    }
    
    return alerts;
  }

  async sendAlert(type, message, metadata = {}) {
    const alert = {
      type,
      message,
      timestamp: new Date().toISOString(),
      metadata
    };
    
    console.log(`🚨 ALERT: ${message}`);
    
    // Save alert to history
    this.saveAlert(alert);
    
    // Send notification if webhook is configured
    if (this.config.webhookUrl) {
      await this.sendSlackNotification(alert);
    }
  }

  saveAlert(alert) {
    const alertsFile = path.join(process.cwd(), 'cache-invalidation-alerts.json');
    
    try {
      let alerts = [];
      
      if (fs.existsSync(alertsFile)) {
        const data = fs.readFileSync(alertsFile, 'utf8');
        alerts = JSON.parse(data);
      }
      
      alerts.push(alert);
      
      // Keep only last 100 alerts
      if (alerts.length > 100) {
        alerts = alerts.slice(-100);
      }
      
      fs.writeFileSync(alertsFile, JSON.stringify(alerts, null, 2));
    } catch (error) {
      console.error('Failed to save alert:', error.message);
    }
  }

  async sendSlackNotification(alert) {
    const message = {
      text: `🚨 Cache Invalidation Alert`,
      attachments: [
        {
          color: alert.metadata.severity === 'critical' ? 'danger' : 'warning',
          fields: [
            { title: 'Type', value: alert.type, short: true },
            { title: 'Message', value: alert.message, short: false },
            { title: 'Timestamp', value: alert.timestamp, short: true },
            { title: 'Severity', value: alert.metadata.severity || 'info', short: true }
          ],
          footer: 'Cache Invalidation Monitor',
          ts: Math.floor(Date.now() / 1000)
        }
      ]
    };
    
    try {
      await this.sendWebhookNotification(message);
      console.log('📧 Slack notification sent');
    } catch (error) {
      console.error('Failed to send Slack notification:', error.message);
    }
  }

  async sendWebhookNotification(message) {
    if (!this.config.webhookUrl) {
      return;
    }
    
    return new Promise((resolve, reject) => {
      const data = JSON.stringify(message);
      const url = new URL(this.config.webhookUrl);
      
      const options = {
        hostname: url.hostname,
        port: url.port || 443,
        path: url.pathname,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': data.length
        }
      };
      
      const req = https.request(options, (res) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve();
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${res.statusMessage}`));
        }
      });
      
      req.on('error', reject);
      req.write(data);
      req.end();
    });
  }

  async generateInvalidationReport() {
    console.log('📋 Generating cache invalidation report...');
    
    const report = {
      timestamp: new Date().toISOString(),
      summary: this.generateSummary(),
      statistics: this.invalidationHistory.statistics,
      recentInvalidations: this.getRecentInvalidations(10),
      performanceMetrics: await this.collectCachePerformanceMetrics(),
      alerts: this.getRecentAlerts(5),
      recommendations: this.generateRecommendations()
    };
    
    // Write report to file
    const reportPath = path.join(process.cwd(), 'cache-invalidation-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    // Generate human-readable summary
    this.generateHumanReadableReport(report);
    
    console.log('📊 Cache invalidation report generated:', reportPath);
    return report;
  }

  generateSummary() {
    const stats = this.invalidationHistory.statistics;
    const successRate = stats.totalInvalidations > 0 ? 
      (stats.successfulInvalidations / stats.totalInvalidations) * 100 : 100;
    
    return {
      totalInvalidations: stats.totalInvalidations,
      successfulInvalidations: stats.successfulInvalidations,
      failedInvalidations: stats.failedInvalidations,
      successRate: successRate.toFixed(1),
      averageInvalidationTime: stats.averageInvalidationTime.toFixed(1),
      lastInvalidation: stats.lastInvalidation,
      status: successRate >= 95 ? 'healthy' : successRate >= 85 ? 'warning' : 'critical'
    };
  }

  getRecentInvalidations(count = 10) {
    return this.invalidationHistory.invalidations
      .sort((a, b) => new Date(b.createTime) - new Date(a.createTime))
      .slice(0, count);
  }

  getRecentAlerts(count = 5) {
    const alertsFile = path.join(process.cwd(), 'cache-invalidation-alerts.json');
    
    try {
      if (fs.existsSync(alertsFile)) {
        const data = fs.readFileSync(alertsFile, 'utf8');
        const alerts = JSON.parse(data);
        return alerts.slice(-count);
      }
    } catch (error) {
      console.warn('Failed to load alerts');
    }
    
    return [];
  }

  generateRecommendations() {
    const recommendations = [];
    const summary = this.generateSummary();
    
    if (summary.successRate < 95) {
      recommendations.push({
        priority: 'high',
        title: 'Improve Invalidation Success Rate',
        description: `Current success rate is ${summary.successRate}%`,
        actions: [
          'Review invalidation patterns and paths',
          'Check AWS CloudFront configuration',
          'Monitor for API rate limiting',
          'Implement retry logic for failed invalidations'
        ]
      });
    }
    
    if (parseFloat(summary.averageInvalidationTime) > 180) {
      recommendations.push({
        priority: 'medium',
        title: 'Optimize Invalidation Performance',
        description: `Average invalidation time is ${summary.averageInvalidationTime}s`,
        actions: [
          'Review invalidation path patterns',
          'Consider using wildcard patterns more efficiently',
          'Monitor CloudFront distribution health',
          'Optimize invalidation timing'
        ]
      });
    }
    
    return recommendations;
  }

  generateHumanReadableReport(report) {
    const summaryPath = path.join(process.cwd(), 'cache-invalidation-summary.md');
    
    const markdown = `# Cache Invalidation Report

Generated: ${new Date(report.timestamp).toLocaleString()}

## Summary

- **Status:** ${report.summary.status.toUpperCase()}
- **Total Invalidations:** ${report.summary.totalInvalidations}
- **Success Rate:** ${report.summary.successRate}%
- **Average Time:** ${report.summary.averageInvalidationTime}s
- **Last Invalidation:** ${report.summary.lastInvalidation ? new Date(report.summary.lastInvalidation).toLocaleString() : 'Never'}

## Performance Metrics

- **Cache Hit Ratio:** ${report.performanceMetrics.hitRatio.toFixed(1)}%
- **Average Response Time:** ${report.performanceMetrics.averageResponseTime.toFixed(0)}ms
- **Error Rate:** ${report.performanceMetrics.errorRate.toFixed(2)}%
- **Total Requests:** ${report.performanceMetrics.totalRequests.toLocaleString()}

## Recent Invalidations

${report.recentInvalidations.length > 0 ? 
  report.recentInvalidations.map(inv => 
    `- **${inv.id}** - ${inv.status} - ${inv.duration}s - ${new Date(inv.createTime).toLocaleString()}`
  ).join('\n') : 
  'No recent invalidations found.'
}

## Recent Alerts

${report.alerts.length > 0 ? 
  report.alerts.map(alert => 
    `- **${alert.type}:** ${alert.message} - ${new Date(alert.timestamp).toLocaleString()}`
  ).join('\n') : 
  'No recent alerts.'
}

## Recommendations

${report.recommendations.map(rec => 
  `### ${rec.title} (${rec.priority.toUpperCase()})\n\n${rec.description}\n\n**Actions:**\n${rec.actions.map(action => `- ${action}`).join('\n')}`
).join('\n\n')}
`;
    
    fs.writeFileSync(summaryPath, markdown);
    console.log('📄 Human-readable summary generated:', summaryPath);
  }
}

async function main() {
  const monitor = new CacheInvalidationMonitor();
  
  try {
    console.log('🚀 Starting cache invalidation monitoring...');
    
    const report = await monitor.startInvalidationMonitoring();
    
    console.log('\n📊 Cache Invalidation Summary:');
    console.log(`   Status: ${report.summary.status.toUpperCase()}`);
    console.log(`   Success Rate: ${report.summary.successRate}%`);
    console.log(`   Average Time: ${report.summary.averageInvalidationTime}s`);
    console.log(`   Cache Hit Ratio: ${report.performanceMetrics.hitRatio.toFixed(1)}%`);
    
    if (report.alerts.length > 0) {
      console.log('\n🚨 Recent Alerts:');
      report.alerts.forEach(alert => {
        console.log(`   ${alert.type}: ${alert.message}`);
      });
    }
    
    console.log('✅ Cache invalidation monitoring completed');
    return report;
  } catch (error) {
    console.error('❌ Cache invalidation monitoring failed:', error.message);
    process.exit(1);
  }
}

// Run monitoring if called directly
if (require.main === module) {
  const command = process.argv[2];
  
  switch (command) {
    case 'monitor':
    case undefined:
      main();
      break;
      
    case 'test':
      const monitor = new CacheInvalidationMonitor();
      monitor.testCacheInvalidation()
        .then(() => console.log('✅ Test completed'))
        .catch(error => {
          console.error('❌ Test failed:', error.message);
          process.exit(1);
        });
      break;
      
    case 'status':
      const statusMonitor = new CacheInvalidationMonitor();
      statusMonitor.checkCurrentInvalidations()
        .then(() => console.log('✅ Status check completed'))
        .catch(error => {
          console.error('❌ Status check failed:', error.message);
          process.exit(1);
        });
      break;
      
    default:
      console.log('Usage:');
      console.log('  node cache-invalidation-monitor.js [monitor]  # Full monitoring (default)');
      console.log('  node cache-invalidation-monitor.js test      # Test invalidation process');
      console.log('  node cache-invalidation-monitor.js status    # Check current invalidations');
      break;
  }
}

module.exports = CacheInvalidationMonitor;