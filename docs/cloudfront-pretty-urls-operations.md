# CloudFront Pretty URLs - Operational Documentation

## Overview

This document provides comprehensive operational guidance for the CloudFront Pretty URLs implementation. The system uses CloudFront Functions to enable clean URL routing for a Next.js static site deployed on S3 + CloudFront architecture.

## Architecture Summary

### Components
- **CloudFront Distribution**: `E2IBMHQ3GCW6ZK`
- **S3 Bucket**: `mobile-marketing-site-prod-1759705011281-tyzuo9`
- **CloudFront Function**: `pretty-urls-rewriter`
- **Domain**: `https://d15sc9fc739ev2.cloudfront.net`

### URL Rewriting Logic

The CloudFront Function implements the following URL transformations:

```javascript
// Function: pretty-urls-rewriter
function handler(event) {
    var request = event.request;
    var uri = request.uri;
    
    // Skip files with extensions (except directories)
    if (uri.includes('.') && !uri.endsWith('/')) {
        return request;
    }
    
    // Directory paths: /privacy-policy/ → /privacy-policy/index.html
    if (uri.endsWith('/')) {
        request.uri += 'index.html';
    }
    // Extensionless paths: /about → /about/index.html
    else if (!uri.includes('.')) {
        request.uri += '/index.html';
    }
    
    return request;
}
```

### URL Transformation Examples

| Original URL | Rewritten URL | Description |
|--------------|---------------|-------------|
| `/` | `/index.html` | Root URL (handled by Default Root Object) |
| `/privacy-policy/` | `/privacy-policy/index.html` | Directory URL |
| `/about` | `/about/index.html` | Extensionless URL |
| `/styles.css` | `/styles.css` | Static asset (no change) |
| `/images/logo.png` | `/images/logo.png` | Image asset (no change) |

## Configuration Details

### Default Root Object
- **Setting**: `index.html`
- **Purpose**: Serves index.html when accessing root URL (/)
- **Location**: CloudFront Distribution Settings

### CloudFront Function Association
- **Function Name**: `pretty-urls-rewriter`
- **Event Type**: `viewer-request`
- **Cache Behavior**: Default (`*`)
- **Stage**: `LIVE`

### Cache Behavior Settings
- **Path Pattern**: `*` (default)
- **Origin**: S3 bucket via Origin Access Control (OAC)
- **Viewer Protocol Policy**: Redirect HTTP to HTTPS
- **Allowed HTTP Methods**: GET, HEAD
- **Cache Policy**: Managed-CachingOptimized
- **Origin Request Policy**: Managed-CORS-S3Origin

## Operational Procedures

### Function Updates

#### 1. Update Function Code
```bash
# Navigate to project directory
cd /path/to/project

# Update function using management script
node scripts/cloudfront-function-manager.js update \
  --function-name pretty-urls-rewriter \
  --code-file scripts/cloudfront-function-code.js
```

#### 2. Test Function Changes
```bash
# Test function locally first
node scripts/test-cloudfront-function.js

# Deploy to DEVELOPMENT stage
node scripts/cloudfront-function-manager.js deploy \
  --function-name pretty-urls-rewriter \
  --stage DEVELOPMENT

# Test in development
node scripts/validate-pretty-urls.js --stage development

# Promote to LIVE stage
node scripts/cloudfront-function-manager.js promote \
  --function-name pretty-urls-rewriter
```

#### 3. Validate Deployment
```bash
# Run comprehensive URL validation
node scripts/post-deployment-pretty-urls-validation.js

# Check function association
node scripts/validate-function-association-implementation.js
```

### Configuration Management

#### Backup Current Configuration
```bash
# Backup distribution configuration
node scripts/cloudfront-configuration-rollback.js backup \
  --distribution-id E2IBMHQ3GCW6ZK
```

#### Update Distribution Settings
```bash
# Update CloudFront configuration
node scripts/configure-cloudfront-pretty-urls.js \
  --distribution-id E2IBMHQ3GCW6ZK \
  --function-name pretty-urls-rewriter
```

#### Rollback Configuration
```bash
# Rollback to previous configuration
node scripts/cloudfront-configuration-rollback.js restore \
  --distribution-id E2IBMHQ3GCW6ZK \
  --backup-id <backup-timestamp>
```

### Cache Management

#### Invalidate Cache After Changes
```bash
# Invalidate all paths (use sparingly)
aws cloudfront create-invalidation \
  --distribution-id E2IBMHQ3GCW6ZK \
  --paths "/*"

# Targeted invalidation for specific paths
node scripts/targeted-cache-invalidation.js \
  --paths "/privacy-policy/" "/about/" "/"
```

#### Monitor Cache Performance
```bash
# Check cache hit ratios
node scripts/verify-cache-behavior.js \
  --distribution-id E2IBMHQ3GCW6ZK

# Test cache effectiveness
node scripts/test-cache-effectiveness.js
```

## Monitoring and Health Checks

### Key Metrics to Monitor

#### CloudFront Function Metrics
- **Function Execution Count**: Number of function invocations
- **Function Execution Time**: Average execution duration
- **Function Errors**: Error rate and types
- **Function Throttles**: Rate limiting events

#### URL Accessibility Metrics
- **Root URL Response**: HTTP 200 for `/`
- **Directory URLs**: HTTP 200 for `/privacy-policy/`, `/about/`
- **Static Assets**: HTTP 200 for CSS, JS, images
- **Error Rates**: 4xx and 5xx response rates

#### Performance Metrics
- **Cache Hit Ratio**: Percentage of requests served from cache
- **Origin Response Time**: S3 response latency
- **Edge Response Time**: CloudFront response latency
- **Data Transfer**: Bandwidth usage patterns

### Health Check Commands

#### Daily Health Check
```bash
# Run comprehensive validation
node scripts/validate-pretty-urls.js --comprehensive

# Check function status
node scripts/cloudfront-function-manager.js status \
  --function-name pretty-urls-rewriter

# Validate URL patterns
node scripts/test-url-validation-logic.js
```

#### Weekly Performance Review
```bash
# Generate performance report
node scripts/performance-optimization-validator.js \
  --distribution-id E2IBMHQ3GCW6ZK

# Check cache effectiveness
node scripts/test-cache-effectiveness.js --detailed

# Review function metrics
aws logs filter-log-events \
  --log-group-name /aws/cloudfront/function/pretty-urls-rewriter \
  --start-time $(date -d '7 days ago' +%s)000
```

## Security Considerations

### Function Security
- **Input Validation**: Function validates URI format and length
- **Path Traversal Protection**: Blocks `..` and `//` patterns
- **Error Handling**: Graceful fallback for malformed requests
- **No External Calls**: Function operates in isolation

### Access Control
- **S3 Bucket**: Private with OAC-only access
- **CloudFront**: HTTPS-only with security headers
- **Function Permissions**: Limited to CloudFront execution
- **IAM Roles**: Least privilege access for management

### Security Monitoring
```bash
# Check for suspicious URL patterns
aws logs filter-log-events \
  --log-group-name /aws/cloudfront/function/pretty-urls-rewriter \
  --filter-pattern "ERROR" \
  --start-time $(date -d '24 hours ago' +%s)000

# Validate security headers
node scripts/security-headers-validation.js \
  --url https://d15sc9fc739ev2.cloudfront.net
```

## Performance Optimization

### Function Performance
- **Execution Time**: Target <1ms per request
- **Memory Usage**: Minimal string operations
- **Code Efficiency**: Early returns for non-applicable requests

### Cache Optimization
- **Cache Keys**: Ensure rewritten URLs cache effectively
- **TTL Settings**: Appropriate cache duration for content types
- **Compression**: Enable gzip/brotli for text content

### Monitoring Performance
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
```

## Integration with Deployment Pipeline

### Automated Deployment
The pretty URLs configuration is integrated into the main deployment process:

```bash
# Full deployment with pretty URLs
./deploy-full-site-simple.bat

# Manual configuration update
node scripts/configure-cloudfront-pretty-urls.js
```

### CI/CD Integration
- **GitHub Actions**: Automated deployment on push to main
- **Validation**: Post-deployment URL testing
- **Rollback**: Automatic rollback on validation failure

### Deployment Validation
```bash
# Post-deployment validation
node scripts/post-deployment-validation.js

# Specific pretty URLs validation
node scripts/post-deployment-pretty-urls-validation.js
```

## Maintenance Schedule

### Daily Tasks
- [ ] Monitor function execution metrics
- [ ] Check URL accessibility (automated)
- [ ] Review error logs for anomalies

### Weekly Tasks
- [ ] Performance metrics review
- [ ] Cache hit ratio analysis
- [ ] Security log review
- [ ] Function code review for optimizations

### Monthly Tasks
- [ ] Comprehensive security audit
- [ ] Performance optimization review
- [ ] Documentation updates
- [ ] Disaster recovery testing

### Quarterly Tasks
- [ ] Function code security review
- [ ] Infrastructure cost analysis
- [ ] Capacity planning review
- [ ] Team training updates

## Contact Information

### Primary Contacts
- **DevOps Team**: devops@company.com
- **Security Team**: security@company.com
- **On-Call Engineer**: oncall@company.com

### Escalation Procedures
1. **Level 1**: Development team (response: 1 hour)
2. **Level 2**: DevOps team (response: 30 minutes)
3. **Level 3**: Security team (response: 15 minutes)
4. **Level 4**: Management escalation (immediate)

### Emergency Contacts
- **Emergency Hotline**: +1-XXX-XXX-XXXX
- **Slack Channel**: #cloudfront-alerts
- **PagerDuty**: cloudfront-pretty-urls service

---

*Last Updated: $(date)*
*Document Version: 1.0*
*Next Review Date: $(date -d '+3 months')*