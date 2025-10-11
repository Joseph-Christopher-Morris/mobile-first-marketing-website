#!/usr/bin/env node

/**
 * Deployment Dashboard
 *
 * This script creates a real-time dashboard for monitoring AWS Amplify deployments
 * and provides visual status tracking.
 */

const fs = require('fs');
const path = require('path');
const DeploymentLogMonitor = require('./deployment-log-monitor');

class DeploymentDashboard {
  constructor() {
    this.monitor = new DeploymentLogMonitor();
    this.refreshInterval = 5000; // 5 seconds
    this.isRunning = false;
  }

  clearScreen() {
    process.stdout.write('\x1b[2J\x1b[0f');
  }

  colorize(text, color) {
    const colors = {
      red: '\x1b[31m',
      green: '\x1b[32m',
      yellow: '\x1b[33m',
      blue: '\x1b[34m',
      magenta: '\x1b[35m',
      cyan: '\x1b[36m',
      white: '\x1b[37m',
      reset: '\x1b[0m',
      bright: '\x1b[1m',
      dim: '\x1b[2m',
    };

    return `${colors[color] || colors.white}${text}${colors.reset}`;
  }

  formatDuration(seconds) {
    if (!seconds) return 'N/A';

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    }
    return `${remainingSeconds}s`;
  }

  formatTimestamp(timestamp) {
    if (!timestamp) return 'N/A';

    const date = new Date(timestamp);
    return date.toLocaleString();
  }

  getStatusIcon(status) {
    const icons = {
      success: '✅',
      failed: '❌',
      in_progress: '🔄',
      pending: '⏳',
      cancelled: '⚠️',
    };

    return icons[status] || '❓';
  }

  getPhaseIcon(phase) {
    const icons = {
      provision: '🏗️',
      prebuild: '🔧',
      build: '⚙️',
      postbuild: '🔨',
      deploy: '🚀',
      test: '🧪',
    };

    return icons[phase.toLowerCase()] || '📋';
  }

  renderHeader() {
    const now = new Date().toLocaleString();
    const title = 'AWS AMPLIFY DEPLOYMENT DASHBOARD';

    console.log(this.colorize('═'.repeat(80), 'cyan'));
    console.log(
      this.colorize(`${title.padStart((80 + title.length) / 2)}`, 'bright')
    );
    console.log(
      this.colorize(
        `Last Updated: ${now}`.padStart((80 + now.length + 14) / 2),
        'dim'
      )
    );
    console.log(this.colorize('═'.repeat(80), 'cyan'));
  }

  renderCurrentDeployment(deployment) {
    if (!deployment) {
      console.log(this.colorize('\n📊 CURRENT DEPLOYMENT: None', 'yellow'));
      return;
    }

    const duration = deployment.startTime
      ? (Date.now() - new Date(deployment.startTime)) / 1000
      : 0;

    console.log(this.colorize('\n📊 CURRENT DEPLOYMENT', 'bright'));
    console.log(this.colorize('─'.repeat(40), 'dim'));

    console.log(
      `${this.getStatusIcon(deployment.status)} Status: ${this.colorize(
        deployment.status.toUpperCase(),
        deployment.status === 'success'
          ? 'green'
          : deployment.status === 'failed'
            ? 'red'
            : 'yellow'
      )}`
    );

    console.log(`🆔 ID: ${deployment.id}`);
    console.log(`⏰ Started: ${this.formatTimestamp(deployment.startTime)}`);
    console.log(`⏱️  Duration: ${this.formatDuration(duration)}`);
    console.log(
      `❌ Errors: ${this.colorize(
        deployment.errors?.length || 0,
        (deployment.errors?.length || 0) > 0 ? 'red' : 'green'
      )}`
    );
    console.log(
      `⚠️  Warnings: ${this.colorize(
        deployment.warnings?.length || 0,
        (deployment.warnings?.length || 0) > 0 ? 'yellow' : 'green'
      )}`
    );

    // Render phases
    if (deployment.phases && Object.keys(deployment.phases).length > 0) {
      console.log('\n🔄 PHASES:');
      Object.entries(deployment.phases).forEach(([phase, info]) => {
        const icon = this.getPhaseIcon(phase);
        const statusIcon = this.getStatusIcon(info.status);
        const durationText = info.duration
          ? ` (${this.formatDuration(info.duration)})`
          : '';

        console.log(
          `  ${icon} ${statusIcon} ${phase.toUpperCase()}${durationText}`
        );
      });
    }
  }

  renderStatistics(stats) {
    console.log(this.colorize('\n📈 DEPLOYMENT STATISTICS', 'bright'));
    console.log(this.colorize('─'.repeat(40), 'dim'));

    const successRate =
      stats.totalDeployments > 0
        ? (
            (stats.successfulDeployments / stats.totalDeployments) *
            100
          ).toFixed(1)
        : 0;

    console.log(`📊 Total Deployments: ${stats.totalDeployments}`);
    console.log(
      `✅ Successful: ${this.colorize(stats.successfulDeployments, 'green')}`
    );
    console.log(`❌ Failed: ${this.colorize(stats.failedDeployments, 'red')}`);
    console.log(
      `📊 Success Rate: ${this.colorize(
        successRate + '%',
        successRate >= 90 ? 'green' : successRate >= 70 ? 'yellow' : 'red'
      )}`
    );
    console.log(
      `⏱️  Avg Build Time: ${this.formatDuration(stats.averageBuildTime)}`
    );
  }

  renderRecentDeployments(deployments) {
    if (!deployments || deployments.length === 0) {
      return;
    }

    console.log(this.colorize('\n📋 RECENT DEPLOYMENTS', 'bright'));
    console.log(this.colorize('─'.repeat(80), 'dim'));

    const headers = [
      'Status',
      'ID',
      'Duration',
      'Started',
      'Errors',
      'Warnings',
    ];
    console.log(headers.map(h => this.colorize(h.padEnd(12), 'cyan')).join(''));
    console.log(this.colorize('─'.repeat(80), 'dim'));

    deployments
      .slice(-10)
      .reverse()
      .forEach(deployment => {
        const status = this.getStatusIcon(deployment.status);
        const id = deployment.id.substring(0, 15) + '...';
        const duration = this.formatDuration(deployment.duration);
        const started = deployment.startTime
          ? new Date(deployment.startTime).toLocaleTimeString()
          : 'N/A';
        const errors = deployment.errors?.length || 0;
        const warnings = deployment.warnings?.length || 0;

        const row = [
          status.padEnd(12),
          id.padEnd(12),
          duration.padEnd(12),
          started.padEnd(12),
          this.colorize(
            errors.toString().padEnd(12),
            errors > 0 ? 'red' : 'green'
          ),
          this.colorize(
            warnings.toString().padEnd(12),
            warnings > 0 ? 'yellow' : 'green'
          ),
        ];

        console.log(row.join(''));
      });
  }

  renderAlerts(alerts) {
    if (!alerts || alerts.length === 0) {
      return;
    }

    console.log(this.colorize('\n🚨 RECENT ALERTS', 'bright'));
    console.log(this.colorize('─'.repeat(80), 'dim'));

    alerts
      .slice(-5)
      .reverse()
      .forEach(alert => {
        const time = new Date(alert.timestamp).toLocaleTimeString();
        const type = alert.type.replace('_', ' ').toUpperCase();

        console.log(`🚨 ${this.colorize(type, 'red')} [${time}]`);
        console.log(`   ${alert.message}`);
      });
  }

  renderBuildProgress() {
    const deployment = this.monitor.currentDeployment;
    if (!deployment || deployment.status !== 'in_progress') {
      return;
    }

    console.log(this.colorize('\n⏳ BUILD PROGRESS', 'bright'));
    console.log(this.colorize('─'.repeat(40), 'dim'));

    const phases = ['provision', 'prebuild', 'build', 'postbuild', 'deploy'];
    const currentPhases = deployment.phases || {};

    phases.forEach(phase => {
      const phaseInfo = currentPhases[phase];
      let status = '⏳ Pending';
      let color = 'dim';

      if (phaseInfo) {
        switch (phaseInfo.status) {
          case 'success':
            status = '✅ Complete';
            color = 'green';
            break;
          case 'failed':
            status = '❌ Failed';
            color = 'red';
            break;
          case 'in_progress':
            status = '🔄 Running';
            color = 'yellow';
            break;
        }
      }

      console.log(
        `${this.getPhaseIcon(phase)} ${phase.toUpperCase().padEnd(12)} ${this.colorize(status, color)}`
      );
    });
  }

  renderFooter() {
    console.log(this.colorize('\n═'.repeat(80), 'cyan'));
    console.log(
      this.colorize('Press Ctrl+C to exit | Refreshes every 5 seconds', 'dim')
    );
  }

  renderDashboard() {
    this.clearScreen();

    const status = this.monitor.getDeploymentStatus();

    this.renderHeader();
    this.renderCurrentDeployment(status.current);
    this.renderBuildProgress();
    this.renderStatistics(status.history.statistics);
    this.renderRecentDeployments(status.history.deployments);
    this.renderAlerts(status.alerts);
    this.renderFooter();
  }

  start() {
    if (this.isRunning) {
      return;
    }

    this.isRunning = true;

    // Initial render
    this.renderDashboard();

    // Set up refresh interval
    this.intervalId = setInterval(() => {
      if (this.isRunning) {
        this.renderDashboard();
      }
    }, this.refreshInterval);

    // Handle Ctrl+C
    process.on('SIGINT', () => {
      this.stop();
    });

    console.log('\nDashboard started. Press Ctrl+C to exit.');
  }

  stop() {
    if (!this.isRunning) {
      return;
    }

    this.isRunning = false;

    if (this.intervalId) {
      clearInterval(this.intervalId);
    }

    this.clearScreen();
    console.log(this.colorize('Dashboard stopped.', 'yellow'));
    process.exit(0);
  }

  // Static dashboard (single render)
  static() {
    this.renderDashboard();
  }

  // Export dashboard data as JSON
  exportData() {
    const status = this.monitor.getDeploymentStatus();
    const exportFile = path.join(
      process.cwd(),
      'deployment-dashboard-export.json'
    );

    const exportData = {
      timestamp: new Date().toISOString(),
      ...status,
    };

    try {
      fs.writeFileSync(exportFile, JSON.stringify(exportData, null, 2));
      console.log(`Dashboard data exported to: ${exportFile}`);
    } catch (error) {
      console.error('Failed to export dashboard data:', error.message);
    }
  }

  // Generate HTML dashboard
  generateHtmlDashboard() {
    const status = this.monitor.getDeploymentStatus();

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AWS Amplify Deployment Dashboard</title>
    <style>
        body { font-family: 'Courier New', monospace; background: #1a1a1a; color: #fff; margin: 20px; }
        .header { text-align: center; border-bottom: 2px solid #00ffff; padding-bottom: 10px; }
        .section { margin: 20px 0; padding: 15px; border: 1px solid #333; border-radius: 5px; }
        .success { color: #00ff00; }
        .error { color: #ff0000; }
        .warning { color: #ffff00; }
        .info { color: #00ffff; }
        .dim { color: #666; }
        table { width: 100%; border-collapse: collapse; }
        th, td { padding: 8px; text-align: left; border-bottom: 1px solid #333; }
        .status-icon { font-size: 1.2em; }
        .refresh-info { text-align: center; margin-top: 20px; color: #666; }
    </style>
    <script>
        // Auto-refresh every 30 seconds
        setTimeout(() => location.reload(), 30000);
    </script>
</head>
<body>
    <div class="header">
        <h1>🚀 AWS Amplify Deployment Dashboard</h1>
        <p class="dim">Last Updated: ${new Date().toLocaleString()}</p>
    </div>

    ${
      status.current
        ? `
    <div class="section">
        <h2>📊 Current Deployment</h2>
        <p><strong>Status:</strong> <span class="${status.current.status === 'success' ? 'success' : status.current.status === 'failed' ? 'error' : 'warning'}">${status.current.status.toUpperCase()}</span></p>
        <p><strong>ID:</strong> ${status.current.id}</p>
        <p><strong>Started:</strong> ${this.formatTimestamp(status.current.startTime)}</p>
        <p><strong>Errors:</strong> <span class="${status.current.errors?.length > 0 ? 'error' : 'success'}">${status.current.errors?.length || 0}</span></p>
        <p><strong>Warnings:</strong> <span class="${status.current.warnings?.length > 0 ? 'warning' : 'success'}">${status.current.warnings?.length || 0}</span></p>
    </div>
    `
        : '<div class="section"><h2>📊 Current Deployment</h2><p>No active deployment</p></div>'
    }

    <div class="section">
        <h2>📈 Statistics</h2>
        <p><strong>Total Deployments:</strong> ${status.history.statistics.totalDeployments}</p>
        <p><strong>Successful:</strong> <span class="success">${status.history.statistics.successfulDeployments}</span></p>
        <p><strong>Failed:</strong> <span class="error">${status.history.statistics.failedDeployments}</span></p>
        <p><strong>Success Rate:</strong> ${status.history.statistics.totalDeployments > 0 ? ((status.history.statistics.successfulDeployments / status.history.statistics.totalDeployments) * 100).toFixed(1) + '%' : 'N/A'}</p>
        <p><strong>Average Build Time:</strong> ${this.formatDuration(status.history.statistics.averageBuildTime)}</p>
    </div>

    ${
      status.history.deployments.length > 0
        ? `
    <div class="section">
        <h2>📋 Recent Deployments</h2>
        <table>
            <tr>
                <th>Status</th>
                <th>ID</th>
                <th>Duration</th>
                <th>Started</th>
                <th>Errors</th>
                <th>Warnings</th>
            </tr>
            ${status.history.deployments
              .slice(-10)
              .reverse()
              .map(
                d => `
            <tr>
                <td class="status-icon">${this.getStatusIcon(d.status)}</td>
                <td>${d.id}</td>
                <td>${this.formatDuration(d.duration)}</td>
                <td>${this.formatTimestamp(d.startTime)}</td>
                <td class="${d.errors?.length > 0 ? 'error' : 'success'}">${d.errors?.length || 0}</td>
                <td class="${d.warnings?.length > 0 ? 'warning' : 'success'}">${d.warnings?.length || 0}</td>
            </tr>
            `
              )
              .join('')}
        </table>
    </div>
    `
        : ''
    }

    <div class="refresh-info">
        <p>Dashboard auto-refreshes every 30 seconds</p>
    </div>
</body>
</html>`;

    const htmlFile = path.join(process.cwd(), 'deployment-dashboard.html');

    try {
      fs.writeFileSync(htmlFile, html);
      console.log(`HTML dashboard generated: ${htmlFile}`);
      console.log('Open this file in your browser to view the dashboard');
    } catch (error) {
      console.error('Failed to generate HTML dashboard:', error.message);
    }
  }
}

// CLI interface
if (require.main === module) {
  const command = process.argv[2];
  const dashboard = new DeploymentDashboard();

  switch (command) {
    case 'start':
    case 'live':
      dashboard.start();
      break;

    case 'static':
    case 'show':
      dashboard.static();
      break;

    case 'export':
      dashboard.exportData();
      break;

    case 'html':
      dashboard.generateHtmlDashboard();
      break;

    default:
      console.log('AWS Amplify Deployment Dashboard');
      console.log('');
      console.log('Usage:');
      console.log(
        '  node deployment-dashboard.js start    - Start live dashboard'
      );
      console.log(
        '  node deployment-dashboard.js static   - Show current status'
      );
      console.log(
        '  node deployment-dashboard.js export   - Export data to JSON'
      );
      console.log(
        '  node deployment-dashboard.js html     - Generate HTML dashboard'
      );
      break;
  }
}

module.exports = DeploymentDashboard;
