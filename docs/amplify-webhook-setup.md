# AWS Amplify Webhook Configuration Guide

This guide covers setting up automatic deployments and webhooks for your AWS
Amplify application.

## Overview

AWS Amplify automatically configures webhooks when you connect your GitHub
repository. This enables automatic deployments whenever code is pushed to your
main branch.

## Prerequisites

- GitHub repository with your code
- AWS account with Amplify access
- Repository contains valid `amplify.yml` configuration

## Automatic Webhook Setup

### 1. Connect GitHub Repository

When you create an Amplify app and connect your GitHub repository:

1. **Repository Selection**: Choose your GitHub repository
2. **Branch Selection**: Select `main` branch for production deployments
3. **Build Settings Detection**: Amplify automatically detects `amplify.yml`
4. **Webhook Creation**: Amplify creates a webhook in your GitHub repository

### 2. Webhook Configuration

The webhook is automatically configured with:

- **Trigger Events**: Push to main branch, pull request updates
- **Payload URL**: AWS Amplify build trigger endpoint
- **Content Type**: `application/json`
- **Secret**: Automatically generated for security

### 3. Build Triggers

Deployments are triggered by:

- **Direct Push**: Commits pushed directly to main branch
- **Pull Request Merge**: When PRs are merged into main branch
- **Manual Trigger**: From Amplify console
- **API Trigger**: Using AWS CLI or SDK

## Manual Webhook Configuration

If you need to manually configure webhooks:

### GitHub Webhook Settings

1. Go to your repository settings
2. Navigate to "Webhooks"
3. Add webhook with:
   - **Payload URL**: Your Amplify app's webhook URL
   - **Content Type**: `application/json`
   - **Events**: Push events, Pull request events
   - **Secret**: Use the secret from Amplify console

### Amplify Console Configuration

1. Open your Amplify app in AWS Console
2. Go to "App settings" > "General"
3. Find "Webhook" section
4. Copy the webhook URL for manual configuration

## Build Notifications

### Email Notifications

Configure build notifications in Amplify console:

1. Go to "App settings" > "Notifications"
2. Add email addresses for:
   - Build success notifications
   - Build failure notifications
   - Deployment completion

### Slack Integration

Set up Slack notifications:

1. Create Slack webhook URL
2. Configure in Amplify console under "Notifications"
3. Choose notification types:
   - Build started
   - Build succeeded
   - Build failed
   - Deployment completed

### SNS Integration

For advanced notifications:

1. Create SNS topic
2. Configure in Amplify app settings
3. Subscribe to topic with:
   - Email endpoints
   - SMS endpoints
   - Lambda functions

## Monitoring and Logging

### Build Logs

Access build logs through:

- **Amplify Console**: Real-time build logs
- **CloudWatch**: Detailed logging and metrics
- **CLI**: `amplify console` command

### Build History

Monitor deployment history:

- **Build Status**: Success, failed, in progress
- **Build Duration**: Time taken for each phase
- **Commit Information**: Associated Git commit
- **Environment Variables**: Used during build

### Performance Monitoring

Track build performance:

- **Build Time Trends**: Monitor build duration over time
- **Success Rate**: Track deployment success percentage
- **Resource Usage**: Monitor build resource consumption

## Troubleshooting

### Common Webhook Issues

1. **Webhook Not Triggering**:
   - Check webhook URL is correct
   - Verify GitHub repository permissions
   - Ensure webhook is active in GitHub settings

2. **Build Failures**:
   - Check build logs in Amplify console
   - Verify environment variables are set
   - Ensure all dependencies are available

3. **Permission Issues**:
   - Verify GitHub app permissions
   - Check AWS IAM roles and policies
   - Ensure Amplify service role has required permissions

### Webhook Validation

Test webhook configuration:

```bash
# Test webhook manually (replace with your webhook URL)
curl -X POST "https://webhooks.amplify.aws.com/prod/webhooks?id=YOUR_WEBHOOK_ID&token=YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"ref":"refs/heads/main","repository":{"name":"your-repo"}}'
```

### Build Configuration Validation

Validate your build configuration:

```bash
# Run local validation
npm run amplify:validate

# Test build locally
npm run build
npm run export

# Validate environment
npm run env:validate
```

## Security Best Practices

### Webhook Security

1. **Use HTTPS**: Always use HTTPS for webhook URLs
2. **Validate Signatures**: Verify webhook signatures from GitHub
3. **Restrict Access**: Limit webhook access to necessary IPs
4. **Rotate Secrets**: Regularly rotate webhook secrets

### Environment Variables

1. **Sensitive Data**: Store sensitive data in Amplify environment variables
2. **Access Control**: Limit access to environment variable configuration
3. **Encryption**: Use AWS KMS for additional encryption if needed
4. **Audit Trail**: Monitor environment variable changes

### Branch Protection

1. **Protected Branches**: Enable branch protection for main branch
2. **Required Reviews**: Require pull request reviews
3. **Status Checks**: Require status checks to pass
4. **Deployment Keys**: Use deployment keys for additional security

## Advanced Configuration

### Multi-Environment Setup

Configure different environments:

1. **Development**: Feature branch deployments
2. **Staging**: Pre-production testing
3. **Production**: Main branch deployments

### Custom Build Commands

Override default build behavior:

```yaml
# In amplify.yml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - echo "Custom pre-build commands"
        - npm run custom:prebuild
    build:
      commands:
        - echo "Custom build commands"
        - npm run custom:build
    postBuild:
      commands:
        - echo "Custom post-build commands"
        - npm run custom:postbuild
```

### Conditional Builds

Skip builds based on conditions:

```yaml
# Skip build if only documentation changed
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - |
          if git diff --name-only HEAD~1 HEAD | grep -E '\.(md|txt)$' && ! git diff --name-only HEAD~1 HEAD | grep -v -E '\.(md|txt)$'; then
            echo "Only documentation changed, skipping build"
            exit 0
          fi
```

## Monitoring Dashboard

Create a monitoring dashboard to track:

- **Build Success Rate**: Percentage of successful builds
- **Build Duration**: Average and trend of build times
- **Deployment Frequency**: Number of deployments per day/week
- **Error Rates**: Build and runtime error tracking
- **Performance Metrics**: Core Web Vitals and load times

## Next Steps

After webhook configuration:

1. **Test Deployment**: Push a small change to trigger build
2. **Monitor Logs**: Watch build logs for any issues
3. **Validate Site**: Test deployed site functionality
4. **Set Up Monitoring**: Configure performance and error monitoring
5. **Document Process**: Create team documentation for deployment process

## Resources

- [AWS Amplify Documentation](https://docs.aws.amazon.com/amplify/)
- [GitHub Webhooks Documentation](https://docs.github.com/en/developers/webhooks-and-events/webhooks)
- [Amplify CLI Reference](https://docs.amplify.aws/cli/)
- [CloudWatch Logs](https://docs.aws.amazon.com/cloudwatch/latest/logs/)
