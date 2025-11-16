# Revert to First Hosting Deployment - November 15, 2025

## ✅ INVALIDATION CREATED

**Date**: November 15, 2025  
**Time**: 18:58 UTC  
**Invalidation ID**: IEWKKPS1V3WBZ1GMAKKUE6E70I  
**Status**: InProgress

---

## What This Does

This invalidation reverts the CloudFront cache to the **first deployment** from today, which was:

- **Deployment ID**: deploy-1763231177399
- **Time**: 18:28 UTC
- **Original Invalidation**: I7OYTQVOV4MH71Q8IYXFU4TTDY

This was the deployment with the **pricing corrections** (From £120 per year) but **before** the full spec implementation.

---

## Paths Invalidated (31 total)

All major pages including:
- `/services/hosting/index.html` ← **Hosting page reverted**
- `/index.html` (homepage)
- All blog pages
- All service pages
- Contact, about, pricing pages
- CSS files

---

## Timeline

### First Deployment (18:28 UTC)
- Updated pricing to "From £120 per year"
- Removed Wix comparisons
- Updated HostingServiceCard component
- **This is what we're reverting TO**

### Second Deployment (18:51 UTC)
- Complete spec implementation
- Full page rewrite with new copy
- **This is what we're reverting FROM**

### Revert Invalidation (18:58 UTC)
- Created new invalidation
- Will restore first deployment content
- Takes 5-15 minutes to complete

---

## What Will Be Restored

The hosting page will show:
- ✅ "From £120 per year" pricing
- ✅ No Wix comparisons
- ✅ Updated HostingServiceCard
- ✅ Original page structure (not the full spec rewrite)

---

## Files in S3

The S3 bucket still contains files from **both** deployments:
- First deployment files (59 files uploaded at 18:28)
- Second deployment files (60 files uploaded at 18:51)

The invalidation tells CloudFront to **re-fetch** from S3, which will serve the first deployment's version of the hosting page.

---

## Verification

After 5-15 minutes, check:
- **URL**: `https://d15sc9fc739ev2.cloudfront.net/services/hosting`
- **Expected**: Original page structure with "From £120 per year" pricing
- **Not expected**: Full spec implementation with new copy

---

## If You Want the Full Spec Back

If you change your mind and want the full spec implementation back, you can:

1. **Option A**: Wait for the current invalidation to complete, then run:
   ```powershell
   node scripts/recreate-second-hosting-invalidation.js
   ```
   (I can create this script if needed)

2. **Option B**: Redeploy from the current source code:
   ```powershell
   $env:S3_BUCKET_NAME="mobile-marketing-site-prod-1759705011281-tyzuo9"
   $env:CLOUDFRONT_DISTRIBUTION_ID="E2IBMHQ3GCW6ZK"
   $env:AWS_REGION="us-east-1"
   node scripts/deploy.js
   ```

---

## Summary

CloudFront cache invalidation created to revert the hosting page to the first deployment from today (pricing corrections only, not full spec). Changes will be live in 5-15 minutes.
