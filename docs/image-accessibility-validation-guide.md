# Image Accessibility Validation Guide

## Overview

This guide covers the automated image accessibility validation tools created to
test image loading via CloudFront CDN endpoints. These tools help identify and
debug image loading issues in the deployment pipeline.

## Validation Tools

### 1. Comprehensive Image Validation (`post-deployment-image-validation.js`)

**Purpose**: Tests multiple images across the site for accessibility via
CloudFront.

**Usage**:

```bash
node scripts/post-deployment-image-validation.js
```

**Features**:

- Tests multiple image paths simultaneously
- Validates HTTP status codes, content types, and response times
- Checks security configuration (S3 direct access blocking)
- Generates comprehensive reports (JSON, Markdown, HTML)
- Includes retry logic for network failures
- Provides detailed error analysis

**Output**:

- `validation-reports/image-accessibility-validation-{timestamp}.json`
- `validation-reports/image-accessibility-validation-{timestamp}.md`
- `validation-reports/image-accessibility-validation-{timestamp}.html`

### 2. Blog Image Specific Test (`test-blog-image-accessibility.js`)

**Purpose**: Focused test for the specific blog image that was failing.

**Usage**:

```bash
node scripts/test-blog-image-accessibility.js
```

**Features**:

- Tests the specific failing blog image:
  `/images/hero/paid-ads-analytics-screenshot.webp`
- Validates security configuration
- Tests alternative image paths
- Provides detailed analysis and recommendations
- Generates focused reports

**Output**:

- `validation-reports/blog-image-test-{timestamp}.json`
- `validation-reports/blog-image-test-{timestamp}.md`

### 3. Complete Validation Suite (`run-image-accessibility-validation.js`)

**Purpose**: Runs both comprehensive and blog-specific tests, generating
combined analysis.

**Usage**:

```bash
node scripts/run-image-accessibility-validation.js
```

**Features**:

- Executes all validation tests in sequence
- Generates combined summary and executive report
- Provides overall status assessment
- Identifies critical issues requiring immediate attention
- Offers prioritized recommendations

**Output**:

- All individual test reports
- `validation-reports/validation-summary-{timestamp}.json`
- `validation-reports/executive-summary-{timestamp}.md`

### 4. Quick Blog Image Test (`quick-blog-image-test.js`)

**Purpose**: Fast validation for the specific blog image during development.

**Usage**:

```bash
node scripts/quick-blog-image-test.js
```

**Features**:

- Lightweight, fast test (5-second timeout)
- Console-only output for quick feedback
- Perfect for development and debugging
- Returns appropriate exit codes for CI/CD integration

## Test Configuration

### Default Settings

```javascript
const CONFIG = {
  cloudfrontDomain: 'd15sc9fc739ev2.cloudfront.net',
  testImages: [
    '/images/hero/paid-ads-analytics-screenshot.webp',
    '/images/services/analytics-hero.webp',
    '/images/hero/mobile-marketing-hero.webp',
    '/images/services/flyer-design-hero.webp',
    '/images/services/stock-photography-hero.webp',
  ],
  timeout: 10000,
  maxRetries: 3,
  outputDir: 'validation-reports',
};
```

### Customization

To test different images or domains, modify the configuration in the respective
scripts or create environment variables:

```bash
export CLOUDFRONT_DOMAIN="your-domain.cloudfront.net"
export TEST_IMAGE_PATH="/your/image/path.webp"
```

## Understanding Test Results

### Status Codes

- **200**: Image loads successfully
- **403**: Access denied (check S3 permissions and OAC configuration)
- **404**: Image not found (check if image exists and was deployed)
- **5xx**: Server error (check AWS service status)

### Content Type Validation

- **Expected**: `image/webp`, `image/jpeg`, `image/png`
- **Invalid**: `text/html` (usually indicates 404 page being served)
- **Missing**: No Content-Type header (warning condition)

### Security Validation

- **S3 Direct Access**: Should return 403 (blocked) for proper security
- **CloudFront Access**: Should return 200 with proper image content
- **OAC Configuration**: Verified through access pattern testing

## Common Issues and Solutions

### Issue: Images Return `text/html` Content-Type

**Cause**: CloudFront is serving a 404 error page instead of the image.

**Solutions**:

1. Verify image exists in S3 bucket
2. Check deployment script uploaded the image
3. Verify image path matches exactly
4. Clear CloudFront cache and retry

### Issue: 403 Access Denied

**Cause**: S3 permissions or OAC configuration issue.

**Solutions**:

1. Verify S3 bucket policy allows CloudFront access
2. Check CloudFront OAC configuration
3. Ensure S3 bucket blocks public access
4. Verify IAM roles and policies

### Issue: Slow Response Times

**Cause**: Images not cached or large file sizes.

**Solutions**:

1. Optimize image file sizes
2. Verify CloudFront caching configuration
3. Check cache hit rates in CloudFront metrics
4. Consider image compression

## Integration with CI/CD

### GitHub Actions Integration

Add to your workflow:

```yaml
- name: Validate Image Accessibility
  run: |
    node scripts/run-image-accessibility-validation.js
  continue-on-error: false
```

### Exit Codes

- **0**: All tests passed
- **1**: Some issues found but not critical
- **2**: Critical issues requiring immediate attention

## Monitoring and Alerting

### Automated Monitoring

Set up regular validation runs:

```bash
# Daily validation (add to cron)
0 9 * * * cd /path/to/project && node scripts/run-image-accessibility-validation.js
```

### Alert Conditions

Monitor for:

- Failed image loads (404, 403 errors)
- Security issues (S3 public access)
- Performance degradation (slow response times)
- Content type mismatches

## Report Analysis

### Executive Summary

The executive summary provides:

- Overall status assessment (EXCELLENT, GOOD, NEEDS_ATTENTION, CRITICAL)
- Key metrics and test results
- Critical issues requiring immediate attention
- Prioritized recommendations
- Next steps for resolution

### Detailed Reports

Technical reports include:

- Individual image test results
- HTTP response headers and timing
- Error messages and warnings
- Security validation results
- Performance metrics

## Best Practices

### Regular Validation

1. Run validation after each deployment
2. Include in CI/CD pipeline
3. Monitor trends over time
4. Set up alerting for failures

### Image Management

1. Use consistent naming conventions
2. Optimize images before deployment
3. Test locally before pushing
4. Document image requirements

### Security

1. Always block S3 public access
2. Use CloudFront OAC exclusively
3. Regularly audit access patterns
4. Monitor for security violations

## Troubleshooting

### Debug Mode

For additional debugging, modify scripts to include:

```javascript
// Add debug logging
console.log('Debug: Request headers:', headers);
console.log('Debug: Response details:', response);
```

### Manual Testing

Test images manually:

```bash
# Test CloudFront access
curl -I https://d15sc9fc739ev2.cloudfront.net/images/hero/paid-ads-analytics-screenshot.webp

# Test S3 direct access (should fail)
curl -I https://bucket-name.s3.amazonaws.com/images/hero/paid-ads-analytics-screenshot.webp
```

### Log Analysis

Check relevant logs:

- CloudFront access logs
- S3 server access logs
- CloudWatch metrics
- Deployment script logs

## Support

For issues with the validation tools:

1. Check the generated reports for detailed error information
2. Review the troubleshooting section above
3. Verify AWS service status
4. Check deployment pipeline logs
5. Validate local image files exist

---

_Last updated: October 2025_
