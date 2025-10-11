# S3 + CloudFront Troubleshooting Procedures

## Quick Reference

### Emergency Commands

```bash
# System status check
node scripts/deployment-status-dashboard.js

# Emergency rollback
node scripts/rollback.js emergency

# Site functionality validation
node scripts/validate-site-functionality.js

# Comprehensive diagnostics
node scripts/comprehensive-deployment-test.js
```

### Critical Issue Response Times

- **P1 (Site Down)**: 5 minutes
- **P2 (Major Degradation)**: 15 minutes
- **P3 (Minor Issues)**: 1 hour
- **P4 (Cosmetic)**: 4 hours

## Deployment Issues

### Issue: GitHub Actions Deployment Failing

**Symptoms**:

- GitHub Actions workflow shows failure
- Deployment not completing
- Build errors in logs

**Immediate Diagnosis**:

```bash
# Check GitHub Actions status
gh run list --limit 5

# View latest run logs
gh run view --log

# Check environment variables
node scripts/validate-production-env.js
```

**Common Causes & Solutions**:

1. **AWS Credentials Invalid**

   ```bash
   # Verify AWS access
   aws sts get-caller-identity

   # Test S3 access
   aws s3 ls s3://$S3_BUCKET_NAME

   # Solution: Update GitHub Secrets with valid AWS credentials
   ```

2. **Build Failures**

   ```bash
   # Test build locally
   npm run build
   npm run export

   # Check for TypeScript errors
   npm run type-check

   # Solution: Fix build errors and redeploy
   ```

3. **S3 Upload Failures**

   ```bash
   # Check S3 bucket permissions
   aws s3api get-bucket-policy --bucket $S3_BUCKET_NAME

   # Test manual upload
   aws s3 cp out/ s3://$S3_BUCKET_NAME/ --recursive

   # Solution: Fix bucket permissions or IAM policies
   ```

4. **CloudFront Invalidation Failures**

   ```bash
   # Check CloudFront distribution status
   aws cloudfront get-distribution --id $CLOUDFRONT_DISTRIBUTION_ID

   # Test manual invalidation
   aws cloudfront create-invalidation --distribution-id $CLOUDFRONT_DISTRIBUTION_ID --paths "/*"

   # Solution: Verify CloudFront permissions
   ```

### Issue: Deployment Succeeds but Site Not Updated

**Symptoms**:

- GitHub Actions shows success
- Old content still visible on site
- No error messages

**Diagnosis**:

```bash
# Check CloudFront cache status
node scripts/cache-invalidation-manager.js report

# Verify S3 content
aws s3 ls s3://$S3_BUCKET_NAME/ --recursive

# Check CloudFront invalidation status
aws cloudfront list-invalidations --distribution-id $CLOUDFRONT_DISTRIBUTION_ID
```

**Solutions**:

1. **Cache Not Invalidated**

   ```bash
   # Force cache invalidation
   node scripts/cache-invalidation-manager.js invalidate full

   # Monitor invalidation progress
   node scripts/cache-invalidation-manager.js status
   ```

2. **Wrong S3 Bucket**

   ```bash
   # Verify bucket configuration
   echo $S3_BUCKET_NAME

   # Check deployment configuration
   cat config/deployment-config.json

   # Solution: Update environment variables
   ```

3. **CloudFront Distribution Issues**

   ```bash
   # Check distribution status
   aws cloudfront get-distribution --id $CLOUDFRONT_DISTRIBUTION_ID --query 'Distribution.Status'

   # Solution: Wait for distribution to deploy or contact AWS support
   ```

## Performance Issues

### Issue: Slow Page Load Times

**Symptoms**:

- Pages taking > 3 seconds to load
- Poor Core Web Vitals scores
- User complaints about performance

**Diagnosis**:

```bash
# Performance analysis
node scripts/performance-benchmarking.js

# Core Web Vitals check
node scripts/core-web-vitals-monitor.js

# Cache performance analysis
node scripts/caching-cdn-optimizer.js
```

**Solutions**:

1. **Poor Cache Hit Ratio**

   ```bash
   # Check cache statistics
   node scripts/cloudfront-analytics-integration.js

   # Optimize cache settings
   node scripts/configure-cloudfront-caching.js

   # Solution: Adjust TTL settings and cache behaviors
   ```

2. **Large Asset Sizes**

   ```bash
   # Analyze bundle sizes
   npm run analyze

   # Check compression
   node scripts/compression-performance-tester.js

   # Solution: Optimize images, enable compression, code splitting
   ```

3. **Origin Response Time Issues**

   ```bash
   # Check S3 response times
   curl -w "@curl-format.txt" -o /dev/null -s https://$S3_BUCKET_NAME.s3.amazonaws.com/index.html

   # Solution: Optimize S3 configuration or contact AWS support
   ```

### Issue: High Core Web Vitals Scores

**Symptoms**:

- LCP > 2.5 seconds
- FID > 100ms
- CLS > 0.1

**Diagnosis**:

```bash
# Detailed Core Web Vitals analysis
node scripts/core-web-vitals-monitor.js

# Performance benchmarking
node scripts/performance-benchmarking.js
```

**Solutions by Metric**:

1. **High LCP (Largest Contentful Paint)**

   ```bash
   # Check for large images or resources
   # Solution: Optimize images, preload critical resources
   ```

2. **High FID (First Input Delay)**

   ```bash
   # Check JavaScript execution time
   # Solution: Reduce JavaScript, use web workers, optimize event handlers
   ```

3. **High CLS (Cumulative Layout Shift)**
   ```bash
   # Check for layout shifts
   # Solution: Set image dimensions, avoid inserting content above fold
   ```

## Security Issues

### Issue: SSL Certificate Errors

**Symptoms**:

- Browser security warnings
- "Not secure" indicators
- SSL handshake failures

**Diagnosis**:

```bash
# Check SSL certificate status
node scripts/ssl-certificate-validator.js

# Test SSL configuration
node scripts/comprehensive-tls-validator.js

# Check certificate expiry
openssl s_client -connect $DOMAIN:443 -servername $DOMAIN | openssl x509 -noout -dates
```

**Solutions**:

1. **Certificate Expired**

   ```bash
   # Renew certificate
   node scripts/setup-ssl-certificate.js

   # Update CloudFront distribution
   node scripts/configure-cloudfront-security.js
   ```

2. **Certificate Mismatch**

   ```bash
   # Check certificate subject
   openssl s_client -connect $DOMAIN:443 -servername $DOMAIN | openssl x509 -noout -subject

   # Solution: Request new certificate with correct domain
   ```

3. **CloudFront Configuration Issues**

   ```bash
   # Check CloudFront SSL settings
   aws cloudfront get-distribution --id $CLOUDFRONT_DISTRIBUTION_ID --query 'Distribution.DistributionConfig.ViewerCertificate'

   # Solution: Update CloudFront SSL configuration
   ```

### Issue: Security Headers Missing

**Symptoms**:

- Security scanners report missing headers
- Browser console warnings
- Security audit failures

**Diagnosis**:

```bash
# Validate security headers
node scripts/security-headers-validator.js

# Comprehensive security check
node scripts/security-validation-suite.js

# Check specific headers
curl -I https://$DOMAIN
```

**Solutions**:

1. **Missing HSTS Header**

   ```bash
   # Check current headers
   curl -I https://$DOMAIN | grep -i strict-transport-security

   # Solution: Update CloudFront response headers
   node scripts/configure-cloudfront-security.js
   ```

2. **Missing CSP Header**

   ```bash
   # Check CSP configuration
   curl -I https://$DOMAIN | grep -i content-security-policy

   # Solution: Configure CSP in CloudFront
   ```

3. **Information Disclosure Headers**

   ```bash
   # Check for server headers
   curl -I https://$DOMAIN | grep -i server

   # Solution: Remove or modify server headers
   ```

## Infrastructure Issues

### Issue: S3 Bucket Access Denied

**Symptoms**:

- 403 Forbidden errors
- Access denied messages
- CloudFront origin errors

**Diagnosis**:

```bash
# Check S3 bucket policy
aws s3api get-bucket-policy --bucket $S3_BUCKET_NAME

# Test S3 access
aws s3 ls s3://$S3_BUCKET_NAME/

# Check CloudFront OAC configuration
aws cloudfront get-origin-access-control --id $OAC_ID
```

**Solutions**:

1. **Incorrect Bucket Policy**

   ```bash
   # Update bucket policy for CloudFront OAC
   node scripts/setup-s3-infrastructure.js

   # Verify policy
   aws s3api get-bucket-policy --bucket $S3_BUCKET_NAME
   ```

2. **Missing OAC Configuration**

   ```bash
   # Configure Origin Access Control
   node scripts/setup-complete-cloudfront.js

   # Update CloudFront distribution
   node scripts/configure-cloudfront-security.js
   ```

### Issue: CloudFront Distribution Errors

**Symptoms**:

- 502/503 errors from CloudFront
- Distribution in "InProgress" state
- Origin connection failures

**Diagnosis**:

```bash
# Check distribution status
aws cloudfront get-distribution --id $CLOUDFRONT_DISTRIBUTION_ID --query 'Distribution.Status'

# Check distribution configuration
aws cloudfront get-distribution-config --id $CLOUDFRONT_DISTRIBUTION_ID

# Test origin connectivity
curl -I https://$S3_BUCKET_NAME.s3.amazonaws.com/index.html
```

**Solutions**:

1. **Distribution Deployment Issues**

   ```bash
   # Wait for deployment to complete (can take 15-20 minutes)
   aws cloudfront wait distribution-deployed --id $CLOUDFRONT_DISTRIBUTION_ID

   # Check for deployment errors in AWS Console
   ```

2. **Origin Configuration Issues**

   ```bash
   # Verify origin configuration
   node scripts/validate-s3-infrastructure.js

   # Update origin settings
   node scripts/setup-complete-cloudfront.js
   ```

## Cost Issues

### Issue: Unexpected Cost Increases

**Symptoms**:

- AWS bill higher than expected
- Cost alerts triggered
- Budget exceeded

**Diagnosis**:

```bash
# Analyze costs
node scripts/cost-analysis-optimizer.js

# Check usage patterns
# Review AWS Cost Explorer manually

# Check invalidation costs
node scripts/cache-invalidation-manager.js report
```

**Solutions**:

1. **High Invalidation Costs**

   ```bash
   # Review invalidation patterns
   aws cloudfront list-invalidations --distribution-id $CLOUDFRONT_DISTRIBUTION_ID

   # Solution: Optimize deployment process to reduce invalidations
   ```

2. **High Data Transfer Costs**

   ```bash
   # Check cache hit ratio
   node scripts/cloudfront-analytics-integration.js

   # Solution: Improve caching to reduce origin requests
   ```

3. **Storage Costs**

   ```bash
   # Analyze S3 storage
   aws s3api list-objects-v2 --bucket $S3_BUCKET_NAME --query 'sum(Contents[].Size)'

   # Solution: Implement lifecycle policies, clean up old versions
   ```

## Monitoring and Alerting Issues

### Issue: Monitoring Scripts Failing

**Symptoms**:

- Monitoring scripts return errors
- No monitoring data available
- Dashboard not updating

**Diagnosis**:

```bash
# Test monitoring scripts individually
node scripts/deployment-status-dashboard.js
node scripts/performance-optimization-monitor.js
node scripts/security-maintenance-monitor.js

# Check AWS permissions
aws sts get-caller-identity

# Verify CloudWatch access
aws cloudwatch list-metrics --namespace AWS/CloudFront
```

**Solutions**:

1. **Permission Issues**

   ```bash
   # Check IAM permissions
   aws iam get-user

   # Solution: Update IAM policies for CloudWatch access
   ```

2. **Script Configuration Issues**

   ```bash
   # Verify environment variables
   node scripts/validate-production-env.js

   # Solution: Update configuration files
   ```

### Issue: Alerts Not Working

**Symptoms**:

- No alerts received for issues
- Alert fatigue from false positives
- Missing critical alerts

**Diagnosis**:

```bash
# Test alert mechanisms
node scripts/setup-deployment-notifications.js

# Check CloudWatch alarms
aws cloudwatch describe-alarms

# Verify notification endpoints
```

**Solutions**:

1. **Notification Configuration**

   ```bash
   # Update notification settings
   node scripts/setup-deployment-notifications.js

   # Test notifications
   ```

2. **Alert Thresholds**

   ```bash
   # Review and adjust alert thresholds
   # Edit monitoring configuration files

   # Update CloudWatch alarms
   node scripts/setup-cloudwatch-monitoring.js
   ```

## Emergency Procedures

### Site Completely Down (P1 Incident)

**Immediate Actions (< 5 minutes)**:

1. **Confirm Outage**:

   ```bash
   # Test site accessibility
   curl -I https://$DOMAIN

   # Check from multiple locations
   # Use external monitoring tools
   ```

2. **Quick Status Check**:

   ```bash
   # System status
   node scripts/deployment-status-dashboard.js

   # AWS service status
   curl -s https://status.aws.amazon.com/
   ```

3. **Emergency Rollback**:

   ```bash
   # Immediate rollback to last known good version
   node scripts/rollback.js emergency

   # Verify rollback success
   curl -I https://$DOMAIN
   ```

4. **Notify Stakeholders**:
   ```bash
   # Send incident notification
   echo "CRITICAL INCIDENT: Site down - $(date)" | mail -s "Site Down" team@company.com
   ```

**Investigation (< 30 minutes)**:

1. **Detailed Diagnostics**:

   ```bash
   # Comprehensive testing
   node scripts/comprehensive-deployment-test.js

   # Infrastructure validation
   node scripts/validate-s3-infrastructure.js

   # Security validation
   node scripts/security-validation-suite.js
   ```

2. **Log Analysis**:

   ```bash
   # Check deployment logs
   cat logs/deployments.json

   # Review GitHub Actions logs
   gh run view --log

   # Check AWS CloudTrail (if configured)
   ```

3. **Root Cause Analysis**:
   - Review recent changes
   - Check for configuration changes
   - Analyze error patterns
   - Identify failure point

**Resolution (< 2 hours)**:

1. **Apply Fix**:

   ```bash
   # Fix identified issue
   # Test fix locally
   npm run build
   npm run export

   # Deploy fix
   git add .
   git commit -m "Fix: [description]"
   git push origin main
   ```

2. **Verify Resolution**:

   ```bash
   # Comprehensive validation
   node scripts/comprehensive-deployment-test.js

   # Performance check
   node scripts/core-web-vitals-monitor.js

   # Security validation
   node scripts/security-validation-suite.js
   ```

3. **Monitor Stability**:
   ```bash
   # Continuous monitoring for 2 hours
   watch -n 300 'node scripts/deployment-status-dashboard.js'
   ```

### Performance Degradation (P2 Incident)

**Immediate Actions (< 15 minutes)**:

1. **Assess Impact**:

   ```bash
   # Performance analysis
   node scripts/performance-benchmarking.js

   # Core Web Vitals check
   node scripts/core-web-vitals-monitor.js
   ```

2. **Quick Fixes**:

   ```bash
   # Cache optimization
   node scripts/caching-cdn-optimizer.js

   # Force cache refresh if needed
   node scripts/cache-invalidation-manager.js invalidate full
   ```

**Investigation and Resolution**:

1. **Detailed Analysis**:

   ```bash
   # Comprehensive performance monitoring
   node scripts/performance-optimization-monitor.js

   # CloudFront analytics
   node scripts/cloudfront-analytics-integration.js
   ```

2. **Apply Optimizations**:
   ```bash
   # Configure optimizations
   node scripts/configure-cloudfront-caching.js
   node scripts/compression-performance-tester.js
   ```

### Security Incident (P1/P2 Incident)

**Immediate Actions (< 15 minutes)**:

1. **Assess Threat**:

   ```bash
   # Security validation
   node scripts/security-validation-suite.js

   # Check for vulnerabilities
   npm audit --audit-level moderate
   ```

2. **Contain Threat**:
   ```bash
   # Disable distribution if necessary
   # Block suspicious traffic
   # Update security configurations
   node scripts/configure-cloudfront-security.js
   ```

**Investigation and Recovery**:

1. **Security Analysis**:

   ```bash
   # Comprehensive security check
   node scripts/security-maintenance-monitor.js

   # Penetration testing
   node scripts/penetration-testing-suite.js
   ```

2. **Apply Security Fixes**:

   ```bash
   # Update dependencies
   npm update
   npm audit fix

   # Apply security patches
   # Update security configurations
   ```

## Escalation Procedures

### Internal Escalation

1. **Level 1**: Development Team (0-2 hours)
   - Initial troubleshooting
   - Standard procedures
   - Common issue resolution

2. **Level 2**: Senior DevOps (2-4 hours)
   - Complex infrastructure issues
   - Security incidents
   - Performance optimization

3. **Level 3**: Management (4-8 hours)
   - Business impact decisions
   - Vendor escalation
   - Resource allocation

### External Escalation

1. **AWS Support**:

   ```bash
   # Create support case
   aws support create-case --service-code "amazon-cloudfront" --severity-code "high" --category-code "performance" --subject "CloudFront Performance Issue" --communication-body "Description of issue"
   ```

2. **GitHub Support**:
   - For GitHub Actions issues
   - Repository access problems
   - API rate limiting

### Emergency Contacts

- **Development Team**: dev-team@company.com
- **DevOps Team**: devops@company.com
- **Security Team**: security@company.com
- **Management**: management@company.com
- **AWS Support**: [Support case URL]

## Prevention and Monitoring

### Proactive Monitoring

```bash
# Daily health checks
node scripts/deployment-status-dashboard.js

# Weekly comprehensive checks
node scripts/comprehensive-deployment-test.js
node scripts/performance-benchmarking.js
node scripts/security-validation-suite.js

# Monthly audits
node scripts/cost-analysis-optimizer.js
node scripts/security-maintenance-monitor.js
```

### Preventive Measures

1. **Automated Testing**:
   - Pre-deployment validation
   - Continuous monitoring
   - Automated rollback triggers

2. **Regular Maintenance**:
   - Dependency updates
   - Security patches
   - Performance optimization

3. **Documentation Updates**:
   - Keep procedures current
   - Document new issues
   - Update contact information

---

**Document Information**:

- **Version**: 1.0
- **Last Updated**: [Current Date]
- **Maintained By**: DevOps Team
- **Review Schedule**: Monthly
- **Emergency Contact**: devops@company.com
