# Emergency Troubleshooting Options

## Current Status ✅
- **Full Invalidation**: COMPLETED (I4FQ1NGVYL92QB33OZGHAB7WC7)
- **Latest Deployment**: deploy-1760046561976 (SUCCESSFUL)
- **Files Updated**: 1 file uploaded
- **Expected Result**: Images should load within 2-5 minutes

## If Images Still Don't Load

### 1. **Browser Testing**
```bash
# Hard refresh
Ctrl+F5 (Windows) or Cmd+Shift+R (Mac)

# Test in incognito mode
# Test in different browser
```

### 2. **Direct Image URL Testing**
Test these URLs directly:
- https://d15sc9fc739ev2.cloudfront.net/images/services/analytics-hero.webp
- https://d15sc9fc739ev2.cloudfront.net/images/services/photography-hero.webp
- https://d15sc9fc739ev2.cloudfront.net/images/services/ad-campaigns-hero.webp

### 3. **Check S3 Directly**
```bash
aws s3 ls s3://mobile-marketing-site-prod-1759705011281-tyzuo9/images/services/
```

### 4. **Force Another Invalidation**
```bash
aws cloudfront create-invalidation --distribution-id E2IBMHQ3GCW6ZK --invalidation-batch '{"Paths":{"Quantity":1,"Items":["/*"]},"CallerReference":"emergency-'$(date +%s)'"}'
```

### 5. **Emergency Rollback**
```bash
# If needed, rollback to previous version
node scripts/rollback.js list
node scripts/rollback.js rollback <backup-id>
```

### 6. **Manual S3 Upload**
```bash
# Upload specific files manually
aws s3 cp out/services/analytics/index.html s3://mobile-marketing-site-prod-1759705011281-tyzuo9/services/analytics/index.html --content-type text/html
```

## Diagnostic Commands

### Check CloudFront Status
```bash
aws cloudfront get-distribution --id E2IBMHQ3GCW6ZK
```

### Check S3 Bucket
```bash
aws s3 ls s3://mobile-marketing-site-prod-1759705011281-tyzuo9/ --recursive | grep services
```

### List Recent Invalidations
```bash
aws cloudfront list-invalidations --distribution-id E2IBMHQ3GCW6ZK
```

## Contact Support
If all else fails:
1. Check AWS CloudFront console for any issues
2. Verify S3 bucket permissions
3. Check for any AWS service outages
4. Consider contacting AWS support

## Expected Timeline
- **0-2 minutes**: S3 updated
- **2-5 minutes**: Most users see changes
- **5-15 minutes**: Global propagation complete
- **If 15+ minutes**: Something is wrong, investigate further