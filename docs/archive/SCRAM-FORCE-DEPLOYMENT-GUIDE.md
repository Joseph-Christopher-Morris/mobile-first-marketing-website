# SCRAM Force Deployment Guide 🚀

## Quick Start

Your SCRAM-compliant website is ready for deployment! Choose your preferred method:

### Option 1: PowerShell (Recommended)
```powershell
.\deploy-scram-force.ps1
```

### Option 2: Batch File
```cmd
deploy-scram-force.bat
```

### Option 3: Direct Node.js
```bash
node scripts/force-scram-deployment.js
```

## What Gets Deployed

### ✅ SCRAM Content
- **Hero**: "Faster, smarter websites that work as hard as you do"
- **Subheadline**: Complete SCRAM-compliant content
- **My Services**: "Vivid Media Cheshire helps local businesses grow..."
- **My Case Studies**: "Explore real results from my projects..."
- **CTA Buttons**: "Let's Grow Your Business" | "Explore Services"

### ✅ Trust Logos (Versioned)
- `bbc.v1.png` - BBC logo with immutable cache
- `forbes.v1.png` - Forbes logo with immutable cache  
- `ft.v1.png` - Financial Times logo with immutable cache

### ✅ Hero Image
- `230422_Chester_Stock_Photography-84.webp` - SCRAM-specified hero image

### ✅ Infrastructure
- **Target**: `https://d15sc9fc739ev2.cloudfront.net`
- **S3 Bucket**: `mobile-marketing-site-prod-1759705011281-tyzuo9`
- **CloudFront**: `E2IBMHQ3GCW6ZK`
- **Region**: `us-east-1`

## Deployment Process

The script will automatically:

1. **Validate SCRAM Compliance** - Ensures all requirements are met
2. **Build Project** - Creates optimized static files
3. **Upload Trust Logos** - With versioned cache headers (1 year)
4. **Upload Hero Image** - With optimized cache settings
5. **Sync Website Files** - All pages and assets
6. **Invalidate CloudFront** - Forces cache refresh
7. **Generate Report** - Documents deployment success

## Cache Strategy

- **Versioned Assets** (logos): 1 year immutable cache
- **Hero Image**: 1 year immutable cache
- **Static Assets**: 1 hour cache
- **HTML Files**: No cache (immediate updates)

## Prerequisites

Make sure you have:
- ✅ AWS CLI installed and configured
- ✅ Node.js installed
- ✅ AWS credentials with S3 and CloudFront permissions

## Expected Timeline

- **Build**: ~20 seconds
- **Upload**: ~2-3 minutes
- **CloudFront Propagation**: 5-10 minutes

## Verification

After deployment, check:
1. Website loads: `https://d15sc9fc739ev2.cloudfront.net`
2. Trust logos display correctly
3. Hero image shows the Chester photography
4. Content matches SCRAM requirements

## Troubleshooting

### Common Issues
- **AWS CLI not found**: Install AWS CLI
- **Permission denied**: Check AWS credentials
- **Build fails**: Run `npm install` first

### Support Files
- `scram-validation-report-*.json` - Compliance validation
- `scram-deployment-report-*.md` - Deployment details

## Post-Deployment

Your website will be live with:
- ✅ 100% SCRAM compliance
- ✅ Optimized performance
- ✅ Proper caching strategy
- ✅ Trust logos with lazy loading
- ✅ Mobile-responsive design

---

**Ready to deploy? Run the script and your SCRAM-compliant website will be live in minutes!**