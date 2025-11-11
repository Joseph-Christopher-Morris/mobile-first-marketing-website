# Vivid Auto SCRAM Rebuild - Rollback Procedures

## Overview

This document provides comprehensive rollback procedures for the Vivid Auto Photography website deployment using S3 versioning and CloudFront invalidation. The procedures ensure quick recovery from deployment issues while maintaining data integrity.

## Infrastructure Configuration

- **S3 Bucket**: `mobile-marketing-site-prod-1759705011281-tyzuo9`
- **CloudFront Distribution**: `E2IBMHQ3GCW6ZK`
- **Region**: `us-east-1`
- **Domain**: `d15sc9fc739ev2.cloudfront.net`

## Prerequisites

1. AWS CLI configured with appropriate permissions
2. S3 versioning enabled on the bucket
3. PowerShell or Bash terminal access
4. Valid AWS credentials with S3 and CloudFront permissions

## S3 Version Management Commands

### 1. List Object Versions

List all versions of objects in the S3 bucket to identify rollback targets:

```bash
# List all object versions
aws s3api list-object-versions \
  --bucket mobile-marketing-site-prod-1759705011281-tyzuo9 \
  --region us-east-1 \
  --output table

# List versions for specific file (e.g., index.html)
aws s3api list-object-versions \
  --bucket mobile-marketing-site-prod-1759705011281-tyzuo9 \
  --prefix index.html \
  --region us-east-1 \
  --query 'Versions[*].[Key,VersionId,LastModified,IsLatest]' \
  --output table

# List versions with JSON output for scripting
aws s3api list-object-versions \
  --bucket mobile-marketing-site-prod-1759705011281-tyzuo9 \
  --region us-east-1 \
  --query 'Versions[?Key==`index.html`].[Key,VersionId,LastModified,IsLatest]' \
  --output json
```

### 2. PowerShell Version Listing Commands

```powershell
# List all object versions (PowerShell)
aws s3api list-object-versions `
  --bucket mobile-marketing-site-prod-1759705011281-tyzuo9 `
  --region us-east-1 `
  --output table

# Get specific file versions with formatted output
aws s3api list-object-versions `
  --bucket mobile-marketing-site-prod-1759705011281-tyzuo9 `
  --prefix "index.html" `
  --region us-east-1 `
  --query "Versions[*].[Key,VersionId,LastModified,IsLatest]" `
  --output table

# Get version IDs for critical files
$criticalFiles = @("index.html", "services/index.html", "blog/index.html", "contact/index.html")
foreach ($file in $criticalFiles) {
    Write-Host "Versions for $file:"
    aws s3api list-object-versions `
      --bucket mobile-marketing-site-prod-1759705011281-tyzuo9 `
      --prefix $file `
      --region us-east-1 `
      --query "Versions[0:3].[VersionId,LastModified,IsLatest]" `
      --output table
}
```

## Object Restoration Commands

### 3. Restore Specific File Version

Restore a specific version of a file using the copy-object command:

```bash
# Restore specific version of index.html
aws s3api copy-object \
  --bucket mobile-marketing-site-prod-1759705011281-tyzuo9 \
  --copy-source "mobile-marketing-site-prod-1759705011281-tyzuo9/index.html?versionId=VERSION_ID_HERE" \
  --key index.html \
  --metadata-directive REPLACE \
  --cache-control "public, max-age=600" \
  --content-type "text/html" \
  --region us-east-1

# Restore services page
aws s3api copy-object \
  --bucket mobile-marketing-site-prod-1759705011281-tyzuo9 \
  --copy-source "mobile-marketing-site-prod-1759705011281-tyzuo9/services/index.html?versionId=VERSION_ID_HERE" \
  --key services/index.html \
  --metadata-directive REPLACE \
  --cache-control "public, max-age=600" \
  --content-type "text/html" \
  --region us-east-1

# Restore blog page
aws s3api copy-object \
  --bucket mobile-marketing-site-prod-1759705011281-tyzuo9 \
  --copy-source "mobile-marketing-site-prod-1759705011281-tyzuo9/blog/index.html?versionId=VERSION_ID_HERE" \
  --key blog/index.html \
  --metadata-directive REPLACE \
  --cache-control "public, max-age=600" \
  --content-type "text/html" \
  --region us-east-1
```

### 4. PowerShell Restoration Commands

```powershell
# Function to restore file with proper metadata
function Restore-S3FileVersion {
    param(
        [string]$Key,
        [string]$VersionId,
        [string]$ContentType = "text/html",
        [string]$CacheControl = "public, max-age=600"
    )
    
    $copySource = "mobile-marketing-site-prod-1759705011281-tyzuo9/$Key" + "?versionId=$VersionId"
    
    aws s3api copy-object `
      --bucket mobile-marketing-site-prod-1759705011281-tyzuo9 `
      --copy-source $copySource `
      --key $Key `
      --metadata-directive REPLACE `
      --cache-control $CacheControl `
      --content-type $ContentType `
      --region us-east-1
    
    Write-Host "Restored $Key to version $VersionId"
}

# Example usage
# Restore-S3FileVersion -Key "index.html" -VersionId "YOUR_VERSION_ID_HERE"
# Restore-S3FileVersion -Key "services/index.html" -VersionId "YOUR_VERSION_ID_HERE"
```

### 5. Batch Restoration for Multiple Files

```bash
#!/bin/bash
# Batch restore script for critical files

BUCKET="mobile-marketing-site-prod-1759705011281-tyzuo9"
REGION="us-east-1"

# Define critical files and their target versions
declare -A FILES_TO_RESTORE=(
    ["index.html"]="VERSION_ID_1"
    ["services/index.html"]="VERSION_ID_2"
    ["blog/index.html"]="VERSION_ID_3"
    ["contact/index.html"]="VERSION_ID_4"
    ["services/photography/index.html"]="VERSION_ID_5"
    ["services/analytics/index.html"]="VERSION_ID_6"
    ["services/ad-campaigns/index.html"]="VERSION_ID_7"
)

# Restore each file
for file in "${!FILES_TO_RESTORE[@]}"; do
    version_id="${FILES_TO_RESTORE[$file]}"
    echo "Restoring $file to version $version_id..."
    
    aws s3api copy-object \
      --bucket "$BUCKET" \
      --copy-source "$BUCKET/$file?versionId=$version_id" \
      --key "$file" \
      --metadata-directive REPLACE \
      --cache-control "public, max-age=600" \
      --content-type "text/html" \
      --region "$REGION"
    
    if [ $? -eq 0 ]; then
        echo "✅ Successfully restored $file"
    else
        echo "❌ Failed to restore $file"
    fi
done
```

## CloudFront Cache Invalidation

### 6. Invalidate CloudFront Cache After Rollback

```bash
# Invalidate all paths after rollback
aws cloudfront create-invalidation \
  --distribution-id E2IBMHQ3GCW6ZK \
  --paths "/*" \
  --region us-east-1

# Invalidate specific paths for targeted rollback
aws cloudfront create-invalidation \
  --distribution-id E2IBMHQ3GCW6ZK \
  --paths "/" "/index.html" "/services/*" "/blog/*" "/images/*" "/sitemap.xml" "/_next/*" \
  --region us-east-1

# Check invalidation status
aws cloudfront get-invalidation \
  --distribution-id E2IBMHQ3GCW6ZK \
  --id INVALIDATION_ID_HERE \
  --region us-east-1
```

### 7. PowerShell CloudFront Commands

```powershell
# Create invalidation (PowerShell)
aws cloudfront create-invalidation `
  --distribution-id E2IBMHQ3GCW6ZK `
  --paths "/*" `
  --region us-east-1

# Targeted invalidation for specific paths
$paths = @("/", "/index.html", "/services/*", "/blog/*", "/images/*", "/sitemap.xml", "/_next/*")
$pathsJson = $paths | ConvertTo-Json -Compress

aws cloudfront create-invalidation `
  --distribution-id E2IBMHQ3GCW6ZK `
  --invalidation-batch "Paths={Quantity=$($paths.Count),Items=$pathsJson},CallerReference=rollback-$(Get-Date -Format 'yyyyMMdd-HHmmss')" `
  --region us-east-1
```

## Step-by-Step Rollback Procedures

### Emergency Rollback (Complete Site)

1. **Identify Target Version**
   ```bash
   # Get the last known good version of index.html
   aws s3api list-object-versions \
     --bucket mobile-marketing-site-prod-1759705011281-tyzuo9 \
     --prefix index.html \
     --query 'Versions[1].[VersionId,LastModified]' \
     --output table
   ```

2. **Document Current State**
   ```bash
   # Save current version IDs for potential re-rollback
   aws s3api list-object-versions \
     --bucket mobile-marketing-site-prod-1759705011281-tyzuo9 \
     --query 'Versions[?IsLatest==`true`].[Key,VersionId]' \
     --output json > current-versions-$(date +%Y%m%d-%H%M%S).json
   ```

3. **Restore Critical Files**
   ```bash
   # Restore main pages (replace VERSION_IDs with actual values)
   aws s3api copy-object \
     --bucket mobile-marketing-site-prod-1759705011281-tyzuo9 \
     --copy-source "mobile-marketing-site-prod-1759705011281-tyzuo9/index.html?versionId=GOOD_VERSION_ID" \
     --key index.html \
     --metadata-directive REPLACE \
     --cache-control "public, max-age=600" \
     --content-type "text/html"
   ```

4. **Invalidate Cache**
   ```bash
   aws cloudfront create-invalidation \
     --distribution-id E2IBMHQ3GCW6ZK \
     --paths "/*"
   ```

5. **Verify Rollback**
   ```bash
   # Check website is accessible
   curl -I https://d15sc9fc739ev2.cloudfront.net/
   
   # Verify specific pages
   curl -I https://d15sc9fc739ev2.cloudfront.net/services/
   curl -I https://d15sc9fc739ev2.cloudfront.net/blog/
   ```

### Selective Rollback (Specific Files)

1. **Identify Problem Files**
   ```bash
   # List recent versions of specific file
   aws s3api list-object-versions \
     --bucket mobile-marketing-site-prod-1759705011281-tyzuo9 \
     --prefix "services/photography/index.html" \
     --query 'Versions[0:5].[VersionId,LastModified,IsLatest]' \
     --output table
   ```

2. **Restore Specific File**
   ```bash
   aws s3api copy-object \
     --bucket mobile-marketing-site-prod-1759705011281-tyzuo9 \
     --copy-source "mobile-marketing-site-prod-1759705011281-tyzuo9/services/photography/index.html?versionId=TARGET_VERSION_ID" \
     --key services/photography/index.html \
     --metadata-directive REPLACE \
     --cache-control "public, max-age=600" \
     --content-type "text/html"
   ```

3. **Targeted Cache Invalidation**
   ```bash
   aws cloudfront create-invalidation \
     --distribution-id E2IBMHQ3GCW6ZK \
     --paths "/services/photography/*" "/services/*"
   ```

## Rollback Verification Checklist

### Post-Rollback Validation

1. **HTTP Status Checks**
   ```bash
   # Check main pages return 200
   curl -s -o /dev/null -w "%{http_code}" https://d15sc9fc739ev2.cloudfront.net/
   curl -s -o /dev/null -w "%{http_code}" https://d15sc9fc739ev2.cloudfront.net/services/
   curl -s -o /dev/null -w "%{http_code}" https://d15sc9fc739ev2.cloudfront.net/blog/
   curl -s -o /dev/null -w "%{http_code}" https://d15sc9fc739ev2.cloudfront.net/contact/
   ```

2. **Content Validation**
   ```bash
   # Verify brand colors are restored (no gradients)
   curl -s https://d15sc9fc739ev2.cloudfront.net/ | grep -i "gradient\|indigo\|purple\|yellow"
   
   # Check hero image is correct
   curl -s https://d15sc9fc739ev2.cloudfront.net/ | grep "aston-martin-db6-website.webp"
   
   # Verify contact form structure
   curl -s https://d15sc9fc739ev2.cloudfront.net/contact/ | grep -c "Full Name\|Email Address\|Phone\|Service Interest\|Message"
   ```

3. **Image Accessibility**
   ```bash
   # Check portfolio images load correctly
   curl -I https://d15sc9fc739ev2.cloudfront.net/images/services/250928-hampson-auctions-sunday-11.webp
   curl -I https://d15sc9fc739ev2.cloudfront.net/images/services/240217-australia-trip-232-1.webp
   ```

## Automated Rollback Scripts

### PowerShell Complete Rollback Script

```powershell
# vivid-auto-emergency-rollback.ps1
param(
    [string]$TargetVersionId,
    [switch]$DryRun = $false
)

$bucket = "mobile-marketing-site-prod-1759705011281-tyzuo9"
$distributionId = "E2IBMHQ3GCW6ZK"
$region = "us-east-1"

# Critical files to rollback
$criticalFiles = @(
    "index.html",
    "services/index.html",
    "blog/index.html",
    "contact/index.html",
    "services/photography/index.html",
    "services/analytics/index.html",
    "services/ad-campaigns/index.html"
)

Write-Host "🔄 Vivid Auto Emergency Rollback Script"
Write-Host "Bucket: $bucket"
Write-Host "Distribution: $distributionId"
Write-Host "Target Version: $TargetVersionId"
Write-Host "Dry Run: $DryRun"
Write-Host ""

if ($DryRun) {
    Write-Host "🧪 DRY RUN MODE - No changes will be made"
    Write-Host ""
}

# Step 1: Backup current versions
Write-Host "📋 Step 1: Documenting current versions..."
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$backupFile = "rollback-backup-$timestamp.json"

$currentVersions = @{}
foreach ($file in $criticalFiles) {
    $versions = aws s3api list-object-versions --bucket $bucket --prefix $file --query 'Versions[?IsLatest==`true`].[VersionId]' --output text
    $currentVersions[$file] = $versions
    Write-Host "  $file : $versions"
}

if (-not $DryRun) {
    $currentVersions | ConvertTo-Json | Out-File $backupFile
    Write-Host "✅ Current versions saved to $backupFile"
}

# Step 2: Restore files
Write-Host ""
Write-Host "📤 Step 2: Restoring files to target version..."
foreach ($file in $criticalFiles) {
    Write-Host "  Restoring $file..."
    
    if (-not $DryRun) {
        $copySource = "$bucket/$file" + "?versionId=$TargetVersionId"
        aws s3api copy-object `
          --bucket $bucket `
          --copy-source $copySource `
          --key $file `
          --metadata-directive REPLACE `
          --cache-control "public, max-age=600" `
          --content-type "text/html" `
          --region $region
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "    ✅ Success"
        } else {
            Write-Host "    ❌ Failed"
        }
    } else {
        Write-Host "    🧪 Would restore to version $TargetVersionId"
    }
}

# Step 3: Invalidate cache
Write-Host ""
Write-Host "🔄 Step 3: Invalidating CloudFront cache..."
if (-not $DryRun) {
    aws cloudfront create-invalidation `
      --distribution-id $distributionId `
      --paths "/*" `
      --region $region
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Cache invalidation initiated"
    } else {
        Write-Host "❌ Cache invalidation failed"
    }
} else {
    Write-Host "🧪 Would invalidate all paths (/*)"
}

# Step 4: Verification
Write-Host ""
Write-Host "🔍 Step 4: Verification commands..."
Write-Host "Run these commands to verify the rollback:"
Write-Host "  curl -I https://d15sc9fc739ev2.cloudfront.net/"
Write-Host "  curl -I https://d15sc9fc739ev2.cloudfront.net/services/"
Write-Host "  curl -I https://d15sc9fc739ev2.cloudfront.net/blog/"
Write-Host ""

if (-not $DryRun) {
    Write-Host "✅ Rollback completed!"
    Write-Host "📁 Current version backup: $backupFile"
    Write-Host "⏱️  Cache propagation may take 5-15 minutes"
} else {
    Write-Host "🧪 Dry run completed - no changes made"
    Write-Host "Remove -DryRun flag to execute the rollback"
}
```

## Troubleshooting

### Common Issues and Solutions

1. **Version Not Found Error**
   ```bash
   # Error: The specified version does not exist
   # Solution: List available versions and verify VersionId
   aws s3api list-object-versions --bucket mobile-marketing-site-prod-1759705011281-tyzuo9 --prefix index.html
   ```

2. **Access Denied Error**
   ```bash
   # Error: Access Denied
   # Solution: Check AWS credentials and IAM permissions
   aws sts get-caller-identity
   aws iam get-user
   ```

3. **CloudFront Invalidation Fails**
   ```bash
   # Error: InvalidDistributionId
   # Solution: Verify distribution ID and region
   aws cloudfront get-distribution --id E2IBMHQ3GCW6ZK
   ```

4. **Cache Not Clearing**
   ```bash
   # Check invalidation status
   aws cloudfront list-invalidations --distribution-id E2IBMHQ3GCW6ZK
   
   # Force browser cache clear
   curl -H "Cache-Control: no-cache" https://d15sc9fc739ev2.cloudfront.net/
   ```

### Recovery from Failed Rollback

If a rollback fails or causes issues:

1. **Restore from backup file**
   ```bash
   # Use the backup JSON file created during rollback
   cat rollback-backup-TIMESTAMP.json
   # Manually restore each file to its backed-up version
   ```

2. **Emergency deployment**
   ```bash
   # Redeploy from known good build
   npm run build:static
   # Upload fresh build to S3
   ```

3. **Contact support**
   - Document the error messages
   - Provide rollback timestamp
   - Include AWS CLI version and credentials info

## Maintenance and Best Practices

### Regular Maintenance

1. **Monitor S3 versioning costs**
   ```bash
   # Check bucket size and version count
   aws s3api list-object-versions --bucket mobile-marketing-site-prod-1759705011281-tyzuo9 --query 'length(Versions)'
   ```

2. **Clean up old versions (if needed)**
   ```bash
   # List versions older than 30 days
   aws s3api list-object-versions \
     --bucket mobile-marketing-site-prod-1759705011281-tyzuo9 \
     --query 'Versions[?LastModified<`2024-01-01`].[Key,VersionId,LastModified]'
   ```

3. **Test rollback procedures monthly**
   - Use dry-run mode to validate commands
   - Verify version IDs are accessible
   - Test cache invalidation

### Security Considerations

1. **Limit rollback permissions**
   - Use IAM roles with minimal required permissions
   - Implement MFA for production rollbacks
   - Log all rollback activities

2. **Version retention policy**
   - Keep at least 10 versions of critical files
   - Implement lifecycle policies for cost management
   - Regular backup verification

This documentation provides comprehensive rollback procedures specifically tailored for the Vivid Auto Photography website deployment infrastructure.