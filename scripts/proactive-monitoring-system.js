#!/usr/bin/env node

/**
 * Proactive Monitoring System
 * Detects and alerts on issues before they become problems
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class ProactiveMonitoringSystem {
  constructor() {
    this.config = {
      checkInterval: 300000, // 5 minutes
      alertThresholds: {
        errorRate: 0.05, // 5%
        responseTime: 3000, // 3 seconds
        availability: 0.99 // 99%
      },
      endpoints: [
        'https://d15sc9fc739ev2.cloudfront.net',
        'https://d15sc9fc739ev2.cloudfront.net/services',
        'https://d15sc9fc739ev2.cloudfront.net/blog'
      ]
    };

    this.metrics = {
      timestamp: new Date().toISOString(),
      availability: {},
      performance: {},
      errors: [],
      alerts: []
    };
  }

  log(message, type = 'info') {
    const colors = {
      info: '\x1b[36m',
      success: '\x1b[32m',
      warning: '\x1b[33m',
      error: '\x1b[31m',
      alert: '\x1b[35m',
      reset: '\x1b[0m'
    };
    const timestamp = new Date().toISOString().substr(11, 8);
    console.log(`${colors[type]}[${timestamp}] ${message}${colors.reset}`);
  }

  async monitorWebsiteAvailability() {
    this.log('\n🌐 Monitoring Website Availability...', 'info');

    for (const endpoint of this.config.endpoints) {
      try {
        const startTime = Date.now();
        
        // Test endpoint availability and response time
        const result = await this.testEndpoint(endpoint);
        const responseTime = Date.now() - startTime;

        this.metrics.availability[endpoint] = {
          status: result.status,
          responseTime,
          timestamp: new Date().toISOString(),
          statusCode: result.statusCode
        };

        if (result.status === 'up') {
          this.log(`✓ ${endpoint} - ${responseTime}ms`, 'success');
        } else {
          this.log(`✗ ${endpoint} - ${result.error}`, 'error');
          this.createAlert('availability', `${endpoint} is down: ${result.error}`);
        }

        // Check response time threshold
        if (responseTime > this.config.alertThresholds.responseTime) {
          this.createAlert('performance', `${endpoint} slow response: ${responseTime}ms`);
        }

      } catch (error) {
        this.log(`✗ ${endpoint} - ${error.message}`, 'error');
        this.metrics.availability[endpoint] = {
          status: 'error',
          error: error.message,
          timestamp: new Date().toISOString()
        };
      }
    }
  }

  async testEndpoint(url) {
    try {
      // Use Windows-compatible curl command
      const nullDevice = process.platform === 'win32' ? 'nul' : '/dev/null';
      const curlCmd = process.platform === 'win32' ? 'curl.exe' : 'curl';
      const command = `${curlCmd} -s -o ${nullDevice} -w "%{http_code},%{time_total}" --max-time 10 "${url}"`;
      const output = execSync(command, { encoding: 'utf8', timeout: 15000 });
      
      const [statusCode, timeTotal] = output.trim().split(',');
      const responseTime = Math.round(parseFloat(timeTotal) * 1000);

      return {
        status: statusCode.startsWith('2') ? 'up' : 'down',
        statusCode: parseInt(statusCode),
        responseTime
      };
    } catch (error) {
      return {
        status: 'error',
        error: error.message
      };
    }
  }

  async monitorCoreWebVitals() {
    this.log('\n⚡ Monitoring Core Web Vitals...', 'info');

    try {
      // Check if Lighthouse CI is available
      if (fs.existsSync('.lighthouserc.js')) {
        const lighthouseResult = await this.runLighthouseCheck();
        this.metrics.performance.lighthouse = lighthouseResult;
      }

      // Monitor performance budget
      if (fs.existsSync('budgets.json')) {
        const budgetResult = await this.checkPerformanceBudget();
        this.metrics.performance.budget = budgetResult;
      }

      // Check Core Web Vitals configuration
      const coreWebVitalsConfig = 'config/core-web-vitals-config.json';
      if (fs.existsSync(coreWebVitalsConfig)) {
        const config = JSON.parse(fs.readFileSync(coreWebVitalsConfig, 'utf8'));
        this.metrics.performance.config = config;
        this.log('✓ Core Web Vitals monitoring configured', 'success');
      } else {
        this.createAlert('configuration', 'Core Web Vitals monitoring not configured');
      }

    } catch (error) {
      this.log(`✗ Core Web Vitals monitoring failed: ${error.message}`, 'error');
      this.metrics.errors.push({
        type: 'performance-monitoring',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  async runLighthouseCheck() {
    try {
      // Run a quick Lighthouse check on the main page
      const command = 'npx lighthouse https://d15sc9fc739ev2.cloudfront.net --only-categories=performance --output=json --quiet';
      const output = execSync(command, { encoding: 'utf8', timeout: 60000 });
      
      const result = JSON.parse(output);
      const performanceScore = result.lhr.categories.performance.score * 100;
      
      this.log(`Lighthouse Performance Score: ${performanceScore}`, 
        performanceScore >= 90 ? 'success' : performanceScore >= 70 ? 'warning' : 'error');

      if (performanceScore < 70) {
        this.createAlert('performance', `Lighthouse performance score dropped to ${performanceScore}`);
      }

      return {
        score: performanceScore,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      this.log('⚠️  Lighthouse check failed (may not be available)', 'warning');
      return { error: error.message };
    }
  }

  async checkPerformanceBudget() {
    try {
      const budget = JSON.parse(fs.readFileSync('budgets.json', 'utf8'));
      // This would typically integrate with your performance monitoring
      // For now, we'll just validate the budget configuration exists
      
      this.log('✓ Performance budget configuration valid', 'success');
      return {
        status: 'configured',
        budgets: budget.budget?.length || 0
      };
    } catch (error) {
      this.createAlert('configuration', 'Performance budget configuration invalid');
      return { error: error.message };
    }
  }

  async monitorAnalytics() {
    this.log('\n📊 Monitoring Analytics...', 'info');

    try {
      // Check GA4 implementation
      const ga4Status = await this.checkGA4Status();
      this.metrics.analytics = { ga4: ga4Status };

      // Check Clarity implementation
      const clarityStatus = await this.checkClarityStatus();
      this.metrics.analytics.clarity = clarityStatus;

      // Validate analytics are loading on the live site
      await this.validateAnalyticsOnLiveSite();

    } catch (error) {
      this.log(`✗ Analytics monitoring failed: ${error.message}`, 'error');
      this.metrics.errors.push({
        type: 'analytics-monitoring',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  async checkGA4Status() {
    const layoutPath = 'src/app/layout.tsx';
    if (fs.existsSync(layoutPath)) {
      const content = fs.readFileSync(layoutPath, 'utf8');
      const hasGA4 = content.includes('G-QJXSCJ0L43');
      
      if (hasGA4) {
        this.log('✓ GA4 configuration found', 'success');
        return { status: 'configured', trackingId: 'G-QJXSCJ0L43' };
      } else {
        this.createAlert('analytics', 'GA4 tracking code not found in layout');
        return { status: 'missing' };
      }
    }
    return { status: 'error', error: 'Layout file not found' };
  }

  async checkClarityStatus() {
    const layoutPath = 'src/app/layout.tsx';
    if (fs.existsSync(layoutPath)) {
      const content = fs.readFileSync(layoutPath, 'utf8');
      const hasClarity = content.includes('o5ggbmm8wd') || content.includes('clarity.ms');
      
      if (hasClarity) {
        this.log('✓ Clarity configuration found', 'success');
        return { status: 'configured', projectId: 'o5ggbmm8wd' };
      } else {
        this.createAlert('analytics', 'Clarity tracking code not found in layout');
        return { status: 'missing' };
      }
    }
    return { status: 'error', error: 'Layout file not found' };
  }

  async validateAnalyticsOnLiveSite() {
    try {
      const url = 'https://d15sc9fc739ev2.cloudfront.net';
      
      // Check if GA4 scripts are present in the live HTML
      const ga4Check = `curl -s "${url}" | grep -i "googletagmanager\\|G-QJXSCJ0L43"`;
      try {
        execSync(ga4Check, { stdio: 'pipe' });
        this.log('✓ GA4 scripts detected on live site', 'success');
      } catch (error) {
        this.createAlert('analytics', 'GA4 scripts not detected on live site');
      }

      // Check if Clarity scripts are present
      const clarityCheck = `curl -s "${url}" | grep -i "clarity.ms\\|o5ggbmm8wd"`;
      try {
        execSync(clarityCheck, { stdio: 'pipe' });
        this.log('✓ Clarity scripts detected on live site', 'success');
      } catch (error) {
        this.createAlert('analytics', 'Clarity scripts not detected on live site');
      }

    } catch (error) {
      this.log('⚠️  Could not validate analytics on live site', 'warning');
    }
  }

  async monitorDeploymentHealth() {
    this.log('\n🚀 Monitoring Deployment Health...', 'info');

    try {
      // Check S3 bucket accessibility
      const s3Status = await this.checkS3Status();
      this.metrics.deployment = { s3: s3Status };

      // Check CloudFront distribution
      const cloudfrontStatus = await this.checkCloudfrontStatus();
      this.metrics.deployment.cloudfront = cloudfrontStatus;

      // Check recent deployments
      const deploymentHistory = await this.checkDeploymentHistory();
      this.metrics.deployment.history = deploymentHistory;

    } catch (error) {
      this.log(`✗ Deployment monitoring failed: ${error.message}`, 'error');
      this.metrics.errors.push({
        type: 'deployment-monitoring',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  async checkS3Status() {
    try {
      const command = 'aws s3 ls s3://mobile-marketing-site-prod-1759705011281-tyzuo9';
      execSync(command, { stdio: 'pipe' });
      this.log('✓ S3 bucket accessible', 'success');
      return { status: 'accessible' };
    } catch (error) {
      this.createAlert('deployment', 'S3 bucket not accessible');
      return { status: 'error', error: error.message };
    }
  }

  async checkCloudfrontStatus() {
    try {
      const command = 'aws cloudfront get-distribution --id E2IBMHQ3GCW6ZK';
      const output = execSync(command, { encoding: 'utf8' });
      const distribution = JSON.parse(output);
      
      const status = distribution.Distribution.Status;
      this.log(`✓ CloudFront distribution status: ${status}`, 'success');
      
      if (status !== 'Deployed') {
        this.createAlert('deployment', `CloudFront distribution status: ${status}`);
      }
      
      return { status, id: 'E2IBMHQ3GCW6ZK' };
    } catch (error) {
      this.createAlert('deployment', 'CloudFront distribution check failed');
      return { status: 'error', error: error.message };
    }
  }

  async checkDeploymentHistory() {
    // Check for recent deployment reports
    const reportFiles = fs.readdirSync('.')
      .filter(f => f.startsWith('deployment-report-'))
      .sort()
      .slice(-5); // Last 5 deployments

    if (reportFiles.length === 0) {
      this.createAlert('deployment', 'No recent deployment reports found');
      return { recentDeployments: 0 };
    }

    const latestReport = reportFiles[reportFiles.length - 1];
    const reportAge = Date.now() - fs.statSync(latestReport).mtime.getTime();
    const hoursAge = Math.round(reportAge / (1000 * 60 * 60));

    this.log(`✓ Latest deployment: ${hoursAge} hours ago`, 'success');

    if (hoursAge > 168) { // 1 week
      this.createAlert('deployment', `No deployments in ${Math.round(hoursAge / 24)} days`);
    }

    return {
      recentDeployments: reportFiles.length,
      latestDeployment: latestReport,
      hoursAge
    };
  }

  createAlert(category, message) {
    const alert = {
      category,
      message,
      timestamp: new Date().toISOString(),
      severity: this.determineAlertSeverity(category, message)
    };

    this.metrics.alerts.push(alert);
    this.log(`🚨 ALERT [${category.toUpperCase()}]: ${message}`, 'alert');
  }

  determineAlertSeverity(category, message) {
    const criticalKeywords = ['down', 'error', 'failed', 'not accessible'];
    const warningKeywords = ['slow', 'missing', 'not found'];

    if (criticalKeywords.some(keyword => message.toLowerCase().includes(keyword))) {
      return 'critical';
    } else if (warningKeywords.some(keyword => message.toLowerCase().includes(keyword))) {
      return 'warning';
    }
    return 'info';
  }

  async generateMonitoringReport() {
    const reportPath = `monitoring-report-${Date.now()}.json`;
    
    // Add summary statistics
    this.metrics.summary = {
      totalAlerts: this.metrics.alerts.length,
      criticalAlerts: this.metrics.alerts.filter(a => a.severity === 'critical').length,
      warningAlerts: this.metrics.alerts.filter(a => a.severity === 'warning').length,
      overallHealth: this.calculateOverallHealth()
    };

    fs.writeFileSync(reportPath, JSON.stringify(this.metrics, null, 2));
    this.log(`📄 Monitoring report saved: ${reportPath}`, 'success');
    
    return reportPath;
  }

  calculateOverallHealth() {
    const criticalAlerts = this.metrics.alerts.filter(a => a.severity === 'critical').length;
    const warningAlerts = this.metrics.alerts.filter(a => a.severity === 'warning').length;

    if (criticalAlerts > 0) return 'critical';
    if (warningAlerts > 2) return 'degraded';
    if (warningAlerts > 0) return 'warning';
    return 'healthy';
  }

  async sendAlertNotifications() {
    const criticalAlerts = this.metrics.alerts.filter(a => a.severity === 'critical');
    
    if (criticalAlerts.length > 0) {
      this.log(`\n🚨 ${criticalAlerts.length} CRITICAL ALERTS DETECTED!`, 'error');
      
      // In a real implementation, you would send these to:
      // - Email notifications
      // - Slack/Discord webhooks
      // - SMS alerts
      // - PagerDuty/OpsGenie
      
      criticalAlerts.forEach(alert => {
        this.log(`  • ${alert.message}`, 'error');
      });
    }
  }

  async run() {
    this.log('🔍 Starting Proactive Monitoring System...', 'info');

    await this.monitorWebsiteAvailability();
    await this.monitorCoreWebVitals();
    await this.monitorAnalytics();
    await this.monitorDeploymentHealth();

    const reportPath = await this.generateMonitoringReport();
    await this.sendAlertNotifications();

    this.log('\n' + '='.repeat(60), 'success');
    this.log('🔍 MONITORING COMPLETED!', 'success');
    this.log('='.repeat(60), 'success');
    this.log(`Overall Health: ${this.metrics.summary.overallHealth.toUpperCase()}`, 
      this.metrics.summary.overallHealth === 'healthy' ? 'success' : 'warning');
    this.log(`Total Alerts: ${this.metrics.summary.totalAlerts}`, 'info');
    this.log(`Critical Alerts: ${this.metrics.summary.criticalAlerts}`, 
      this.metrics.summary.criticalAlerts > 0 ? 'error' : 'success');
    this.log(`Report: ${reportPath}`, 'info');

    return this.metrics;
  }

  // Continuous monitoring mode
  async startContinuousMonitoring() {
    this.log('🔄 Starting continuous monitoring mode...', 'info');
    this.log(`Check interval: ${this.config.checkInterval / 1000}s`, 'info');

    const runCheck = async () => {
      try {
        await this.run();
      } catch (error) {
        this.log(`Monitoring check failed: ${error.message}`, 'error');
      }
    };

    // Run initial check
    await runCheck();

    // Schedule recurring checks
    setInterval(runCheck, this.config.checkInterval);
  }
}

// CLI interface
if (require.main === module) {
  const args = process.argv.slice(2);
  const continuous = args.includes('--continuous');
  const interval = args.find(arg => arg.startsWith('--interval='));

  const monitor = new ProactiveMonitoringSystem();

  if (interval) {
    const minutes = parseInt(interval.split('=')[1]);
    monitor.config.checkInterval = minutes * 60 * 1000;
  }

  if (continuous) {
    monitor.startContinuousMonitoring();
  } else {
    monitor.run().then(results => {
      process.exit(results.summary.criticalAlerts > 0 ? 1 : 0);
    }).catch(error => {
      console.error('Monitoring failed:', error);
      process.exit(1);
    });
  }
}

module.exports = ProactiveMonitoringSystem;