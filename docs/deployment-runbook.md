# AWS Amplify Deployment Runbook

## Overview

This runbook provides comprehensive guidance for deploying and maintaining the
mobile-first marketing website on AWS Amplify. It covers the complete deployment
process, environment configuration, monitoring setup, and troubleshooting
procedures.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Variables Configuration](#environment-variables-configuration)
3. [Deployment Process](#deployment-process)
4. [Monitoring and Alerts](#monitoring-and-alerts)
5. [Troubleshooting Guide](#troubleshooting-guide)
6. [Backup and Rollback Procedures](#backup-and-rollback-procedures)
7. [Performance Optimization](#performance-optimization)
8. [Security Configuration](#security-configuration)

## Prerequisites

### Required Tools and Access

- AWS Account with Amplify access
- GitHub repository access
- Node.js 18.x or higher
- npm or yarn package manager

### Required Environment Setup

```bash
# Verify Node.js version
node --version  # Should be 18.x or higher

# Install dependencies
npm install

# Verify build process
npm run build
```

## Environment Variables Configuration

### Required Environment Variables

#### Core Site Configuration

```bash
# Site Identity
NEXT_PUBLIC_SITE_URL=https://your-domain.com
NEXT_PUBLIC_SITE_NAME="Your Site Name"
NEXT_PUBLIC_SITE_DESCRIPTION="Your site description"

# Contact Configuration
CONTACT_EMAIL=contact@your-domain.com
```

#### Optional Analytics Configuration

```bash
# Google Analytics
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX

# Google Tag Manager
NEXT_PUBLIC_GTM_ID=GTM-XXXXXXX

# Facebook Pixel
NEXT_PUBLIC_FACEBOOK_PIXEL_ID=123456789012345
```

#### Optional Social Media Configuration

```bash
NEXT_PUBLIC_FACEBOOK_URL=https://facebook.com/yourpage
NEXT_PUBLIC_TWITTER_URL=https://twitter.com/youraccount
NEXT_PUBLIC_LINKEDIN_URL=https://linkedin.com/company/yourcompany
NEXT_PUBLIC_INSTAGRAM_URL=https://instagram.com/youraccount
```

#### Optional Email Configuration (for contact forms)

```bash
SMTP_HOST=smtp.your-provider.com
SMTP_PORT=587
SMTP_USER=your-smtp-username
SMTP_PASS=your-smtp-password
```

### Environment Variable Validation

Before deployment, validate your environment configuration:

```bash
# Validate environment variables
npm run env:validate

# Test environment configuration
npm run env:test
```

## Deployment Process

### Step 1: Pre-deployment Validation

```bash
# Run comprehensive pre-deployment tests
npm run amplify:test-deployment

# Validate content structure
npm run content:validate-structure

# Run type checking
npm run type-check

# Execute test suite
npm run test:all
```

### Step 2: AWS Amplify Setup

#### Initial Setup

1. **Connect Repository**
   - Log into AWS Amplify Console
   - Click "New app" → "Host web app"
   - Connect your GitHub repository
   - Select the main branch

2. **Configure Build Settings**
   - Amplify should auto-detect the `amplify.yml` file
   - Verify build settings match the configuration below:

```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm ci --cache .npm --prefer-offline --no-audit
        - npm run env:validate
        - npm run content:validate-structure
        - npm run type-check
    build:
      commands:
        - npm run build
        - npm run test
    postBuild:
      commands:
        - npm run cache:optimize
        - npm run deploy:monitor
  artifacts:
    baseDirectory: out
    files:
      - '**/*'
  cache:
    paths:
      - .npm/**/*
      - .next/cache/**/*
      - node_modules/**/*
```

3. **Configure Environment Variables**
   - In Amplify Console, go to App Settings → Environment variables
   - Add all required environment variables from the configuration above
   - Ensure `NODE_ENV` is set to `production`

4. **Configure Custom Domain (Optional)**
   - Go to App Settings → Domain management
   - Add your custom domain
   - AWS will automatically provision SSL certificates

### Step 3: Deploy and Validate

```bash
# Trigger deployment (automatic on git push to main)
git push origin main

# Monitor deployment
npm run amplify:monitor

# Run comprehensive deployment tests
npm run deploy:test-comprehensive
```

## Monitoring and Alerts

### Performance Monitoring

#### Core Web Vitals Monitoring

```bash
# Monitor Core Web Vitals
npm run performance:vitals

# Validate performance budget
npm run performance:budget
```

#### Continuous Monitoring Setup

- **Google Analytics**: Configured via `NEXT_PUBLIC_GA_ID`
- **Core Web Vitals**: Automatic tracking enabled
- **Error Tracking**: Built-in error monitoring

### Deployment Monitoring

#### Build Monitoring

```bash
# Monitor build logs
npm run amplify:monitor

# View deployment dashboard
npm run amplify:dashboard
```

#### Alert Configuration

**Build Failure Alerts**

- Configured in AWS Amplify Console
- Notifications sent to configured email/Slack
- Automatic retry on transient failures

**Performance Regression Alerts**

- Core Web Vitals threshold monitoring
- Performance budget validation
- Automatic alerts on regression

### Monitoring Dashboard

Access the monitoring dashboard:

```bash
# Start monitoring dashboard
npm run amplify:dashboard-live

# Generate HTML report
npm run amplify:dashboard-html
```

## Troubleshooting Guide

### Common Build Issues

#### Build Fails with Environment Variable Errors

**Symptoms**: Build fails during pre-build phase with environment validation
errors

**Solution**:

1. Check environment variables in Amplify Console
2. Ensure all required variables are set
3. Validate variable format and values

```bash
# Debug environment variables locally
npm run env:validate
npm run env:test
```

#### Build Fails with Content Validation Errors

**Symptoms**: Build fails with content structure validation errors

**Solution**:

1. Validate content structure locally
2. Check for missing or malformed content files
3. Verify content schema compliance

```bash
# Debug content issues
npm run content:validate-structure
npm run content:validate
```

#### Build Fails with TypeScript Errors

**Symptoms**: Build fails during type checking phase

**Solution**:

1. Run type checking locally
2. Fix TypeScript errors
3. Ensure all dependencies are properly typed

```bash
# Debug TypeScript issues
npm run type-check
npm run lint
```

### Common Runtime Issues

#### Site Not Loading (404 Errors)

**Symptoms**: Site returns 404 errors or blank pages

**Solution**:

1. Check build output directory configuration
2. Verify static export completed successfully
3. Check CloudFront cache invalidation

```bash
# Test build locally
npm run build
npm run export

# Check output directory
ls -la out/
```

#### Contact Forms Not Working

**Symptoms**: Contact form submissions fail or don't send emails

**Solution**:

1. Verify `CONTACT_EMAIL` environment variable
2. Check SMTP configuration if using email
3. Test form functionality locally

```bash
# Test contact form configuration
npm run deploy:test-comprehensive
```

#### Analytics Not Tracking

**Symptoms**: Analytics data not appearing in dashboards

**Solution**:

1. Verify analytics IDs in environment variables
2. Check tracking code implementation
3. Test analytics in browser developer tools

```bash
# Validate analytics configuration
npm run deploy:test-comprehensive
```

### Performance Issues

#### Slow Loading Times

**Symptoms**: Site loads slowly, poor Core Web Vitals scores

**Solution**:

1. Check CDN cache configuration
2. Optimize images and assets
3. Review performance budget

```bash
# Analyze performance
npm run performance:monitor
npm run performance:budget
npm run analyze
```

#### Cache Issues

**Symptoms**: Updated content not appearing, stale cache

**Solution**:

1. Invalidate CloudFront cache
2. Check cache headers configuration
3. Verify cache optimization settings

```bash
# Invalidate cache
npm run cache:invalidate

# Test cache configuration
npm run caching:validate
```

### Security Issues

#### Security Headers Missing

**Symptoms**: Security scanners report missing headers

**Solution**:

1. Verify custom headers in `amplify.yml`
2. Test security header implementation
3. Update CSP policies if needed

```bash
# Validate security configuration
npm run security:validate
npm run security:headers
npm run security:csp
```

## Backup and Rollback Procedures

### Automated Backups

AWS Amplify automatically maintains:

- **Build History**: Last 10 builds available for rollback
- **Source Code**: GitHub repository serves as source of truth
- **Environment Configuration**: Stored in Amplify Console

### Manual Rollback Procedure

#### Rollback to Previous Build

1. **Via Amplify Console**:
   - Go to App → Deployments
   - Select previous successful build
   - Click "Promote to main"

2. **Via Git Revert**:

   ```bash
   # Revert to previous commit
   git revert HEAD
   git push origin main

   # Or reset to specific commit
   git reset --hard <commit-hash>
   git push --force origin main
   ```

#### Emergency Rollback

For critical issues requiring immediate rollback:

1. **Disable Auto-Deploy**:
   - Go to App Settings → Build settings
   - Disable automatic builds

2. **Rollback to Last Known Good**:
   - Promote previous successful build
   - Verify functionality with test suite

3. **Re-enable Auto-Deploy**:
   - Fix issues in development
   - Test thoroughly
   - Re-enable automatic builds

### Backup Verification

Regularly verify backup integrity:

```bash
# Test deployment from clean state
git clone <repository-url> backup-test
cd backup-test
npm install
npm run build
npm run test:all
```

## Performance Optimization

### Build Performance

#### Optimize Build Times

- **Dependency Caching**: Configured in `amplify.yml`
- **Build Cache**: Next.js build cache enabled
- **Parallel Processing**: Multi-core build optimization

#### Monitor Build Performance

```bash
# Analyze build performance
npm run amplify:build-validate

# Monitor build times
npm run amplify:monitor
```

### Runtime Performance

#### CDN Optimization

- **CloudFront**: Global edge caching enabled
- **Compression**: Gzip/Brotli compression configured
- **Cache Headers**: Optimized for different content types

#### Performance Monitoring

```bash
# Monitor Core Web Vitals
npm run performance:vitals

# Validate performance budget
npm run performance:budget

# Comprehensive performance test
npm run deploy:test-comprehensive
```

### Performance Thresholds

| Metric                         | Target  | Alert Threshold |
| ------------------------------ | ------- | --------------- |
| Largest Contentful Paint (LCP) | < 2.5s  | > 4.0s          |
| First Input Delay (FID)        | < 100ms | > 300ms         |
| Cumulative Layout Shift (CLS)  | < 0.1   | > 0.25          |
| Time to First Byte (TTFB)      | < 600ms | > 1.8s          |

## Security Configuration

### Security Headers

Configured in `amplify.yml`:

```yaml
customHeaders:
  - pattern: '**/*'
    headers:
      - key: 'Strict-Transport-Security'
        value: 'max-age=31536000; includeSubDomains'
      - key: 'Content-Security-Policy'
        value:
          'default-src self; script-src self unsafe-inline; style-src self
          unsafe-inline'
      - key: 'X-Frame-Options'
        value: 'DENY'
      - key: 'X-Content-Type-Options'
        value: 'nosniff'
      - key: 'Referrer-Policy'
        value: 'strict-origin-when-cross-origin'
```

### Security Validation

```bash
# Validate security configuration
npm run security:validate

# Test specific security aspects
npm run security:headers
npm run security:csp
npm run security:https
```

### SSL/TLS Configuration

- **Automatic SSL**: AWS Amplify provides automatic SSL certificates
- **HTTPS Redirect**: Configured in custom headers
- **HSTS**: Strict Transport Security enabled

## Maintenance Procedures

### Regular Maintenance Tasks

#### Weekly

- Review deployment logs
- Check performance metrics
- Validate security headers
- Test critical user journeys

```bash
# Weekly maintenance script
npm run deploy:test-comprehensive
npm run performance:validate
npm run security:validate
```

#### Monthly

- Review and update dependencies
- Analyze performance trends
- Update security configurations
- Test backup and rollback procedures

#### Quarterly

- Security audit and penetration testing
- Performance optimization review
- Disaster recovery testing
- Documentation updates

### Monitoring Checklist

- [ ] Build success rate > 95%
- [ ] Core Web Vitals within thresholds
- [ ] Security headers properly configured
- [ ] Contact forms functioning
- [ ] Analytics tracking active
- [ ] CDN cache hit rate > 90%
- [ ] Error rate < 1%

## Emergency Contacts and Escalation

### Contact Information

- **Development Team**: [team-email@company.com]
- **DevOps Team**: [devops@company.com]
- **AWS Support**: [aws-support-case-url]

### Escalation Procedures

1. **Level 1**: Development team response (< 2 hours)
2. **Level 2**: DevOps team escalation (< 4 hours)
3. **Level 3**: AWS Support engagement (< 8 hours)

### Critical Issue Response

For critical issues affecting site availability:

1. Immediate rollback to last known good state
2. Notify stakeholders
3. Investigate root cause
4. Implement fix and test
5. Post-incident review and documentation

---

## Quick Reference Commands

```bash
# Deployment Testing
npm run deploy:test-comprehensive

# Environment Validation
npm run env:validate

# Performance Monitoring
npm run performance:validate

# Security Validation
npm run security:validate

# Build Monitoring
npm run amplify:monitor

# Cache Management
npm run cache:invalidate

# Emergency Rollback
# (Use Amplify Console or git revert)
```

## Document Version

- **Version**: 1.0
- **Last Updated**: [Current Date]
- **Next Review**: [Date + 3 months]
