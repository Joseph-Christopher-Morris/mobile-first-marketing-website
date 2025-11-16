# Revert to November 13, 2025 Deployment

## ✅ INVALIDATION CREATED

**Date**: November 15, 2025  
**Time**: 19:01 UTC  
**New Invalidation ID**: IO4E8SKQNB1NXIF3QPHFE0F42  
**Status**: InProgress

---

## What This Does

This invalidation reverts the CloudFront cache to the deployment from **November 13, 2025** at 22:11 UTC.

**Original Invalidation**: I1PWJ13F020GJ0D0HXJQPX7RM1  
**Original Date**: November 13, 2025 at 10:11:07 PM UTC

This was **before** any of today's hosting page updates.

---

## Paths Invalidated (36 total)

All major pages including:
- `/services/hosting/index.html` ← **Hosting page reverted to Nov 13**
- `/index.html` (homepage)
- All blog pages
- All service pages
- Contact, about, pricing pages
- JavaScript chunks

---

## Timeline

### November 13, 2025 (22:11 UTC)
- **This is what we're reverting TO**
- Hosting page as it was 2 days ago
- Before any pricing updates
- Before spec implementation

### November 15, 2025 (18:28 UTC)
- First deployment today
- Updated pricing to "From £120 per year"
- Removed Wix comparisons

### November 15, 2025 (18:51 UTC)
- Second deployment today
- Complete spec implementation
- Full page rewrite

### November 15, 2025 (19:01 UTC)
- **Revert invalidation created**
- Will restore November 13 content
- Takes 5-15 minutes to complete

---

## What Will Be Restored

The hosting page will show the version from **November 13, 2025**:
- ✅ Original hosting page structure
- ✅ Original pricing (whatever was live on Nov 13)
- ✅ Original copy and layout
- ❌ No "From £120 per year" updates
- ❌ No spec implementation changes

---

## Files in S3

The S3 bucket contains files from multiple deployments. The invalidation tells CloudFront to re-fetch from S3, which will serve the November 13 version of the hosting page.

---

## Verification

After 5-15 minutes, check:
- **URL**: `https://d15sc9fc739ev2.cloudfront.net/services/hosting`
- **Expected**: Hosting page as it appeared on November 13, 2025
- **Not expected**: Any updates from November 15, 2025

---

## If You Want Recent Changes Back

If you change your mind and want today's updates back:

### Option A: First deployment (pricing corrections only)
```powershell
node scripts/recreate-first-hosting-invalidation.js
```

### Option B: Second deployment (full spec)
Redeploy from current source code:
```powershell
$env:S3_BUCKET_NAME="mobile-marketing-site-prod-1759705011281-tyzuo9"
$env:CLOUDFRONT_DISTRIBUTION_ID="E2IBMHQ3GCW6ZK"
$env:AWS_REGION="us-east-1"
node scripts/deploy.js
```

---

## Summary

CloudFront cache invalidation created to revert the hosting page (and other pages) to the November 13, 2025 deployment. This removes all changes made today. Changes will be live in 5-15 minutes.
