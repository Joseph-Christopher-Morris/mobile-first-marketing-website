#!/usr/bin/env node

/**
 * Image Performance Alert Handler
 * Processes and handles performance monitoring alerts
 */

const fs = require('fs');
const path = require('path');

class AlertHandler {
  constructor() {
    this.configPath =
      'C:\Users\Joe\Projects\website-sync-20251003_133144\config\performance-alerts-config.json';
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
      threshold: rule.condition.threshold,
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

    const logEntry = JSON.stringify(alert) + '\\n';
    fs.appendFileSync(this.logPath, logEntry);
  }

  /**
   * Display alert notification
   */
  notifyAlert(alert) {
    const severityIcon = {
      ERROR: '🚨',
      WARNING: '⚠️',
      INFO: 'ℹ️',
    };

    console.log('\n' + severityIcon[alert.severity] + ' PERFORMANCE ALERT');
    console.log('Rule: ' + alert.rule);
    console.log('Message: ' + alert.message);
    console.log(
      'Metric: ' +
        alert.metric +
        ' = ' +
        alert.value +
        ' (threshold: ' +
        alert.threshold +
        ')'
    );
    console.log('Time: ' + alert.timestamp + '\n');
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
      escalationTime: new Date().toISOString(),
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
      timestamp: new Date().toISOString(),
    });
  }
}

module.exports = AlertHandler;
