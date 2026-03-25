# CloudFront Redirect Setup Guide

## Overview

This guide explains how to implement and deploy a 301 redirect from `/services/hosting/` to `/services/website-hosting/` using CloudFront Functions. This redirect consolidates link equity and prevents URL canonicalization confusion in Google Search Console.

## Why CloudFront Functions?

CloudFront Functions are the recommended approach for this redirect because:

- **Static Export Compatible**: Works with Next.js static export (`output: 'export'`)
- **Edge Performance**: Executes at CloudFront edge locations for minimal latency
- **Proper HTTP 301**: Returns true HTTP 301 redirect status for SEO
- **Cost Effective**: CloudFront Functions are extremely low cost ($0.10 per 1M invocations)
- **No Server Required**: No need for server-side rendering or middleware

## Architecture

```
User Request → CloudFront Edge → CloudFront Function → Redirect Response
                                      ↓
                                 (if not redirect)
                                      ↓
                                  S3 Origin
```

The CloudFront Function intercepts requests at the viewer-request stage and returns a 301 redirect response for the artifact URL before reaching the S3 origin.

## Files

### CloudFront Function Code

**Location**: `cloudfront-functions/redirect-hosting-to-website-hosting.js`

This file contains the JavaScript code that runs at CloudFront edge locations. It checks if the request URI matches `/services/hosting` or `/services/hosting/` and returns a 301 redirect response.

### Deployment Script

**Location**: `scripts/deploy-cloudfront-function.js`

This Node.js script automates the deployment of the CloudFront Function:
1. Creates or updates the CloudFront Function
2. Publishes the function to LIVE stage
3. Associates the function with the CloudFront distribution
4. Configures the function to run on viewer-request events

## Deployment Instructions

### Prerequisites

1. **AWS Credentials**: Ensure AWS credentials are configured with CloudFront permissions
2. **Environment Variables**: Set the CloudFront distribution ID

```bash
export CLOUDFRONT_DISTRIBUTION_ID="E2IBMHQ3GCW6ZK"
export AWS_REGION="us-east-1"
```

### Automated Deployment (Recommended)

Run the deployment script to automatically deploy the CloudFront Function:

```bash
node scripts/deploy-cloudfront-function.js
```

The script will:
- ✅ Read the function code from `cloudfront-functions/redirect-hosting-to-website-hosting.js`
- ✅ Create or update the CloudFront Function
- ✅ Publish the function to LIVE stage
- ✅ Associate the function with your CloudFront distribution
- ✅ Configure the function to run on viewer-request events

**Expected Output**:
```
🚀 Starting CloudFront Function deployment...
   Function: redirect-hosting-to-website-hosting
   Distribution: E2IBMHQ3GCW6ZK

📖 Reading function code from cloudfront-functions/redirect-hosting-to-website-hosting.js...
✅ Function code loaded successfully
🆕 Creating CloudFront Function: redirect-hosting-to-website-hosting...
✅ CloudFront Function created successfully
   Function ARN: arn:aws:cloudfront::123456789012:function/redirect-hosting-to-website-hosting
📤 Publishing CloudFront Function to LIVE stage...
✅ CloudFront Function published to LIVE stage
🔗 Associating function with distribution E2IBMHQ3GCW6ZK...
✅ Function associated with distribution successfully
   Distribution Status: InProgress

🎉 CloudFront Function deployment completed successfully!
```

### Manual Deployment (Alternative)

If you prefer to deploy manually via AWS Console:

#### Step 1: Create CloudFront Function

1. Open AWS Console → CloudFront → Functions
2. Click "Create function"
3. Function name: `redirect-hosting-to-website-hosting`
4. Description: "Redirects /services/hosting/ to /services/website-hosting/ with 301 status"
5. Runtime: `cloudfront-js-1.0`
6. Copy code from `cloudfront-functions/redirect-hosting-to-website-hosting.js`
7. Click "Save changes"

#### Step 2: Test the Function

1. Click "Test" tab
2. Event type: "Viewer Request"
3. Test event JSON:
```json
{
  "version": "1.0",
  "context": {
    "eventType": "viewer-request"
  },
  "viewer": {
    "ip": "198.51.100.1"
  },
  "request": {
    "method": "GET",
    "uri": "/services/hosting/",
    "headers": {},
    "cookies": {},
    "querystring": {}
  }
}
```
4. Click "Test function"
5. Verify response shows 301 redirect with location header

#### Step 3: Publish Function

1. Click "Publish" tab
2. Click "Publish function"
3. Confirm publication to LIVE stage

#### Step 4: Associate with Distribution

1. Open AWS Console → CloudFront → Distributions
2. Select distribution `E2IBMHQ3GCW6ZK`
3. Click "Behaviors" tab
4. Select "Default (*)" behavior
5. Click "Edit"
6. Scroll to "Function associations"
7. Viewer request: Select `redirect-hosting-to-website-hosting`
8. Click "Save changes"

#### Step 5: Wait for Deployment

CloudFront distribution updates take 5-10 minutes to deploy globally.

## Testing the Redirect

### Test with curl

```bash
# Test redirect (should return 301)
curl -I https://d15sc9fc739ev2.cloudfront.net/services/hosting/

# Expected output:
HTTP/2 301
location: /services/website-hosting/
```

### Test with browser

1. Open browser developer tools (Network tab)
2. Navigate to `https://d15sc9fc739ev2.cloudfront.net/services/hosting/`
3. Verify:
   - Status code: 301 Moved Permanently
   - Location header: `/services/website-hosting/`
   - Browser redirects to `/services/website-hosting/`

### Test both URL variations

```bash
# Without trailing slash
curl -I https://d15sc9fc739ev2.cloudfront.net/services/hosting

# With trailing slash
curl -I https://d15sc9fc739ev2.cloudfront.net/services/hosting/
```

Both should return 301 redirect to `/services/website-hosting/`.

## Verification Checklist

After deployment, verify:

- [ ] CloudFront Function is published to LIVE stage
- [ ] Function is associated with distribution's default behavior
- [ ] Distribution status is "Deployed"
- [ ] `/services/hosting/` returns 301 redirect
- [ ] `/services/hosting` (no trailing slash) returns 301 redirect
- [ ] Redirect location is `/services/website-hosting/`
- [ ] Other URLs are not affected by the function
- [ ] Sitemap.xml excludes `/services/hosting/`
- [ ] Sitemap.xml includes `/services/website-hosting/`

## Troubleshooting

### Function not redirecting

**Symptom**: Accessing `/services/hosting/` does not redirect

**Solutions**:
1. Check CloudFront distribution status (must be "Deployed")
2. Verify function is published to LIVE stage (not DEVELOPMENT)
3. Confirm function is associated with default cache behavior
4. Clear browser cache and test in incognito mode
5. Wait 5-10 minutes for CloudFront propagation

### 403 or 404 errors

**Symptom**: Accessing `/services/hosting/` returns 403 or 404

**Solutions**:
1. Verify function code syntax is correct
2. Check CloudFront Function logs in CloudWatch
3. Test function in AWS Console test interface
4. Ensure function is associated with viewer-request event (not viewer-response)

### Function not found error

**Symptom**: Deployment script fails with "NoSuchFunctionExists"

**Solutions**:
1. Verify AWS credentials have CloudFront permissions
2. Check function name matches exactly: `redirect-hosting-to-website-hosting`
3. Ensure you're using the correct AWS region (CloudFront is global, use us-east-1)

### Permission denied errors

**Symptom**: Deployment script fails with "AccessDenied"

**Required IAM Permissions**:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "cloudfront:CreateFunction",
        "cloudfront:UpdateFunction",
        "cloudfront:PublishFunction",
        "cloudfront:DescribeFunction",
        "cloudfront:GetDistributionConfig",
        "cloudfront:UpdateDistribution"
      ],
      "Resource": "*"
    }
  ]
}
```

## Monitoring

### CloudWatch Logs

CloudFront Functions do not generate CloudWatch logs by default. To monitor function execution:

1. Use CloudFront access logs to track redirects
2. Monitor CloudFront metrics for 301 response codes
3. Use AWS X-Ray for detailed tracing (if enabled)

### Metrics to Monitor

- **301 Redirect Count**: Number of requests to `/services/hosting/`
- **Function Execution Time**: Should be <1ms
- **Error Rate**: Should be 0%

## Cost Considerations

CloudFront Functions are extremely cost-effective:

- **Pricing**: $0.10 per 1 million invocations
- **Free Tier**: 2 million invocations per month
- **Expected Cost**: ~$0.00 for typical traffic (< 100 redirects/day)

## SEO Impact

### Positive Effects

- ✅ Consolidates link equity to canonical URL
- ✅ Prevents duplicate content issues
- ✅ Improves Google Search Console coverage
- ✅ Reduces "Alternate page with proper canonical tag" warnings
- ✅ Proper 301 redirect signal for search engines

### Timeline

- **Immediate**: Redirect is active after CloudFront deployment
- **1-2 weeks**: Google recrawls and updates index
- **2-4 weeks**: Search Console shows improved coverage metrics

## Integration with Sitemap

The redirect works in conjunction with sitemap changes:

1. **Sitemap**: Excludes `/services/hosting/`, includes only `/services/website-hosting/`
2. **Redirect**: Handles any direct traffic or old links to `/services/hosting/`
3. **Canonical Tags**: All pages use correct canonical URLs

This three-pronged approach ensures complete URL consolidation.

## Rollback Procedure

If you need to remove the redirect:

### Automated Rollback

```bash
# Disassociate function from distribution
aws cloudfront get-distribution-config --id E2IBMHQ3GCW6ZK > dist-config.json
# Edit dist-config.json to remove function association
aws cloudfront update-distribution --id E2IBMHQ3GCW6ZK --if-match <etag> --distribution-config file://dist-config.json
```

### Manual Rollback

1. Open AWS Console → CloudFront → Distributions
2. Select distribution `E2IBMHQ3GCW6ZK`
3. Click "Behaviors" tab
4. Select "Default (*)" behavior
5. Click "Edit"
6. Scroll to "Function associations"
7. Viewer request: Select "No association"
8. Click "Save changes"

## Additional Resources

- [CloudFront Functions Documentation](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/cloudfront-functions.html)
- [CloudFront Functions JavaScript Runtime](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/functions-javascript-runtime-features.html)
- [SEO Best Practices for 301 Redirects](https://developers.google.com/search/docs/crawling-indexing/301-redirects)

## Support

For issues or questions:
1. Check CloudFront distribution status in AWS Console
2. Review CloudFront Function test results
3. Verify IAM permissions for deployment
4. Test redirect with curl or browser developer tools
