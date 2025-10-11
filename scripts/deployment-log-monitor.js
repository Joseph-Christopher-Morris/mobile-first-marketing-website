#!/usr/bin/env node

/**
 * Deployment Log Monitor
 *
 * This script provides tools for monitoring AWS Amplify deployment logs
 * and tracking deployment status in real-time.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class DeploymentLogMonitor {
  constructor(options = {}) {
    this.logFile =
      options.logFile || path.join(process.cwd(), 'deployment-logs.json');
    this.statusFile =
      options.statusFile || path.join(process.cwd(), 'deployment-status.json');
    this.alertThresholds = {
      buildTime: options.maxBuildTime || 900, // 15 minutes
      errorCount: options.maxErrors || 0,
      warningCount: options.maxWarnings || 10,
    };
    this.deploymentHistory = this.loadDeploymentHistory();
  }

  log(message, type = 'info', metadata = {}) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      type,
      message,
      metadata,
    };

    console.log(`[${timestamp}] [${type.toUpperCase()}] ${message}`);

    // Append to log file
    this.appendToLogFile(logEntry);

    return logEntry;
  }

  appendToLogFile(logEntry) {
    try {
      const logLine = JSON.stringify(logEntry) + '\n';
      fs.appendFileSync(this.logFile, logLine);
    } catch (error) {
      console.error('Failed to write to log file:', error.message);
    }
  }

  loadDeploymentHistory() {
    try {
      if (fs.existsSync(this.statusFile)) {
        const data = fs.readFileSync(this.statusFile, 'utf8');
        return JSON.parse(data);
      }
    } catch (error) {
      this.log('Failed to load deployment history, starting fresh', 'warning');
    }

    return {
      deployments: [],
      lastDeployment: null,
      statistics: {
        totalDeployments: 0,
        successfulDeployments: 0,
        failedDeployments: 0,
        averageBuildTime: 0,
      },
    };
  }

  saveDeploymentHistory() {
    try {
      fs.writeFileSync(
        this.statusFile,
        JSON.stringify(this.deploymentHistory, null, 2)
      );
    } catch (error) {
      this.log('Failed to save deployment history', 'error', {
        error: error.message,
      });
    }
  }

  startDeploymentMonitoring(deploymentId = null) {
    const deployment = {
      id: deploymentId || this.generateDeploymentId(),
      startTime: new Date().toISOString(),
      status: 'in_progress',
      phases: {},
      logs: [],
      errors: [],
      warnings: [],
      metrics: {},
    };

    this.currentDeployment = deployment;
    this.deploymentHistory.deployments.push(deployment);
    this.deploymentHistory.lastDeployment = deployment;

    this.log('Started deployment monitoring', 'info', {
      deploymentId: deployment.id,
    });

    return deployment;
  }

  updateDeploymentPhase(phase, status, duration = null, logs = []) {
    if (!this.currentDeployment) {
      this.log('No active deployment to update', 'warning');
      return;
    }

    this.currentDeployment.phases[phase] = {
      status,
      duration,
      timestamp: new Date().toISOString(),
      logs: logs,
    };

    this.log(
      `Phase ${phase}: ${status}`,
      status === 'failed' ? 'error' : 'info',
      {
        phase,
        status,
        duration,
      }
    );

    // Check for alerts
    this.checkPhaseAlerts(phase, status, duration);

    this.saveDeploymentHistory();
  }

  addDeploymentLog(message, type = 'info', phase = null) {
    if (!this.currentDeployment) {
      return;
    }

    const logEntry = {
      timestamp: new Date().toISOString(),
      type,
      message,
      phase,
    };

    this.currentDeployment.logs.push(logEntry);

    if (type === 'error') {
      this.currentDeployment.errors.push(logEntry);
    } else if (type === 'warning') {
      this.currentDeployment.warnings.push(logEntry);
    }

    this.log(message, type, { phase });
  }

  completeDeployment(status, metrics = {}) {
    if (!this.currentDeployment) {
      this.log('No active deployment to complete', 'warning');
      return;
    }

    const endTime = new Date().toISOString();
    const startTime = new Date(this.currentDeployment.startTime);
    const duration = (new Date(endTime) - startTime) / 1000;

    this.currentDeployment.status = status;
    this.currentDeployment.endTime = endTime;
    this.currentDeployment.duration = duration;
    this.currentDeployment.metrics = metrics;

    // Update statistics
    this.updateStatistics(status, duration);

    this.log(
      `Deployment completed: ${status}`,
      status === 'success' ? 'success' : 'error',
      {
        deploymentId: this.currentDeployment.id,
        duration,
        status,
      }
    );

    // Check for deployment alerts
    this.checkDeploymentAlerts(this.currentDeployment);

    this.saveDeploymentHistory();
    this.currentDeployment = null;
  }

  updateStatistics(status, duration) {
    const stats = this.deploymentHistory.statistics;

    stats.totalDeployments++;

    if (status === 'success') {
      stats.successfulDeployments++;
    } else {
      stats.failedDeployments++;
    }

    // Update average build time
    const totalDuration =
      stats.averageBuildTime * (stats.totalDeployments - 1) + duration;
    stats.averageBuildTime = totalDuration / stats.totalDeployments;
  }

  checkPhaseAlerts(phase, status, duration) {
    if (status === 'failed') {
      this.sendAlert('phase_failed', `Phase ${phase} failed`, {
        phase,
        deploymentId: this.currentDeployment?.id,
      });
    }

    if (duration && duration > this.alertThresholds.buildTime) {
      this.sendAlert(
        'phase_slow',
        `Phase ${phase} is taking longer than expected`,
        {
          phase,
          duration,
          threshold: this.alertThresholds.buildTime,
        }
      );
    }
  }

  checkDeploymentAlerts(deployment) {
    // Check error count
    if (deployment.errors.length > this.alertThresholds.errorCount) {
      this.sendAlert(
        'high_error_count',
        `Deployment has ${deployment.errors.length} errors`,
        {
          errorCount: deployment.errors.length,
          threshold: this.alertThresholds.errorCount,
        }
      );
    }

    // Check warning count
    if (deployment.warnings.length > this.alertThresholds.warningCount) {
      this.sendAlert(
        'high_warning_count',
        `Deployment has ${deployment.warnings.length} warnings`,
        {
          warningCount: deployment.warnings.length,
          threshold: this.alertThresholds.warningCount,
        }
      );
    }

    // Check build time
    if (deployment.duration > this.alertThresholds.buildTime) {
      this.sendAlert(
        'slow_deployment',
        `Deployment took ${deployment.duration}s`,
        {
          duration: deployment.duration,
          threshold: this.alertThresholds.buildTime,
        }
      );
    }

    // Check success rate
    const stats = this.deploymentHistory.statistics;
    const successRate = stats.successfulDeployments / stats.totalDeployments;

    if (successRate < 0.8 && stats.totalDeployments >= 5) {
      this.sendAlert(
        'low_success_rate',
        `Deployment success rate is ${(successRate * 100).toFixed(1)}%`,
        {
          successRate,
          totalDeployments: stats.totalDeployments,
        }
      );
    }
  }

  sendAlert(type, message, metadata = {}) {
    const alert = {
      type,
      message,
      timestamp: new Date().toISOString(),
      metadata,
    };

    this.log(`ALERT: ${message}`, 'error', metadata);

    // In a real implementation, you would send this to:
    // - Email notifications
    // - Slack webhooks
    // - AWS SNS
    // - PagerDuty
    // etc.

    this.saveAlert(alert);
  }

  saveAlert(alert) {
    const alertsFile = path.join(process.cwd(), 'deployment-alerts.json');

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

  generateDeploymentId() {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `deploy-${timestamp}-${random}`;
  }

  getDeploymentStatus() {
    return {
      current: this.currentDeployment,
      history: this.deploymentHistory,
      alerts: this.getRecentAlerts(),
    };
  }

  getRecentAlerts(count = 10) {
    const alertsFile = path.join(process.cwd(), 'deployment-alerts.json');

    try {
      if (fs.existsSync(alertsFile)) {
        const data = fs.readFileSync(alertsFile, 'utf8');
        const alerts = JSON.parse(data);
        return alerts.slice(-count);
      }
    } catch (error) {
      this.log('Failed to load alerts', 'warning');
    }

    return [];
  }

  generateStatusReport() {
    const stats = this.deploymentHistory.statistics;
    const recentDeployments = this.deploymentHistory.deployments.slice(-10);
    const recentAlerts = this.getRecentAlerts(5);

    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalDeployments: stats.totalDeployments,
        successRate:
          stats.totalDeployments > 0
            ? (
                (stats.successfulDeployments / stats.totalDeployments) *
                100
              ).toFixed(1) + '%'
            : 'N/A',
        averageBuildTime: stats.averageBuildTime.toFixed(1) + 's',
        failedDeployments: stats.failedDeployments,
      },
      currentDeployment: this.currentDeployment,
      recentDeployments: recentDeployments.map(d => ({
        id: d.id,
        status: d.status,
        duration: d.duration,
        startTime: d.startTime,
        errorCount: d.errors?.length || 0,
        warningCount: d.warnings?.length || 0,
      })),
      recentAlerts: recentAlerts,
    };

    return report;
  }

  printStatusReport() {
    const report = this.generateStatusReport();

    console.log('\n=== DEPLOYMENT STATUS REPORT ===');
    console.log(`Generated: ${report.timestamp}`);

    console.log('\n📊 SUMMARY:');
    console.log(`Total Deployments: ${report.summary.totalDeployments}`);
    console.log(`Success Rate: ${report.summary.successRate}`);
    console.log(`Average Build Time: ${report.summary.averageBuildTime}`);
    console.log(`Failed Deployments: ${report.summary.failedDeployments}`);

    if (report.currentDeployment) {
      console.log('\n🔄 CURRENT DEPLOYMENT:');
      console.log(`ID: ${report.currentDeployment.id}`);
      console.log(`Status: ${report.currentDeployment.status}`);
      console.log(`Started: ${report.currentDeployment.startTime}`);
      console.log(`Errors: ${report.currentDeployment.errors.length}`);
      console.log(`Warnings: ${report.currentDeployment.warnings.length}`);
    }

    if (report.recentDeployments.length > 0) {
      console.log('\n📈 RECENT DEPLOYMENTS:');
      report.recentDeployments.forEach(d => {
        const status = d.status === 'success' ? '✅' : '❌';
        console.log(
          `${status} ${d.id} - ${d.duration}s - ${d.errorCount} errors, ${d.warningCount} warnings`
        );
      });
    }

    if (report.recentAlerts.length > 0) {
      console.log('\n🚨 RECENT ALERTS:');
      report.recentAlerts.forEach(alert => {
        console.log(`⚠️  ${alert.type}: ${alert.message} (${alert.timestamp})`);
      });
    }

    return report;
  }

  // Cleanup old logs and data
  cleanup(daysToKeep = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    // Clean up deployment history
    this.deploymentHistory.deployments =
      this.deploymentHistory.deployments.filter(d => {
        return new Date(d.startTime) > cutoffDate;
      });

    // Clean up log files
    this.cleanupLogFile(cutoffDate);

    this.saveDeploymentHistory();
    this.log(`Cleaned up data older than ${daysToKeep} days`, 'info');
  }

  cleanupLogFile(cutoffDate) {
    try {
      if (!fs.existsSync(this.logFile)) {
        return;
      }

      const logs = fs
        .readFileSync(this.logFile, 'utf8')
        .split('\n')
        .filter(line => line.trim())
        .map(line => JSON.parse(line))
        .filter(log => new Date(log.timestamp) > cutoffDate);

      const newContent = logs.map(log => JSON.stringify(log)).join('\n') + '\n';
      fs.writeFileSync(this.logFile, newContent);
    } catch (error) {
      this.log('Failed to cleanup log file', 'warning', {
        error: error.message,
      });
    }
  }
}

// CLI interface
if (require.main === module) {
  const command = process.argv[2];
  const monitor = new DeploymentLogMonitor();

  switch (command) {
    case 'start':
      const deploymentId = process.argv[3];
      monitor.startDeploymentMonitoring(deploymentId);
      break;

    case 'phase':
      const phase = process.argv[3];
      const status = process.argv[4];
      const duration = process.argv[5] ? parseFloat(process.argv[5]) : null;
      monitor.updateDeploymentPhase(phase, status, duration);
      break;

    case 'complete':
      const finalStatus = process.argv[3] || 'success';
      monitor.completeDeployment(finalStatus);
      break;

    case 'status':
      monitor.printStatusReport();
      break;

    case 'cleanup':
      const days = process.argv[3] ? parseInt(process.argv[3]) : 30;
      monitor.cleanup(days);
      break;

    default:
      console.log('Usage:');
      console.log('  node deployment-log-monitor.js start [deploymentId]');
      console.log(
        '  node deployment-log-monitor.js phase <phase> <status> [duration]'
      );
      console.log('  node deployment-log-monitor.js complete [status]');
      console.log('  node deployment-log-monitor.js status');
      console.log('  node deployment-log-monitor.js cleanup [days]');
      break;
  }
}

module.exports = DeploymentLogMonitor;
