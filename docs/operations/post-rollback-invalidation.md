# Post-Rollback CloudFront Invalidation Guide

## Overview

After performing an S3 versioning rollback, CloudFront cache invalidation is essential to ensure users see the rolled-back content immediately. This document outlines the specific invalidation steps required after different types of rollbacks.

## Infrastructure Configuration

- **CloudFront Distribution**: `E2IBMHQ3GCW6ZK`
- **Region**: `us-east-1`
- **Domain**: `d15sc9fc739ev2.cloudfront.net`

## Invalidation Strategies by Rollback Type

### 1. Complete Site Rollback

When rolling back the entire site to a previous version:

```bash
# Full site invalidation (use sparingly due to cost)
aws cloudfront create-invalidation \
  --distribution-id E2IBMHQ3GCW6ZK \
  --paths "/*" \
  --region us-east-1

# Alternative: Targeted paths for main content
aws cloudfront create-invalidation \
  --distribution-id E2IBMHQ3GCW6ZK \
  --paths "/" "/index.html" "/services/*" "/blog/*" "/contact/*" "/privacy-policy/*" "/images/*" "/sitemap.xml" "/_next/*" \
  --region us-east-1
```

### 2. HTML Content Rollback

When rolling back HTML pages only:

```bash
# HTML pages and related content
aws cloudfront create-invalidation \
  --distribution-id E2IBMHQ3GCW6ZK \
  --paths "/" "/index.html" "/services/*" "/blog/*" "/contact/*" "/privacy-policy/*" "/sitemap.xml" \
  --region us-east-1
```

### 3. Static Assets Rollback

When rolling back CSS, JS, or image files:

```bash
# Static assets invalidation
aws cloudfront create-invalidation \
  --distribution-id E2IBMHQ3GCW6ZK \
  --paths "/_next/*" "/images/*" "/*.css" "/*.js" "/*.webp" "/*.png" "/*.jpg" "/*.svg" \
  --region us-east-1
```

### 4. Selective File Rollback

When rolling back specific files or sections:

```bash
# Example: Services section rollback
aws cloudfront create-invalidation \
  --distribution-id E2IBMHQ3GCW6ZK \
  --paths "/services/*" "/services/photography/*" "/services/analytics/*" "/services/ad-campaigns/*" \
  --region us-east-1

# Example: Blog section rollback
aws cloudfront create-invalidation \
  --distribution-id E2IBMHQ3GCW6ZK \
  --paths "/blog/*" "/blog/*/index.html" \
  --region us-east-1

# Example: Single page rollback
aws cloudfront create-invalidation \
  --distribution-id E2IBMHQ3GCW6ZK \
  --paths "/contact/index.html" "/contact/*" \
  --region us-east-1
```

## Step-by-Step Post-Rollback Invalidation

### Step 1: Identify Rollback Scope

Determine which files were rolled back to choose the appropriate invalidation strategy:

```bash
# List recently modified objects to understand rollback scope
aws s3api list-objects-v2 \
  --bucket mobile-marketing-site-prod-1759705011281-tyzuo9 \
  --query 'Contents[?LastModified>=`2024-01-01T00:00:00Z`].[Key,LastModified]' \
  --output table
```

### Step 2: Create Invalidation

Execute the appropriate invalidation command based on rollback scope:

```bash
# Standard post-rollback invalidation
aws cloudfront create-invalidation \
  --distribution-id E2IBMHQ3GCW6ZK \
  --paths "/" "/index.html" "/services/*" "/blog/*" "/images/*" "/sitemap.xml" "/_next/*" \
  --region us-east-1 \
  --output json
```

### Step 3: Monitor Invalidation Progress

Track the invalidation status:

```bash
# Get invalidation ID from previous command output, then check status
INVALIDATION_ID="YOUR_INVALIDATION_ID_HERE"

aws cloudfront get-invalidation \
  --distribution-id E2IBMHQ3GCW6ZK \
  --id $INVALIDATION_ID \
  --region us-east-1 \
  --query 'Invalidation.[Id,Status,CreateTime]' \
  --output table

# List all recent invalidations
aws cloudfront list-invalidations \
  --distribution-id E2IBMHQ3GCW6ZK \
  --region us-east-1 \
  --query 'InvalidationList.Items[0:5].[Id,Status,CreateTime]' \
  --output table
```

### Step 4: Verify Cache Clearing

Test that the rollback is visible to users:

```bash
# Test main pages with cache-busting
curl -H "Cache-Control: no-cache" -I https://d15sc9fc739ev2.cloudfront.net/
curl -H "Cache-Control: no-cache" -I https://d15sc9fc739ev2.cloudfront.net/services/
curl -H "Cache-Control: no-cache" -I https://d15sc9fc739ev2.cloudfront.net/blog/

# Check specific content to verify rollback
curl -H "Cache-Control: no-cache" -s https://d15sc9fc739ev2.cloudfront.net/ | grep -i "title\|h1"
```

## PowerShell Commands

For Windows environments:

### Create Invalidation (PowerShell)
```powershell
# Standard post-rollback invalidation
$paths = @("/", "/index.html", "/services/*", "/blog/*", "/images/*", "/sitemap.xml", "/_next/*")
$pathsString = ($paths -join '","')

aws cloudfront create-invalidation `
  --distribution-id E2IBMHQ3GCW6ZK `
  --paths $pathsString `
  --region us-east-1 `
  --output json
```

### Monitor Invalidation (PowerShell)
```powershell
# Check invalidation status
$invalidationId = "YOUR_INVALIDATION_ID_HERE"

aws cloudfront get-invalidation `
  --distribution-id E2IBMHQ3GCW6ZK `
  --id $invalidationId `
  --region us-east-1 `
  --query "Invalidation.[Id,Status,CreateTime]" `
  --output table
```

### Verify Cache Clearing (PowerShell)
```powershell
# Test pages with PowerShell
$headers = @{"Cache-Control" = "no-cache"}
Invoke-WebRequest -Uri "https://d15sc9fc739ev2.cloudfront.net/" -Headers $headers -Method Head
Invoke-WebRequest -Uri "https://d15sc9fc739ev2.cloudfront.net/services/" -Headers $headers -Method Head
```

## Automated Post-Rollback Script

Complete script for post-rollback invalidation:

```bash
#!/bin/bash
# post-rollback-invalidation.sh

DISTRIBUTION_ID="E2IBMHQ3GCW6ZK"
REGION="us-east-1"
DOMAIN="d15sc9fc739ev2.cloudfront.net"

# Function to create invalidation
create_invalidation() {
    local paths="$1"
    local description="$2"
    
    echo "Creating invalidation: $description"
    echo "Paths: $paths"
    
    local result=$(aws cloudfront create-invalidation \
      --distribution-id "$DISTRIBUTION_ID" \
      --paths $paths \
      --region "$REGION" \
      --output json)
    
    local invalidation_id=$(echo "$result" | jq -r '.Invalidation.Id')
    echo "Invalidation created with ID: $invalidation_id"
    
    return 0
}

# Function to monitor invalidation
monitor_invalidation() {
    local invalidation_id="$1"
    
    echo "Monitoring invalidation: $invalidation_id"
    
    while true; do
        local status=$(aws cloudfront get-invalidation \
          --distribution-id "$DISTRIBUTION_ID" \
          --id "$invalidation_id" \
          --region "$REGION" \
          --query 'Invalidation.Status' \
          --output text)
        
        echo "Status: $status"
        
        if [ "$status" = "Completed" ]; then
            echo "✅ Invalidation completed successfully"
            break
        elif [ "$status" = "InProgress" ]; then
            echo "⏳ Invalidation in progress, waiting 30 seconds..."
            sleep 30
        else
            echo "❌ Unexpected status: $status"
            break
        fi
    done
}

# Function to verify rollback
verify_rollback() {
    echo "🔍 Verifying rollback visibility..."
    
    local test_urls=(
        "https://$DOMAIN/"
        "https://$DOMAIN/services/"
        "https://$DOMAIN/blog/"
        "https://$DOMAIN/contact/"
    )
    
    for url in "${test_urls[@]}"; do
        echo "Testing: $url"
        local status=$(curl -H "Cache-Control: no-cache" -s -o /dev/null -w "%{http_code}" "$url")
        
        if [ "$status" = "200" ]; then
            echo "✅ $url - OK ($status)"
        else
            echo "❌ $url - Error ($status)"
        fi
    done
}

# Main execution
main() {
    local rollback_type="${1:-standard}"
    
    echo "🔄 Post-Rollback CloudFront Invalidation"
    echo "Distribution: $DISTRIBUTION_ID"
    echo "Rollback Type: $rollback_type"
    echo ""
    
    case "$rollback_type" in
        "full")
            create_invalidation "/*" "Full site rollback"
            ;;
        "html")
            create_invalidation "/" "/index.html" "/services/*" "/blog/*" "/contact/*" "/privacy-policy/*" "/sitemap.xml" "HTML content rollback"
            ;;
        "assets")
            create_invalidation "/_next/*" "/images/*" "Static assets rollback"
            ;;
        "standard"|*)
            create_invalidation "/" "/index.html" "/services/*" "/blog/*" "/images/*" "/sitemap.xml" "/_next/*" "Standard post-rollback invalidation"
            ;;
    esac
    
    # Get the invalidation ID from the last command
    local latest_invalidation=$(aws cloudfront list-invalidations \
      --distribution-id "$DISTRIBUTION_ID" \
      --region "$REGION" \
      --query 'InvalidationList.Items[0].Id' \
      --output text)
    
    if [ "$latest_invalidation" != "None" ] && [ -n "$latest_invalidation" ]; then
        monitor_invalidation "$latest_invalidation"
        
        echo ""
        echo "⏱️ Waiting 2 minutes for cache propagation..."
        sleep 120
        
        verify_rollback
    else
        echo "❌ Could not retrieve invalidation ID"
        exit 1
    fi
    
    echo ""
    echo "✅ Post-rollback invalidation completed!"
    echo "🌐 Site should now reflect the rolled-back content"
}

# Usage information
usage() {
    echo "Usage: $0 [rollback_type]"
    echo ""
    echo "Rollback types:"
    echo "  standard  - Standard post-rollback invalidation (default)"
    echo "  full      - Full site invalidation (/*)"
    echo "  html      - HTML content only"
    echo "  assets    - Static assets only"
    echo ""
    echo "Examples:"
    echo "  $0                    # Standard invalidation"
    echo "  $0 full              # Full site invalidation"
    echo "  $0 html              # HTML content only"
}

# Check for help flag
if [ "$1" = "-h" ] || [ "$1" = "--help" ]; then
    usage
    exit 0
fi

# Run main function
main "$@"
```

## Invalidation Best Practices

### Cost Optimization
- Use targeted paths instead of `/*` when possible
- Each AWS account gets 1,000 free invalidation paths per month
- Additional paths cost $0.005 per path

### Timing Considerations
- Invalidations typically complete within 10-15 minutes
- Plan rollbacks during low-traffic periods when possible
- Consider gradual rollbacks for large sites

### Monitoring and Verification
- Always monitor invalidation completion
- Test multiple pages to verify rollback visibility
- Use cache-busting headers for immediate verification
- Check both desktop and mobile versions

### Emergency Procedures
- For critical issues, use full invalidation (`/*`)
- Have monitoring in place to detect rollback success
- Prepare communication for users during rollback periods

## Troubleshooting

### Invalidation Fails
```bash
# Check distribution status
aws cloudfront get-distribution --id E2IBMHQ3GCW6ZK --query 'Distribution.Status'

# Verify permissions
aws cloudfront list-distributions --query 'DistributionList.Items[?Id==`E2IBMHQ3GCW6ZK`]'
```

### Cache Not Clearing
```bash
# Force browser cache clear
curl -H "Cache-Control: no-cache" -H "Pragma: no-cache" https://d15sc9fc739ev2.cloudfront.net/

# Check cache headers
curl -I https://d15sc9fc739ev2.cloudfront.net/ | grep -i cache
```

### Partial Invalidation Issues
```bash
# List all active invalidations
aws cloudfront list-invalidations --distribution-id E2IBMHQ3GCW6ZK --query 'InvalidationList.Items[?Status==`InProgress`]'

# Create additional targeted invalidation
aws cloudfront create-invalidation --distribution-id E2IBMHQ3GCW6ZK --paths "/specific/path/*"
```

This guide ensures proper cache invalidation after rollback procedures, minimizing user-visible downtime and ensuring rollback changes are immediately available.