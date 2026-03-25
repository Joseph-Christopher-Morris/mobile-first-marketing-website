# Cloudflare Cache Automation Setup

## Overview

This document explains how to set up automated Cloudflare cache purging for deployments to ensure the canonical domain (vividmediacheshire.com) always serves the latest content.

## Why This Is Needed

The site architecture uses:
```
User → Cloudflare (proxy/cache) → CloudFront (CDN) → S3 (origin)
```

When deploying updates:
1. Files are uploaded to S3
2. CloudFront cache is invalidated
3. **Cloudflare cache must also be purged** (otherwise serves stale content)

## Setup Instructions

### 1. Get Cloudflare API Credentials

#### A. Get Zone ID
1. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Select the `vividmediacheshire.com` domain
3. Scroll down on the Overview page
4. Copy the **Zone ID** (right column, under "API" section)

#### B. Create API Token
1. Go to [API Tokens](https://dash.cloudflare.com/profile/api-tokens)
2. Click **Create Token**
3. Use the **Edit zone DNS** template or create custom token with:
   - **Permissions:**
     - Zone → Cache Purge → Purge
   - **Zone Resources:**
     - Include → Specific zone → vividmediacheshire.com
4. Click **Continue to summary**
5. Click **Create Token**
6. **Copy the token** (you won't see it again!)

### 2. Add GitHub Secrets

1. Go to your GitHub repository
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add two secrets:

**Secret 1:**
- Name: `CLOUDFLARE_ZONE_ID`
- Value: [paste your Zone ID]

**Secret 2:**
- Name: `CLOUDFLARE_API_TOKEN`
- Value: [paste your API token]

### 3. Verify Setup

The automation is already configured in:
- `scripts/deploy.js` - Local deployment script
- `.github/workflows/s3-cloudfront-deploy.yml` - CI/CD pipeline

After adding the secrets, the next deployment will automatically:
1. Build the site
2. Upload to S3
3. Invalidate CloudFront cache
4. **Purge Cloudflare cache** ← New step
5. Submit to IndexNow

## Testing

### Test Local Deployment

```bash
# Set environment variables
export S3_BUCKET_NAME="mobile-marketing-site-prod-1759705011281-tyzuo9"
export CLOUDFRONT_DISTRIBUTION_ID="E2IBMHQ3GCW6ZK"
export AWS_REGION="us-east-1"
export CLOUDFLARE_ZONE_ID="your-zone-id"
export CLOUDFLARE_API_TOKEN="your-api-token"

# Run deployment
node scripts/deploy.js
```

Expected output:
```
🔄 Invalidating CloudFront cache...
✅ Cache invalidation started

🔄 Purging Cloudflare cache...
   Purging 3 files from Cloudflare
✅ Cloudflare cache purged successfully
```

### Test GitHub Actions

1. Push a change to the `main` branch
2. Go to **Actions** tab in GitHub
3. Watch the deployment workflow
4. Check the "Purge Cloudflare Cache" step
5. Verify it shows: `✅ Cloudflare cache purged`

### Verify Cache Purge Worked

```bash
# Check sitemap on canonical domain
curl -I https://vividmediacheshire.com/sitemap.xml

# Look for these headers:
# - cf-cache-status: MISS (first request after purge)
# - cf-cache-status: HIT (subsequent requests)
# - x-cache: Miss from cloudfront (if CloudFront also missed)
```

## Files Purged Automatically

The automation purges these critical files on every deployment:
- `https://vividmediacheshire.com/sitemap.xml`
- `https://vividmediacheshire.com/robots.txt`
- `https://vividmediacheshire.com/` (homepage)

## Manual Cache Purge

If you need to purge cache manually:

### Option 1: Cloudflare Dashboard
1. Log in to Cloudflare
2. Select vividmediacheshire.com
3. Go to **Caching** → **Configuration**
4. Click **Purge Cache** → **Custom Purge**
5. Enter URLs to purge
6. Click **Purge**

### Option 2: Command Line
```bash
curl -X POST "https://api.cloudflare.com/client/v4/zones/$CLOUDFLARE_ZONE_ID/purge_cache" \
  -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
  -H "Content-Type: application/json" \
  --data '{"files":["https://vividmediacheshire.com/sitemap.xml"]}'
```

### Option 3: Purge Everything (Nuclear)
```bash
curl -X POST "https://api.cloudflare.com/client/v4/zones/$CLOUDFLARE_ZONE_ID/purge_cache" \
  -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
  -H "Content-Type: application/json" \
  --data '{"purge_everything":true}'
```

## Troubleshooting

### "Cloudflare credentials not set" Warning

**Cause:** GitHub secrets not configured or environment variables not set

**Fix:**
1. Verify secrets exist in GitHub Settings → Secrets
2. Check secret names match exactly: `CLOUDFLARE_ZONE_ID` and `CLOUDFLARE_API_TOKEN`
3. For local deployment, export environment variables

### "Cloudflare cache purge failed"

**Cause:** Invalid API token or insufficient permissions

**Fix:**
1. Verify API token has **Cache Purge** permission
2. Check token is for the correct zone (vividmediacheshire.com)
3. Regenerate token if needed

### Cache Still Serving Old Content

**Cause:** Browser cache or DNS propagation delay

**Fix:**
1. Hard refresh browser (Cmd+Shift+R on Mac, Ctrl+Shift+R on Windows)
2. Test with curl: `curl -I https://vividmediacheshire.com/sitemap.xml`
3. Wait 1-2 minutes for Cloudflare edge servers to sync
4. Check cf-cache-status header (should be MISS then HIT)

## Security Notes

- API tokens are stored as GitHub Secrets (encrypted)
- Tokens have minimal permissions (Cache Purge only)
- Tokens are scoped to specific zone (vividmediacheshire.com)
- Never commit tokens to git
- Rotate tokens periodically (every 90 days recommended)

## Related Documentation

- [Cloudflare Cache Fix Guide](./sitemap-cloudflare-cache-fix.md)
- [Deployment Quick Reference](./deployment-quick-reference.md)
- [AWS Security Standards](../aws-security-standards.md)
- [Deployment Standards](../.kiro/steering/deployment-standards.md)

## API Reference

- [Cloudflare Purge Cache API](https://developers.cloudflare.com/api/operations/zone-purge)
- [Cloudflare API Tokens](https://developers.cloudflare.com/fundamentals/api/get-started/create-token/)
