#!/usr/bin/env node

/**
 * Update CloudFront Content Security Policy for GA4
 * Adds Google Analytics domains to CSP headers
 */

const fs = require('fs');

console.log('🔧 Updating CloudFront CSP for GA4 Integration');

// Updated CSP policy that includes GA4 domains
const updatedCSP = `
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
`.replace(/\n\s+/g, ' ').trim();

console.log('📋 Updated CSP Policy:');
console.log(updatedCSP);

// Create CloudFront function for security headers
const cloudfrontFunction = `
function handler(event) {
    var response = event.response;
    var headers = response.headers;

    // Security Headers
    headers['strict-transport-security'] = { value: 'max-age=63072000; includeSubDomains; preload' };
    headers['content-security-policy'] = { value: "${updatedCSP}" };
    headers['x-content-type-options'] = { value: 'nosniff' };
    headers['x-frame-options'] = { value: 'DENY' };
    headers['x-xss-protection'] = { value: '1; mode=block' };
    headers['referrer-policy'] = { value: 'strict-origin-when-cross-origin' };
    headers['permissions-policy'] = { value: 'camera=(), microphone=(), geolocation=()' };

    return response;
}
`;

// Save CloudFront function
fs.writeFileSync('cloudfront-security-headers-ga4.js', cloudfrontFunction);

console.log('✅ CloudFront function created: cloudfront-security-headers-ga4.js');

// Create deployment instructions
const instructions = `
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
\`\`\`bash
# Check CSP header
curl -I https://d15sc9fc739ev2.cloudfront.net | grep -i content-security-policy

# Test GA4 loading
curl -I https://www.googletagmanager.com/gtag/js?id=G-QJXSCJ0L43
\`\`\`

## Expected CSP Header:
${updatedCSP}
`;

fs.writeFileSync('cloudfront-csp-ga4-instructions.md', instructions);

console.log('📄 Instructions saved: cloudfront-csp-ga4-instructions.md');
console.log('');
console.log('🎯 Next Steps:');
console.log('1. Update CloudFront security headers (see instructions above)');
console.log('2. Deploy the website: npm run build && node scripts/deploy.js');
console.log('3. Invalidate cache: aws cloudfront create-invalidation --distribution-id E2IBMHQ3GCW6ZK --paths "/*"');
console.log('4. Verify GA4 tracking in browser console and GA4 Realtime reports');