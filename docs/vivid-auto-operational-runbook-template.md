# Vivid Auto SCRAM Rebuild - Operational Runbook Template

## Document Information

- **Document Type:** Operational Runbook
- **Project:** Vivid Auto Photography Website SCRAM Rebuild
- **Environment:** Production
- **Last Updated:** [AUTO-GENERATED]
- **Version:** 1.0

## Infrastructure Overview

### AWS Resources

| Resource Type | Identifier | Purpose |
|---------------|------------|---------|
| S3 Bucket | `mobile-marketing-site-prod-1759705011281-tyzuo9` | Static website hosting |
| CloudFront Distribution | `E2IBMHQ3GCW6ZK` | CDN and caching |
| Domain | `d15sc9fc739ev2.cloudfront.net` | Public website URL |
| Region | `us-east-1` | Primary AWS region |

### Critical Files Tracking

The following files are tracked for version management and rollback procedures:

#### HTML Pages
- `index.html` - Home page
- `services/index.html` - Services overview
- `blog/index.html` - Blog listing
- `contact/index.html` - Contact form
- `services/photography/index.html` - Photography services
- `services/analytics/index.html` - Analytics services  
- `services/ad-campaigns/index.html` - Ad campaigns services
- `privacy-policy/index.html` - Privacy policy

#### Configuration Files
- `sitemap.xml` - SEO sitemap
- `robots.txt` - Search engine directives

#### Portfolio Images (Kebab-case naming)
- `images/services/250928-hampson-auctions-sunday-11.webp`
- `images/services/240217-australia-trip-232-1.webp`
- `images/services/240219-australia-trip-148.webp`
- `images/services/240619-london-19.webp`
- `images/services/240619-london-26-1.webp`
- `images/services/240619-london-64.webp`
- `images/services/250125-liverpool-40.webp`

## Current Deployment Status

### Version Information
[AUTO-GENERATED - Current file versions and deployment metadata]

### Git Information
- **Branch:** [AUTO-GENERATED]
- **Commit:** [AUTO-GENERATED]
- **Last Deployment:** [AUTO-GENERATED]

### Health Status
[AUTO-GENERATED - Current health check results]

## Standard Operating Procedures

### 1. Deployment Logging

#### Track New Deployment
```powershell
# Log manual deployment
.\scripts\vivid-auto-version-tracker.ps1 -Action track -DeploymentType manual

# Log automated deployment
.\scripts\vivid-auto-version-tracker.ps1 -Action track -DeploymentType auto

# Log rollback deployment
.\scripts\vivid-auto-version-tracker.ps1 -Action track -DeploymentType rollback
```

#### View Deployment History
```powershell
# View last 10 deployments
.\scripts\vivid-auto-version-tracker.ps1 -Action history -Limit 10

# View last 5 deployments
.\scripts\vivid-auto-version-tracker.ps1 -Action history -Limit 5
```

### 2. Version Management

#### Check Current Versions
```powershell
# View all current file versions
.\scripts\vivid-auto-version-tracker.ps1 -Action versions

# List versions for specific file
.\scripts\vivid-auto-rollback.ps1 -Action list-versions -File "index.html"
```

#### Version Tracking Best Practices
1. Always log deployments immediately after completion
2. Document version IDs for critical files before major changes
3. Maintain deployment history for at least 30 days
4. Regular health checks after deployments

### 3. Health Monitoring

#### Automated Health Check
```powershell
# Perform comprehensive health check
.\scripts\vivid-auto-version-tracker.ps1 -Action health

# Verify deployment with rollback script
.\scripts\vivid-auto-rollback.ps1 -Action verify
```

#### Manual Health Verification
1. **Website Accessibility**
   - Visit https://d15sc9fc739ev2.cloudfront.net/
   - Verify home page loads within 3 seconds
   - Check all navigation links work

2. **Content Validation**
   - Verify hero image shows Aston Martin DB6
   - Check all 7 portfolio images load without 404 errors
   - Confirm contact form has all required fields
   - Validate blog shows Flyers ROI article

3. **Brand Compliance**
   - No gradients visible on any page
   - Only approved colors used (pink #ff2d7a, pink2 #d81b60, black #0b0b0b, white #ffffff)
   - No indigo, purple, or yellow colors present

## Emergency Procedures

### Emergency Rollback (Complete Site)

**When to Use:** Critical site-wide issues, broken deployment, security concerns

**Estimated Time:** 5-10 minutes

**Procedure:**
1. **Assess Impact**
   ```powershell
   # Check current health status
   .\scripts\vivid-auto-version-tracker.ps1 -Action health
   ```

2. **Execute Emergency Rollback**
   ```powershell
   # Dry run first (recommended)
   .\scripts\vivid-auto-rollback.ps1 -Action emergency -DryRun
   
   # Execute rollback
   .\scripts\vivid-auto-rollback.ps1 -Action emergency
   ```

3. **Verify Rollback**
   ```powershell
   # Verify deployment health
   .\scripts\vivid-auto-rollback.ps1 -Action verify
   ```

4. **Log Rollback**
   ```powershell
   # Track rollback deployment
   .\scripts\vivid-auto-version-tracker.ps1 -Action track -DeploymentType rollback
   ```

### Selective File Rollback

**When to Use:** Single file issues, specific page problems

**Estimated Time:** 2-5 minutes

**Procedure:**
1. **Identify Problem File**
   ```powershell
   # List available versions
   .\scripts\vivid-auto-rollback.ps1 -Action list-versions -File "index.html"
   ```

2. **Execute Selective Rollback**
   ```powershell
   # Rollback specific file
   .\scripts\vivid-auto-rollback.ps1 -Action rollback -File "index.html" -VersionId "VERSION_ID_HERE"
   ```

3. **Verify Fix**
   - Test the specific page/functionality
   - Check for any related issues

## Troubleshooting Guide

### Common Issues and Solutions

#### 1. Website Not Loading (HTTP 5xx errors)
**Symptoms:** Site returns 500, 502, 503, or 504 errors
**Diagnosis:**
```powershell
# Check CloudFront distribution status
aws cloudfront get-distribution --id E2IBMHQ3GCW6ZK --region us-east-1

# Check S3 bucket accessibility
aws s3api head-bucket --bucket mobile-marketing-site-prod-1759705011281-tyzuo9 --region us-east-1
```
**Solutions:**
- Verify CloudFront distribution is enabled and deployed
- Check S3 bucket permissions and OAC configuration
- Review CloudFront error logs

#### 2. Images Not Loading (404 errors)
**Symptoms:** Portfolio images show broken image icons or 404 errors
**Diagnosis:**
```powershell
# Check image file existence
aws s3api head-object --bucket mobile-marketing-site-prod-1759705011281-tyzuo9 --key "images/services/250928-hampson-auctions-sunday-11.webp" --region us-east-1
```
**Solutions:**
- Verify image files exist in S3 with correct kebab-case names
- Check image references in HTML match actual file names
- Ensure images were uploaded during deployment

#### 3. Brand Colors Incorrect
**Symptoms:** Gradients visible, wrong colors (blue, purple, yellow)
**Diagnosis:**
```bash
# Check for prohibited CSS classes
curl -s https://d15sc9fc739ev2.cloudfront.net/ | grep -i "gradient\|indigo\|purple\|yellow"
```
**Solutions:**
- Rollback to previous version with correct brand colors
- Verify Tailwind configuration uses only approved brand colors
- Check for CSS overrides or incorrect class usage

#### 4. Contact Form Not Working
**Symptoms:** Form fields missing, incorrect order, submission errors
**Diagnosis:**
- Manually test form on contact page
- Check browser developer tools for JavaScript errors
**Solutions:**
- Rollback contact page to working version
- Verify form structure matches specification
- Check form validation and submission handling

#### 5. Blog Content Issues
**Symptoms:** Missing Flyers ROI article, incorrect content
**Diagnosis:**
- Check blog page for article visibility
- Verify article metadata and content
**Solutions:**
- Rollback blog content to correct version
- Verify blog post files exist and are properly formatted

#### 6. Cache Issues
**Symptoms:** Old content still visible, changes not reflecting
**Diagnosis:**
```powershell
# Check cache headers
curl -I https://d15sc9fc739ev2.cloudfront.net/
```
**Solutions:**
```powershell
# Create cache invalidation
aws cloudfront create-invalidation --distribution-id E2IBMHQ3GCW6ZK --paths "/*" --region us-east-1
```

### Escalation Procedures

#### Level 1: Self-Service Resolution
- Use automated rollback procedures
- Follow troubleshooting guide
- Check deployment logs and health status

#### Level 2: Technical Support
- Contact development team with:
  - Deployment ID and timestamp
  - Error messages and symptoms
  - Steps already attempted
  - Current health check results

#### Level 3: Emergency Escalation
- Critical site outage (>15 minutes)
- Security incidents
- Data integrity issues
- Contact technical lead immediately

## Maintenance Procedures

### Daily Checks
- [ ] Verify website accessibility
- [ ] Check CloudFront cache hit rate
- [ ] Monitor S3 bucket size and costs

### Weekly Checks
- [ ] Review deployment logs
- [ ] Test rollback procedures (dry run)
- [ ] Verify backup integrity
- [ ] Update operational runbook if needed

### Monthly Checks
- [ ] Clean up old deployment logs (>30 days)
- [ ] Review S3 versioning costs
- [ ] Test emergency procedures
- [ ] Update documentation

## Performance Baselines

### Expected Performance Metrics
- **Home Page Load Time:** < 3 seconds
- **Lighthouse Performance Score:** ≥ 90
- **Lighthouse Accessibility Score:** ≥ 90
- **Lighthouse Best Practices Score:** ≥ 90
- **Lighthouse SEO Score:** ≥ 90

### Cache Performance
- **CloudFront Cache Hit Rate:** > 80%
- **HTML Cache TTL:** 600 seconds (10 minutes)
- **Static Assets Cache TTL:** 31536000 seconds (1 year)

## Security Considerations

### Access Control
- S3 bucket is private with CloudFront OAC access only
- No public S3 access allowed
- IAM roles follow least privilege principle

### Monitoring
- CloudTrail logging enabled for all API calls
- S3 access logging configured
- CloudFront logging available if needed

### Incident Response
1. Identify and contain security issue
2. Execute emergency rollback if needed
3. Document incident and response
4. Review and update security measures

## Contact Information

### Primary Contacts
- **Development Team:** [Contact Information]
- **Technical Lead:** [Contact Information]
- **AWS Support:** [Support Plan Details]

### Documentation References
- **Rollback Procedures:** `docs/vivid-auto-rollback-procedures.md`
- **Deployment Scripts:** `scripts/vivid-auto-rollback.ps1`
- **Version Tracking:** `scripts/vivid-auto-version-tracker.ps1`
- **Project Requirements:** `.kiro/specs/vivid-auto-scram-rebuild/requirements.md`

## Appendix

### Command Reference

#### Version Management
```powershell
# Track deployment
.\scripts\vivid-auto-version-tracker.ps1 -Action track -DeploymentType manual

# View history
.\scripts\vivid-auto-version-tracker.ps1 -Action history -Limit 10

# Check versions
.\scripts\vivid-auto-version-tracker.ps1 -Action versions

# Health check
.\scripts\vivid-auto-version-tracker.ps1 -Action health

# Generate runbook
.\scripts\vivid-auto-version-tracker.ps1 -Action runbook
```

#### Rollback Operations
```powershell
# List versions
.\scripts\vivid-auto-rollback.ps1 -Action list-versions -File "index.html"

# Selective rollback
.\scripts\vivid-auto-rollback.ps1 -Action rollback -File "index.html" -VersionId "VERSION_ID"

# Emergency rollback
.\scripts\vivid-auto-rollback.ps1 -Action emergency

# Verify deployment
.\scripts\vivid-auto-rollback.ps1 -Action verify
```

#### AWS CLI Commands
```bash
# List object versions
aws s3api list-object-versions --bucket mobile-marketing-site-prod-1759705011281-tyzuo9 --prefix index.html --region us-east-1

# Create invalidation
aws cloudfront create-invalidation --distribution-id E2IBMHQ3GCW6ZK --paths "/*" --region us-east-1

# Check distribution status
aws cloudfront get-distribution --id E2IBMHQ3GCW6ZK --region us-east-1
```

---

**Note:** This runbook is automatically updated by the version tracking system. Manual edits may be overwritten during automated updates.