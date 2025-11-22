# CloudFront Security Headers Configuration

## Issue
Lighthouse CI reports missing Content Security Policy (CSP) and other security headers.

## Solution
Add security headers via CloudFront Response Headers Policy.

## Implementation Steps

### 1. Create Response Headers Policy in AWS Console

Navigate to: CloudFront → Policies → Response headers

Create a new policy with these settings:

#### Security Headers

```json
{
  "SecurityHeadersConfig": {
    "StrictTransportSecurity": {
      "AccessControlMaxAgeSec": 63072000,
      "IncludeSubdomains": true,
      "Preload": true,
      "Override": true
    },
    "ContentTypeOptions": {
      "Override": true
    },
    "FrameOptions": {
      "FrameOption": "DENY",
      "Override": true
    },
    "XSSProtection": {
      "ModeBlock": true,
      "Protection": true,
      "Override": true
    },
    "ReferrerPolicy": {
      "ReferrerPolicy": "strict-origin-when-cross-origin",
      "Override": true
    },
    "ContentSecurityPolicy": {
      "ContentSecurityPolicy": "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://www.clarity.ms; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://www.google-analytics.com https://www.clarity.ms; frame-src 'self' https://www.google.com;",
      "Override": true
    }
  }
}
```

### 2. Attach Policy to CloudFront Distribution

1. Go to your CloudFront distribution (E2IBMHQ3GCW6ZK)
2. Edit the default cache behavior
3. Under "Response headers policy", select your new policy
4. Save changes

### 3. Verify Headers

After deployment, test with:

```bash
curl -I https://d15sc9fc739ev2.cloudfront.net
```

Expected headers:
- `strict-transport-security`
- `x-content-type-options: nosniff`
- `x-frame-options: DENY`
- `x-xss-protection: 1; mode=block`
- `referrer-policy: strict-origin-when-cross-origin`
- `content-security-policy: ...`

## Automated Script

Run this script to configure headers programmatically:

```bash
node scripts/configure-cloudfront-security-headers.js
```

## Impact on Lighthouse Scores

This will fix:
- ✅ CSP XSS protection (currently 0)
- ✅ Best practices score improvement
- ✅ Security audit warnings

## Notes

- CSP policy includes GA4 and Clarity domains
- Adjust CSP if adding new third-party services
- Test thoroughly after applying changes
