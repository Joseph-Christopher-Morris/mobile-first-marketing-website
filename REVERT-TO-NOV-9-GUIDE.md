# Revert to November 9, 2025 CloudFront State

## Overview

This guide helps you revert your CloudFront distribution to the exact state it was in on **November 9, 2025 at 10:24:11 PM UTC**.

## What This Does

Recreates the CloudFront invalidation that was completed on November 9, 2025, which invalidated these 5 specific paths:

1. `/_next/static/chunks/app/page-e6d83047ead03bc2.js`
2. `/404/index.html`
3. `/privacy-policy/index.html`
4. `/index.html`
5. `/404.html`

## Prerequisites

- AWS credentials configured with CloudFront permissions
- Node.js installed
- AWS SDK dependencies installed (`npm install`)

## Quick Start

### Option 1: PowerShell (Recommended for Windows)

```powershell
.\revert-to-nov-9.ps1
```

### Option 2: Batch File

```cmd
revert-to-nov-9.bat
```

### Option 3: Direct Node.js

```bash
node scripts/recreate-nov-9-invalidation.js
```

## Environment Variables Required

```bash
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-east-1  # Optional, defaults to us-east-1
CLOUDFRONT_DISTRIBUTION_ID=E2IBMHQ3GCW6ZK  # Set automatically by scripts
```

## What Happens

1. **Validation**: Scripts check for AWS credentials
2. **Configuration**: Sets CloudFront distribution ID to `E2IBMHQ3GCW6ZK`
3. **Invalidation**: Creates a new invalidation with the exact 5 paths from Nov 9
4. **Propagation**: CloudFront distributes changes globally (5-15 minutes)

## Expected Output

```
🔄 Recreating November 9, 2025 CloudFront Invalidation
============================================================
Distribution: E2IBMHQ3GCW6ZK
Original Date: November 9, 2025 at 10:24:11 PM UTC
Paths: 5

📤 Creating invalidation...

✅ Invalidation created successfully!

📋 Details:
   New Invalidation ID: [NEW_ID]
   Status: InProgress
   Created: [TIMESTAMP]
   Paths: 5

⏱️  Propagation time: 5-15 minutes
🌐 Changes will be visible globally once complete

Invalidated paths:
   ✓ /_next/static/chunks/app/page-e6d83047ead03bc2.js
   ✓ /404/index.html
   ✓ /privacy-policy/index.html
   ✓ /index.html
   ✓ /404.html
```

## Verification Steps

After running the reversion (wait 5-15 minutes):

1. **Test Homepage**
   ```
   https://d15sc9fc739ev2.cloudfront.net/
   ```

2. **Test 404 Page**
   ```
   https://d15sc9fc739ev2.cloudfront.net/404
   ```

3. **Test Privacy Policy**
   ```
   https://d15sc9fc739ev2.cloudfront.net/privacy-policy
   ```

4. **Check CloudFront Console**
   - Go to AWS Console → CloudFront
   - Select distribution `E2IBMHQ3GCW6ZK`
   - View "Invalidations" tab
   - Verify new invalidation is "Completed"

## Troubleshooting

### Error: AWS credentials not found

**Solution**: Set environment variables:

```powershell
# PowerShell
$env:AWS_ACCESS_KEY_ID = "your_key"
$env:AWS_SECRET_ACCESS_KEY = "your_secret"
```

```cmd
REM Command Prompt
set AWS_ACCESS_KEY_ID=your_key
set AWS_SECRET_ACCESS_KEY=your_secret
```

### Error: Access Denied

**Solution**: Ensure your AWS IAM user has these permissions:
- `cloudfront:CreateInvalidation`
- `cloudfront:GetInvalidation`
- `cloudfront:ListInvalidations`

### Invalidation stuck "InProgress"

**Normal**: CloudFront invalidations take 5-15 minutes to complete globally. Check status in AWS Console.

### Changes not visible after 15 minutes

**Solutions**:
1. Hard refresh browser (Ctrl+F5 or Cmd+Shift+R)
2. Clear browser cache
3. Test in incognito/private window
4. Check CloudFront invalidation status in AWS Console

## Comparison with November 10 Reversion

| Aspect | Nov 9 Reversion | Nov 10 Reversion |
|--------|----------------|------------------|
| **Paths** | 5 paths | 39 paths |
| **Scope** | Core pages only | Full site including press logos |
| **Time** | 10:24:11 PM UTC | 2:55:58 PM UTC |
| **Use Case** | Minimal revert | Comprehensive revert |

## When to Use This

Use the November 9 reversion when you want to:
- Revert only core pages (homepage, 404, privacy policy)
- Minimize invalidation scope
- Restore the site to a known stable state from Nov 9
- Avoid invalidating press logos and other assets

Use the November 10 reversion when you need:
- Full site revert including all pages
- Press logos restoration
- Complete rollback to Nov 10 state

## Cost Considerations

- First 1,000 invalidation paths per month: **FREE**
- Additional paths: $0.005 per path
- This reversion: **5 paths = FREE** (within free tier)

## Support

If you encounter issues:

1. Check AWS CloudWatch logs
2. Verify CloudFront distribution status
3. Review IAM permissions
4. Check network connectivity to AWS

## Related Files

- `scripts/recreate-nov-9-invalidation.js` - Main invalidation script
- `revert-to-nov-9.ps1` - PowerShell wrapper
- `revert-to-nov-9.bat` - Batch file wrapper
- `REVERT-TO-NOV-10-GUIDE.md` - Alternative reversion guide

## Architecture Notes

This reversion follows the project's S3 + CloudFront deployment architecture:

- **S3 Bucket**: `mobile-marketing-site-prod-1759705011281-tyzuo9`
- **CloudFront Distribution**: `E2IBMHQ3GCW6ZK`
- **Region**: `us-east-1`
- **Access**: Private S3 with CloudFront OAC only

## Security

- Never commit AWS credentials to version control
- Use IAM roles with least privilege
- Rotate credentials regularly
- Monitor CloudFront access logs

---

**Last Updated**: November 10, 2025
**Distribution**: E2IBMHQ3GCW6ZK
**Target State**: November 9, 2025 at 10:24:11 PM UTC
