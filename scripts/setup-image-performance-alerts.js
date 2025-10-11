#!/usr/bin/env node

/**
 * Setup Image Performance Monitoring Alerts
 * Configures automated alerts for image loading failures and performance issues
 */

const fs = require('fs');
const path = require('path');

class ImagePerformanceAlertsSetup {
  constructor() {
    this.configPath = path.join(process.cwd(), 'config', 'image-performance-monitoring-config.json');
    this.alertsConfigPath = path.join(process.cwd(), 'config', 'performance-alerts-config.json');
    this.config = this.loadConfig();
  }

  /**
   * Load monitoring configuration
   */
  loadConfig() {
    try {
      if (fs.existsSync(this.configPath)) {
        return JSON.parse(fs.readFileSync(this.configPath, 'utf8'));
      }
    } catch (error) {
      console.warn('⚠️  Could not load monitoring config, using defaults');
    }
    
    return this.getDefaultConfig();
  }

  /**
   * Get default configuration
   */
  getDefaultConfig() {
    return {
      thresholds: {
        imageLoading: {
          maxLoadTime: 2000,
          maxFileSize: 500,
          minSuccessRate: 95
        },
        coreWebVitals: {
          lcp: { good: 1200, poor: 2500 },
          cls: { good: 0.1, poor: 0.25 },
          fid: { good: 100, poor: 300 }
        }
      },
      alerts: {
        enabled: true,
        channels: ['console', 'file']
      }
    };
  }

  /**
   * Setup alert monitoring system
   */
  setupAlerts() {
    console.log('🚨 Setting up Image Performance Monitoring Alerts...');
    
    const alertsConfig = {
      timestamp: new Date().toISOString(),
      enabled: true,
      alertRules: this.createAlertRules(),
      notificationChannels: this.setupNotificationChannels(),
      escalationPolicies: this.createEscalationPolicies(),
      monitoringSchedule: this.createMonitoringSchedule()
    };
    
    // Save alerts configuration
    this.saveAlertsConfig(alertsConfig);
    
    // Create alert handler script
    this.createAlertHandler();
    
    // Create monitoring scheduler
    this.createMonitoringScheduler();
    
    // Setup log rotation
    this.setupLogRotation();
    
    console.log('✅ Image performance alerts setup completed');
    return alertsConfig;
  }

  /**
   * Create alert rules based on thresholds
   */
  createAlertRules() {
    const rules = [];
    
    // Image loading failure alerts
    rules.push({
      id: 'image-loading-failure',
      name: 'Image Loading Failure',
      description: 'Triggered when images fail to load',
      condition: {
        metric: 'image_success_rate',
        operator: 'less_than',
        threshold: this.config.thresholds.imageLoading.minSuccessRate,
        duration: '5m'
      },
      severity: 'ERROR',
      actions: ['log', 'notify'],
      cooldown: '10m',
      message: 'Critical: Images failing to load - immediate attention required'
    });
    
    // Slow image loading alerts
    rules.push({
      id: 'slow-image-loading',
      name: 'Slow Image Loading',
      description: 'Triggered when images load slowly',
      condition: {
        metric: 'avg_image_load_time',
        operator: 'greater_than',
        threshold: this.config.thresholds.imageLoading.maxLoadTime,
        duration: '10m'
      },
      severity: 'WARNING',
      actions: ['log', 'notify'],
      cooldown: '30m',
      message: 'Warning: Images loading slowly - performance optimization needed'
    });
    
    // LCP performance alerts
    rules.push({
      id: 'poor-lcp-performance',
      name: 'Poor LCP Performance',
      description: 'Triggered when LCP exceeds threshold',
      condition: {
        metric: 'lcp',
        operator: 'greater_than',
        threshold: this.config.thresholds.coreWebVitals.lcp.poor,
        duration: '5m'
      },
      severity: 'ERROR',
      actions: ['log', 'notify', 'escalate'],
      cooldown: '15m',
      message: 'Critical: LCP performance poor - SEO impact likely'
    });
    
    // CLS stability alerts
    rules.push({
      id: 'layout-shift-issues',
      name: 'Layout Shift Issues',
      description: 'Triggered when CLS exceeds threshold',
      condition: {
        metric: 'cls',
        operator: 'greater_than',
        threshold: this.config.thresholds.coreWebVitals.cls.poor,
        duration: '10m'
      },
      severity: 'WARNING',
      actions: ['log', 'notify'],
      cooldown: '20m',
      message: 'Warning: Layout shift issues detected - user experience impact'
    });
    
    // Image size optimization alerts
    rules.push({
      id: 'large-image-sizes',
      name: 'Large Image Sizes',
      description: 'Triggered when images are too large',
      condition: {
        metric: 'avg_image_size',
        operator: 'greater_than',
        threshold: this.config.thresholds.imageLoading.maxFileSize * 1024, // Convert to bytes
        duration: '1h'
      },
      severity: 'INFO',
      actions: ['log'],
      cooldown: '4h',
      message: 'Info: Large image sizes detected - consider optimization'
    });
    
    return rules;
  }

  /**
   * Setup notification channels
   */
  setupNotificationChannels() {
    return {
      console: {
        enabled: true,
        format: 'colored',
        includeTimestamp: true
      },
      file: {
        enabled: true,
        logFile: './logs/performance-alerts.log',
        format: 'json',
        rotation: {
          enabled: true,
          maxSize: '10MB',
          maxFiles: 5
        }
      },
      webhook: {
        enabled: false,
        url: null,
        headers: {},
        timeout: 5000
      },
      email: {
        enabled: false,
        recipients: [],
        smtp: {}
      }
    };
  }

  /**
   * Create escalation policies
   */
  createEscalationPolicies() {
    return {
      levels: [
        {
          level: 1,
          severity: ['INFO'],
          actions: ['log'],
          delay: '0m'
        },
        {
          level: 2,
          severity: ['WARNING'],
          actions: ['log', 'notify'],
          delay: '5m'
        },
        {
          level: 3,
          severity: ['ERROR'],
          actions: ['log', 'notify', 'escalate'],
          delay: '2m'
        }
      ],
      escalationDelay: '30m',
      maxEscalations: 3
    };
  }

  /**
   * Create monitoring schedule
   */
  createMonitoringSchedule() {
    return {
      enabled: true,
      frequency: '1h',
      timezone: 'UTC',
      activeHours: {
        enabled: false,
        start: '09:00',
        end: '17:00',
        days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
      },
      maintenanceWindows: []
    };
  }

  /**
   * Save alerts configuration
   */
  saveAlertsConfig(config) {
    const configDir = path.dirname(this.alertsConfigPath);
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }
    
    fs.writeFileSync(this.alertsConfigPath, JSON.stringify(config, null, 2));
    console.log(`📄 Alerts configuration saved: ${this.alertsConfigPath}`);
  }

  /**
   * Create alert handler script
   */
  createAlertHandler() {
    const handlerScript = `#!/usr/bin/env node

/**
 * Image Performance Alert Handler
 * Processes and handles performance monitoring alerts
 */

const fs = require('fs');
const path = require('path');

class AlertHandler {
  constructor() {
    this.configPath = '${this.alertsConfigPath}';
    this.logPath = './logs/performance-alerts.log';
    this.config = this.loadConfig();
  }

  loadConfig() {
    try {
      return JSON.parse(fs.readFileSync(this.configPath, 'utf8'));
    } catch (error) {
      console.error('Failed to load alerts config:', error);
      return null;
    }
  }

  /**
   * Process alert based on severity and rules
   */
  processAlert(alert) {
    const rule = this.config.alertRules.find(r => r.id === alert.ruleId);
    if (!rule) {
      console.error('Unknown alert rule:', alert.ruleId);
      return;
    }

    const timestamp = new Date().toISOString();
    const alertData = {
      timestamp,
      rule: rule.name,
      severity: rule.severity,
      message: rule.message,
      metric: alert.metric,
      value: alert.value,
      threshold: rule.condition.threshold
    };

    // Execute actions based on rule configuration
    rule.actions.forEach(action => {
      switch (action) {
        case 'log':
          this.logAlert(alertData);
          break;
        case 'notify':
          this.notifyAlert(alertData);
          break;
        case 'escalate':
          this.escalateAlert(alertData);
          break;
      }
    });
  }

  /**
   * Log alert to file
   */
  logAlert(alert) {
    const logDir = path.dirname(this.logPath);
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }

    const logEntry = JSON.stringify(alert) + '\\\\n';
    fs.appendFileSync(this.logPath, logEntry);
  }

  /**
   * Display alert notification
   */
  notifyAlert(alert) {
    const severityIcon = {
      'ERROR': '🚨',
      'WARNING': '⚠️',
      'INFO': 'ℹ️'
    };

    console.log('\\n' + severityIcon[alert.severity] + ' PERFORMANCE ALERT');
    console.log('Rule: ' + alert.rule);
    console.log('Message: ' + alert.message);
    console.log('Metric: ' + alert.metric + ' = ' + alert.value + ' (threshold: ' + alert.threshold + ')');
    console.log('Time: ' + alert.timestamp + '\\n');
  }

  /**
   * Escalate critical alerts
   */
  escalateAlert(alert) {
    // In a real implementation, this would integrate with
    // external systems like PagerDuty, Slack, etc.
    console.log('🔥 ESCALATING ALERT: ' + alert.rule);
    
    // Log escalation
    const escalationLog = {
      ...alert,
      escalated: true,
      escalationTime: new Date().toISOString()
    };
    
    this.logAlert(escalationLog);
  }
}

// CLI execution
if (require.main === module) {
  const handler = new AlertHandler();
  
  // Example usage - in real implementation, this would be called by monitoring system
  if (process.argv[2] === 'test') {
    handler.processAlert({
      ruleId: 'image-loading-failure',
      metric: 'image_success_rate',
      value: 85,
      timestamp: new Date().toISOString()
    });
  }
}

module.exports = AlertHandler;
`;

    const handlerPath = path.join(process.cwd(), 'scripts', 'image-performance-alert-handler.js');
    fs.writeFileSync(handlerPath, handlerScript);
    console.log(`📄 Alert handler created: ${handlerPath}`);
  }

  /**
   * Create monitoring scheduler
   */
  createMonitoringScheduler() {
    const schedulerScript = `#!/usr/bin/env node

/**
 * Image Performance Monitoring Scheduler
 * Schedules and runs performance monitoring at regular intervals
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class MonitoringScheduler {
  constructor() {
    this.configPath = '${this.alertsConfigPath}';
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

    const frequency = this.parseFrequency(this.config.monitoringSchedule.frequency);
    
    setTimeout(() => {
      this.runMonitoring();
      this.scheduleNextRun();
    }, frequency);
  }

  /**
   * Parse frequency string to milliseconds
   */
  parseFrequency(frequency) {
    const match = frequency.match(/(\\\\d+)([smh])/);
    if (!match) return 3600000; // Default 1 hour

    const value = parseInt(match[1]);
    const unit = match[2];

    switch (unit) {
      case 's': return value * 1000;
      case 'm': return value * 60 * 1000;
      case 'h': return value * 60 * 60 * 1000;
      default: return 3600000;
    }
  }

  /**
   * Run monitoring and check for alerts
   */
  async runMonitoring() {
    try {
      console.log('🔍 Running scheduled monitoring at ' + new Date().toISOString());
      
      // Run integrated monitoring
      const result = execSync('node scripts/integrated-image-performance-monitor.js', {
        encoding: 'utf8',
        timeout: 300000 // 5 minutes timeout
      });
      
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
      timestamp: new Date().toISOString()
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
`;

    const schedulerPath = path.join(process.cwd(), 'scripts', 'image-performance-monitoring-scheduler.js');
    fs.writeFileSync(schedulerPath, schedulerScript);
    console.log(`📄 Monitoring scheduler created: ${schedulerPath}`);
  }

  /**
   * Setup log rotation
   */
  setupLogRotation() {
    const logsDir = path.join(process.cwd(), 'logs');
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }

    // Create log rotation script
    const rotationScript = `#!/usr/bin/env node

/**
 * Log Rotation for Performance Monitoring
 */

const fs = require('fs');
const path = require('path');

class LogRotation {
  constructor() {
    this.logsDir = './logs';
    this.maxSize = 10 * 1024 * 1024; // 10MB
    this.maxFiles = 5;
  }

  rotateLog(logFile) {
    const logPath = path.join(this.logsDir, logFile);
    
    if (!fs.existsSync(logPath)) return;
    
    const stats = fs.statSync(logPath);
    if (stats.size < this.maxSize) return;
    
    // Rotate existing files
    for (let i = this.maxFiles - 1; i > 0; i--) {
      const oldFile = logPath + '.' + i;
      const newFile = logPath + '.' + (i + 1);
      
      if (fs.existsSync(oldFile)) {
        if (i === this.maxFiles - 1) {
          fs.unlinkSync(oldFile); // Delete oldest
        } else {
          fs.renameSync(oldFile, newFile);
        }
      }
    }
    
    // Move current log to .1
    fs.renameSync(logPath, logPath + '.1');
    
    console.log('📋 Rotated log file: ' + logFile);
  }

  rotateAllLogs() {
    const logFiles = ['performance-alerts.log', 'monitoring.log'];
    logFiles.forEach(file => this.rotateLog(file));
  }
}

if (require.main === module) {
  const rotation = new LogRotation();
  rotation.rotateAllLogs();
}

module.exports = LogRotation;
`;

    const rotationPath = path.join(process.cwd(), 'scripts', 'log-rotation.js');
    fs.writeFileSync(rotationPath, rotationScript);
    console.log(`📄 Log rotation script created: ${rotationPath}`);
  }

  /**
   * Test alert system
   */
  testAlerts() {
    console.log('🧪 Testing alert system...');
    
    try {
      // Test alert handler
      const { execSync } = require('child_process');
      execSync('node scripts/image-performance-alert-handler.js test', { stdio: 'inherit' });
      
      console.log('✅ Alert system test completed');
      return true;
    } catch (error) {
      console.error('❌ Alert system test failed:', error);
      return false;
    }
  }

  /**
   * Generate setup summary
   */
  generateSetupSummary() {
    const summary = {
      timestamp: new Date().toISOString(),
      components: [
        {
          name: 'Alert Rules',
          status: 'configured',
          count: this.config.alerts?.rules?.length || 5,
          description: 'Performance monitoring alert rules'
        },
        {
          name: 'Notification Channels',
          status: 'configured',
          channels: ['console', 'file'],
          description: 'Alert notification delivery channels'
        },
        {
          name: 'Monitoring Scheduler',
          status: 'configured',
          frequency: '1h',
          description: 'Automated monitoring execution'
        },
        {
          name: 'Log Rotation',
          status: 'configured',
          maxSize: '10MB',
          description: 'Log file management and rotation'
        }
      ],
      nextSteps: [
        'Run initial monitoring: node scripts/integrated-image-performance-monitor.js',
        'Start scheduler: node scripts/image-performance-monitoring-scheduler.js',
        'Monitor alerts: tail -f logs/performance-alerts.log',
        'Test alert system: node scripts/image-performance-alert-handler.js test'
      ]
    };

    const summaryPath = path.join(process.cwd(), 'image-performance-alerts-setup-summary.json');
    fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
    
    console.log('\n📋 Setup Summary:');
    summary.components.forEach(comp => {
      console.log('  ✅ ' + comp.name + ': ' + comp.status);
    });
    
    console.log('\n🚀 Next Steps:');
    summary.nextSteps.forEach((step, index) => {
      console.log('  ' + (index + 1) + '. ' + step);
    });
    
    console.log('\n📄 Full summary saved: ' + summaryPath);
    
    return summary;
  }
}

// CLI execution
if (require.main === module) {
  const setup = new ImagePerformanceAlertsSetup();
  
  try {
    const alertsConfig = setup.setupAlerts();
    const testResult = setup.testAlerts();
    const summary = setup.generateSetupSummary();
    
    console.log('\n🎉 Image Performance Monitoring Alerts setup completed successfully!');
    
    if (!testResult) {
      console.warn('⚠️  Some tests failed - please review the configuration');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  }
}

module.exports = ImagePerformanceAlertsSetup;