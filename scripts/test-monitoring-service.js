#!/usr/bin/env node

/**
 * Test Monitoring Service
 *
 * A lightweight service that continuously monitors test results
 * and provides real-time alerts and notifications
 */

const fs = require('fs');
const path = require('path');
const TestResultDashboard = require('./test-result-dashboard');

class TestMonitoringService {
  constructor() {
    this.configPath = '.kiro/test-results/monitoring-config.json';
    this.config = this.loadConfig();
    this.isRunning = false;
    this.intervalId = null;
    this.lastResults = null;
  }

  loadConfig() {
    try {
      if (fs.existsSync(this.configPath)) {
        return JSON.parse(fs.readFileSync(this.configPath, 'utf8'));
      }
    } catch (error) {
      console.warn(
        'Could not load monitoring config, using defaults:',
        error.message
      );
    }

    return {
      monitoring: {
        enabled: true,
        interval: 300000, // 5 minutes
        alerts: {
          success_rate_threshold: 80,
          critical_threshold: 50,
        },
      },
    };
  }

  start() {
    if (this.isRunning) {
      console.log('⚠️ Monitoring service is already running');
      return;
    }

    if (!this.config.monitoring.enabled) {
      console.log('❌ Monitoring is disabled in configuration');
      return;
    }

    console.log('🚀 Starting test monitoring service...');
    console.log(
      `📊 Monitoring interval: ${this.config.monitoring.interval / 1000}s`
    );
    console.log(
      `🎯 Success rate threshold: ${this.config.monitoring.alerts.success_rate_threshold}%`
    );

    this.isRunning = true;

    // Run initial test
    this.runMonitoringCycle();

    // Schedule recurring runs
    this.intervalId = setInterval(() => {
      this.runMonitoringCycle();
    }, this.config.monitoring.interval);

    // Handle graceful shutdown
    process.on('SIGINT', () => {
      console.log('\n🛑 Shutting down monitoring service...');
      this.stop();
      process.exit(0);
    });

    console.log('✅ Test monitoring service started');
    console.log('Press Ctrl+C to stop monitoring');
  }

  stop() {
    if (!this.isRunning) {
      return;
    }

    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    this.isRunning = false;
    console.log('🛑 Test monitoring service stopped');
  }

  async runMonitoringCycle() {
    const timestamp = new Date().toISOString();
    console.log(`\n⏰ [${timestamp}] Running monitoring cycle...`);

    try {
      const dashboard = new TestResultDashboard();
      await dashboard.runAllTests();

      const results = dashboard.results;
      this.analyzeResults(results);
      this.lastResults = results;
    } catch (error) {
      console.error('❌ Error during monitoring cycle:', error.message);
      this.sendAlert('error', 'Monitoring cycle failed', error.message);
    }
  }

  analyzeResults(results) {
    const { summary, alerts } = results;
    const threshold = this.config.monitoring.alerts.success_rate_threshold;
    const criticalThreshold = this.config.monitoring.alerts.critical_threshold;

    // Check success rate
    if (summary.success_rate < criticalThreshold) {
      this.sendAlert(
        'critical',
        `Critical: Test success rate is ${summary.success_rate}%`,
        `This is below the critical threshold of ${criticalThreshold}%`
      );
    } else if (summary.success_rate < threshold) {
      this.sendAlert(
        'warning',
        `Warning: Test success rate is ${summary.success_rate}%`,
        `This is below the threshold of ${threshold}%`
      );
    }

    // Check for new failures
    if (this.lastResults && summary.failed > this.lastResults.summary.failed) {
      const newFailures = summary.failed - this.lastResults.summary.failed;
      this.sendAlert(
        'warning',
        `New test failures detected: ${newFailures}`,
        'Check the dashboard for details'
      );
    }

    // Check for alerts from test results
    if (alerts && alerts.length > 0) {
      alerts.forEach(alert => {
        this.sendAlert(alert.type, alert.message, alert.details);
      });
    }

    // Success notification for good results
    if (summary.success_rate >= 95 && summary.total > 0) {
      console.log(
        `✅ All tests passing! Success rate: ${summary.success_rate}%`
      );
    }
  }

  sendAlert(type, message, details) {
    const timestamp = new Date().toISOString();
    const alertMessage = `[${timestamp}] ${type.toUpperCase()}: ${message}`;

    // Console notification
    const icon =
      type === 'critical'
        ? '🚨'
        : type === 'error'
          ? '❌'
          : type === 'warning'
            ? '⚠️'
            : 'ℹ️';
    console.log(`${icon} ${alertMessage}`);
    if (details) {
      console.log(`   Details: ${details}`);
    }

    // File notification
    this.logAlert(type, message, details);

    // Future: Add webhook, email, Slack notifications here
  }

  logAlert(type, message, details) {
    const alertsFile = path.join('.kiro/test-results', 'alerts.log');
    const timestamp = new Date().toISOString();
    const logEntry = `${timestamp} [${type.toUpperCase()}] ${message}${details ? ` - ${details}` : ''}\n`;

    try {
      fs.appendFileSync(alertsFile, logEntry);
    } catch (error) {
      console.warn('Could not write to alerts log:', error.message);
    }
  }

  getStatus() {
    return {
      running: this.isRunning,
      config: this.config,
      lastResults: this.lastResults
        ? {
            timestamp: this.lastResults.timestamp,
            summary: this.lastResults.summary,
          }
        : null,
    };
  }

  // Static methods for CLI
  static start() {
    const service = new TestMonitoringService();
    service.start();
  }

  static status() {
    const service = new TestMonitoringService();
    const status = service.getStatus();

    console.log('📊 Test Monitoring Service Status');
    console.log('================================');
    console.log(`Running: ${status.running ? '✅ Yes' : '❌ No'}`);
    console.log(
      `Monitoring enabled: ${status.config.monitoring.enabled ? '✅ Yes' : '❌ No'}`
    );
    console.log(`Interval: ${status.config.monitoring.interval / 1000}s`);

    if (status.lastResults) {
      console.log(
        `Last run: ${new Date(status.lastResults.timestamp).toLocaleString()}`
      );
      console.log(`Success rate: ${status.lastResults.summary.success_rate}%`);
      console.log(`Total tests: ${status.lastResults.summary.total}`);
    } else {
      console.log('Last run: Never');
    }
  }
}

// CLI interface
if (require.main === module) {
  const command = process.argv[2];

  switch (command) {
    case 'start':
      TestMonitoringService.start();
      break;

    case 'status':
      TestMonitoringService.status();
      break;

    default:
      console.log(`
🔄 Test Monitoring Service

Usage:
  node scripts/test-monitoring-service.js start   - Start monitoring service
  node scripts/test-monitoring-service.js status  - Show service status

The monitoring service will:
  • Run tests at regular intervals
  • Monitor success rates and alert on failures
  • Generate continuous dashboards
  • Log alerts and notifications

Configuration: .kiro/test-results/monitoring-config.json
      `);
  }
}

module.exports = TestMonitoringService;
