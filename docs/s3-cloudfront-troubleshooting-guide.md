# S3 + CloudFront Deployment Troubleshooting Guide

## Overview

This guide provides detailed troubleshooting procedures for common issues
encountered with the S3 + CloudFront deployment infrastructure. Each issue
includes symptoms, root causes, diagnostic steps, and resolution procedures.

## Quick Diagnostic Commands

Before diving into specific issues, run these commands to get an overview of
system health:

```bash
# Overall system status
node scripts/deployment-status-dashboard.js

# Comprehensive deployment test
node scripts/comprehensive-deployment-test.js

# Site functionality validation
node scripts/validate-site-functionality.js

# Environment validation
node scripts/validate-env.js
```

## Deployment Issues

### Issue: GitHub Actions Deployment Fails

**Symptoms:**

- GitHub Actions workflow shows failure status
- Build or deployment steps fail
- Site is not updated after code push

**Common Causes:**

- AWS credentials expired or incorrect
- S3 bucket permissions issues
- CloudFront distribution problems
- Build process failures

**Diagnostic Steps:**

1. Check GitHub Actions logs:

   ```bash
   # Review the failed workflow in GitHub Actions tab
   # Look for specific error messages in build/deploy steps
   ```

2. Validate AWS credentials:

   ```bash
   # Test AWS access locally
   aws sts get-caller-identity

   # Verify GitHub Secrets are set correctly
   # Check: AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION
   ```

3. Test deployment locally:

   ```bash
   # Run deployment script locally
   node scripts/deploy.js

   # Check for specific error messages
   ```

**Resolution Steps:**

1. **Credential Issues:**

   ```bash
   # Update GitHub Secrets with new AWS credentials
   # Ensure IAM user has required permissions
   ```

2. **Permission Issues:**

   ```bash
   # Verify IAM policy includes:
   # - S3: GetObject, PutObject, DeleteObject, ListBucket
   # - CloudFront: CreateInvalidation, GetDistribution
   ```

3. **Build Issues:**

   ```bash
   # Test build locally
   npm run build
   npm run export

   # Check for build errors and fix
   ```

### Issue: S3 Upload Failures

**Symptoms:**

- Files not appearing in S3 bucket
- Upload timeout errors
- Permission denied errors

**Diagnostic Steps:**

1. Check S3 bucket status:

   ```bash
   node scripts/validate-s3-infrastructure.js
   ```

2. Test S3 access:
   ```bash
   aws s3 ls s3://your-bucket-name
   aws s3 cp test-file.txt s3://your-bucket-name/
   ```

**Resolution Steps:**

1. **Bucket Policy Issues:**

   ```bash
   # Update bucket policy to allow deployment user access
   node scripts/setup-s3-infrastructure.js
   ```

2. **Network Issues:**
   ```bash
   # Retry upload with exponential backoff
   # Check AWS service status
   ```

### Issue: CloudFront Invalidation Failures

**Symptoms:**

- Cache not clearing after deployment
- Old content still served
- Invalidation API errors

**Diagnostic Steps:**

1. Check invalidation status:

   ```bash
   node scripts/cache-invalidation-manager.js report
   ```

2. Test invalidation manually:
   ```bash
   node scripts/cache-invalidation-manager.js invalidate full
   ```

**Resolution Steps:**

1. **Permission Issues:**

   ```bash
   # Ensure CloudFront:CreateInvalidation permission
   # Check distribution ID is correct
   ```

2. **Rate Limiting:**
   ```bash
   # Wait for existing invalidations to complete
   # Batch invalidations to reduce API calls
   ```

## Performance Issues

### Issue: Slow Site Loading

**Symptoms:**

- High page load times
- Poor Core Web Vitals scores
- User complaints about performance

**Diagnostic Steps:**

1. Run performance analysis:

   ```bash
   node scripts/performance-benchmarking.js
   node scripts/core-web-vitals-monitor.js
   ```

2. Check cache hit ratio:

   ```bash
   node scripts/caching-cdn-optimizer.js
   ```

3. Analyze CloudFront metrics:
   ```bash
   node scripts/deployment-status-dashboard.js
   ```

**Resolution Steps:**

1. **Cache Optimization:**

   ```bash
   # Review and optimize cache settings
   nano config/deployment-config.json

   # Update CloudFront cache behaviors
   node scripts/configure-cloudfront-caching.js
   ```

2. **Compression Issues:**

   ```bash
   # Enable compression if not already enabled
   node scripts/compression-performance-tester.js

   # Update CloudFront compression settings
   node scripts/configure-cloudfront-security.js
   ```

3. **Origin Performance:**
   ```bash
   # Check S3 response times
   # Consider using CloudFront origin shield
   ```

### Issue: High Cache Miss Rate

**Symptoms:**

- Frequent requests to S3 origin
- High data transfer costs
- Slow response times

**Diagnostic Steps:**

1. Analyze cache performance:

   ```bash
   node scripts/caching-cdn-optimizer.js
   ```

2. Review cache behaviors:
   ```bash
   # Check CloudFront distribution configuration
   aws cloudfront get-distribution --id YOUR_DISTRIBUTION_ID
   ```

**Resolution Steps:**

1. **Optimize Cache Settings:**

   ```bash
   # Increase TTL for static assets
   # Set appropriate cache headers
   # Review query string and header forwarding
   ```

2. **Fix Cache-Busting Issues:**
   ```bash
   # Ensure static assets have versioned filenames
   # Review Next.js build configuration
   ```

## Security Issues

### Issue: SSL Certificate Problems

**Symptoms:**

- SSL certificate warnings in browser
- HTTPS not working
- Certificate expiration alerts

**Diagnostic Steps:**

1. Check certificate status:

   ```bash
   node scripts/ssl-certificate-validator.js
   ```

2. Validate TLS configuration:
   ```bash
   node scripts/comprehensive-tls-validator.js
   ```

**Resolution Steps:**

1. **Certificate Renewal:**

   ```bash
   # Request new certificate
   node scripts/setup-ssl-certificate.js

   # Update CloudFront distribution
   ```

2. **Domain Validation:**
   ```bash
   # Verify DNS records for domain validation
   # Check certificate domain matches CloudFront CNAME
   ```

### Issue: Security Headers Missing

**Symptoms:**

- Security scanner warnings
- Missing security headers in response
- Vulnerability reports

**Diagnostic Steps:**

1. Check security headers:

   ```bash
   node scripts/security-headers-validator.js
   ```

2. Run security validation:
   ```bash
   node scripts/security-validation-suite.js
   ```

**Resolution Steps:**

1. **Configure Security Headers:**

   ```bash
   # Update security headers configuration
   nano config/deployment-config.json

   # Apply security headers to CloudFront
   node scripts/configure-cloudfront-security.js
   ```

2. **Validate Implementation:**

   ```bash
   # Test security headers
   curl -I https://your-domain.com

   # Run comprehensive security test
   node scripts/security-validation-suite.js
   ```

## Access and Permission Issues

### Issue: S3 Bucket Access Denied

**Symptoms:**

- 403 Forbidden errors
- Unable to upload files
- CloudFront origin errors

**Diagnostic Steps:**

1. Check bucket permissions:

   ```bash
   aws s3api get-bucket-policy --bucket your-bucket-name
   aws s3api get-bucket-acl --bucket your-bucket-name
   ```

2. Validate IAM permissions:
   ```bash
   aws iam get-user-policy --user-name deployment-user --policy-name deployment-policy
   ```

**Resolution Steps:**

1. **Fix Bucket Policy:**

   ```bash
   # Update bucket policy for CloudFront OAC access
   node scripts/setup-s3-infrastructure.js
   ```

2. **Update IAM Permissions:**
   ```bash
   # Ensure deployment user has required S3 permissions
   # Update IAM policy as needed
   ```

### Issue: CloudFront Origin Access Control Problems

**Symptoms:**

- Direct S3 access works but CloudFront doesn't
- Origin access errors in CloudFront logs
- Inconsistent content delivery

**Diagnostic Steps:**

1. Check OAC configuration:

   ```bash
   aws cloudfront get-origin-access-control --id YOUR_OAC_ID
   ```

2. Validate S3 bucket policy:
   ```bash
   node scripts/validate-s3-infrastructure.js
   ```

**Resolution Steps:**

1. **Recreate OAC:**

   ```bash
   # Delete and recreate Origin Access Control
   node scripts/setup-cloudfront-distribution.js
   ```

2. **Update Bucket Policy:**
   ```bash
   # Ensure bucket policy allows OAC access only
   node scripts/setup-s3-infrastructure.js
   ```

## Cost and Billing Issues

### Issue: Unexpected High Costs

**Symptoms:**

- AWS bill higher than expected
- Cost alerts triggered
- High data transfer charges

**Diagnostic Steps:**

1. Run cost analysis:

   ```bash
   node scripts/cost-analysis-optimizer.js
   ```

2. Check invalidation costs:
   ```bash
   node scripts/cache-invalidation-manager.js report
   ```

**Resolution Steps:**

1. **Optimize Cache Settings:**

   ```bash
   # Reduce unnecessary invalidations
   # Optimize cache TTL settings
   # Enable compression to reduce data transfer
   ```

2. **Review Usage Patterns:**
   ```bash
   # Analyze CloudFront usage reports
   # Consider price class optimization
   # Review storage class usage in S3
   ```

## Monitoring and Alerting Issues

### Issue: Missing Monitoring Data

**Symptoms:**

- No metrics in CloudWatch
- Monitoring scripts return no data
- Missing performance data

**Diagnostic Steps:**

1. Check CloudWatch permissions:

   ```bash
   aws logs describe-log-groups
   aws cloudwatch list-metrics --namespace AWS/CloudFront
   ```

2. Validate monitoring setup:
   ```bash
   node scripts/setup-cloudwatch-monitoring.js
   ```

**Resolution Steps:**

1. **Enable CloudWatch Metrics:**

   ```bash
   # Enable detailed monitoring for CloudFront
   # Configure S3 request metrics
   ```

2. **Fix Permissions:**
   ```bash
   # Add CloudWatch permissions to IAM policy
   # Enable CloudTrail for API logging
   ```

## Network and Connectivity Issues

### Issue: Site Not Accessible

**Symptoms:**

- Domain not resolving
- Connection timeouts
- DNS errors

**Diagnostic Steps:**

1. Check DNS resolution:

   ```bash
   nslookup your-domain.com
   dig your-domain.com
   ```

2. Test CloudFront distribution:
   ```bash
   curl -I https://d1234567890abc.cloudfront.net
   ```

**Resolution Steps:**

1. **DNS Configuration:**

   ```bash
   # Verify CNAME record points to CloudFront distribution
   # Check DNS propagation
   ```

2. **CloudFront Status:**
   ```bash
   # Ensure distribution is deployed and enabled
   node scripts/deployment-status-dashboard.js
   ```

## Data Integrity Issues

### Issue: Files Missing or Corrupted

**Symptoms:**

- 404 errors for existing files
- Corrupted file downloads
- Inconsistent content

**Diagnostic Steps:**

1. Check S3 bucket contents:

   ```bash
   aws s3 ls s3://your-bucket-name --recursive
   ```

2. Validate file integrity:
   ```bash
   # Compare local and S3 file checksums
   aws s3api head-object --bucket your-bucket-name --key path/to/file
   ```

**Resolution Steps:**

1. **Re-upload Files:**

   ```bash
   # Re-run deployment to restore missing files
   node scripts/deploy.js
   ```

2. **Verify Upload Process:**
   ```bash
   # Check deployment script for upload errors
   # Validate file permissions and encoding
   ```

## Emergency Procedures

### Complete Service Outage

1. **Immediate Assessment:**

   ```bash
   # Check AWS service status
   # Run comprehensive diagnostic
   node scripts/comprehensive-deployment-test.js
   ```

2. **Emergency Rollback:**

   ```bash
   # Rollback to last known good version
   node scripts/rollback.js

   # Verify rollback success
   node scripts/validate-site-functionality.js
   ```

3. **Escalation:**
   - Contact AWS Support if service issue
   - Notify stakeholders of outage
   - Document incident for post-mortem

### Security Incident Response

1. **Immediate Actions:**

   ```bash
   # Disable CloudFront distribution if compromised
   aws cloudfront update-distribution --id YOUR_ID --distribution-config file://disabled-config.json

   # Review access logs for suspicious activity
   node scripts/setup-logging-audit.js
   ```

2. **Investigation:**

   ```bash
   # Run security validation
   node scripts/security-validation-suite.js

   # Check for unauthorized changes
   aws cloudtrail lookup-events --lookup-attributes AttributeKey=EventName,AttributeValue=PutObject
   ```

3. **Recovery:**
   ```bash
   # Apply security patches
   # Update security configurations
   # Re-enable services after validation
   ```

## Prevention and Best Practices

### Regular Health Checks

1. **Daily Monitoring:**

   ```bash
   # Automated health check script
   node scripts/deployment-status-dashboard.js
   ```

2. **Weekly Reviews:**

   ```bash
   # Performance analysis
   node scripts/performance-benchmarking.js

   # Cost analysis
   node scripts/cost-analysis-optimizer.js
   ```

3. **Monthly Audits:**

   ```bash
   # Security validation
   node scripts/security-validation-suite.js

   # Infrastructure validation
   node scripts/validate-s3-infrastructure.js
   ```

### Proactive Measures

1. **Monitoring Setup:**
   - Configure CloudWatch alarms
   - Set up cost alerts
   - Enable access logging

2. **Backup Procedures:**
   - Regular configuration backups
   - Version control for infrastructure
   - Disaster recovery testing

3. **Documentation Maintenance:**
   - Keep runbooks updated
   - Document all changes
   - Maintain contact information

## Getting Help

### Internal Resources

1. Check this troubleshooting guide
2. Review deployment runbook
3. Consult team documentation

### External Resources

1. AWS Documentation
2. AWS Support (if applicable)
3. Community forums and resources

### Escalation Path

1. **Level 1**: Development team self-service
2. **Level 2**: DevOps/Infrastructure team
3. **Level 3**: AWS Support or external consultants

---

**Last Updated**: [Insert date] **Version**: 1.0 **Maintained By**: [Insert
team/person]
