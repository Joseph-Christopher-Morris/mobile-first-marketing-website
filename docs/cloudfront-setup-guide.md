# CloudFront Distribution Setup Guide

This guide explains how to set up a CloudFront distribution with S3 origin, Origin Access Control (OAC), security headers, and optimal caching strategies.

## Overview

The CloudFront setup consists of three main components:

1. **Distribution with S3 Origin & OAC** - Secure access to private S3 bucket
2. **Security Headers & Error Handling** - Comprehensive security and SPA routing
3. **Caching Strategies** - Optimized performance for different content types

## Prerequisites

- AWS CLI configured with appropriate permissions
- S3 bucket already created and configured
- Node.js and npm installed
- Required AWS SDK packages installed

## Environment Variables

Set the following environment variables before running the scripts:

```bash
export S3_BUCKET_NAME="your-bucket-name"
export AWS_REGION="us-east-1"
export ENVIRONMENT="production"  # or "staging", "development"
export AWS_ACCOUNT_ID="123456789012"  # Your AWS account ID
```

## Quick Setup (Recommended)

Use the complete setup script to configure everything at once:

```bash
node scripts/setup-complete-cloudfront.js
```

This script will:
- Create CloudFront distribution with S3 origin and OAC
- Configure security headers and error handling
- Set up optimal caching strategies
- Generate a deployment summary

## Individual Setup Scripts

If you prefer to run each step individually:

### 1. Create CloudFront Distribution

```bash
node scripts/setup-cloudfront-distribution.js
```

This creates:
- CloudFront distribution with private S3 origin
- Origin Access Control (OAC) for secure S3 access
- Basic cache behaviors for different content types
- S3 bucket policy allowing CloudFront access only

### 2. Configure Security Headers

```bash
export CLOUDFRONT_DISTRIBUTION_ID="your-distribution-id"
node scripts/configure-cloudfront-security.js
```

This configures:
- Comprehensive security headers (HSTS, CSP, etc.)
- Custom error pages for SPA routing (404 → index.html)
- CORS headers policy for API endpoints
- Error page templates

### 3. Configure Caching Strategies

```bash
export CLOUDFRONT_DISTRIBUTION_ID="your-distribution-id"
node scripts/configure-cloudfront-caching.js
```

This sets up:
- Long cache (1 year) for static assets
- Short cache (5 minutes) for HTML files
- No cache for service worker
- Medium cache (1 day) for manifest files
- Compression for all text-based content

## Configuration Files

The setup scripts generate several configuration files in the `config/` directory:

- `cloudfront-distribution.json` - Distribution information
- `cloudfront-security.json` - Security configuration
- `cloudfront-caching.json` - Caching policies
- `cloudfront-deployment-summary.json` - Complete deployment summary
- `cloudfront-s3-config.json` - Reference configuration

## Caching Strategies

| Content Type | Cache Duration | Compression | Description |
|--------------|----------------|-------------|-------------|
| `/_next/static/*` | 1 year | Yes | Next.js static assets with versioned filenames |
| `*.{js,css,png,jpg,...}` | 1 year | Yes | Static assets (images, fonts, etc.) |
| `*.html` | 5 minutes | Yes | HTML files for frequent updates |
| `/sw.js` | No cache | Yes | Service worker must always be fresh |
| `/manifest.json` | 1 day | Yes | App manifest with medium-term cache |

## Security Headers

The following security headers are automatically configured:

- **Strict-Transport-Security**: Forces HTTPS for 1 year
- **Content-Security-Policy**: Prevents XSS attacks
- **X-Content-Type-Options**: Prevents MIME type sniffing
- **X-Frame-Options**: Prevents clickjacking (DENY)
- **X-XSS-Protection**: Enables XSS filtering
- **Referrer-Policy**: Controls referrer information
- **Permissions-Policy**: Restricts browser features

## Error Handling

Custom error responses are configured for SPA routing:

- **404 errors** → Serve `/index.html` with 200 status
- **403 errors** → Serve `/index.html` with 200 status (S3 access denied)
- **5xx errors** → Serve `/500.html` with original error status

## Testing the Setup

After deployment, test your CloudFront distribution:

```bash
# Test basic connectivity
curl -I https://your-distribution-domain.cloudfront.net

# Test security headers
curl -I https://your-distribution-domain.cloudfront.net | grep -E "(strict-transport|content-security|x-frame)"

# Test SPA routing (should return index.html)
curl -I https://your-distribution-domain.cloudfront.net/non-existent-page

# Test static asset caching
curl -I https://your-distribution-domain.cloudfront.net/_next/static/some-file.js
```

## Monitoring and Maintenance

### CloudWatch Metrics

Monitor these key metrics:

- **4xxErrorRate** - Client errors (should be < 5%)
- **OriginLatency** - Response time from S3 (should be < 3s)
- **CacheHitRate** - Cache effectiveness (should be > 80%)

### Cache Invalidation

When you deploy new content:

```bash
aws cloudfront create-invalidation \
  --distribution-id YOUR_DISTRIBUTION_ID \
  --paths "/*"
```

### Cost Optimization

- Use `PriceClass_100` for North America and Europe only
- Monitor data transfer costs
- Optimize cache hit ratios
- Set up lifecycle policies for S3

## Troubleshooting

### Common Issues

1. **403 Forbidden Errors**
   - Check S3 bucket policy allows CloudFront access
   - Verify OAC is properly configured
   - Ensure bucket is not publicly accessible

2. **Cache Not Working**
   - Check cache policies are applied to behaviors
   - Verify TTL values are set correctly
   - Test with different file types

3. **Security Headers Missing**
   - Verify response headers policy is attached
   - Check policy configuration
   - Test with browser developer tools

4. **SPA Routing Not Working**
   - Confirm custom error responses are configured
   - Test 404 handling returns index.html
   - Check error page paths exist in S3

### Useful Commands

```bash
# Get distribution status
aws cloudfront get-distribution --id YOUR_DISTRIBUTION_ID

# List all distributions
aws cloudfront list-distributions

# Get distribution configuration
aws cloudfront get-distribution-config --id YOUR_DISTRIBUTION_ID

# Create cache invalidation
aws cloudfront create-invalidation --distribution-id YOUR_DISTRIBUTION_ID --paths "/*"
```

## Next Steps

After successful setup:

1. Configure custom domain and SSL certificate
2. Set up monitoring and alerting
3. Configure CI/CD pipeline for automated deployments
4. Test performance and optimize further
5. Set up backup and disaster recovery procedures

## Security Considerations

- Keep S3 bucket private (never public)
- Use OAC instead of deprecated OAI
- Regularly review and update security headers
- Monitor access logs for suspicious activity
- Keep AWS credentials secure and rotate regularly