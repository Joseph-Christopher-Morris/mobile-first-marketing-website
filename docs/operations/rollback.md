# S3 Versioning Rollback Procedures

## Overview

This document provides step-by-step rollback procedures for the SCRAM Final Deployment using S3 versioning and CloudFront invalidation. These procedures ensure quick recovery from deployment issues while maintaining proper cache headers and data integrity.

## Infrastructure Configuration

- **S3 Bucket**: `mobile-marketing-site-prod-1759705011281-tyzuo9`
- **CloudFront Distribution**: `E2IBMHQ3GCW6ZK`
- **Region**: `us-east-1`
- **Domain**: `d15sc9fc739ev2.cloudfront.net`

## Prerequisites

1. AWS CLI configured with appropriate permissions
2. S3 versioning enabled on the production bucket
3. Valid AWS credentials with S3 and CloudFront permissions
4. Terminal access (PowerShell, Bash, or Command Prompt)

## Core Rollback Commands

### 1. List Object Versions

Use the `aws s3api list-object-versions` command to identify available versions for rollback:

```bash
# List all versions of a specific file
aws s3api list-object-versions \
  --bucket mobile-marketing-site-prod-1759705011281-tyzuo9 \
  --prefix index.html \
  --region us-east-1 \
  --query 'Versions[*].[Key,VersionId,LastModified,IsLatest]' \
  --output table

# List versions for multiple critical files
aws s3api list-object-versions \
  --bucket mobile-marketing-site-prod-1759705011281-tyzuo9 \
  --region us-east-1 \
  --query 'Versions[?Key==`index.html` || Key==`services/index.html` || Key==`blog/index.html`].[Key,VersionId,LastModified,IsLatest]' \
  --output table

# Get JSON output for scripting
aws s3api list-object-versions \
  --bucket mobile-marketing-site-prod-1759705011281-tyzuo9 \
  --prefix index.html \
  --region us-east-1 \
  --query 'Versions[0:5].[VersionId,LastModified,IsLatest]' \
  --output json
```

### 2. Restore Object Version with Proper Cache Headers

Use the `aws s3api copy-object` command with `--metadata-directive REPLACE` to restore versions while preserving proper cache headers:

```bash
# Restore HTML file with correct cache headers
aws s3api copy-object \
  --bucket mobile-marketing-site-prod-1759705011281-tyzuo9 \
  --copy-source "mobile-marketing-site-prod-1759705011281-tyzuo9/index.html?versionId=VERSION_ID_HERE" \
  --key index.html \
  --metadata-directive REPLACE \
  --cache-control "public, max-age=600" \
  --content-type "text/html; charset=utf-8" \
  --region us-east-1

# Restore static asset with long cache headers
aws s3api copy-object \
  --bucket mobile-marketing-site-prod-1759705011281-tyzuo9 \
  --copy-source "mobile-marketing-site-prod-1759705011281-tyzuo9/_next/static/css/app.css?versionId=VERSION_ID_HERE" \
  --key _next/static/css/app.css \
  --metadata-directive REPLACE \
  --cache-control "public, max-age=31536000, immutable" \
  --content-type "text/css" \
  --region us-east-1

# Restore image with proper MIME type
aws s3api copy-object \
  --bucket mobile-marketing-site-prod-1759705011281-tyzuo9 \
  --copy-source "mobile-marketing-site-prod-1759705011281-tyzuo9/images/hero.webp?versionId=VERSION_ID_HERE" \
  --key images/hero.webp \
  --metadata-directive REPLACE \
  --cache-control "public, max-age=31536000, immutable" \
  --content-type "image/webp" \
  --region us-east-1
```

### 3. Post-Rollback CloudFront Invalidation

After restoring files, invalidate CloudFront cache to ensure changes are visible:

```bash
# Targeted invalidation for specific paths
aws cloudfront create-invalidation \
  --distribution-id E2IBMHQ3GCW6ZK \
  --paths "/" "/index.html" "/services/*" "/blog/*" "/images/*" "/sitemap.xml" "/_next/*" \
  --region us-east-1

# Full cache invalidation (use sparingly due to cost)
aws cloudfront create-invalidation \
  --distribution-id E2IBMHQ3GCW6ZK \
  --paths "/*" \
  --region us-east-1

# Check invalidation status
aws cloudfront get-invalidation \
  --distribution-id E2IBMHQ3GCW6ZK \
  --id INVALIDATION_ID_FROM_PREVIOUS_COMMAND \
  --region us-east-1
```

## Step-by-Step Rollback Procedures

### Emergency Complete Rollback

When the entire site needs to be rolled back to a previous version:

#### Step 1: Identify Target Version
```bash
# Find the last known good deployment timestamp
aws s3api list-object-versions \
  --bucket mobile-marketing-site-prod-1759705011281-tyzuo9 \
  --prefix index.html \
  --region us-east-1 \
  --query 'Versions[1:3].[VersionId,LastModified]' \
  --output table
```

#### Step 2: Document Current State
```bash
# Save current version IDs for potential re-rollback
aws s3api list-object-versions \
  --bucket mobile-marketing-site-prod-1759705011281-tyzuo9 \
  --region us-east-1 \
  --query 'Versions[?IsLatest==`true`].[Key,VersionId]' \
  --output json > "rollback-backup-$(date +%Y%m%d-%H%M%S).json"
```

#### Step 3: Restore Critical Files
```bash
# Define target version ID (replace with actual version)
TARGET_VERSION="YOUR_TARGET_VERSION_ID_HERE"

# Restore main HTML files with proper cache headers
aws s3api copy-object \
  --bucket mobile-marketing-site-prod-1759705011281-tyzuo9 \
  --copy-source "mobile-marketing-site-prod-1759705011281-tyzuo9/index.html?versionId=$TARGET_VERSION" \
  --key index.html \
  --metadata-directive REPLACE \
  --cache-control "public, max-age=600" \
  --content-type "text/html; charset=utf-8" \
  --region us-east-1

aws s3api copy-object \
  --bucket mobile-marketing-site-prod-1759705011281-tyzuo9 \
  --copy-source "mobile-marketing-site-prod-1759705011281-tyzuo9/services/index.html?versionId=$TARGET_VERSION" \
  --key services/index.html \
  --metadata-directive REPLACE \
  --cache-control "public, max-age=600" \
  --content-type "text/html; charset=utf-8" \
  --region us-east-1

aws s3api copy-object \
  --bucket mobile-marketing-site-prod-1759705011281-tyzuo9 \
  --copy-source "mobile-marketing-site-prod-1759705011281-tyzuo9/blog/index.html?versionId=$TARGET_VERSION" \
  --key blog/index.html \
  --metadata-directive REPLACE \
  --cache-control "public, max-age=600" \
  --content-type "text/html; charset=utf-8" \
  --region us-east-1
```

#### Step 4: Invalidate CloudFront Cache
```bash
aws cloudfront create-invalidation \
  --distribution-id E2IBMHQ3GCW6ZK \
  --paths "/" "/index.html" "/services/*" "/blog/*" "/images/*" "/sitemap.xml" "/_next/*" \
  --region us-east-1
```

#### Step 5: Verify Rollback Success
```bash
# Check HTTP status codes
curl -s -o /dev/null -w "%{http_code}\n" https://d15sc9fc739ev2.cloudfront.net/
curl -s -o /dev/null -w "%{http_code}\n" https://d15sc9fc739ev2.cloudfront.net/services/
curl -s -o /dev/null -w "%{http_code}\n" https://d15sc9fc739ev2.cloudfront.net/blog/

# Verify cache headers are correct
curl -I https://d15sc9fc739ev2.cloudfront.net/ | grep -i cache-control
```

### Selective File Rollback

When only specific files need to be rolled back:

#### Step 1: Identify Problem File and Target Version
```bash
# List versions for specific problematic file
aws s3api list-object-versions \
  --bucket mobile-marketing-site-prod-1759705011281-tyzuo9 \
  --prefix "services/photography/index.html" \
  --region us-east-1 \
  --query 'Versions[0:5].[VersionId,LastModified,IsLatest]' \
  --output table
```

#### Step 2: Restore Specific File
```bash
# Restore single file with proper metadata
aws s3api copy-object \
  --bucket mobile-marketing-site-prod-1759705011281-tyzuo9 \
  --copy-source "mobile-marketing-site-prod-1759705011281-tyzuo9/services/photography/index.html?versionId=TARGET_VERSION_ID" \
  --key services/photography/index.html \
  --metadata-directive REPLACE \
  --cache-control "public, max-age=600" \
  --content-type "text/html; charset=utf-8" \
  --region us-east-1
```

#### Step 3: Targeted Cache Invalidation
```bash
# Invalidate only affected paths
aws cloudfront create-invalidation \
  --distribution-id E2IBMHQ3GCW6ZK \
  --paths "/services/photography/*" "/services/*" \
  --region us-east-1
```

## Cache Header Preservation Guidelines

### HTML Files Cache Headers
```bash
--cache-control "public, max-age=600"
--content-type "text/html; charset=utf-8"
```

### Static Assets Cache Headers
```bash
--cache-control "public, max-age=31536000, immutable"
--content-type "text/css"  # for CSS files
--content-type "application/javascript"  # for JS files
--content-type "image/webp"  # for WebP images
--content-type "image/svg+xml"  # for SVG files
```

### Special Files Cache Headers
```bash
# sitemap.xml and robots.txt
--cache-control "public, max-age=600"
--content-type "application/xml"  # for sitemap.xml
--content-type "text/plain"  # for robots.txt

# JSON files
--cache-control "public, max-age=31536000, immutable"
--content-type "application/json"

# Web manifest
--cache-control "public, max-age=31536000, immutable"
--content-type "application/manifest+json"
```

## PowerShell Commands

For Windows environments using PowerShell:

### List Versions (PowerShell)
```powershell
# List object versions
aws s3api list-object-versions `
  --bucket mobile-marketing-site-prod-1759705011281-tyzuo9 `
  --prefix "index.html" `
  --region us-east-1 `
  --query "Versions[*].[Key,VersionId,LastModified,IsLatest]" `
  --output table
```

### Restore File (PowerShell)
```powershell
# Restore with proper cache headers
$bucket = "mobile-marketing-site-prod-1759705011281-tyzuo9"
$versionId = "YOUR_VERSION_ID_HERE"
$key = "index.html"

aws s3api copy-object `
  --bucket $bucket `
  --copy-source "$bucket/$key?versionId=$versionId" `
  --key $key `
  --metadata-directive REPLACE `
  --cache-control "public, max-age=600" `
  --content-type "text/html; charset=utf-8" `
  --region us-east-1
```

### Invalidate Cache (PowerShell)
```powershell
# Create invalidation
aws cloudfront create-invalidation `
  --distribution-id E2IBMHQ3GCW6ZK `
  --paths "/" "/index.html" "/services/*" "/blog/*" "/images/*" "/sitemap.xml" "/_next/*" `
  --region us-east-1
```

## Batch Rollback Script

For rolling back multiple files simultaneously:

```bash
#!/bin/bash
# batch-rollback.sh - Rollback multiple files to target version

BUCKET="mobile-marketing-site-prod-1759705011281-tyzuo9"
DISTRIBUTION_ID="E2IBMHQ3GCW6ZK"
REGION="us-east-1"
TARGET_VERSION="$1"

if [ -z "$TARGET_VERSION" ]; then
    echo "Usage: $0 <target-version-id>"
    exit 1
fi

# Critical files to rollback
FILES=(
    "index.html"
    "services/index.html"
    "blog/index.html"
    "contact/index.html"
    "privacy-policy/index.html"
    "sitemap.xml"
    "robots.txt"
)

echo "Starting batch rollback to version: $TARGET_VERSION"

# Restore each file
for file in "${FILES[@]}"; do
    echo "Restoring $file..."
    
    # Determine content type and cache control
    if [[ "$file" == *.html ]]; then
        CONTENT_TYPE="text/html; charset=utf-8"
        CACHE_CONTROL="public, max-age=600"
    elif [[ "$file" == "sitemap.xml" ]]; then
        CONTENT_TYPE="application/xml"
        CACHE_CONTROL="public, max-age=600"
    elif [[ "$file" == "robots.txt" ]]; then
        CONTENT_TYPE="text/plain"
        CACHE_CONTROL="public, max-age=600"
    else
        CONTENT_TYPE="application/octet-stream"
        CACHE_CONTROL="public, max-age=31536000, immutable"
    fi
    
    aws s3api copy-object \
      --bucket "$BUCKET" \
      --copy-source "$BUCKET/$file?versionId=$TARGET_VERSION" \
      --key "$file" \
      --metadata-directive REPLACE \
      --cache-control "$CACHE_CONTROL" \
      --content-type "$CONTENT_TYPE" \
      --region "$REGION"
    
    if [ $? -eq 0 ]; then
        echo "✅ Successfully restored $file"
    else
        echo "❌ Failed to restore $file"
    fi
done

# Invalidate CloudFront cache
echo "Invalidating CloudFront cache..."
aws cloudfront create-invalidation \
  --distribution-id "$DISTRIBUTION_ID" \
  --paths "/" "/index.html" "/services/*" "/blog/*" "/images/*" "/sitemap.xml" "/_next/*" \
  --region "$REGION"

echo "Batch rollback completed!"
echo "Cache propagation may take 5-15 minutes to complete."
```

## Troubleshooting

### Common Issues and Solutions

#### Version Not Found Error
```bash
# Error: The specified version does not exist
# Solution: Verify the version ID exists
aws s3api list-object-versions \
  --bucket mobile-marketing-site-prod-1759705011281-tyzuo9 \
  --prefix index.html \
  --region us-east-1
```

#### Access Denied Error
```bash
# Error: Access Denied
# Solution: Check AWS credentials and permissions
aws sts get-caller-identity
aws s3api get-bucket-versioning --bucket mobile-marketing-site-prod-1759705011281-tyzuo9
```

#### CloudFront Invalidation Fails
```bash
# Error: InvalidDistributionId or access denied
# Solution: Verify distribution ID and permissions
aws cloudfront get-distribution --id E2IBMHQ3GCW6ZK
```

#### Cache Headers Not Applied
```bash
# Check current object metadata
aws s3api head-object \
  --bucket mobile-marketing-site-prod-1759705011281-tyzuo9 \
  --key index.html \
  --region us-east-1
```

### Recovery from Failed Rollback

If a rollback operation fails:

1. **Check the backup file** created during the rollback process
2. **Restore from the backup** using the saved version IDs
3. **Verify AWS credentials** and permissions
4. **Check S3 bucket versioning** is enabled
5. **Contact support** with error details and timestamps

## Best Practices

### Before Rollback
- Always document current version IDs
- Verify target version exists and is accessible
- Test rollback commands in staging environment first
- Notify stakeholders of planned rollback

### During Rollback
- Use `--metadata-directive REPLACE` to preserve cache headers
- Apply appropriate cache control headers for file types
- Invalidate only necessary CloudFront paths to minimize costs
- Monitor rollback progress and verify each step

### After Rollback
- Verify site functionality across all pages
- Check cache headers are correctly applied
- Monitor CloudFront invalidation completion
- Document rollback actions and results
- Plan follow-up deployment if needed

This runbook provides comprehensive procedures for rolling back the SCRAM Final Deployment while maintaining proper cache headers and ensuring minimal downtime.