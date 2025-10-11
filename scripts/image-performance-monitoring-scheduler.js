#!/usr/bin/env node

/**
 * Image Performance Monitoring Scheduler
 * Schedules and runs performance monitoring at regular intervals
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class MonitoringScheduler {
  constructor() {
    this.configPath =
      'C:\Users\Joe\Projects\website-sync-20251003_133144\config\performance-alerts-config.json';
    this.config = this.loadConfig();
    this.isRunning = false;
  }

  loadConfig() {
    try {
      return JSON.parse(fs.readFileSync(this.configPath, 'utf8'));
    } catch (error) {
      console.error('Failed to load scheduler config:', error);
      return { monitoringSchedule: { enabled: false } };
    }
  }

  /**
   * Start monitoring scheduler
   */
  start() {
    if (!this.config.monitoringSchedule.enabled) {
      console.log('📅 Monitoring scheduler is disabled');
      return;
    }

    console.log('🚀 Starting image performance monitoring scheduler...');
    console.log('📊 Frequency: ' + this.config.monitoringSchedule.frequency);

    this.isRunning = true;
    this.scheduleNextRun();
  }

  /**
   * Schedule next monitoring run
   */
  scheduleNextRun() {
    if (!this.isRunning) return;

    const frequency = this.parseFrequency(
      this.config.monitoringSchedule.frequency
    );

    setTimeout(() => {
      this.runMonitoring();
      this.scheduleNextRun();
    }, frequency);
  }

  /**
   * Parse frequency string to milliseconds
   */
  parseFrequency(frequency) {
    const match = frequency.match(/(\\d+)([smh])/);
    if (!match) return 3600000; // Default 1 hour

    const value = parseInt(match[1]);
    const unit = match[2];

    switch (unit) {
      case 's':
        return value * 1000;
      case 'm':
        return value * 60 * 1000;
      case 'h':
        return value * 60 * 60 * 1000;
      default:
        return 3600000;
    }
  }

  /**
   * Run monitoring and check for alerts
   */
  async runMonitoring() {
    try {
      console.log(
        '🔍 Running scheduled monitoring at ' + new Date().toISOString()
      );

      // Run integrated monitoring
      const result = execSync(
        'node scripts/integrated-image-performance-monitor.js',
        {
          encoding: 'utf8',
          timeout: 300000, // 5 minutes timeout
        }
      );

      console.log('✅ Monitoring completed successfully');

      // Check for alerts in the results
      this.checkForAlerts();
    } catch (error) {
      console.error('❌ Monitoring failed:', error.message);

      // Alert on monitoring failure
      this.handleMonitoringFailure(error);
    }
  }

  /**
   * Check monitoring results for alert conditions
   */
  checkForAlerts() {
    // In a real implementation, this would parse the monitoring results
    // and check against alert rules, then trigger the alert handler
    console.log('🔍 Checking for alert conditions...');
  }

  /**
   * Handle monitoring system failures
   */
  handleMonitoringFailure(error) {
    const AlertHandler = require('./image-performance-alert-handler');
    const handler = new AlertHandler();

    handler.processAlert({
      ruleId: 'monitoring-system-failure',
      metric: 'system_health',
      value: 0,
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Stop monitoring scheduler
   */
  stop() {
    console.log('🛑 Stopping monitoring scheduler...');
    this.isRunning = false;
  }
}

// CLI execution
if (require.main === module) {
  const scheduler = new MonitoringScheduler();

  // Handle process signals
  process.on('SIGINT', () => {
    scheduler.stop();
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    scheduler.stop();
    process.exit(0);
  });

  scheduler.start();
}

module.exports = MonitoringScheduler;
