# Manual CloudFront Deployment Guide

This guide provides step-by-step instructions for manually deploying content
updates to your CloudFront distribution without using Kiro.

## Prerequisites

Before you begin, ensure you have:

- AWS CLI installed and configured with appropriate permissions
- Node.js and npm installed
- Access to your project repository
- Your AWS credentials configured

## Production Environment Details

- **S3 Bucket**: `mobile-marketing-site-prod-1759705011281-tyzuo9`
- **CloudFront Distribution ID**: `E2IBMHQ3GCW6ZK`
- **Region**: `us-east-1`
- **Live URL**: `https://d15sc9fc739ev2.cloudfront.net`

## Method 1: Using Project Scripts (Recommended)

### Step 1: Set Environment Variables

```bash
# Windows Command Prompt
set S3_BUCKET_NAME=mobile-marketing-site-prod-1759705011281-tyzuo9
set CLOUDFRONT_DISTRIBUTION_ID=E2IBMHQ3GCW6ZK
set AWS_REGION=us-east-1

# Windows PowerShell
$env:S3_BUCKET_NAME="mobile-marketing-site-prod-1759705011281-tyzuo9"
$env:CLOUDFRONT_DISTRIBUTION_ID="E2IBMHQ3GCW6ZK"
$env:AWS_REGION="us-east-1"

# macOS/Linux
export S3_BUCKET_NAME="mobile-marketing-site-prod-1759705011281-tyzuo9"
export CLOUDFRONT_DISTRIBUTION_ID="E2IBMHQ3GCW6ZK"
export AWS_REGION="us-east-1"
```

### Step 2: Build the Project

```bash
# Install dependencies (if not already done)
npm install

# Build the static site
npm run build
```

### Step 3: Deploy Using Project Script

```bash
# Run the deployment script
node scripts/deploy.js
```

This script will:

- Upload all files from the `out/` directory to S3
- Set proper content types and cache headers
- Create a CloudFront invalidation
- Provide deployment status updates

## Method 2: Manual AWS CLI Commands

### Step 1: Build the Project

```bash
npm install
npm run build
```

### Step 2: Sync Files to S3

```bash
# Sync all files to S3 bucket
aws s3 sync out/ s3://mobile-marketing-site-prod-1759705011281-tyzuo9/ --delete --region us-east-1

# Set proper content types for specific file types
aws s3 cp out/ s3://mobile-marketing-site-prod-1759705011281-tyzuo9/ --recursive --exclude "*" --include "*.html" --content-type "text/html" --cache-control "public, max-age=0, must-revalidate" --region us-east-1

aws s3 cp out/ s3://mobile-marketing-site-prod-1759705011281-tyzuo9/ --recursive --exclude "*" --include "*.css" --content-type "text/css" --cache-control "public, max-age=31536000, immutable" --region us-east-1

aws s3 cp out/ s3://mobile-marketing-site-prod-1759705011281-tyzuo9/ --recursive --exclude "*" --include "*.js" --content-type "application/javascript" --cache-control "public, max-age=31536000, immutable" --region us-east-1

aws s3 cp out/ s3://mobile-marketing-site-prod-1759705011281-tyzuo9/ --recursive --exclude "*" --include "*.json" --content-type "application/json" --cache-control "public, max-age=0, must-revalidate" --region us-east-1
```

### Step 3: Create CloudFront Invalidation

```bash
# Create invalidation for all files
aws cloudfront create-invalidation --distribution-id E2IBMHQ3GCW6ZK --paths "/*" --region us-east-1

# Or create targeted invalidation for specific files
aws cloudfront create-invalidation --distribution-id E2IBMHQ3GCW6ZK --paths "/index.html" "/about/index.html" "/contact/index.html" "/blog/index.html" --region us-east-1
```

### Step 4: Monitor Invalidation Status

```bash
# List recent invalidations
aws cloudfront list-invalidations --distribution-id E2IBMHQ3GCW6ZK --region us-east-1

# Check specific invalidation status (replace INVALIDATION_ID)
aws cloudfront get-invalidation --distribution-id E2IBMHQ3GCW6ZK --id INVALIDATION_ID --region us-east-1
```

## Method 3: Using AWS Console (GUI)

### Step 1: Build Locally

```bash
npm install
npm run build
```

### Step 2: Upload to S3 via Console

1. Go to [AWS S3 Console](https://console.aws.amazon.com/s3/)
2. Navigate to bucket: `mobile-marketing-site-prod-1759705011281-tyzuo9`
3. Select all existing files and delete them
4. Upload all files from your local `out/` directory
5. Ensure proper permissions are set (should inherit bucket policy)

### Step 3: Create CloudFront Invalidation via Console

1. Go to [AWS CloudFront Console](https://console.aws.amazon.com/cloudfront/)
2. Click on distribution ID: `E2IBMHQ3GCW6ZK`
3. Go to "Invalidations" tab
4. Click "Create Invalidation"
5. Enter `/*` to invalidate all files
6. Click "Create Invalidation"

## Quick Deployment Checklist

- [ ] Environment variables set
- [ ] Dependencies installed (`npm install`)
- [ ] Project built successfully (`npm run build`)
- [ ] Files uploaded to S3
- [ ] CloudFront invalidation created
- [ ] Deployment verified at live URL
- [ ] Cache cleared in browser for testing

## Troubleshooting

### Build Fails

```bash
# Clear npm cache and reinstall
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
npm run build
```

### S3 Upload Issues

```bash
# Check AWS credentials
aws sts get-caller-identity

# Verify bucket access
aws s3 ls s3://mobile-marketing-site-prod-1759705011281-tyzuo9/ --region us-east-1
```

### CloudFront Issues

```bash
# Check distribution status
aws cloudfront get-distribution --id E2IBMHQ3GCW6ZK --region us-east-1
```

### Cache Not Clearing

- Wait 5-10 minutes for invalidation to complete
- Check invalidation status in AWS Console
- Try hard refresh in browser (Ctrl+F5 or Cmd+Shift+R)
- Test in incognito/private browsing mode

## Security Notes

- Never commit AWS credentials to version control
- Use IAM roles with minimal required permissions
- Regularly rotate access keys
- Monitor CloudTrail logs for unauthorized access

## Performance Tips

- Use targeted invalidations instead of `/*` when possible
- Batch multiple changes before deploying
- Monitor CloudWatch metrics for performance impact
- Consider using versioned file names for better caching

## Emergency Rollback

If you need to quickly rollback:

```bash
# Use the rollback script
node scripts/rollback.js emergency

# Or manually restore from backup
node scripts/rollback.js list
node scripts/rollback.js rollback <backup-id>
```

## Support

For issues with this deployment process:

1. Check the troubleshooting section above
2. Review AWS CloudWatch logs
3. Consult the comprehensive operational runbook
4. Contact your AWS administrator if needed
