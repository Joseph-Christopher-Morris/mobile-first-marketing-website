# HTTPS Redirect Validation Guide

## Overview

This guide covers the implementation and usage of HTTPS redirect validation for CloudFront distributions. The validation ensures that all HTTP traffic is properly redirected to HTTPS and that appropriate security headers are implemented.

## Features

### Core Validation Tests

1. **HTTP to HTTPS Redirect Testing**
   - Tests multiple URL patterns (root, with trailing slash, specific pages)
   - Validates redirect status codes (301, 302, 307, 308)
   - Checks redirect target URLs for HTTPS protocol
   - Tests www subdomain redirects

2. **HSTS Header Validation**
   - Verifies presence of Strict-Transport-Security header
   - Validates max-age directive (minimum 1 year recommended)
   - Checks for includeSubDomains directive
   - Validates preload directive

3. **Secure Cookie Testing**
   - Analyzes all Set-Cookie headers
   - Validates Secure flag presence
   - Checks HttpOnly flag for session security
   - Verifies SameSite attribute configuration

4. **Redirect Chain Analysis**
   - Follows complete redirect chains
   - Detects redirect loops
   - Validates final destination URLs
   - Ensures redirect count stays within limits

5. **Security Headers Validation**
   - X-Content-Type-Options: nosniff
   - X-Frame-Options: DENY or SAMEORIGIN
   - X-XSS-Protection: 1; mode=block
   - Referrer-Policy: strict-origin-when-cross-origin
   - Content-Security-Policy: presence check

## Usage

### Command Line Interface

```bash
# Basic validation
node scripts/https-redirect-validator.js example.com

# With output files
node scripts/https-redirect-validator.js example.com \
  --output results.json \
  --html report.html

# With custom timeout
node scripts/https-redirect-validator.js example.com --timeout 15000
```

### Programmatic Usage

```javascript
const HttpsRedirectValidator = require('./scripts/https-redirect-validator');

const validator = new HttpsRedirectValidator({
  timeout: 10000,
  maxRedirects: 5
});

const results = await validator.validateHttpsRedirect('example.com', {
  testHttpRedirect: true,
  testHstsHeader: true,
  testSecureCookies: true,
  testRedirectChain: true
});

console.log('Validation Results:', results);
```

## Configuration

### Default Settings

```json
{
  "timeout": 10000,
  "maxRedirects": 5,
  "userAgent": "HTTPS-Redirect-Validator/1.0",
  "followRedirects": true,
  "validateCertificates": true
}
```

### Test Configuration

The validator can be configured to enable/disable specific tests:

```javascript
const testConfig = {
  testHttpRedirect: true,    // Test HTTP to HTTPS redirects
  testHstsHeader: true,      // Validate HSTS header
  testSecureCookies: true,   // Check cookie security
  testRedirectChain: true    // Analyze redirect chains
};
```

## CloudFront Configuration

### Required CloudFront Settings

1. **Viewer Protocol Policy**
   ```json
   {
     "ViewerProtocolPolicy": "redirect-to-https"
   }
   ```

2. **Response Headers Policy**
   ```json
   {
     "ResponseHeadersPolicy": {
       "SecurityHeadersConfig": {
         "StrictTransportSecurity": {
           "AccessControlMaxAgeSec": 31536000,
           "IncludeSubdomains": true,
           "Preload": true
         },
         "ContentTypeOptions": {
           "Override": true
         },
         "FrameOptions": {
           "FrameOption": "DENY",
           "Override": true
         },
         "XSSProtection": {
           "ModeBlock": true,
           "Protection": true,
           "Override": true
         },
         "ReferrerPolicy": {
           "ReferrerPolicy": "strict-origin-when-cross-origin",
           "Override": true
         }
       }
     }
   }
   ```

### Cache Behavior Configuration

```json
{
  "CacheBehaviors": [
    {
      "PathPattern": "*",
      "ViewerProtocolPolicy": "redirect-to-https",
      "ResponseHeadersPolicyId": "your-security-headers-policy-id",
      "Compress": true
    }
  ]
}
```

## Test Results Interpretation

### Status Codes

- **PASSED**: Test completed successfully, meets security requirements
- **FAILED**: Critical security issue found, requires immediate attention
- **WARNING**: Non-critical issue or recommendation for improvement
- **INFO**: Informational message, no action required

### Common Test Results

1. **HTTP to HTTPS Redirect - PASSED**
   ```json
   {
     "statusCode": 301,
     "location": "https://example.com/",
     "redirectType": "Permanent Redirect"
   }
   ```

2. **HSTS Header - PASSED**
   ```json
   {
     "header": "max-age=31536000; includeSubDomains; preload",
     "maxAge": 31536000,
     "includeSubDomains": true,
     "preload": true
   }
   ```

3. **Cookie Security - WARNING**
   ```json
   {
     "raw": "sessionId=abc123; Path=/",
     "secure": false,
     "httpOnly": false,
     "issues": ["Missing Secure flag", "Missing HttpOnly flag"]
   }
   ```

## Troubleshooting

### Common Issues and Solutions

#### 1. HTTP Requests Not Redirecting to HTTPS

**Symptoms:**
- HTTP requests return 200 status instead of redirect
- No Location header in HTTP responses

**Causes:**
- CloudFront viewer protocol policy not set to "redirect-to-https"
- Origin server handling HTTP requests directly

**Solutions:**
```bash
# Check CloudFront distribution configuration
aws cloudfront get-distribution-config --id YOUR_DISTRIBUTION_ID

# Update viewer protocol policy
aws cloudfront update-distribution --id YOUR_DISTRIBUTION_ID \
  --distribution-config file://updated-config.json
```

#### 2. HSTS Header Not Present

**Symptoms:**
- HTTPS responses missing Strict-Transport-Security header
- Browser not enforcing HTTPS for subsequent requests

**Causes:**
- No response headers policy configured
- Origin server not sending HSTS header

**Solutions:**
```bash
# Create response headers policy with HSTS
aws cloudfront create-response-headers-policy \
  --response-headers-policy-config file://hsts-policy.json

# Associate policy with cache behavior
aws cloudfront update-distribution --id YOUR_DISTRIBUTION_ID \
  --distribution-config file://updated-config.json
```

#### 3. Insecure Cookies Detected

**Symptoms:**
- Cookies transmitted without Secure flag
- Session cookies accessible via JavaScript

**Causes:**
- Application not setting security flags
- Third-party cookies without proper configuration

**Solutions:**
- Update application cookie configuration
- Review third-party integrations
- Implement cookie security middleware

#### 4. Redirect Loops

**Symptoms:**
- Infinite redirect chains
- Browser showing "too many redirects" error

**Causes:**
- Conflicting redirect rules
- Origin server and CloudFront both handling redirects

**Solutions:**
- Review all redirect configurations
- Ensure only one layer handles redirects
- Test redirect chains thoroughly

### Validation Command Examples

```bash
# Test production domain
node scripts/https-redirect-validator.js yourdomain.com \
  --output production-https-validation.json \
  --html production-https-report.html

# Test staging environment
node scripts/https-redirect-validator.js staging.yourdomain.com \
  --timeout 15000

# Run comprehensive test suite
node scripts/test-https-redirect-validation.js
```

## Integration with CI/CD

### GitHub Actions Integration

```yaml
name: HTTPS Redirect Validation

on:
  push:
    branches: [main]
  schedule:
    - cron: '0 6 * * *'  # Daily at 6 AM

jobs:
  validate-https:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm install
        
      - name: Validate HTTPS redirects
        run: |
          node scripts/https-redirect-validator.js ${{ secrets.DOMAIN_NAME }} \
            --output https-validation-results.json \
            --html https-validation-report.html
            
      - name: Upload validation results
        uses: actions/upload-artifact@v3
        with:
          name: https-validation-results
          path: |
            https-validation-results.json
            https-validation-report.html
```

### Monitoring Integration

```javascript
// Monitor HTTPS redirect health
const validator = new HttpsRedirectValidator();

setInterval(async () => {
  try {
    const results = await validator.validateHttpsRedirect(process.env.DOMAIN_NAME);
    
    if (results.summary.failed > 0) {
      // Send alert to monitoring system
      await sendAlert({
        severity: 'HIGH',
        message: `HTTPS redirect validation failed: ${results.summary.failed} tests failed`,
        details: results
      });
    }
  } catch (error) {
    console.error('HTTPS validation monitoring failed:', error);
  }
}, 300000); // Check every 5 minutes
```

## Security Best Practices

### HSTS Configuration

1. **Minimum max-age**: 31536000 seconds (1 year)
2. **Include subdomains**: Use includeSubDomains directive
3. **Preload consideration**: Add preload directive for high-security sites
4. **Gradual rollout**: Start with shorter max-age, increase gradually

### Cookie Security

1. **Secure flag**: Always set for HTTPS-only cookies
2. **HttpOnly flag**: Set for session cookies to prevent XSS
3. **SameSite attribute**: Use Strict or Lax based on requirements
4. **Domain scope**: Limit cookie scope to necessary domains

### Redirect Configuration

1. **Use 301 redirects**: For permanent HTTPS enforcement
2. **Avoid redirect chains**: Minimize redirect hops
3. **Test all paths**: Validate redirects for all URL patterns
4. **Monitor performance**: Track redirect impact on page load times

## Compliance Requirements

### OWASP Guidelines

- Force HTTPS for all communications
- Implement HSTS header with appropriate max-age
- Use secure cookie flags
- Implement comprehensive security headers

### PCI DSS Compliance

- Encrypt transmission of cardholder data
- Use strong cryptography and security protocols
- Implement secure authentication mechanisms

### GDPR Privacy Requirements

- Ensure data protection by design
- Implement appropriate technical measures
- Secure data transmission channels

## Reporting and Analytics

### JSON Report Structure

```json
{
  "timestamp": "2025-10-05T22:00:00.000Z",
  "testResults": [...],
  "summary": {
    "totalTests": 18,
    "passed": 15,
    "failed": 0,
    "warnings": 3,
    "successRate": "83.3%",
    "overallStatus": "PASSED"
  },
  "recommendations": [...]
}
```

### HTML Report Features

- Visual dashboard with test results
- Color-coded status indicators
- Detailed test information
- Actionable recommendations
- Export capabilities

### Metrics Tracking

Track these key metrics over time:
- HTTPS redirect success rate
- HSTS header compliance
- Cookie security score
- Security header coverage
- Response time impact

## Conclusion

The HTTPS redirect validation system provides comprehensive testing of HTTPS enforcement and security header implementation. Regular validation ensures that your CloudFront distribution maintains proper security posture and complies with industry standards.

For additional support or questions, refer to the troubleshooting section or consult the AWS CloudFront documentation for specific configuration details.