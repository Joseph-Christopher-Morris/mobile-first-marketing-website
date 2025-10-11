#!/usr/bin/env node

/**
 * Deployment Notifications Setup Script
 *
 * This script helps configure various notification channels for deployment
 * status updates and alerts.
 */

const fs = require('fs');
const path = require('path');

class NotificationSetup {
  constructor() {
    this.configDir = '.kiro/deployment-notifications';
    this.configFile = path.join(this.configDir, 'config.json');
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = {
      info: '📋',
      success: '✅',
      warning: '⚠️',
      error: '❌',
    }[type];

    console.log(`${prefix} [${timestamp}] ${message}`);
  }

  /**
   * Create default notification configuration
   */
  createDefaultConfig() {
    const defaultConfig = {
      enabled: true,
      channels: {
        console: {
          enabled: true,
          level: 'info', // info, warning, error
        },
        file: {
          enabled: true,
          directory: '.kiro/deployment-notifications',
          retention: 30, // days
        },
        slack: {
          enabled: false,
          webhookUrl: '',
          channel: '#deployments',
          username: 'DeployBot',
          icon: ':rocket:',
          notifyOn: ['success', 'failure'],
        },
        discord: {
          enabled: false,
          webhookUrl: '',
          username: 'DeployBot',
          avatar: '',
          notifyOn: ['success', 'failure'],
        },
        email: {
          enabled: false,
          smtp: {
            host: '',
            port: 587,
            secure: false,
            auth: {
              user: '',
              pass: '',
            },
          },
          from: '',
          to: [],
          notifyOn: ['failure'],
        },
        webhook: {
          enabled: false,
          url: '',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          notifyOn: ['success', 'failure'],
        },
      },
      templates: {
        success: {
          title: '✅ Deployment Successful',
          message: 'Deployment to {{environment}} completed successfully',
          fields: [
            { name: 'Environment', value: '{{environment}}', inline: true },
            { name: 'Deployment ID', value: '{{deploymentId}}', inline: true },
            { name: 'Site URL', value: '{{siteUrl}}', inline: false },
            { name: 'Deployed by', value: '{{actor}}', inline: true },
            { name: 'Branch', value: '{{ref}}', inline: true },
          ],
        },
        failure: {
          title: '❌ Deployment Failed',
          message: 'Deployment to {{environment}} failed',
          fields: [
            { name: 'Environment', value: '{{environment}}', inline: true },
            { name: 'Deployment ID', value: '{{deploymentId}}', inline: true },
            {
              name: 'Failure Reason',
              value: '{{failureReason}}',
              inline: false,
            },
            { name: 'Deployed by', value: '{{actor}}', inline: true },
            { name: 'Branch', value: '{{ref}}', inline: true },
          ],
        },
      },
    };

    return defaultConfig;
  }

  /**
   * Initialize notification configuration
   */
  async initialize() {
    this.log('Initializing deployment notifications...', 'info');

    // Create configuration directory
    if (!fs.existsSync(this.configDir)) {
      fs.mkdirSync(this.configDir, { recursive: true });
      this.log(`Created configuration directory: ${this.configDir}`, 'success');
    }

    // Create default configuration if it doesn't exist
    if (!fs.existsSync(this.configFile)) {
      const defaultConfig = this.createDefaultConfig();
      fs.writeFileSync(this.configFile, JSON.stringify(defaultConfig, null, 2));
      this.log(`Created default configuration: ${this.configFile}`, 'success');
    } else {
      this.log('Configuration file already exists', 'info');
    }

    // Create notification templates directory
    const templatesDir = path.join(this.configDir, 'templates');
    if (!fs.existsSync(templatesDir)) {
      fs.mkdirSync(templatesDir, { recursive: true });
      this.createTemplateFiles(templatesDir);
    }

    this.log('Notification setup completed', 'success');
  }

  /**
   * Create template files for different notification types
   */
  createTemplateFiles(templatesDir) {
    // Slack template
    const slackTemplate = {
      success: {
        text: 'Deployment Successful! :rocket:',
        attachments: [
          {
            color: 'good',
            fields: [
              { title: 'Environment', value: '{{environment}}', short: true },
              {
                title: 'Deployment ID',
                value: '{{deploymentId}}',
                short: true,
              },
              { title: 'Site URL', value: '{{siteUrl}}', short: false },
              { title: 'Deployed by', value: '{{actor}}', short: true },
              { title: 'Branch', value: '{{ref}}', short: true },
            ],
            footer: 'Deployment Bot',
            ts: '{{timestamp}}',
          },
        ],
      },
      failure: {
        text: 'Deployment Failed! :x:',
        attachments: [
          {
            color: 'danger',
            fields: [
              { title: 'Environment', value: '{{environment}}', short: true },
              {
                title: 'Deployment ID',
                value: '{{deploymentId}}',
                short: true,
              },
              {
                title: 'Failure Reason',
                value: '{{failureReason}}',
                short: false,
              },
              { title: 'Deployed by', value: '{{actor}}', short: true },
              { title: 'Branch', value: '{{ref}}', short: true },
            ],
            footer: 'Deployment Bot',
            ts: '{{timestamp}}',
          },
        ],
      },
    };

    fs.writeFileSync(
      path.join(templatesDir, 'slack.json'),
      JSON.stringify(slackTemplate, null, 2)
    );

    // Discord template
    const discordTemplate = {
      success: {
        embeds: [
          {
            title: '✅ Deployment Successful',
            description: 'Deployment to {{environment}} completed successfully',
            color: 3066993, // Green
            fields: [
              { name: 'Environment', value: '{{environment}}', inline: true },
              {
                name: 'Deployment ID',
                value: '{{deploymentId}}',
                inline: true,
              },
              { name: 'Site URL', value: '{{siteUrl}}', inline: false },
              { name: 'Deployed by', value: '{{actor}}', inline: true },
              { name: 'Branch', value: '{{ref}}', inline: true },
            ],
            footer: { text: 'Deployment Bot' },
            timestamp: '{{timestamp}}',
          },
        ],
      },
      failure: {
        embeds: [
          {
            title: '❌ Deployment Failed',
            description: 'Deployment to {{environment}} failed',
            color: 15158332, // Red
            fields: [
              { name: 'Environment', value: '{{environment}}', inline: true },
              {
                name: 'Deployment ID',
                value: '{{deploymentId}}',
                inline: true,
              },
              {
                name: 'Failure Reason',
                value: '{{failureReason}}',
                inline: false,
              },
              { name: 'Deployed by', value: '{{actor}}', inline: true },
              { name: 'Branch', value: '{{ref}}', inline: true },
            ],
            footer: { text: 'Deployment Bot' },
            timestamp: '{{timestamp}}',
          },
        ],
      },
    };

    fs.writeFileSync(
      path.join(templatesDir, 'discord.json'),
      JSON.stringify(discordTemplate, null, 2)
    );

    // Email template
    const emailTemplate = {
      success: {
        subject: '✅ Deployment Successful - {{environment}}',
        html: `
          <h2>✅ Deployment Successful</h2>
          <p>Deployment to <strong>{{environment}}</strong> completed successfully.</p>
          <table>
            <tr><td><strong>Environment:</strong></td><td>{{environment}}</td></tr>
            <tr><td><strong>Deployment ID:</strong></td><td>{{deploymentId}}</td></tr>
            <tr><td><strong>Site URL:</strong></td><td><a href="{{siteUrl}}">{{siteUrl}}</a></td></tr>
            <tr><td><strong>Deployed by:</strong></td><td>{{actor}}</td></tr>
            <tr><td><strong>Branch:</strong></td><td>{{ref}}</td></tr>
            <tr><td><strong>Timestamp:</strong></td><td>{{timestamp}}</td></tr>
          </table>
        `,
        text: `
          Deployment Successful
          
          Environment: {{environment}}
          Deployment ID: {{deploymentId}}
          Site URL: {{siteUrl}}
          Deployed by: {{actor}}
          Branch: {{ref}}
          Timestamp: {{timestamp}}
        `,
      },
      failure: {
        subject: '❌ Deployment Failed - {{environment}}',
        html: `
          <h2>❌ Deployment Failed</h2>
          <p>Deployment to <strong>{{environment}}</strong> failed.</p>
          <table>
            <tr><td><strong>Environment:</strong></td><td>{{environment}}</td></tr>
            <tr><td><strong>Deployment ID:</strong></td><td>{{deploymentId}}</td></tr>
            <tr><td><strong>Failure Reason:</strong></td><td>{{failureReason}}</td></tr>
            <tr><td><strong>Deployed by:</strong></td><td>{{actor}}</td></tr>
            <tr><td><strong>Branch:</strong></td><td>{{ref}}</td></tr>
            <tr><td><strong>Timestamp:</strong></td><td>{{timestamp}}</td></tr>
          </table>
        `,
        text: `
          Deployment Failed
          
          Environment: {{environment}}
          Deployment ID: {{deploymentId}}
          Failure Reason: {{failureReason}}
          Deployed by: {{actor}}
          Branch: {{ref}}
          Timestamp: {{timestamp}}
        `,
      },
    };

    fs.writeFileSync(
      path.join(templatesDir, 'email.json'),
      JSON.stringify(emailTemplate, null, 2)
    );

    this.log('Created notification templates', 'success');
  }

  /**
   * Display configuration instructions
   */
  displayInstructions() {
    console.log('\n📋 Notification Configuration Instructions');
    console.log('='.repeat(50));
    console.log('\n1. Edit the configuration file:');
    console.log(`   ${this.configFile}`);
    console.log('\n2. Enable desired notification channels');
    console.log('\n3. Configure channel-specific settings:');
    console.log('   • Slack: Add webhook URL and channel');
    console.log('   • Discord: Add webhook URL');
    console.log('   • Email: Configure SMTP settings');
    console.log('   • Webhook: Add custom webhook URL');
    console.log('\n4. Test notifications:');
    console.log('   npm run deploy:test-notifications');
    console.log('\n5. Customize templates in:');
    console.log(`   ${path.join(this.configDir, 'templates')}/`);
    console.log('\n📚 For detailed setup instructions, see:');
    console.log('   docs/deployment-notifications-setup.md');
  }

  /**
   * Run the setup process
   */
  async run() {
    console.log('🔔 Deployment Notifications Setup\n');

    try {
      await this.initialize();
      this.displayInstructions();

      this.log('Setup completed successfully!', 'success');
    } catch (error) {
      this.log(`Setup failed: ${error.message}`, 'error');
      process.exit(1);
    }
  }
}

// CLI execution
if (require.main === module) {
  const setup = new NotificationSetup();
  setup.run().catch(error => {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  });
}

module.exports = NotificationSetup;
