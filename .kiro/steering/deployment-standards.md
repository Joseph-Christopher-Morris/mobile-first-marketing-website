---
inclusion: always
---

# Deployment Standards

## Static Site Deployment Best Practices

### Architecture Principles

- **ALWAYS** use S3 + CloudFront for static site deployment
- **NEVER** use AWS Amplify for static content hosting
- **MANDATORY**: All static sites must use the S3 + CloudFront architecture
- Implement proper caching strategies for different content types
- Separate static assets from dynamic content
- Use CDN edge locations for global performance

### Deployment Architecture Requirements

- **Primary Method**: S3 + CloudFront with Origin Access Control (OAC)
- **Build Process**: Next.js static export (`npm run build`)
- **Deployment Pipeline**: GitHub Actions with automated S3 upload and
  CloudFront invalidation
- **Infrastructure**: Defined in code using our setup scripts
- **Security**: Private S3 buckets with CloudFront-only access

### Build and Deployment Process

- **Required Build Command**: `npm run build` (Next.js static export)
- **Deployment Method**: Use `scripts/deploy.js` for S3 upload and CloudFront
  invalidation
- **CI/CD Pipeline**: GitHub Actions workflow
  (`.github/workflows/s3-cloudfront-deploy.yml`)
- **Infrastructure Setup**: Use `scripts/setup-infrastructure.js` for initial
  setup
- Always build locally or in CI/CD before deployment
- Validate build output before uploading to production
- Implement atomic deployments (all-or-nothing)
- Maintain deployment logs and audit trails

### Prohibited Deployment Methods

- **DO NOT** use AWS Amplify for static site hosting
- **DO NOT** use direct S3 website hosting without CloudFront
- **DO NOT** make S3 buckets publicly accessible
- **DO NOT** use deprecated Origin Access Identity (OAI)

### Performance Optimization

- Compress static assets (gzip/brotli)
- Optimize images and use appropriate formats
- Implement proper cache headers for different file types
- Use CloudFront compression for text-based content

## Environment Management

### Environment Separation

- Maintain separate environments (dev, staging, production)
- Use different AWS accounts or clear resource naming
- Implement proper promotion processes between environments
- Test deployments in staging before production

### Configuration Management

- Store environment-specific configuration separately
- Use AWS Systems Manager Parameter Store for sensitive config
- Implement configuration validation before deployment
- Document all configuration requirements

## Rollback and Recovery

### Version Management

- Tag all deployments with version numbers
- Maintain previous versions for quick rollback
- Implement automated rollback triggers for critical failures
- Document rollback procedures and test regularly

### Backup and Recovery

- Implement automated backups of critical data
- Test recovery procedures regularly
- Document disaster recovery plans
- Maintain offsite backups for critical systems

## Quality Assurance

### Pre-deployment Validation

- Run automated tests before deployment
- Validate all links and functionality
- Check for security vulnerabilities
- Verify performance benchmarks

### Post-deployment Verification

- Implement health checks after deployment
- Monitor error rates and performance metrics
- Validate all critical user journeys
- Set up alerting for deployment issues

## Analytics and Tracking

### Google Analytics 4 Implementation

- Google Analytics 4 tracking code (G-QJXSCJ0L43) implemented globally via CloudFront-compliant script tag
- Verified through GA4 Realtime report post-deployment
- Uses Next.js Script components with `afterInteractive` strategy for optimal performance
- Requires CloudFront CSP headers to include GA4 domains for proper functionality
