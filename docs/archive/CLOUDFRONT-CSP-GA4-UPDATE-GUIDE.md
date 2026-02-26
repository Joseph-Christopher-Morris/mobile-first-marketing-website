# CloudFront CSP Update for GA4 - REQUIRED FINAL STEP

## 🚨 CRITICAL: GA4 Tracking Requires CloudFront CSP Update

The GA4 tracking code (G-QJXSCJ0L43) has been successfully deployed to all pages, but **requires CloudFront Content Security Policy update** to function properly.

## Current Status
- ✅ GA4 Script: Deployed in `src/app/layout.tsx`
- ✅ Website: Built and deployed to S3 + CloudFront
- ⚠️ **CSP Headers**: Need update to allow GA4 domains

## Required CloudFront CSP Update

### Current CSP (Blocking GA4):
```
Content-Security-Policy: default-src 'self'; script-src 'self'; ...
```

### Required CSP (GA4 Compatible):
```
Content-Security-Policy: 
  default-src 'self';
  script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com;
  img-src 'self' data: https://www.google-analytics.com;
  connect-src 'self' https://www.google-analytics.com https://region1.google-analytics.com;
  style-src 'self' 'unsafe-inline';
  font-src 'self' https://fonts.gstatic.com;
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';
  upgrade-insecure-requests;
```

## Manual Update Steps

### Option 1: AWS Console (Recommended)

1. **Open AWS Console** → CloudFront → Distribution `E2IBMHQ3GCW6ZK`

2. **Functions Tab** → Create Function:
   - Name: `security-headers-ga4`
   - Runtime: `cloudfront-js-1.0`
   - Code: Use content from `cloudfront-security-headers-ga4.js`

3. **Behaviors Tab** → Edit Default Behavior:
   - Function associations → Viewer response
   - Function type: CloudFront Function
   - Function ARN: `security-headers-ga4`

4. **Deploy** and wait for distribution update (5-15 minutes)

### Option 2: Use Existing Script
```bash
node scripts/configure-cloudfront-security.js
```

## Verification Steps

### 1. Test CSP Headers
```bash
curl -I https://d15sc9fc739ev2.cloudfront.net | grep -i content-security-policy
```

### 2. Test GA4 Loading
1. Open: https://d15sc9fc739ev2.cloudfront.net
2. Open browser console (F12)
3. Check for GA4 functions:
   ```javascript
   window.gtag        // Should be function
   window.dataLayer   // Should be array
   ```

### 3. Verify No CSP Errors
- Console should show no "Refused to connect" errors
- Network tab should show successful GA4 requests

### 4. GA4 Realtime Verification
1. Open Google Analytics: https://analytics.google.com/
2. Navigate to Realtime reports
3. Visit website pages
4. Confirm active users appear in dashboard

## Expected Results After CSP Update

### Immediate (2-3 minutes):
- ✅ No CSP violation errors in browser console
- ✅ GA4 scripts load successfully
- ✅ `window.gtag` and `window.dataLayer` available

### Within 5-10 minutes:
- ✅ Active users appear in GA4 Realtime reports
- ✅ Page views tracked across all 26 pages
- ✅ User behavior data collection begins

## Troubleshooting

### If GA4 Still Not Working:
1. **Clear Browser Cache**: Use Incognito mode for testing
2. **Check CloudFront Propagation**: Wait 15 minutes for global distribution
3. **Verify CSP Headers**: Ensure all GA4 domains are included
4. **Test Different Pages**: Try homepage, services, about pages

### Common Issues:
- **"Your Google tag wasn't detected"**: Usually cache-related, wait and retry
- **CSP Violations**: Double-check script-src includes googletagmanager.com
- **No Realtime Data**: Verify connect-src includes google-analytics.com

## Files Created/Modified

### Deployment Files:
- ✅ `src/app/layout.tsx` - GA4 Script components added
- ✅ `.env.production` - GA4 environment variable
- ✅ `cloudfront-security-headers-ga4.js` - CloudFront function code
- ✅ `.kiro/steering/deployment-standards.md` - Documentation updated

### Verification Files:
- `scripts/verify-ga4-gallery-deployment.js` - Automated testing
- `GA4-GALLERY-DEPLOYMENT-COMPLETE.md` - Status summary

## Final Checklist

- [ ] Update CloudFront CSP headers (manual step required)
- [ ] Wait 5-15 minutes for CloudFront propagation
- [ ] Test GA4 in browser console
- [ ] Verify GA4 Realtime reports show active users
- [ ] Confirm no CSP violations in console
- [ ] Document completion in deployment log

---

## 🎯 Once CSP is Updated:

**GA4 tracking will be fully operational** across all pages with:
- Global user behavior tracking
- Page view analytics
- Enhanced ecommerce data
- Performance monitoring
- Zero impact on Core Web Vitals

**Website**: https://d15sc9fc739ev2.cloudfront.net  
**GA4 Property**: G-QJXSCJ0L43  
**Status**: Deployed, awaiting CSP update for activation