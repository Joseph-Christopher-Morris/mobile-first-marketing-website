
# CloudFront CSP Update Instructions for GA4

## Manual Update Steps:

1. **AWS Console → CloudFront → Distribution E2IBMHQ3GCW6ZK**

2. **Functions Tab → Create Function:**
   - Name: security-headers-ga4
   - Runtime: cloudfront-js-1.0
   - Code: Use content from cloudfront-security-headers-ga4.js

3. **Behaviors Tab → Edit Default Behavior:**
   - Function associations → Viewer response
   - Function type: CloudFront Function
   - Function ARN: security-headers-ga4

4. **Deploy and Test:**
   - Save changes and wait for deployment
   - Test with: curl -I https://d15sc9fc739ev2.cloudfront.net
   - Verify CSP header includes GA4 domains

## Alternative: Use existing security configuration script
Run: node scripts/configure-cloudfront-security.js

## Verification Commands:
```bash
# Check CSP header
curl -I https://d15sc9fc739ev2.cloudfront.net | grep -i content-security-policy

# Test GA4 loading
curl -I https://www.googletagmanager.com/gtag/js?id=G-QJXSCJ0L43
```

## Expected CSP Header:
Content-Security-Policy:  default-src 'self'; script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com; img-src 'self' data: https://www.google-analytics.com; connect-src 'self' https://www.google-analytics.com https://region1.google-analytics.com; style-src 'self' 'unsafe-inline'; font-src 'self' https://fonts.gstatic.com; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; upgrade-insecure-requests;
