# Privacy Policy Force Deployment Guide

## 🔒 Deploy Privacy Policy with Full Navigation to CloudFront

This guide will help you force deploy the updated privacy policy page to CloudFront with proper navigation integration and cache invalidation.

### ✅ What's Included

The privacy policy page includes:
- **Complete GDPR and UK DPA compliance content**
- **Full website navigation integration** (header, menu, footer)
- **Responsive design** for all devices
- **SEO optimization** with proper meta tags
- **Accessibility compliance**
- **Sitemap inclusion** for search engines

### 🚀 Deployment Options

#### Option 1: PowerShell Script (Recommended)
```powershell
.\deploy-privacy-policy-force.ps1
```

#### Option 2: Batch File
```cmd
deploy-privacy-policy-force.bat
```

#### Option 3: Manual Commands
```bash
# Clean and build
npm ci
npm run build

# Deploy HTML files with short cache
aws s3 sync out/ s3://mobile-marketing-site-prod-1759705011281-tyzuo9/ \
  --include "*.html" --include "sitemap.xml" --include "robots.txt" --exclude "*" \
  --cache-control "public, max-age=600" --content-type "text/html; charset=utf-8" --delete

# Deploy static assets with long cache
aws s3 sync out/ s3://mobile-marketing-site-prod-1759705011281-tyzuo9/ \
  --exclude "*.html" --exclude "sitemap.xml" --exclude "robots.txt" \
  --cache-control "public, max-age=31536000, immutable" --delete

# Force CloudFront invalidation
aws cloudfront create-invalidation \
  --distribution-id E2IBMHQ3GCW6ZK \
  --paths "/privacy-policy/*" "/privacy-policy/" "/" "/index.html" "/_next/*" "/sitemap.xml"
```

### 🔍 Pre-Deployment Checklist

Before running the deployment:

- [ ] **AWS CLI configured** with proper credentials
- [ ] **Node.js installed** (version 22.x recommended)
- [ ] **Project dependencies installed** (`npm ci`)
- [ ] **AWS permissions** for S3 and CloudFront operations
- [ ] **Internet connection** for deployment and validation

### 📋 What the Deployment Does

#### 1. **Clean Build Process**
- Removes previous build artifacts
- Clears Next.js cache
- Installs fresh dependencies
- Builds static site with privacy policy

#### 2. **Verification Steps**
- Confirms privacy policy page exists in build output
- Validates navigation integration
- Checks sitemap inclusion
- Verifies content integrity

#### 3. **S3 Deployment**
- Deploys HTML files with 10-minute cache
- Deploys static assets with 1-year cache
- Sets correct MIME types for all file types
- Removes outdated files

#### 4. **CloudFront Invalidation**
- Invalidates privacy policy paths: `/privacy-policy/*`, `/privacy-policy/`
- Invalidates main site paths: `/`, `/index.html`
- Invalidates static assets: `/_next/*`
- Invalidates sitemap: `/sitemap.xml`

#### 5. **Validation Testing**
- Tests privacy policy accessibility
- Verifies HTTP response codes
- Checks cache headers
- Validates deployment success

### 🌐 Expected Results

After successful deployment:

#### **URLs Available:**
- **Main Site:** https://d15sc9fc739ev2.cloudfront.net
- **Privacy Policy:** https://d15sc9fc739ev2.cloudfront.net/privacy-policy/

#### **Features Working:**
- ✅ Full website navigation (header, menu, footer)
- ✅ Responsive design on all devices
- ✅ GDPR-compliant privacy policy content
- ✅ SEO optimization with proper meta tags
- ✅ Accessibility compliance
- ✅ Fast loading with optimized caching

#### **Cache Configuration:**
- **HTML files:** 10 minutes (allows quick updates)
- **Static assets:** 1 year (optimal performance)
- **Images:** 1 year with immutable flag

### ⏰ Propagation Timeline

- **Immediate:** S3 deployment complete
- **2-5 minutes:** CloudFront edge locations start updating
- **5-15 minutes:** Full global propagation
- **Force refresh:** Use Ctrl+F5 to bypass browser cache

### 🔧 Post-Deployment Validation

#### Automatic Validation
The deployment script includes automatic validation:
- HTTP response code checking
- Content verification
- Cache header validation
- Accessibility testing

#### Manual Validation Script
```bash
node scripts/validate-privacy-policy-deployment.js
```

This will generate detailed reports:
- `privacy-policy-validation-report-[timestamp].json`
- `privacy-policy-validation-summary-[timestamp].md`

#### Manual Testing Checklist
- [ ] Visit https://d15sc9fc739ev2.cloudfront.net/privacy-policy/
- [ ] Verify navigation menu is present and functional
- [ ] Test responsive design on mobile/tablet
- [ ] Check all internal links work
- [ ] Verify contact email links work
- [ ] Test page loading speed
- [ ] Validate accessibility with screen reader

### 🚨 Troubleshooting

#### Common Issues and Solutions

**Issue: "Privacy policy page not found"**
- Solution: Wait 5-15 minutes for CloudFront propagation
- Try force refresh (Ctrl+F5)
- Check invalidation status in AWS Console

**Issue: "Navigation not showing"**
- Solution: Clear browser cache completely
- Check if CSS files are loading properly
- Verify build included all navigation components

**Issue: "AWS CLI errors"**
- Solution: Check AWS credentials configuration
- Verify IAM permissions for S3 and CloudFront
- Ensure correct region is set (us-east-1)

**Issue: "Build fails"**
- Solution: Run `npm ci` to reinstall dependencies
- Check Node.js version (should be 22.x)
- Verify all source files are present

#### Emergency Rollback
If issues occur, you can rollback using:
```bash
# Use existing rollback scripts
.\rollback-with-privacy.ps1
```

### 📊 Monitoring and Analytics

#### CloudWatch Metrics
Monitor these metrics in AWS CloudWatch:
- **4xx/5xx errors** for the privacy policy path
- **Cache hit ratio** for optimal performance
- **Origin requests** to track traffic

#### Performance Monitoring
- **Page load times** should be under 2 seconds
- **First Contentful Paint** should be under 1.5 seconds
- **Lighthouse scores** should be 90+ for all metrics

### 🔐 Security Considerations

The deployment maintains security best practices:
- ✅ **Private S3 bucket** with CloudFront-only access
- ✅ **HTTPS-only** access via CloudFront
- ✅ **Security headers** configured
- ✅ **No public S3 access** (blocked at bucket level)
- ✅ **Origin Access Control (OAC)** instead of deprecated OAI

### 📞 Support

If you encounter issues:

1. **Check the deployment logs** for specific error messages
2. **Run the validation script** to identify problems
3. **Review AWS CloudWatch logs** for detailed error information
4. **Test with different browsers** to isolate browser-specific issues

### 🎉 Success Confirmation

You'll know the deployment is successful when:
- ✅ Privacy policy page loads at the correct URL
- ✅ Full navigation is present and functional
- ✅ Page is responsive on all devices
- ✅ All content is properly formatted
- ✅ SEO meta tags are present
- ✅ Page loads quickly (under 2 seconds)

---

## 🚀 Ready to Deploy!

Choose your preferred deployment method and run the script. The privacy policy will be live with full navigation integration within 15 minutes.

**Quick Start:**
```powershell
.\deploy-privacy-policy-force.ps1
```

The script will handle everything automatically and provide detailed feedback throughout the process.