# Photography Page Deployment Runbook

## Overview
This runbook covers the complete deployment process for removing the legacy statistics grid from the photography services page and deploying the updated content to production.

## Pre-Deployment Checklist

### 1. Pull Latest Changes
```bash
# If syncing from Git or remote source
git pull origin main
```

### 2. Verify Source File
Confirm `src/app/services/photography/page.tsx` contains the updated content:

**✅ MUST NOT contain:**
- `<div className='grid grid-cols-1 md:grid-cols-3 ...'>`
- Statistics grid under "Published Editorial Photographer"
- Old stats grid under "Proven Global Reach" with:
  - "3+ Major Publications"
  - "50+ Local Projects" 
  - "100+ Campaign Images"

**✅ MUST contain:**
- Clean "Proven Global Reach" section with narrative content
- Current statistics: "3,500+ licensed images" and "90+ countries"
- No legacy metric grids

### 3. Build Verification
```bash
npm install
npm run build
```

Expected output:
- Next.js 15.5.6 build completion
- Static pages generated including `/services/photography`
- No build errors or warnings

## Deployment Process

### 1. Environment Configuration
Set required environment variables in PowerShell:

```powershell
$env:S3_BUCKET_NAME = "mobile-marketing-site-prod-1759705011281-tyzuo9"
$env:CLOUDFRONT_DISTRIBUTION_ID = "E2IBMHQ3GCW6ZK"
$env:AWS_REGION = "us-east-1"
```

**Important Notes:**
- Use CloudFront Distribution ID: `E2IBMHQ3GCW6ZK` (confirmed active distribution)
- Do NOT use: `IBPKGXRHSKL8PYJKI4MMODSCVY` (legacy/inactive)
- Missing `S3_BUCKET_NAME` will throw: `Error: S3_BUCKET_NAME environment variable is required`

### 2. Execute Deployment
```bash
node scripts/deploy.js
```

**What the script does:**
1. Runs Next.js build internally (rebuilds even if you ran `npm run build`)
2. Verifies required images are present
3. Uploads changed files from `out/` directory to S3 bucket
4. Starts CloudFront cache invalidation
5. Returns invalidation ID for tracking

### 3. Expected Deployment Output
```
📋 Deployment Configuration:
   Environment: production
   S3 Bucket: mobile-marketing-site-prod-1759705011281-tyzuo9
   CloudFront Distribution: E2IBMHQ3GCW6ZK
   Region: us-east-1

🚀 Starting deployment...
✅ Build completed successfully
📤 Uploading files to S3...
🔄 Invalidating CloudFront cache...
   Invalidation ID: [UNIQUE_ID]
   Status: InProgress
🎉 Deployment completed successfully!
```

## Cache Invalidation Strategy

### Critical Paths for Photography Page
The deployment script must invalidate at minimum:
- `/services/photography`
- `/services/photography/index.html`
- Ideally `/*` for comprehensive cache clearing

### Invalidation Timing
- Cache invalidation takes 5-15 minutes to propagate globally
- Status can be tracked via returned Invalidation ID

## Post-Deployment Verification

### 1. Immediate Verification
```bash
# Test CloudFront URL
curl -I https://d15sc9fc739ev2.cloudfront.net/services/photography
```

### 2. Browser Testing
1. Open: `https://d15sc9fc739ev2.cloudfront.net/services/photography`
2. Hard refresh: `Ctrl+F5` (Windows) / `Cmd+Shift+R` (Mac)
3. Test in private/incognito window

### 3. Content Validation
**✅ Verify REMOVED:**
- No "3+" statistics
- No "50+" statistics  
- No "100+" statistics
- No legacy metrics grid

**✅ Verify PRESENT:**
- "3,500+ licensed images sold on leading stock platforms"
- "90+ countries where my work has been published or purchased"
- Clean narrative content in "Proven Global Reach" section

### 4. DevTools Console Check
```javascript
// Check for absence of legacy content
document.body.innerHTML.includes('3+') // Should be false
document.body.innerHTML.includes('50+') // Should be false
document.body.innerHTML.includes('100+') // Should be false
document.body.innerHTML.includes('Major Publications') // Should be false (in stats context)
```

## Troubleshooting

### If CDN Still Shows Old Content
**Cause:** Local browser cache or edge location not yet refreshed

**Solutions:**
1. Test in Firefox private window
2. Test from different geographic location
3. Run targeted invalidation:
   ```powershell
   # Set environment variables again
   $env:CLOUDFRONT_DISTRIBUTION_ID = "E2IBMHQ3GCW6ZK"
   
   # Run targeted invalidation
   aws cloudfront create-invalidation --distribution-id E2IBMHQ3GCW6ZK --paths "/services/photography" "/services/photography/index.html"
   ```

### Common Issues
- **Missing environment variables:** Ensure all three variables are set
- **Build failures:** Check for syntax errors in photography page
- **Upload failures:** Verify AWS credentials and S3 bucket permissions
- **Invalidation delays:** Normal behavior, wait 15 minutes maximum

## Documentation Updates

### Project History
- **Date:** 2025-11-01
- **Change:** Removed legacy metrics block from Photography services page
- **Source:** `src/app/services/photography/page.tsx`
- **Deployment ID:** `deploy-1762009339139`
- **Invalidation ID:** `I5BMK5DDG65377WUDPKS1CUN41`

### Content Guidelines
- **Current source of truth:** `src/app/services/photography/page.tsx`
- **Do NOT reintroduce metric grids** unless specifically requested
- **Client preference:** Narrative copy over statistics blocks
- **Approved statistics:** Only "3,500+ licensed images" and "90+ countries"

## Emergency Rollback
If immediate rollback is required:
```bash
node scripts/rollback.js emergency
```

## Success Criteria
✅ Photography page loads without legacy statistics grid  
✅ Current statistics (3,500+ and 90+) display correctly  
✅ No build or deployment errors  
✅ CloudFront invalidation completed successfully  
✅ Content verified across multiple browsers/devices  

---
**Last Updated:** 2025-11-01  
**Next Review:** As needed for content changes