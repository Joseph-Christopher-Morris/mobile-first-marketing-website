# Deployment Notifications Setup Guide

This guide explains how to configure deployment notifications for the
S3/CloudFront deployment pipeline.

## Overview

The deployment pipeline includes comprehensive notification capabilities to keep
your team informed about deployment status, failures, and important events.
Notifications can be sent to multiple channels including Slack, Discord, email,
and custom webhooks.

## Quick Setup

1. **Initialize notification configuration:**

   ```bash
   npm run deploy:notifications:setup
   ```

2. **Edit the configuration file:**

   ```bash
   # Edit .kiro/deployment-notifications/config.json
   ```

3. **Test notifications:**
   ```bash
   npm run deploy:validate
   ```

## Configuration

### Configuration File Location

The main configuration file is located at:

```
.kiro/deployment-notifications/config.json
```

### Basic Configuration Structure

```json
{
  "enabled": true,
  "channels": {
    "console": { "enabled": true },
    "file": { "enabled": true },
    "slack": { "enabled": false },
    "discord": { "enabled": false },
    "email": { "enabled": false },
    "webhook": { "enabled": false }
  }
}
```

## Channel Configuration

### Console Notifications

Always enabled by default. Provides real-time feedback during deployment.

```json
{
  "console": {
    "enabled": true,
    "level": "info"
  }
}
```

### File Notifications

Saves deployment notifications to files for audit and debugging purposes.

```json
{
  "file": {
    "enabled": true,
    "directory": ".kiro/deployment-notifications",
    "retention": 30
  }
}
```

### Slack Integration

Configure Slack webhook for team notifications:

```json
{
  "slack": {
    "enabled": true,
    "webhookUrl": "https://hooks.slack.com/services/YOUR/WEBHOOK/URL",
    "channel": "#deployments",
    "username": "DeployBot",
    "icon": ":rocket:",
    "notifyOn": ["success", "failure"]
  }
}
```

**Setup Steps:**

1. Go to your Slack workspace
2. Create a new app or use existing one
3. Enable Incoming Webhooks
4. Create a webhook for your desired channel
5. Copy the webhook URL to the configuration

### Discord Integration

Configure Discord webhook for team notifications:

```json
{
  "discord": {
    "enabled": true,
    "webhookUrl": "https://discord.com/api/webhooks/YOUR/WEBHOOK/URL",
    "username": "DeployBot",
    "avatar": "",
    "notifyOn": ["success", "failure"]
  }
}
```

**Setup Steps:**

1. Go to your Discord server
2. Navigate to Server Settings → Integrations → Webhooks
3. Create a new webhook
4. Copy the webhook URL to the configuration

### Email Notifications

Configure SMTP for email notifications:

```json
{
  "email": {
    "enabled": true,
    "smtp": {
      "host": "smtp.gmail.com",
      "port": 587,
      "secure": false,
      "auth": {
        "user": "your-email@gmail.com",
        "pass": "your-app-password"
      }
    },
    "from": "deployments@yourcompany.com",
    "to": ["team@yourcompany.com", "ops@yourcompany.com"],
    "notifyOn": ["failure"]
  }
}
```

**Common SMTP Providers:**

**Gmail:**

```json
{
  "host": "smtp.gmail.com",
  "port": 587,
  "secure": false
}
```

**Outlook/Hotmail:**

```json
{
  "host": "smtp-mail.outlook.com",
  "port": 587,
  "secure": false
}
```

**SendGrid:**

```json
{
  "host": "smtp.sendgrid.net",
  "port": 587,
  "secure": false,
  "auth": {
    "user": "apikey",
    "pass": "your-sendgrid-api-key"
  }
}
```

### Custom Webhook

Configure custom webhook for integration with other systems:

```json
{
  "webhook": {
    "enabled": true,
    "url": "https://your-monitoring-system.com/webhooks/deployments",
    "method": "POST",
    "headers": {
      "Content-Type": "application/json",
      "Authorization": "Bearer your-token"
    },
    "notifyOn": ["success", "failure"]
  }
}
```

## Notification Templates

Templates are located in `.kiro/deployment-notifications/templates/` and can be
customized for each channel.

### Template Variables

The following variables are available in all templates:

- `{{environment}}` - Deployment environment (production, staging)
- `{{deploymentId}}` - Unique deployment identifier
- `{{siteUrl}}` - URL of the deployed site
- `{{actor}}` - Person who triggered the deployment
- `{{ref}}` - Git branch or reference
- `{{timestamp}}` - Deployment timestamp
- `{{failureReason}}` - Reason for failure (failure notifications only)

### Customizing Templates

1. **Edit template files:**

   ```bash
   # Slack template
   .kiro/deployment-notifications/templates/slack.json

   # Discord template
   .kiro/deployment-notifications/templates/discord.json

   # Email template
   .kiro/deployment-notifications/templates/email.json
   ```

2. **Use template variables:**

   ```json
   {
     "text": "Deployment to {{environment}} completed by {{actor}}"
   }
   ```

3. **Test your templates:**
   ```bash
   npm run deploy:validate
   ```

## GitHub Secrets Configuration

For production deployments, store sensitive configuration in GitHub Secrets:

### Required Secrets

1. **SLACK_WEBHOOK_URL** (if using Slack)
   - Your Slack webhook URL

2. **DISCORD_WEBHOOK_URL** (if using Discord)
   - Your Discord webhook URL

3. **SMTP_PASSWORD** (if using email)
   - SMTP password or app-specific password

4. **WEBHOOK_TOKEN** (if using custom webhook)
   - Authentication token for custom webhook

### Environment Variables in GitHub Actions

Update your workflow to use secrets:

```yaml
env:
  SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
  DISCORD_WEBHOOK_URL: ${{ secrets.DISCORD_WEBHOOK_URL }}
  SMTP_PASSWORD: ${{ secrets.SMTP_PASSWORD }}
```

## Testing Notifications

### Local Testing

Test notifications locally:

```bash
# Test all configured channels
npm run deploy:validate

# Test specific deployment scenario
DEPLOYMENT_ENVIRONMENT=staging npm run deploy:validate
```

### Production Testing

Test in GitHub Actions:

1. Make a small change to your repository
2. Push to main branch
3. Monitor the deployment workflow
4. Check configured notification channels

## Troubleshooting

### Common Issues

1. **Slack notifications not working:**
   - Verify webhook URL is correct
   - Check that the Slack app has permission to post to the channel
   - Ensure webhook is not expired

2. **Discord notifications not working:**
   - Verify webhook URL is correct
   - Check that webhook is not deleted in Discord
   - Ensure proper permissions for the webhook

3. **Email notifications not working:**
   - Verify SMTP credentials
   - Check spam/junk folders
   - Ensure less secure app access is enabled (Gmail)
   - Use app-specific passwords for 2FA accounts

4. **Custom webhook not working:**
   - Verify endpoint URL and method
   - Check authentication headers
   - Ensure endpoint accepts JSON payload

### Debug Mode

Enable debug logging:

```bash
DEBUG=true npm run deploy:validate
```

### Log Files

Check notification logs:

```bash
# View recent notifications
ls -la .kiro/deployment-notifications/

# View specific notification
cat .kiro/deployment-notifications/deploy-1234567890.json
```

## Security Best Practices

### Webhook Security

1. **Use HTTPS URLs only**
2. **Implement webhook signature verification**
3. **Rotate webhook URLs regularly**
4. **Limit webhook permissions**

### Credential Management

1. **Store sensitive data in GitHub Secrets**
2. **Use app-specific passwords**
3. **Rotate credentials regularly**
4. **Limit access to notification channels**

### Information Disclosure

1. **Avoid including sensitive data in notifications**
2. **Use generic error messages in public channels**
3. **Limit deployment details in notifications**

## Advanced Configuration

### Conditional Notifications

Configure notifications based on conditions:

```json
{
  "conditions": {
    "production": {
      "notifyOn": ["success", "failure"],
      "channels": ["slack", "email"]
    },
    "staging": {
      "notifyOn": ["failure"],
      "channels": ["slack"]
    }
  }
}
```

### Rate Limiting

Prevent notification spam:

```json
{
  "rateLimiting": {
    "enabled": true,
    "maxNotifications": 10,
    "timeWindow": 3600
  }
}
```

### Retry Configuration

Configure retry behavior for failed notifications:

```json
{
  "retry": {
    "enabled": true,
    "maxAttempts": 3,
    "backoffMultiplier": 2,
    "initialDelay": 1000
  }
}
```

## Integration Examples

### PagerDuty Integration

```json
{
  "webhook": {
    "enabled": true,
    "url": "https://events.pagerduty.com/v2/enqueue",
    "method": "POST",
    "headers": {
      "Content-Type": "application/json"
    },
    "payload": {
      "routing_key": "your-integration-key",
      "event_action": "trigger",
      "dedup_key": "{{deploymentId}}",
      "payload": {
        "summary": "Deployment {{status}} - {{environment}}",
        "severity": "error",
        "source": "deployment-pipeline"
      }
    },
    "notifyOn": ["failure"]
  }
}
```

### Datadog Integration

```json
{
  "webhook": {
    "enabled": true,
    "url": "https://api.datadoghq.com/api/v1/events",
    "method": "POST",
    "headers": {
      "Content-Type": "application/json",
      "DD-API-KEY": "your-api-key"
    },
    "payload": {
      "title": "Deployment {{status}}",
      "text": "Deployment to {{environment}} {{status}}",
      "tags": ["environment:{{environment}}", "deployment:{{deploymentId}}"]
    }
  }
}
```

## Monitoring and Metrics

### Notification Metrics

Track notification delivery:

- Success/failure rates
- Delivery latency
- Channel availability
- Error patterns

### Dashboard Integration

Integrate with monitoring dashboards:

- Grafana
- Datadog
- New Relic
- Custom dashboards

## Support and Maintenance

### Regular Maintenance

1. **Review notification logs monthly**
2. **Update webhook URLs as needed**
3. **Rotate credentials quarterly**
4. **Test all channels quarterly**

### Documentation Updates

Keep documentation current:

1. **Update team contact information**
2. **Document new notification channels**
3. **Update troubleshooting guides**
4. **Review security practices**

For additional support, see:

- [GitHub Actions AWS Setup Guide](github-actions-aws-setup.md)
- [Deployment Runbook](deployment-runbook.md)
- [Troubleshooting Guide](troubleshooting-guide.md)
