# Pretty URLs Cache Invalidation Guide

## Overview

This guide covers the cache invalidation implementation for CloudFront pretty URLs configuration (Task 8.2.3). The cache invalidation ensures that all affected paths are properly cleared after the CloudFront Function and default root object configuration changes.

## Implementation Details

### Cache Invalidation Script

**File**: `scripts/pretty-urls-cache-invalidation.js`

This script performs comprehensive cache invalidation for all paths affected by the pretty URLs configuration:

- **Root paths**: `/`, `/index.html`
- **Pretty URL paths**: `/about/`, `/contact/`, `/services/`, etc.
- **Explicit file paths**: `/about/index.html`, `/contact/index.html`, etc.
- **Extensionless paths**: `/about`, `/contact`, `/services`, etc.
- **Service pages**: All photography, analytics, and ad-campaigns pages
- **Wildcard paths**: `/*`, `/blog/*`, `/services/*`

### Execution Methods

#### 1. Direct Node.js Execution
```bash
node scripts/pretty-urls-cache-invalidation.js
```

#### 2. With Monitoring
```bash
node scripts/pretty-urls-cache-invalidation.js --monitor
```

#### 3. Windows Batch File
```cmd
invalidate-pretty-urls-cache.bat
```

#### 4. PowerShell Script
```powershell
.\invalidate-pretty-urls-cache.ps1
```

### Integration with Deployment

The cache invalidation is integrated into the main deployment script (`deploy-full-site-simple.bat`) at step 6/6:

```batch
echo [6/6] Invalidating CloudFront cache for pretty URLs...
node scripts/pretty-urls-cache-invalidation.js
```

## Path Categories

### 1. Root Paths
- `/` - Root URL that should serve index.html
- `/index.html` - Explicit root file

### 2. Pretty URL Paths (Directory Style)
- `/about/` - About page directory URL
- `/contact/` - Contact page directory URL
- `/services/` - Services page directory URL
- `/blog/` - Blog page directory URL
- `/privacy-policy/` - Privacy policy directory URL

### 3. Explicit File Paths
- `/about/index.html` - Direct file access (backward compatibility)
- `/contact/index.html` - Direct file access
- `/services/index.html` - Direct file access
- `/blog/index.html` - Direct file access
- `/privacy-policy/index.html` - Direct file access

### 4. Extensionless Paths
- `/about` - Will be rewritten to `/about/index.html`
- `/contact` - Will be rewritten to `/contact/index.html`
- `/services` - Will be rewritten to `/services/index.html`
- `/blog` - Will be rewritten to `/blog/index.html`
- `/privacy-policy` - Will be rewritten to `/privacy-policy/index.html`

### 5. Service Pages
- `/services/photography/`, `/services/photography/index.html`, `/services/photography`
- `/services/analytics/`, `/services/analytics/index.html`, `/services/analytics`
- `/services/ad-campaigns/`, `/services/ad-campaigns/index.html`, `/services/ad-campaigns`

### 6. Wildcard Paths
- `/*` - Catches all other paths
- `/blog/*` - All blog posts and pages
- `/services/*` - All service-related pages

## Monitoring and Validation

### Automatic Monitoring

The script includes optional monitoring functionality:

```javascript
// Monitor invalidation completion
await monitorInvalidation(invalidationResult.invalidationId);
```

### Manual Validation

After cache invalidation, manually test these URLs:

1. **Root URL**: https://d15sc9fc739ev2.cloudfront.net/
2. **Pretty URLs**: 
   - https://d15sc9fc739ev2.cloudfront.net/about/
   - https://d15sc9fc739ev2.cloudfront.net/contact/
   - https://d15sc9fc739ev2.cloudfront.net/services/
3. **Extensionless URLs**:
   - https://d15sc9fc739ev2.cloudfront.net/about
   - https://d15sc9fc739ev2.cloudfront.net/contact
   - https://d15sc9fc739ev2.cloudfront.net/services
4. **Explicit Files**:
   - https://d15sc9fc739ev2.cloudfront.net/about/index.html
   - https://d15sc9fc739ev2.cloudfront.net/contact/index.html

## Error Handling

### Common Issues and Solutions

#### 1. AWS Credentials Not Found
```
Error: CredentialsError
Solution: Configure AWS CLI with `aws configure`
```

#### 2. Access Denied
```
Error: AccessDenied
Solution: Verify IAM permissions for cloudfront:CreateInvalidation
```

#### 3. Too Many Invalidations
```
Error: TooManyInvalidationsInProgress
Solution: Wait for current invalidations to complete (check AWS Console)
```

#### 4. Distribution Not Found
```
Error: NoSuchDistribution
Solution: Verify CLOUDFRONT_DISTRIBUTION_ID is correct (E2IBMHQ3GCW6ZK)
```

### Fallback Strategy

If the comprehensive invalidation fails, the deployment script falls back to:

```bash
aws cloudfront create-invalidation --distribution-id E2IBMHQ3GCW6ZK --paths "/*"
```

## Performance Considerations

### Cost Optimization

- **Path Count**: 25+ specific paths + wildcards
- **Estimated Cost**: ~$0.125 per invalidation (AWS pricing: $0.005 per path)
- **Alternative**: Use only `/*` for $0.005 total cost but less targeted

### Timing

- **Creation Time**: 1-2 seconds
- **Propagation Time**: 5-15 minutes globally
- **Monitoring Interval**: 30 seconds (if using --monitor flag)

## Requirements Compliance

This implementation satisfies Task 8.2.3 requirements:

✅ **Invalidate CloudFront cache for all affected paths**
- Comprehensive path coverage including root, pretty URLs, explicit files, and extensionless paths

✅ **Include both pretty URL paths and explicit file paths**
- Pretty URLs: `/about/`, `/contact/`, etc.
- Explicit files: `/about/index.html`, `/contact/index.html`, etc.

✅ **Monitor invalidation completion status**
- Optional monitoring with `--monitor` flag
- Status checking every 30 seconds
- Completion detection and reporting

✅ **Requirements: 4.3**
- Integrated into deployment script
- Automatic execution after CloudFront configuration changes
- Comprehensive error handling and fallback strategies

## Testing

### Test Script

Run the test script to validate configuration:

```bash
node scripts/test-pretty-urls-cache-invalidation.js
```

This validates:
- Path coverage for all URL patterns
- No duplicate paths
- Valid path formats
- Requirements compliance
- Cost estimation

### Manual Testing Steps

1. **Run invalidation**:
   ```bash
   node scripts/pretty-urls-cache-invalidation.js
   ```

2. **Wait 2-3 minutes** for initial propagation

3. **Test URLs** in browser or with curl:
   ```bash
   curl -I https://d15sc9fc739ev2.cloudfront.net/
   curl -I https://d15sc9fc739ev2.cloudfront.net/about/
   curl -I https://d15sc9fc739ev2.cloudfront.net/about
   ```

4. **Verify responses** return 200 OK with HTML content

## Maintenance

### Regular Tasks

1. **Monitor invalidation costs** in AWS billing
2. **Review path efficiency** quarterly
3. **Update paths** when adding new pages
4. **Test invalidation** after infrastructure changes

### Updates

When adding new pages, update `INVALIDATION_PATHS` in `scripts/pretty-urls-cache-invalidation.js`:

```javascript
const INVALIDATION_PATHS = [
  // ... existing paths ...
  
  // New page paths
  '/new-page/',
  '/new-page/index.html',
  '/new-page',
];
```

## Troubleshooting

### Debug Steps

1. **Check AWS credentials**:
   ```bash
   aws sts get-caller-identity
   ```

2. **Verify distribution exists**:
   ```bash
   aws cloudfront get-distribution --id E2IBMHQ3GCW6ZK
   ```

3. **List current invalidations**:
   ```bash
   aws cloudfront list-invalidations --distribution-id E2IBMHQ3GCW6ZK
   ```

4. **Check invalidation status**:
   ```bash
   aws cloudfront get-invalidation --distribution-id E2IBMHQ3GCW6ZK --id <invalidation-id>
   ```

### Log Analysis

The script provides detailed logging:
- Path categorization
- AWS API responses
- Error details with solutions
- Completion status and timing

## Security

### IAM Permissions Required

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "cloudfront:CreateInvalidation",
        "cloudfront:GetInvalidation",
        "cloudfront:ListInvalidations"
      ],
      "Resource": "arn:aws:cloudfront::*:distribution/E2IBMHQ3GCW6ZK"
    }
  ]
}
```

### Best Practices

1. **Use least privilege** IAM permissions
2. **Rotate AWS credentials** regularly
3. **Monitor invalidation costs** to prevent abuse
4. **Validate paths** before invalidation to prevent errors
5. **Use environment variables** for sensitive configuration