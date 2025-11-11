# CloudFront Pretty URLs - Troubleshooting Guide

## Common Issues and Solutions

### Issue 1: Root URL Returns 404 Error

**Symptoms:**
- Accessing `https://d15sc9fc739ev2.cloudfront.net/` returns 404
- Error message: "The system cannot find the file specified"

**Diagnosis:**
```bash
# Check default root object setting
aws cloudfront get-distribution --id E2IBMHQ3GCW6ZK \
  --query 'Distribution.DistributionConfig.DefaultRootObject'

# Expected output: "index.html"
```

**Solution:**
```bash
# Update default root object
node scripts/configure-cloudfront-pretty-urls.js \
  --fix-root-object \
  --distribution-id E2IBMHQ3GCW6ZK

# Verify the fix
curl -I https://d15sc9fc739ev2.cloudfront.net/
# Expected: HTTP/2 200
```

**Prevention:**
- Always verify default root object is set to "index.html"
- Include root object validation in deployment scripts

---

### Issue 2: Directory URLs Return 403 Forbidden

**Symptoms:**
- URLs like `/privacy-policy/` return 403 Forbidden
- Direct file access `/privacy-policy/index.html` works

**Diagnosis:**
```bash
# Check if CloudFront Function is attached
node scripts/validate-function-association-implementation.js

# Check function status
aws cloudfront describe-function \
  --name pretty-urls-rewriter \
  --stage LIVE
```

**Solution:**
```bash
# Recreate and attach function
node scripts/cloudfront-function-manager.js create \
  --function-name pretty-urls-rewriter \
  --attach-to-distribution E2IBMHQ3GCW6ZK

# Validate function attachment
node scripts/test-cloudfront-function-association.js
```

**Prevention:**
- Monitor function association status
- Include function validation in health checks

---

### Issue 3: CloudFront Function Errors

**Symptoms:**
- Function execution errors in CloudWatch logs
- Intermittent 500 errors for pretty URLs

**Diagnosis:**
```bash
# Check function logs
aws logs filter-log-events \
  --log-group-name /aws/cloudfront/function/pretty-urls-rewriter \
  --filter-pattern "ERROR" \
  --start-time $(date -d '24 hours ago' +%s)000

# Test function locally
node scripts/test-cloudfront-function.js --verbose
```

**Common Error Patterns:**
1. **Undefined URI**: Request object missing URI property
2. **Invalid Characters**: Non-ASCII characters in URL
3. **Excessive Length**: URLs exceeding CloudFront limits

**Solution:**
```bash
# Update function with enhanced error handling
node scripts/cloudfront-function-manager.js update \
  --function-name pretty-urls-rewriter \
  --code-file scripts/cloudfront-function-code-enhanced.js

# Deploy to DEVELOPMENT first
node scripts/cloudfront-function-manager.js deploy \
  --function-name pretty-urls-rewriter \
  --stage DEVELOPMENT

# Test thoroughly before promoting to LIVE
node scripts/validate-pretty-urls.js --stage development
```

**Enhanced Function Code:**
```javascript
function handler(event) {
    try {
        var request = event.request;
        var uri = request.uri;
        
        // Validate input
        if (!uri || typeof uri !== 'string' || uri.length === 0) {
            return request;
        }
        
        // Length check (CloudFront limit: 8192 characters)
        if (uri.length > 8000) {
            return request;
        }
        
        // Character validation (basic ASCII check)
        if (!/^[\x20-\x7E]*$/.test(uri)) {
            return request;
        }
        
        // Apply URL rewriting logic
        if (uri.endsWith('/') && uri.length > 1) {
            request.uri += 'index.html';
        } else if (!uri.includes('.') && !uri.endsWith('/') && uri !== '/') {
            request.uri += '/index.html';
        }
        
        return request;
    } catch (error) {
        // Log error and return original request
        console.log('Function error:', error.message);
        return event.request;
    }
}
```

---

### Issue 4: Cache Invalidation Not Working

**Symptoms:**
- Old content still served after deployment
- Pretty URL changes not reflected immediately

**Diagnosis:**
```bash
# Check recent invalidations
aws cloudfront list-invalidations \
  --distribution-id E2IBMHQ3GCW6ZK \
  --max-items 5

# Check invalidation status
aws cloudfront get-invalidation \
  --distribution-id E2IBMHQ3GCW6ZK \
  --id <invalidation-id>
```

**Solution:**
```bash
# Force comprehensive cache invalidation
aws cloudfront create-invalidation \
  --distribution-id E2IBMHQ3GCW6ZK \
  --paths "/*"

# Wait for completion (can take 10-15 minutes)
aws cloudfront wait invalidation-completed \
  --distribution-id E2IBMHQ3GCW6ZK \
  --id <invalidation-id>

# Verify cache is cleared
node scripts/verify-cache-behavior.js --force-refresh
```

**Prevention:**
- Include cache invalidation in deployment scripts
- Use targeted invalidation for specific paths
- Monitor invalidation completion before validation

---

### Issue 5: Static Assets Not Loading

**Symptoms:**
- CSS, JS, or image files return 404
- Pretty URLs work but assets fail

**Diagnosis:**
```bash
# Test static asset access
curl -I https://d15sc9fc739ev2.cloudfront.net/styles.css
curl -I https://d15sc9fc739ev2.cloudfront.net/images/logo.png

# Check function logic for asset handling
node scripts/test-cloudfront-function.js --test-assets
```

**Solution:**
```bash
# Verify function doesn't rewrite asset URLs
node scripts/test-url-validation-logic.js --include-assets

# If function is incorrectly rewriting assets, update logic:
# Ensure files with extensions are passed through unchanged
```

**Asset Handling Validation:**
```javascript
// Test cases for asset handling
const assetTests = [
    { uri: '/styles.css', expected: '/styles.css' },
    { uri: '/script.js', expected: '/script.js' },
    { uri: '/images/logo.png', expected: '/images/logo.png' },
    { uri: '/fonts/font.woff2', expected: '/fonts/font.woff2' }
];
```

---

### Issue 6: Performance Degradation

**Symptoms:**
- Increased response times after function deployment
- High function execution times in CloudWatch

**Diagnosis:**
```bash
# Check function performance metrics
aws cloudwatch get-metric-statistics \
  --namespace AWS/CloudFront \
  --metric-name FunctionExecutionTime \
  --dimensions Name=FunctionName,Value=pretty-urls-rewriter \
  --start-time $(date -d '24 hours ago' --iso-8601) \
  --end-time $(date --iso-8601) \
  --period 3600 \
  --statistics Average,Maximum

# Check cache hit ratios
node scripts/test-cache-effectiveness.js --detailed
```

**Solution:**
```bash
# Optimize function code for performance
node scripts/cloudfront-function-manager.js update \
  --function-name pretty-urls-rewriter \
  --code-file scripts/cloudfront-function-optimized.js

# Monitor performance improvement
node scripts/performance-optimization-validator.js \
  --distribution-id E2IBMHQ3GCW6ZK
```

**Performance Optimization Tips:**
1. **Early Returns**: Exit function quickly for non-applicable requests
2. **Minimal String Operations**: Reduce string manipulation overhead
3. **Avoid Regex**: Use simple string methods instead of regular expressions
4. **Cache-Friendly URLs**: Ensure rewritten URLs cache effectively

---

### Issue 7: Security Header Conflicts

**Symptoms:**
- Security headers missing or incorrect
- Content Security Policy violations

**Diagnosis:**
```bash
# Check security headers
curl -I https://d15sc9fc739ev2.cloudfront.net/ | grep -E "(Strict-Transport|Content-Security|X-Frame)"

# Validate security configuration
node scripts/security-headers-validation.js \
  --url https://d15sc9fc739ev2.cloudfront.net
```

**Solution:**
```bash
# Verify security headers are preserved
node scripts/cloudfront-security-headers-validator.js \
  --distribution-id E2IBMHQ3GCW6ZK

# Update security configuration if needed
node scripts/configure-cloudfront-security.js \
  --distribution-id E2IBMHQ3GCW6ZK
```

---

## Diagnostic Commands Reference

### Quick Health Check
```bash
# One-command health check
node scripts/validate-pretty-urls.js --quick

# Expected output: All tests PASSED
```

### Detailed Diagnostics
```bash
# Comprehensive system check
node scripts/post-deployment-pretty-urls-validation.js --verbose

# Function-specific diagnostics
node scripts/cloudfront-function-manager.js diagnose \
  --function-name pretty-urls-rewriter
```

### Performance Analysis
```bash
# Performance metrics
node scripts/performance-optimization-validator.js \
  --distribution-id E2IBMHQ3GCW6ZK \
  --include-function-metrics

# Cache analysis
node scripts/verify-cache-behavior.js --detailed
```

### Security Validation
```bash
# Security audit
node scripts/security-headers-validation.js \
  --comprehensive \
  --url https://d15sc9fc739ev2.cloudfront.net

# Access control validation
node scripts/validate-access-control-audit.js \
  --distribution-id E2IBMHQ3GCW6ZK
```

## Emergency Procedures

### Complete System Failure

**Immediate Actions:**
1. **Disable Function**: Remove function association to restore basic functionality
2. **Cache Invalidation**: Clear all cached content
3. **Rollback**: Restore previous working configuration
4. **Notify**: Alert stakeholders and users

**Commands:**
```bash
# Emergency rollback
node scripts/cloudfront-configuration-rollback.js emergency \
  --distribution-id E2IBMHQ3GCW6ZK

# Verify basic functionality
curl -I https://d15sc9fc739ev2.cloudfront.net/privacy-policy/index.html
# Should return HTTP/2 200
```

### Partial Functionality Loss

**Assessment:**
```bash
# Quick assessment of what's working
node scripts/validate-pretty-urls.js --assessment-mode

# Identify specific failure points
node scripts/test-url-validation-logic.js --failure-analysis
```

**Targeted Fixes:**
```bash
# Fix specific issues based on assessment
node scripts/cloudfront-function-manager.js repair \
  --function-name pretty-urls-rewriter \
  --issue-type <identified-issue>
```

## Monitoring and Alerting Setup

### CloudWatch Alarms
```bash
# Set up function error rate alarm
aws cloudwatch put-metric-alarm \
  --alarm-name "CloudFront-Function-Errors" \
  --alarm-description "CloudFront Function error rate too high" \
  --metric-name FunctionExecutionErrors \
  --namespace AWS/CloudFront \
  --statistic Sum \
  --period 300 \
  --threshold 10 \
  --comparison-operator GreaterThanThreshold \
  --dimensions Name=FunctionName,Value=pretty-urls-rewriter \
  --evaluation-periods 2

# Set up performance alarm
aws cloudwatch put-metric-alarm \
  --alarm-name "CloudFront-Function-Performance" \
  --alarm-description "CloudFront Function execution time too high" \
  --metric-name FunctionExecutionTime \
  --namespace AWS/CloudFront \
  --statistic Average \
  --period 300 \
  --threshold 5 \
  --comparison-operator GreaterThanThreshold \
  --dimensions Name=FunctionName,Value=pretty-urls-rewriter \
  --evaluation-periods 3
```

### Automated Health Checks
```bash
# Set up automated monitoring
node scripts/setup-monitoring-dashboard.js \
  --include-pretty-urls \
  --distribution-id E2IBMHQ3GCW6ZK

# Configure alerting
node scripts/configure-deployment-alerts.js \
  --include-function-monitoring
```

## Best Practices for Prevention

### Development Practices
1. **Test Locally**: Always test function changes locally first
2. **Staged Deployment**: Use DEVELOPMENT stage before LIVE
3. **Comprehensive Testing**: Test all URL patterns and edge cases
4. **Performance Monitoring**: Monitor function execution metrics

### Operational Practices
1. **Regular Health Checks**: Daily automated validation
2. **Performance Reviews**: Weekly performance analysis
3. **Security Audits**: Monthly security validation
4. **Documentation Updates**: Keep troubleshooting guide current

### Deployment Practices
1. **Backup First**: Always backup configuration before changes
2. **Validate After**: Run comprehensive validation after deployment
3. **Monitor Closely**: Watch metrics for 24 hours after changes
4. **Rollback Plan**: Have tested rollback procedures ready

---

*Last Updated: $(date)*
*Document Version: 1.0*
*For emergency support: oncall@company.com*