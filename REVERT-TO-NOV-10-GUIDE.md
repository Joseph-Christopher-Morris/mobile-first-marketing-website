# Revert to November 10, 2025 State - Quick Guide

## Overview

This guide helps you restore your deployment to the state from the CloudFront invalidation created on **November 10, 2025 at 2:55:58 PM UTC**.

**Target Details:**
- **Distribution ID:** E2IBMHQ3GCW6ZK
- **S3 Bucket:** mobile-marketing-site-prod-1759705011281-tyzuo9
- **Invalidated Paths:** 39 paths including press logos, blog posts, and service pages
- **Status:** Completed

## Quick Start

### Step 1: List Available Backups

First, see what backups are available around November 10, 2025:

```bash
# Windows (Batch)
revert-to-nov-10.bat list

# Windows (PowerShell)
.\revert-to-nov-10.ps1 -Action list

# Node.js (any platform)
node scripts/revert-to-nov-10-invalidation.js list
```

### Step 2: Find Closest Backup

Find the backup closest to the target date:

```bash
# Windows (Batch)
revert-to-nov-10.bat find

# Windows (PowerShell)
.\revert-to-nov-10.ps1 -Action find

# Node.js
node scripts/revert-to-nov-10-invalidation.js find
```

### Step 3: Check Invalidation History

View recent CloudFront invalidations to verify the target:

```bash
# Windows (Batch)
revert-to-nov-10.bat history

# Windows (PowerShell)
.\revert-to-nov-10.ps1 -Action history

# Node.js
node scripts/revert-to-nov-10-invalidation.js history
```

### Step 4: Restore to November 10 State

Restore to the closest backup automatically:

```bash
# Windows (Batch)
revert-to-nov-10.bat restore

# Windows (PowerShell)
.\revert-to-nov-10.ps1 -Action restore

# Node.js
node scripts/revert-to-nov-10-invalidation.js restore
```

Or restore to a specific backup:

```bash
# Windows (Batch)
revert-to-nov-10.bat restore backup-2025-11-10T14-50-00-000Z

# Windows (PowerShell)
.\revert-to-nov-10.ps1 -Action restore -BackupId "backup-2025-11-10T14-50-00-000Z"

# Node.js
node scripts/revert-to-nov-10-invalidation.js restore backup-2025-11-10T14-50-00-000Z
```

## What the Restoration Does

1. **Creates Pre-Rollback Backup** - Saves current state before making changes
2. **Verifies Backup Integrity** - Ensures the backup is not corrupted
3. **Clears Current Deployment** - Removes current files from S3
4. **Restores Files** - Copies files from the November 10 backup
5. **Invalidates CloudFront Cache** - Recreates the 39-path invalidation
6. **Updates Metadata** - Records the restoration details

## Invalidated Paths (39 total)

The November 10 invalidation included these paths:

```
/images/press-logos/autotrader-logo.svg
/images/press-logos/business-insider-logo.svg
/services/website-hosting/index.html
/blog/stock-photography-breakthrough/index.html
/privacy-policy/index.html
/blog/ebay-model-car-sales-timing-bundles/index.html
/blog/stock-photography-income-growth/index.html
/services/website-design/index.html
/blog/flyer-marketing-case-study-part-2/index.html
/images/press-logos/bbc-logo.svg
... and 29 more paths
```

## Just Recreate the Invalidation

If you only want to recreate the CloudFront invalidation without restoring files:

```bash
# Windows (Batch)
revert-to-nov-10.bat invalidate

# Windows (PowerShell)
.\revert-to-nov-10.ps1 -Action invalidate

# Node.js
node scripts/revert-to-nov-10-invalidation.js invalidate
```

## Timeline

- **Restoration Time:** 2-5 minutes (depending on file count)
- **Cache Propagation:** 5-15 minutes after invalidation
- **Total Time:** ~10-20 minutes for full restoration

## Safety Features

✅ **Pre-Rollback Backup** - Current state is backed up before restoration
✅ **Integrity Verification** - Backup integrity is checked before use
✅ **Confirmation Prompts** - Requires explicit confirmation before proceeding
✅ **Detailed Logging** - All operations are logged for audit trail
✅ **Rollback Support** - Can rollback the rollback if needed

## Troubleshooting

### No Backups Found

If no backups are found:

```bash
# Check S3 bucket access
aws s3 ls s3://mobile-marketing-site-prod-1759705011281-tyzuo9/backups/

# Verify AWS credentials
aws sts get-caller-identity
```

### Backup Too Old/New

If the closest backup is not ideal:
1. Use `list` command to see all available backups
2. Choose a specific backup ID
3. Use `restore <backup-id>` with your chosen backup

### CloudFront Invalidation Fails

If invalidation fails:
1. Check CloudFront permissions
2. Verify distribution ID: E2IBMHQ3GCW6ZK
3. Check for concurrent invalidations (max 3 allowed)
4. Manually invalidate in AWS Console if needed

### Restoration Fails Mid-Process

If restoration fails:
1. A pre-rollback backup was created
2. Use standard rollback to restore: `node scripts/rollback.js list`
3. Find the pre-rollback backup
4. Restore it: `node scripts/rollback.js rollback <pre-rollback-backup-id>`

## Verification After Restoration

After restoration completes, verify the deployment:

1. **Check Website:**
   ```
   https://d15sc9fc739ev2.cloudfront.net
   ```

2. **Verify Specific Paths:**
   - https://d15sc9fc739ev2.cloudfront.net/services/website-hosting/
   - https://d15sc9fc739ev2.cloudfront.net/blog/stock-photography-breakthrough/
   - https://d15sc9fc739ev2.cloudfront.net/privacy-policy/

3. **Check Press Logos:**
   - https://d15sc9fc739ev2.cloudfront.net/images/press-logos/bbc-logo.svg
   - https://d15sc9fc739ev2.cloudfront.net/images/press-logos/autotrader-logo.svg

4. **Monitor CloudFront:**
   - AWS Console → CloudFront → E2IBMHQ3GCW6ZK
   - Check invalidation status

## Environment Variables

The scripts use these environment variables (with defaults):

```bash
S3_BUCKET_NAME=mobile-marketing-site-prod-1759705011281-tyzuo9
CLOUDFRONT_DISTRIBUTION_ID=E2IBMHQ3GCW6ZK
AWS_REGION=us-east-1
```

You can override them if needed:

```bash
# Windows (PowerShell)
$env:S3_BUCKET_NAME="your-bucket"
$env:CLOUDFRONT_DISTRIBUTION_ID="your-distribution"
.\revert-to-nov-10.ps1 -Action restore

# Windows (CMD)
set S3_BUCKET_NAME=your-bucket
set CLOUDFRONT_DISTRIBUTION_ID=your-distribution
revert-to-nov-10.bat restore
```

## Support

If you encounter issues:

1. Check AWS credentials: `aws sts get-caller-identity`
2. Verify Node.js: `node --version` (should be v18+)
3. Check AWS permissions for S3 and CloudFront
4. Review logs in the console output
5. Check CloudWatch logs for detailed error messages

## Related Documentation

- [Rollback Procedures](docs/operations/rollback.md)
- [Deployment Guide](DEPLOYMENT_GUIDE.md)
- [CloudFront Configuration](config/cloudfront-s3-config.json)
- [Project Deployment Config](.kiro/steering/project-deployment-config.md)
