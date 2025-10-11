> **Migration Notice**: This project has been migrated from AWS Amplify to
> S3/CloudFront. For migration details, see
> `docs/amplify-to-s3-migration-summary.md`.

# S3 + CloudFront Deployment Runbook

## Overview

This runbook provides step-by-step procedures for deploying, managing, and
troubleshooting the S3 + CloudFront static site deployment infrastructure. This
deployment solution replaces AWS Amplify to resolve persistent Next.js SSR
detection issues.

## Prerequisites

### Required Tools

- AWS CLI v2.x configured with appropriate credentials
- Node.js v18+ and npm
- Git access to the repository
- Access to AWS Console (for monitoring and troubleshooting)

### Required AWS Permissions

- S3: Full access to deployment buckets
- CloudFront: Full access to distributions
- CloudWatch: Read access for monitoring
- Cost Explorer: Read access for cost analysis (optional)
- IAM: Read access for role validation

### Environment Setup

```bash
# Verify AWS CLI configuration
aws sts get-caller-identity

# Verify Node.js version
node --version

# Install dependencies
npm install
```

## Deployment Procedures

### Initial Infrastructure Setup

1. **Configure Deployment Settings**

   ```bash
   # Edit deployment configuration
   nano config/deployment-config.json

   # Update the following values:
   # - bucketName: Your S3 bucket name
   # - distributionId: Your CloudFront distribution ID
   # - customDomain: Your custom domain (optional)
   # - region: AWS region
   ```

2. **Create AWS Infrastructure**

   ```bash
   # Run infrastructure setup script
   node scripts/setup-infrastructure.js

   # Verify infrastructure creation
   node scripts/deployment-status-dashboard.js
   ```

3. **Configure GitHub Actions**
   ```bash
   # Set up GitHub Secrets:
   # AWS_ACCESS_KEY_ID
   # AWS_SECRET_ACCESS_KEY
   # AWS_REGION
   # S3_BUCKET_NAME
   # CLOUDFRONT_DISTRIBUTION_ID
   ```

### Standard Deployment Process

1. **Pre-Deployment Checks**

   ```bash
   # Validate environment configuration
   node scripts/validate-env.js

   # Check deployment readiness
   node scripts/test-deployment-readiness.js

   # Verify site functionality
   node scripts/validate-site-functionality.js
   ```

2. **Build and Deploy**

   ```bash
   # Build Next.js static export
   npm run build
   npm run export

   # Deploy to S3 + CloudFront
   node scripts/deploy.js

   # Monitor deployment status
   node scripts/deployment-status-dashboard.js
   ```

3. **Post-Deployment Verification**

   ```bash
   # Validate deployment
   node scripts/comprehensive-deployment-test.js

   # Check security configuration
   node scripts/security-validation-suite.js

   # Verify performance
   node scripts/performance-benchmarking.js
   ```

### Automated Deployment (GitHub Actions)

The deployment automatically triggers on:

- Push to `main` branch
- Manual workflow dispatch

**Monitoring Automated Deployments:**

1. Check GitHub Actions tab for build status
2. Monitor deployment logs in GitHub Actions
3. Verify deployment success with dashboard:
   ```bash
   node scripts/deployment-status-dashboard.js
   ```

## Cache Management

### Cache Invalidation

1. **Full Site Invalidation**

   ```bash
   node scripts/cache-invalidation-manager.js invalidate full
   ```

2. **Selective Invalidation**

   ```bash
   # HTML files only
   node scripts/cache-invalidation-manager.js invalidate html

   # Static assets only
   node scripts/cache-invalidation-manager.js invalidate assets

   # API routes only
   node scripts/cache-invalidation-manager.js invalidate api
   ```

3. **Monitor Invalidation Status**

   ```bash
   # View invalidation report
   node scripts/cache-invalidation-manager.js report

   # Check specific invalidation status
   node scripts/cache-invalidation-manager.js status <invalidation-id>
   ```

### Cache Optimization

1. **Review Cache Performance**

   ```bash
   node scripts/caching-cdn-optimizer.js
   ```

2. **Adjust Cache Settings**
   - Edit `config/deployment-config.json`
   - Update `cacheSettings` section
   - Redeploy configuration:
     ```bash
     node scripts/configure-cloudfront-caching.js
     ```

## Monitoring and Alerting

### Health Monitoring

1. **Deployment Status Dashboard**

   ```bash
   # Generate comprehensive status report
   node scripts/deployment-status-dashboard.js
   ```

2. **Performance Monitoring**

   ```bash
   # Core Web Vitals monitoring
   node scripts/core-web-vitals-monitor.js

   # Performance benchmarking
   node scripts/performance-benchmarking.js
   ```

3. **Security Monitoring**

   ```bash
   # Security headers validation
   node scripts/security-headers-validator.js

   # SSL/TLS configuration check
   node scripts/ssl-certificate-validator.js
   ```

### Cost Monitoring

1. **Cost Analysis**

   ```bash
   # Generate cost analysis report
   node scripts/cost-analysis-optimizer.js
   ```

2. **Cost Optimization**
   - Review recommendations in cost analysis report
   - Implement suggested optimizations
   - Monitor cost trends over time

### Alerting Setup

1. **Configure CloudWatch Alarms**

   ```bash
   node scripts/setup-cloudwatch-monitoring.js
   ```

2. **Set Up Deployment Notifications**
   ```bash
   node scripts/setup-deployment-notifications.js
   ```

## Rollback Procedures

### Emergency Rollback

1. **Immediate Rollback**

   ```bash
   # Rollback to previous version
   node scripts/rollback.js

   # Verify rollback success
   node scripts/deployment-status-dashboard.js
   ```

2. **Rollback to Specific Version**

   ```bash
   # List available versions
   node scripts/rollback.js --list

   # Rollback to specific version
   node scripts/rollback.js --version <version-number>
   ```

### Rollback Verification

1. **Post-Rollback Checks**

   ```bash
   # Verify site functionality
   node scripts/validate-site-functionality.js

   # Check performance
   node scripts/performance-benchmarking.js

   # Validate security
   node scripts/security-validation-suite.js
   ```

## Maintenance Procedures

### Regular Maintenance Tasks

1. **Weekly Tasks**
   - Review deployment status dashboard
   - Check cost analysis report
   - Validate security configurations
   - Review performance metrics

2. **Monthly Tasks**
   - Update dependencies
   - Review and optimize cache settings
   - Analyze traffic patterns
   - Update documentation

3. **Quarterly Tasks**
   - Security audit and penetration testing
   - Disaster recovery testing
   - Cost optimization review
   - Performance benchmarking

### SSL Certificate Management

1. **Certificate Renewal**

   ```bash
   # Check certificate status
   node scripts/ssl-certificate-validator.js

   # Renew certificate (if needed)
   node scripts/setup-ssl-certificate.js
   ```

2. **Custom Domain Configuration**

   ```bash
   # Configure custom domain
   node scripts/setup-custom-domain.js

   # Validate domain configuration
   node scripts/ssl-custom-domain-setup.js
   ```

## Security Procedures

### Security Validation

1. **Comprehensive Security Check**

   ```bash
   node scripts/security-validation-suite.js
   ```

2. **Specific Security Tests**

   ```bash
   # TLS/SSL validation
   node scripts/comprehensive-tls-validator.js

   # Security headers check
   node scripts/security-headers-validator.js

   # Penetration testing
   node scripts/penetration-testing-suite.js
   ```

### Security Incident Response

1. **Immediate Response**
   - Disable CloudFront distribution if necessary
   - Block suspicious traffic at CloudFront level
   - Review access logs for anomalies

2. **Investigation**

   ```bash
   # Analyze access logs
   node scripts/setup-logging-audit.js

   # Review security configurations
   node scripts/cloudfront-security-validator.js
   ```

3. **Recovery**
   - Apply security patches
   - Update security configurations
   - Re-enable services after validation

## Performance Optimization

### Performance Analysis

1. **Core Web Vitals**

   ```bash
   node scripts/core-web-vitals-monitor.js
   ```

2. **Comprehensive Performance Testing**
   ```bash
   node scripts/performance-benchmarking.js
   ```

### Optimization Actions

1. **Cache Optimization**

   ```bash
   node scripts/caching-cdn-optimizer.js
   ```

2. **Compression Optimization**

   ```bash
   node scripts/compression-performance-tester.js
   ```

3. **CloudFront Configuration**
   ```bash
   node scripts/configure-cloudfront-security.js
   ```

## Troubleshooting

### Common Issues

1. **Deployment Failures**
   - Check GitHub Actions logs
   - Verify AWS credentials
   - Validate S3 bucket permissions
   - Check CloudFront distribution status

2. **Cache Issues**
   - Verify cache invalidation completion
   - Check cache behavior configurations
   - Review TTL settings

3. **Performance Issues**
   - Analyze CloudFront cache hit ratio
   - Review compression settings
   - Check origin response times

4. **Security Issues**
   - Validate SSL certificate
   - Check security headers
   - Review access control policies

### Diagnostic Commands

```bash
# Comprehensive deployment test
node scripts/comprehensive-deployment-test.js

# Site functionality validation
node scripts/validate-site-functionality.js

# Infrastructure validation
node scripts/validate-s3-infrastructure.js

# Environment validation
node scripts/validate-env.js
```

## Emergency Contacts

### Escalation Procedures

1. **Level 1**: Development Team
   - Check automated monitoring alerts
   - Review deployment logs
   - Attempt standard troubleshooting

2. **Level 2**: DevOps/Infrastructure Team
   - AWS infrastructure issues
   - Complex configuration problems
   - Security incidents

3. **Level 3**: AWS Support
   - Service outages
   - Account-level issues
   - Critical security incidents

### Contact Information

- **Development Team**: [Insert contact details]
- **DevOps Team**: [Insert contact details]
- **AWS Support**: [Insert support case process]
- **Emergency Escalation**: [Insert emergency contact]

## Documentation Updates

This runbook should be updated:

- After any infrastructure changes
- When new procedures are added
- After incident resolution
- During quarterly reviews

**Last Updated**: [Insert date] **Version**: 1.0 **Maintained By**: [Insert
team/person]
