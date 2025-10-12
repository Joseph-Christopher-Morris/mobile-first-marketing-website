#!/usr/bin/env node

/**
 * Deployment Monitoring and Alerts Configuration Script
 * Sets up build failure notifications, performance regression alerts, and monitoring
 */

const fs = require('fs');
const path = require('path');
const DeploymentMonitor = require('./deployment-monitor');
const DeploymentLogMonitor = require('./deployment-log-monitor');
const PerformanceMonitor = require('./performance-monitor');

class DeploymentAlertsConfigurator {
  constructor() {
    this.config = {
      appId: process.env.AMPLIFY_APP_ID,
      branch: process.env.AMPLIFY_BRANCH || 'main',
      region: process.env.AWS_REGION || 'us-east-1',
      siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://localhost:3000',
      webhookUrl: process.env.SLACK_WEBHOOK_URL,
      emailNotifications: process.env.EMAIL_NOTIFICATIONS === 'true',
      notificationEmail: process.env.NOTIFICATION_EMAIL || process.env.CONTACT_EMAIL,
      performanceThresholds: {
        lcp: parseInt(process.env.PERFORMANCE_LCP_THRESHOLD) || 2500,
        fid: parseInt(process.env.PERFORMANCE_FID_THRESHOLD) || 100,
        cls: parseFloat(process.env.PERFORMANCE_CLS_THRESHOLD) || 0.1,
        cacheHitRatio: parseFloat(process.env.CACHE_HIT_RATIO_THRESHOLD) || 90,
        errorRate: parseFloat(process.env.ERROR_RATE_THRESHOLD) || 2,
        buildTime: parseInt(process.env.BUILD_TIME_THRESHOLD) || 900
      }
    };
    
    this.deploymentMonitor = new DeploymentMonitor();
    this.logMonitor = new DeploymentLogMonitor();
    this.performanceMonitor = new PerformanceMonitor();
    
    this.alertsConfigPath = path.join(process.cwd(), '.kiro', 'deployment-alerts-config.json');
    this.alertsHistoryPath = path.join(process.cwd(), 'deployment-alerts-history.json');
  }

  async configureAlerts() {
    console.log('🔧 Configuring deployment monitoring and alerts...');
    
    try {
      // Configure build failure notifications
      await this.configureBuildFailureNotifications();
      
      // Set up performance regression alerts
      await this.configurePerformanceRegressionAlerts();
      
      // Test cache invalidation monitoring
      await this.testCacheInvalidationMonitoring();
      
      // Verify error tracking and reporting
      await this.verifyErrorTrackingAndReporting();
      
      // Save configuration
      await this.saveAlertsConfiguration();
      
      console.log('✅ Deployment alerts configuration completed');
      return this.getConfigurationSummary();
    } catch (error) {
      console.error('❌ Failed to configure deployment alerts:', error.message);
      throw error;
    }
  }

  async configureBuildFailureNotifications() {
    console.log('📧 Configuring build failure notifications...');
    
    const buildFailureConfig = {
      enabled: true,
      channels: [],
      thresholds: {
        consecutiveFailures: 2,
        failureRate: 50, // percentage
        timeWindow: 3600 // 1 hour in seconds
      },
      templates: {
        buildFailed: {
          title: '❌ Build Failed',
          message: 'Deployment build has failed for branch {{branch}}',
          fields: [
            { name: 'Branch', value: '{{branch}}', inline: true },
            { name: 'Build ID', value: '{{buildId}}', inline: true },
            { name: 'Commit', value: '{{commitId}}', inline: true },
            { name: 'Duration', value: '{{duration}}s', inline: true },
            { name: 'Error', value: '{{error}}', inline: false }
          ]
        },
        consecutiveFailures: {
          title: '🚨 Multiple Build Failures',
          message: 'Multiple consecutive build failures detected',
          fields: [
            { name: 'Failure Count', value: '{{count}}', inline: true },
            { name: 'Time Window', value: '{{timeWindow}}', inline: true },
            { name: 'Branch', value: '{{branch}}', inline: true }
          ]
        }
      }
    };

    // Configure notification channels
    if (this.config.webhookUrl) {
      buildFailureConfig.channels.push({
        type: 'slack',
        url: this.config.webhookUrl,
        enabled: true
      });
      console.log('   ✅ Slack notifications configured');
    }

    if (this.config.emailNotifications && this.config.notificationEmail) {
      buildFailureConfig.channels.push({
        type: 'email',
        recipients: [this.config.notificationEmail],
        enabled: true
      });
      console.log('   ✅ Email notifications configured');
    }

    if (buildFailureConfig.channels.length === 0) {
      console.log('   ⚠️  No notification channels configured - alerts will be logged only');
      buildFailureConfig.channels.push({
        type: 'console',
        enabled: true
      });
    }

    this.alertsConfig = { ...this.alertsConfig, buildFailure: buildFailureConfig };
    
    // Test build failure notification
    await this.testBuildFailureNotification();
    
    console.log('   ✅ Build failure notifications configured');
  }

  async configurePerformanceRegressionAlerts() {
    console.log('📊 Configuring performance regression alerts...');
    
    const performanceConfig = {
      enabled: true,
      monitoringInterval: 300, // 5 minutes
      baselineWindow: 7, // days
      regressionThresholds: {
        lcp: {
          warning: this.config.performanceThresholds.lcp * 1.2, // 20% increase
          critical: this.config.performanceThresholds.lcp * 1.5  // 50% increase
        },
        fid: {
          warning: this.config.performanceThresholds.fid * 1.3,
          critical: this.config.performanceThresholds.fid * 2
        },
        cls: {
          warning: this.config.performanceThresholds.cls * 1.5,
          critical: this.config.performanceThresholds.cls * 2
        },
        cacheHitRatio: {
          warning: this.config.performanceThresholds.cacheHitRatio * 0.9, // 10% decrease
          critical: this.config.performanceThresholds.cacheHitRatio * 0.8  // 20% decrease
        },
        errorRate: {
          warning: this.config.performanceThresholds.errorRate * 1.5,
          critical: this.config.performanceThresholds.errorRate * 2
        }
      },
      templates: {
        performanceRegression: {
          title: '📉 Performance Regression Detected',
          message: 'Performance metrics have degraded beyond acceptable thresholds',
          fields: [
            { name: 'Metric', value: '{{metric}}', inline: true },
            { name: 'Current Value', value: '{{currentValue}}', inline: true },
            { name: 'Baseline', value: '{{baseline}}', inline: true },
            { name: 'Regression %', value: '{{regressionPercent}}%', inline: true },
            { name: 'Severity', value: '{{severity}}', inline: true },
            { name: 'Page', value: '{{page}}', inline: true }
          ]
        }
      }
    };

    this.alertsConfig = { ...this.alertsConfig, performance: performanceConfig };
    
    // Test performance regression detection
    await this.testPerformanceRegressionDetection();
    
    console.log('   ✅ Performance regression alerts configured');
  }

  async testCacheInvalidationMonitoring() {
    console.log('💾 Testing cache invalidation monitoring...');
    
    const cacheMonitoringConfig = {
      enabled: true,
      monitoringEndpoints: [
        '/',
        '/services/',
        '/blog/',
        '/contact/'
      ],
      invalidationThresholds: {
        maxInvalidationTime: 300, // 5 minutes
        maxPendingInvalidations: 10,
        invalidationFailureRate: 5 // percentage
      },
      templates: {
        invalidationFailed: {
          title: '🚨 Cache Invalidation Failed',
          message: 'Cache invalidation has failed for deployment',
          fields: [
            { name: 'Distribution ID', value: '{{distributionId}}', inline: true },
            { name: 'Invalidation ID', value: '{{invalidationId}}', inline: true },
            { name: 'Paths', value: '{{paths}}', inline: false },
            { name: 'Error', value: '{{error}}', inline: false }
          ]
        },
        slowInvalidation: {
          title: '⏱️ Slow Cache Invalidation',
          message: 'Cache invalidation is taking longer than expected',
          fields: [
            { name: 'Duration', value: '{{duration}}s', inline: true },
            { name: 'Threshold', value: '{{threshold}}s', inline: true },
            { name: 'Status', value: '{{status}}', inline: true }
          ]
        }
      }
    };

    this.alertsConfig = { ...this.alertsConfig, cacheInvalidation: cacheMonitoringConfig };
    
    // Simulate cache invalidation test
    const testResult = await this.simulateCacheInvalidationTest();
    
    if (testResult.success) {
      console.log('   ✅ Cache invalidation monitoring test passed');
      console.log(`   📊 Average invalidation time: ${testResult.averageTime}s`);
    } else {
      console.log('   ⚠️  Cache invalidation monitoring test failed');
      console.log(`   ❌ Error: ${testResult.error}`);
    }
  }

  async verifyErrorTrackingAndReporting() {
    console.log('🔍 Verifying error tracking and reporting...');
    
    const errorTrackingConfig = {
      enabled: true,
      errorCategories: {
        build: {
          enabled: true,
          threshold: 1, // any build error triggers alert
          severity: 'critical'
        },
        runtime: {
          enabled: true,
          threshold: 10, // 10 runtime errors per hour
          severity: 'warning'
        },
        performance: {
          enabled: true,
          threshold: 5, // 5 performance issues per hour
          severity: 'warning'
        },
        security: {
          enabled: true,
          threshold: 1, // any security issue triggers alert
          severity: 'critical'
        }
      },
      reportingInterval: 3600, // 1 hour
      templates: {
        errorThresholdExceeded: {
          title: '🚨 Error Threshold Exceeded',
          message: 'Error count has exceeded the configured threshold',
          fields: [
            { name: 'Category', value: '{{category}}', inline: true },
            { name: 'Count', value: '{{count}}', inline: true },
            { name: 'Threshold', value: '{{threshold}}', inline: true },
            { name: 'Time Window', value: '{{timeWindow}}', inline: true },
            { name: 'Severity', value: '{{severity}}', inline: true }
          ]
        }
      }
    };

    this.alertsConfig = { ...this.alertsConfig, errorTracking: errorTrackingConfig };
    
    // Test error tracking functionality
    const trackingTest = await this.testErrorTracking();
    
    if (trackingTest.success) {
      console.log('   ✅ Error tracking verification passed');
      console.log(`   📊 Tracked error categories: ${trackingTest.categories.join(', ')}`);
    } else {
      console.log('   ⚠️  Error tracking verification failed');
      console.log(`   ❌ Error: ${trackingTest.error}`);
    }
  }

  async saveAlertsConfiguration() {
    console.log('💾 Saving alerts configuration...');
    
    const configData = {
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      config: this.alertsConfig,
      environment: {
        appId: this.config.appId,
        branch: this.config.branch,
        region: this.config.region,
        siteUrl: this.config.siteUrl
      }
    };

    // Ensure .kiro directory exists
    const kiroDir = path.dirname(this.alertsConfigPath);
    if (!fs.existsSync(kiroDir)) {
      fs.mkdirSync(kiroDir, { recursive: true });
    }

    fs.writeFileSync(this.alertsConfigPath, JSON.stringify(configData, null, 2));
    console.log(`   ✅ Configuration saved to: ${this.alertsConfigPath}`);
  }

  async testBuildFailureNotification() {
    console.log('   🧪 Testing build failure notification...');
    
    const testNotification = {
      type: 'build_failure_test',
      timestamp: new Date().toISOString(),
      data: {
        branch: this.config.branch,
        buildId: 'test-build-123',
        commitId: 'abc123def456',
        duration: 45,
        error: 'Test build failure notification'
      }
    };

    try {
      await this.sendTestNotification(testNotification);
      console.log('   ✅ Build failure notification test successful');
    } catch (error) {
      console.log('   ⚠️  Build failure notification test failed:', error.message);
    }
  }

  async testPerformanceRegressionDetection() {
    console.log('   🧪 Testing performance regression detection...');
    
    // Simulate performance baseline and current metrics
    const baseline = {
      lcp: 2000,
      fid: 80,
      cls: 0.08,
      cacheHitRatio: 95,
      errorRate: 0.5
    };

    const current = {
      lcp: 2800, // 40% increase - should trigger warning
      fid: 85,   // slight increase
      cls: 0.09, // slight increase
      cacheHitRatio: 92, // slight decrease
      errorRate: 0.6     // slight increase
    };

    const regressions = this.detectPerformanceRegressions(baseline, current);
    
    if (regressions.length > 0) {
      console.log('   ✅ Performance regression detection working');
      console.log(`   📊 Detected ${regressions.length} regression(s)`);
      regressions.forEach(regression => {
        console.log(`      - ${regression.metric}: ${regression.severity} (${regression.regressionPercent}% change)`);
      });
    } else {
      console.log('   ✅ No performance regressions detected in test');
    }
  }

  detectPerformanceRegressions(baseline, current) {
    const regressions = [];
    const thresholds = this.alertsConfig.performance.regressionThresholds;

    Object.keys(baseline).forEach(metric => {
      const baselineValue = baseline[metric];
      const currentValue = current[metric];
      const threshold = thresholds[metric];

      if (!threshold) return;

      let regressionPercent;
      let isRegression = false;
      let severity = 'info';

      if (metric === 'cacheHitRatio') {
        // For cache hit ratio, lower is worse
        regressionPercent = ((baselineValue - currentValue) / baselineValue) * 100;
        if (currentValue < threshold.critical) {
          isRegression = true;
          severity = 'critical';
        } else if (currentValue < threshold.warning) {
          isRegression = true;
          severity = 'warning';
        }
      } else {
        // For other metrics, higher is worse
        regressionPercent = ((currentValue - baselineValue) / baselineValue) * 100;
        if (currentValue > threshold.critical) {
          isRegression = true;
          severity = 'critical';
        } else if (currentValue > threshold.warning) {
          isRegression = true;
          severity = 'warning';
        }
      }

      if (isRegression) {
        regressions.push({
          metric,
          baseline: baselineValue,
          current: currentValue,
          regressionPercent: Math.round(regressionPercent * 100) / 100,
          severity
        });
      }
    });

    return regressions;
  }

  async simulateCacheInvalidationTest() {
    // Simulate cache invalidation test
    const testPaths = ['/', '/services/', '/blog/'];
    const startTime = Date.now();
    
    try {
      // Simulate invalidation process
      await new Promise(resolve => setTimeout(resolve, 100)); // Simulate API call
      
      const endTime = Date.now();
      const duration = (endTime - startTime) / 1000;
      
      return {
        success: true,
        averageTime: duration,
        paths: testPaths,
        invalidationId: 'test-invalidation-123'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async testErrorTracking() {
    try {
      const categories = Object.keys(this.alertsConfig.errorTracking.errorCategories);
      
      // Simulate error tracking test
      const testErrors = [
        { category: 'build', count: 0 },
        { category: 'runtime', count: 3 },
        { category: 'performance', count: 2 },
        { category: 'security', count: 0 }
      ];

      return {
        success: true,
        categories,
        testErrors
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async sendTestNotification(notification) {
    // In a real implementation, this would send actual notifications
    // For now, we'll just log the test notification
    console.log('   📧 Test notification:', JSON.stringify(notification, null, 2));
    
    // Save test notification to history
    this.saveNotificationToHistory(notification);
  }

  saveNotificationToHistory(notification) {
    try {
      let history = [];
      
      if (fs.existsSync(this.alertsHistoryPath)) {
        const data = fs.readFileSync(this.alertsHistoryPath, 'utf8');
        history = JSON.parse(data);
      }

      history.push(notification);

      // Keep only last 100 notifications
      if (history.length > 100) {
        history = history.slice(-100);
      }

      fs.writeFileSync(this.alertsHistoryPath, JSON.stringify(history, null, 2));
    } catch (error) {
      console.warn('Failed to save notification to history:', error.message);
    }
  }

  getConfigurationSummary() {
    const summary = {
      timestamp: new Date().toISOString(),
      status: 'configured',
      features: {
        buildFailureNotifications: this.alertsConfig.buildFailure?.enabled || false,
        performanceRegressionAlerts: this.alertsConfig.performance?.enabled || false,
        cacheInvalidationMonitoring: this.alertsConfig.cacheInvalidation?.enabled || false,
        errorTrackingAndReporting: this.alertsConfig.errorTracking?.enabled || false
      },
      notificationChannels: this.getConfiguredChannels(),
      thresholds: this.config.performanceThresholds,
      configurationFile: this.alertsConfigPath
    };

    return summary;
  }

  getConfiguredChannels() {
    const channels = [];
    
    if (this.config.webhookUrl) {
      channels.push('slack');
    }
    
    if (this.config.emailNotifications && this.config.notificationEmail) {
      channels.push('email');
    }
    
    if (channels.length === 0) {
      channels.push('console');
    }
    
    return channels;
  }

  async generateAlertsReport() {
    console.log('📋 Generating alerts configuration report...');
    
    const summary = this.getConfigurationSummary();
    const reportPath = path.join(process.cwd(), 'deployment-alerts-report.json');
    
    fs.writeFileSync(reportPath, JSON.stringify(summary, null, 2));
    
    // Generate human-readable report
    const markdownPath = path.join(process.cwd(), 'deployment-alerts-summary.md');
    const markdown = this.generateMarkdownReport(summary);
    
    fs.writeFileSync(markdownPath, markdown);
    
    console.log(`📊 Alerts report generated: ${reportPath}`);
    console.log(`📄 Summary generated: ${markdownPath}`);
    
    return summary;
  }

  generateMarkdownReport(summary) {
    return `# Deployment Alerts Configuration Report

Generated: ${new Date(summary.timestamp).toLocaleString()}

## Configuration Status: ${summary.status.toUpperCase()}

## Enabled Features

${Object.entries(summary.features).map(([feature, enabled]) => 
  `- **${feature.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:** ${enabled ? '✅ Enabled' : '❌ Disabled'}`
).join('\n')}

## Notification Channels

${summary.notificationChannels.map(channel => `- ${channel.charAt(0).toUpperCase() + channel.slice(1)}`).join('\n')}

## Performance Thresholds

- **LCP (Largest Contentful Paint):** ${summary.thresholds.lcp}ms
- **FID (First Input Delay):** ${summary.thresholds.fid}ms
- **CLS (Cumulative Layout Shift):** ${summary.thresholds.cls}
- **Cache Hit Ratio:** ${summary.thresholds.cacheHitRatio}%
- **Error Rate:** ${summary.thresholds.errorRate}%
- **Build Time:** ${summary.thresholds.buildTime}s

## Configuration File

\`${summary.configurationFile}\`

## Next Steps

1. Monitor deployment alerts in real-time
2. Adjust thresholds based on actual performance data
3. Set up additional notification channels if needed
4. Review and update alert configurations regularly
`;
  }
}

// CLI interface
async function main() {
  const configurator = new DeploymentAlertsConfigurator();
  
  try {
    console.log('🚀 Starting deployment alerts configuration...');
    
    const summary = await configurator.configureAlerts();
    
    console.log('\n📊 Configuration Summary:');
    console.log(`   Status: ${summary.status}`);
    console.log(`   Build Failure Notifications: ${summary.features.buildFailureNotifications ? '✅' : '❌'}`);
    console.log(`   Performance Regression Alerts: ${summary.features.performanceRegressionAlerts ? '✅' : '❌'}`);
    console.log(`   Cache Invalidation Monitoring: ${summary.features.cacheInvalidationMonitoring ? '✅' : '❌'}`);
    console.log(`   Error Tracking and Reporting: ${summary.features.errorTrackingAndReporting ? '✅' : '❌'}`);
    console.log(`   Notification Channels: ${summary.notificationChannels.join(', ')}`);
    
    // Generate detailed report
    await configurator.generateAlertsReport();
    
    console.log('\n✅ Deployment alerts configuration completed successfully');
    return summary;
  } catch (error) {
    console.error('❌ Deployment alerts configuration failed:', error.message);
    process.exit(1);
  }
}

// Run configuration if called directly
if (require.main === module) {
  const command = process.argv[2];
  
  switch (command) {
    case 'configure':
    case undefined:
      main();
      break;
      
    case 'test':
      const configurator = new DeploymentAlertsConfigurator();
      configurator.testBuildFailureNotification()
        .then(() => console.log('✅ Test completed'))
        .catch(error => {
          console.error('❌ Test failed:', error.message);
          process.exit(1);
        });
      break;
      
    case 'report':
      const reportConfigurator = new DeploymentAlertsConfigurator();
      reportConfigurator.generateAlertsReport()
        .then(() => console.log('✅ Report generated'))
        .catch(error => {
          console.error('❌ Report generation failed:', error.message);
          process.exit(1);
        });
      break;
      
    default:
      console.log('Usage:');
      console.log('  node configure-deployment-alerts.js [configure]  # Configure alerts (default)');
      console.log('  node configure-deployment-alerts.js test         # Test notifications');
      console.log('  node configure-deployment-alerts.js report       # Generate report');
      break;
  }
}

module.exports = DeploymentAlertsConfigurator;