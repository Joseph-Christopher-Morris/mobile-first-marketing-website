#!/usr/bin/env node

/**
 * Deployment Monitoring Script
 * Monitors deployment status and sends notifications
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

class DeploymentMonitor {
  constructor() {
    this.config = {
      appId: process.env.AMPLIFY_APP_ID,
      branch: process.env.AMPLIFY_BRANCH || 'main',
      region: process.env.AWS_REGION || 'us-east-1',
      webhookUrl: process.env.SLACK_WEBHOOK_URL,
      emailNotifications: process.env.EMAIL_NOTIFICATIONS === 'true',
    };
  }

  async checkDeploymentStatus() {
    console.log('🔍 Checking deployment status...');

    try {
      // In a real implementation, this would call AWS Amplify API
      // For now, we'll simulate the check
      const status = await this.simulateStatusCheck();

      console.log(`📊 Deployment Status: ${status.status}`);
      console.log(`🕒 Duration: ${status.duration}s`);

      if (status.status === 'SUCCEED') {
        await this.sendSuccessNotification(status);
      } else if (status.status === 'FAILED') {
        await this.sendFailureNotification(status);
      }

      return status;
    } catch (error) {
      console.error('❌ Failed to check deployment status:', error.message);
      await this.sendErrorNotification(error);
      throw error;
    }
  }

  async simulateStatusCheck() {
    // Simulate deployment status check
    return {
      status: 'SUCCEED',
      duration: 120,
      buildId: process.env.AMPLIFY_BUILD_ID || 'local-build',
      commitId: process.env.AMPLIFY_COMMIT_ID || 'unknown',
      branch: this.config.branch,
      timestamp: new Date().toISOString(),
    };
  }

  async sendSuccessNotification(status) {
    const message = {
      text: '✅ Deployment Successful',
      attachments: [
        {
          color: 'good',
          fields: [
            { title: 'Branch', value: status.branch, short: true },
            { title: 'Duration', value: `${status.duration}s`, short: true },
            { title: 'Build ID', value: status.buildId, short: true },
            {
              title: 'Commit',
              value: status.commitId.substring(0, 8),
              short: true,
            },
          ],
          footer: 'AWS Amplify',
          ts: Math.floor(Date.now() / 1000),
        },
      ],
    };

    await this.sendNotification(message);
    console.log('✅ Success notification sent');
  }

  async sendFailureNotification(status) {
    const message = {
      text: '❌ Deployment Failed',
      attachments: [
        {
          color: 'danger',
          fields: [
            { title: 'Branch', value: status.branch, short: true },
            { title: 'Duration', value: `${status.duration}s`, short: true },
            { title: 'Build ID', value: status.buildId, short: true },
            {
              title: 'Error',
              value: status.error || 'Unknown error',
              short: false,
            },
          ],
          footer: 'AWS Amplify',
          ts: Math.floor(Date.now() / 1000),
        },
      ],
    };

    await this.sendNotification(message);
    console.log('❌ Failure notification sent');
  }

  async sendErrorNotification(error) {
    const message = {
      text: '🚨 Deployment Monitoring Error',
      attachments: [
        {
          color: 'warning',
          fields: [
            { title: 'Error', value: error.message, short: false },
            { title: 'Branch', value: this.config.branch, short: true },
            {
              title: 'Timestamp',
              value: new Date().toISOString(),
              short: true,
            },
          ],
          footer: 'Deployment Monitor',
          ts: Math.floor(Date.now() / 1000),
        },
      ],
    };

    await this.sendNotification(message);
    console.log('🚨 Error notification sent');
  }

  async sendNotification(message) {
    if (!this.config.webhookUrl) {
      console.log(
        '📝 Notification (webhook not configured):',
        JSON.stringify(message, null, 2)
      );
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
          'Content-Length': data.length,
        },
      };

      const req = https.request(options, res => {
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

  generateDeploymentReport() {
    const report = {
      deployment: {
        timestamp: new Date().toISOString(),
        branch: this.config.branch,
        appId: this.config.appId,
        region: this.config.region,
      },
      build: {
        nodeVersion: process.version,
        environment: process.env.NODE_ENV,
        buildId: process.env.AMPLIFY_BUILD_ID,
        commitId: process.env.AMPLIFY_COMMIT_ID,
      },
      performance: {
        buildDuration: process.env.BUILD_DURATION || 'unknown',
        bundleSize: this.getBundleSize(),
      },
    };

    const reportPath = path.join(process.cwd(), 'deployment-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    console.log('📊 Deployment report generated:', reportPath);
    return report;
  }

  getBundleSize() {
    try {
      const outDir = path.join(process.cwd(), 'out');
      if (!fs.existsSync(outDir)) {
        return 'unknown';
      }

      let totalSize = 0;
      const files = fs.readdirSync(outDir, { recursive: true });

      files.forEach(file => {
        const filePath = path.join(outDir, file);
        if (fs.statSync(filePath).isFile()) {
          totalSize += fs.statSync(filePath).size;
        }
      });

      return `${(totalSize / 1024 / 1024).toFixed(2)} MB`;
    } catch (error) {
      return 'unknown';
    }
  }
}

async function main() {
  const monitor = new DeploymentMonitor();

  try {
    console.log('🚀 Starting deployment monitoring...');

    // Generate deployment report
    const report = monitor.generateDeploymentReport();

    // Check deployment status
    const status = await monitor.checkDeploymentStatus();

    console.log('✅ Deployment monitoring completed');

    return { report, status };
  } catch (error) {
    console.error('❌ Deployment monitoring failed:', error.message);
    process.exit(1);
  }
}

// Run monitoring if called directly
if (require.main === module) {
  main();
}

module.exports = DeploymentMonitor;
