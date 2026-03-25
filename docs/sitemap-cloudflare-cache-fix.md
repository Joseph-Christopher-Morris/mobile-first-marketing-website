# Sitemap Cloudflare Cache Fix

## Problem Summary

The sitemap at vividmediacheshire.com/sitemap.xml is serving an outdated version (lastmod: 2026-02-20) that:
- Still includes the deprecated `/services/hosting/` URL
- Does not include individual blog article URLs

However, the CloudFront distribution (d15sc9fc739ev2.cloudfront.net) has the correct, updated sitemap (lastmod: 2026-03-06) with:
- Blog articles included
- `/services/hosting/` removed

## Root Cause

The domain vividmediacheshire.com is currently proxied through Cloudflare, which is caching the old sitemap. The DNS points to Cloudflare IPs (172.67.200.35, 104.21.84.252) instead of directly to CloudFront.

Evidence:
```bash
# CloudFront (correct sitemap)
curl https://d15sc9fc739ev2.cloudfront.net/sitemap.xml
# Shows: lastmod 2026-03-06, includes blog articles, no /services/hosting/

# Canonical domain (cached old sitemap)
curl https://vividmediacheshire.com/sitemap.xml
# Shows: lastmod 2026-02-20, no blog articles, includes /services/hosting/

# DNS resolution
dig vividmediacheshire.com +short
# Returns: 172.67.200.35, 104.21.84.252 (Cloudflare IPs)

# Response headers
curl -I https://vividmediacheshire.com/sitemap.xml
# Shows: server: cloudflare, cf-cache-status: HIT
```

## Immediate Fix: Purge Cloudflare Cache

### Option 1: Purge Specific File (Recommended)

1. Log in to Cloudflare dashboard
2. Select the vividmediacheshire.com domain
3. Go to **Caching** → **Configuration**
4. Click **Purge Cache** → **Custom Purge**
5. Enter the URL: `https://vividmediacheshire.com/sitemap.xml`
6. Click **Purge**

### Option 2: Purge Everything (Nuclear Option)

1. Log in to Cloudflare dashboard
2. Select the vividmediacheshire.com domain
3. Go to **Caching** → **Configuration**
4. Click **Purge Cache** → **Purge Everything**
5. Confirm the purge

### Verification

After purging, verify the fix:

```bash
# Check the sitemap
curl https://vividmediacheshire.com/sitemap.xml | grep -E "lastmod|/blog/|/services/hosting/"

# Expected results:
# - lastmod: 2026-03-06 (or current date)
# - Multiple /blog/ URLs present
# - NO /services/hosting/ URL
```

## Long-term Solution: Direct CloudFront Integration

The custom domain setup spec (`.kiro/specs/cloudfront-custom-domain-setup/`) was created but never completed. To eliminate Cloudflare as a middleman:

### Option A: Keep Cloudflare Proxy (Current Setup)

**Pros:**
- Additional DDoS protection
- Cloudflare's global CDN
- Web Application Firewall (WAF)

**Cons:**
- Double caching layer (Cloudflare + CloudFront)
- Cache purging requires two steps
- Additional complexity

**Configuration:**
- Keep DNS pointing to Cloudflare
- Set Cloudflare cache rules to respect CloudFront headers
- Purge Cloudflare cache after each deployment

### Option B: Direct CloudFront (Recommended)

**Pros:**
- Single caching layer
- Simpler cache invalidation
- Direct control over all caching behavior
- Follows AWS best practices

**Cons:**
- Lose Cloudflare's additional features
- Need to configure CloudFront custom domain

**Implementation:**
1. Complete the custom domain setup spec
2. Request ACM certificate for vividmediacheshire.com
3. Add custom domain to CloudFront distribution
4. Update DNS to point directly to CloudFront
5. Remove Cloudflare proxy (set to DNS-only)

## Deployment Pipeline Update

If keeping Cloudflare, update the deployment script to purge Cloudflare cache:

```javascript
// Add to scripts/deploy.js after CloudFront invalidation

async invalidateCloudflareCache() {
  console.log('🔄 Purging Cloudflare cache...');
  
  const CLOUDFLARE_ZONE_ID = process.env.CLOUDFLARE_ZONE_ID;
  const CLOUDFLARE_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;
  
  if (!CLOUDFLARE_ZONE_ID || !CLOUDFLARE_API_TOKEN) {
    console.warn('⚠️  Cloudflare credentials not set, skipping cache purge');
    return;
  }
  
  try {
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/zones/${CLOUDFLARE_ZONE_ID}/purge_cache`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          files: [
            'https://vividmediacheshire.com/sitemap.xml',
            'https://vividmediacheshire.com/robots.txt',
          ],
        }),
      }
    );
    
    const result = await response.json();
    
    if (result.success) {
      console.log('✅ Cloudflare cache purged successfully');
    } else {
      console.error('❌ Cloudflare cache purge failed:', result.errors);
    }
  } catch (error) {
    console.error('❌ Cloudflare cache purge error:', error.message);
  }
}
```

## Recommended Action Plan

1. **Immediate** (5 minutes):
   - Purge Cloudflare cache for sitemap.xml
   - Verify the updated sitemap is live

2. **Short-term** (1-2 hours):
   - Add Cloudflare cache purging to deployment script
   - Test full deployment pipeline

3. **Long-term** (1-2 days):
   - Evaluate whether Cloudflare proxy is needed
   - If not needed, complete custom domain setup spec
   - Point DNS directly to CloudFront
   - Remove Cloudflare proxy layer

## Current Architecture

```
User → Cloudflare (caching) → CloudFront (caching) → S3 (origin)
```

## Recommended Architecture

```
User → CloudFront (caching) → S3 (origin)
```

## References

- Custom Domain Setup Spec: `.kiro/specs/cloudfront-custom-domain-setup/`
- Deployment Script: `scripts/deploy.js`
- CloudFront Distribution: E2IBMHQ3GCW6ZK
- S3 Bucket: mobile-marketing-site-prod-1759705011281-tyzuo9
