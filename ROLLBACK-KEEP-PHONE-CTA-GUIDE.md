# Rollback to Nov 11 Deployment (Keep Phone CTA)

## Overview

This rollback restores your site to the successful deployment from **November 11, 2025 at 3:15:32 PM UTC** while preserving the new phone number sticky CTA.

## What Gets Restored

### ✅ Restored from Nov 11 Deployment
- Text-only PressStrip component (no image logos)
- Simplified hero sections
- Pink background on pricing section
- All content and styling from that deployment
- All other components and pages

### 📱 Preserved (Current Version)
- Phone number sticky CTA: **07586 378502**
- Black button styling
- Phone icon
- GA4 tracking for phone clicks
- Positioning (bottom-right, appears after 300px scroll)

## How to Run

### Option 1: PowerShell Script (Recommended)
```powershell
.\rollback-keep-phone-cta.ps1
```

### Option 2: Direct Node.js
```bash
node scripts/rollback-keep-phone-cta.js
```

## What Happens

1. **Fetches S3 Versions** - Gets all file versions from the bucket
2. **Identifies Target Files** - Finds files from Nov 11, 3:15 PM UTC deployment
3. **Selective Restore** - Restores all files EXCEPT:
   - `_next/static/chunks/app/layout-*.js` (contains StickyCTA)
   - `_next/static/chunks/src_components_StickyCTA_*.js` (StickyCTA component)
4. **Invalidates Cache** - Clears CloudFront cache for all paths
5. **Waits for Propagation** - Changes live in 5-15 minutes

## Timeline

- **Immediate**: Script completes, files restored to S3
- **5-15 minutes**: CloudFront cache clears, changes go live
- **Result**: Nov 11 deployment + phone CTA

## Verification Steps

After 15 minutes, check:

### Home Page
- [ ] Text-only press strip (BBC, Forbes, Financial Times, etc.)
- [ ] No broken image icons
- [ ] Pink background on pricing section
- [ ] Phone CTA shows: 07586 378502
- [ ] Phone CTA is black with phone icon

### Photography Page
- [ ] Text-only press strip
- [ ] No overlap issues
- [ ] Phone CTA present

### Mobile Testing
- [ ] Press strip wraps properly
- [ ] Phone CTA visible and clickable
- [ ] Pink pricing section looks good

### Phone CTA Functionality
- [ ] Appears after scrolling 300px
- [ ] Shows phone icon + number
- [ ] Clicking initiates phone call
- [ ] GA4 tracks `sticky_cta_phone_click` event

## What You're Getting Back

This is the deployment that had:

**PressStrip Component:**
- Clean text-only outlet names
- No image dependencies
- Responsive and accessible
- Cannot be cut off on any screen size

**Outlets Displayed:**
- BBC
- Forbes
- Financial Times
- CNN
- AutoTrader
- Daily Mail
- Business Insider

**Pricing Section:**
- Light pink background (`bg-pink-50`)
- Smooth rounded corners
- Subtle shadow
- Improved text contrast
- Hover state on CTA link

**Plus Your New Phone CTA:**
- Black button with phone icon
- Number: 07586 378502
- Clickable to call
- GA4 event tracking
- Responsive design

## If Something Goes Wrong

### Full Rollback Available
If you need to go back further:
```bash
node scripts/rollback.js list
node scripts/rollback.js rollback <backup-id>
```

### Re-deploy Current Version
If you want to go back to what you have now:
```bash
npm run build
node scripts/deploy.js
```

## Technical Details

**Target Deployment:**
- Date: November 11, 2025
- Time: 15:15:32 UTC (3:15:32 PM)
- Invalidation: I8M3MUK012BS41XS2SHFXDM2DP
- Files: 294 total
- Build Size: 11.35 MB

**Infrastructure:**
- S3 Bucket: `mobile-marketing-site-prod-1759705011281-tyzuo9`
- CloudFront: `E2IBMHQ3GCW6ZK`
- Region: `us-east-1`
- URL: `https://d15sc9fc739ev2.cloudfront.net`

## Why This Approach?

This selective rollback gives you:
1. ✅ The stable Nov 11 deployment (proven to work)
2. ✅ Your new phone CTA feature (better conversion)
3. ✅ No need to rebuild or redeploy
4. ✅ Fast execution (just restore + invalidate)

## Support

If you encounter issues:
1. Check CloudWatch logs in AWS Console
2. Verify CloudFront invalidation status
3. Review `docs/troubleshooting-procedures-s3-cloudfront.md`
4. Use full rollback if needed: `node scripts/rollback.js`

---

**Ready to rollback?**
```powershell
.\rollback-keep-phone-cta.ps1
```
