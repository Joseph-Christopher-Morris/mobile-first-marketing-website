# How to Deploy Your Website Changes

## Quick Deployment Steps

### 1. **Test Locally First**

```bash
# Install dependencies (if needed)
npm install

# Run the development server
npm run dev

# Open http://localhost:3000 to see your changes
```

### 2. **Build and Test**

```bash
# Build the project
npm run build

# Test the production build locally
npm run start
```

### 3. **Deploy to Production**

Your project uses **S3 + CloudFront deployment**. Here are your options:

#### **Option A: Automatic Deployment (Recommended)**

```bash
# Simply push your changes to GitHub
git add .
git commit -m "Add brand colors and testimonials"
git push origin main

# GitHub Actions will automatically:
# 1. Build your site
# 2. Deploy to S3
# 3. Invalidate CloudFront cache
# 4. Your changes will be live in ~5-10 minutes
```

#### **Option B: Manual Deployment**

```bash
# Build the project
npm run build
npm run export

# Deploy using the deployment script
node scripts/deploy.js

# Verify deployment
node scripts/deployment-status-dashboard.js
```

## What You Just Added

### ✅ **Brand Colors Applied**

- Primary color: `#F5276F` (replaces all blue)
- Hover color: `#C8094C`
- Applied to buttons, links, forms, and all UI elements

### ✅ **New Testimonials Section**

- Scott Beercroft testimonial
- Lee Murfitt testimonial
- No profile photos (as requested)
- Professional card design with your brand colors

### ✅ **Global Theme Integration**

- All existing components now use your brand colors
- Consistent styling across the entire website
- Responsive design for all devices

## Monitoring Your Deployment

After pushing to GitHub, you can monitor the deployment:

```bash
# Check GitHub Actions status
gh run list --limit 5

# Monitor deployment progress
node scripts/deployment-status-dashboard.js

# Validate the site after deployment
node scripts/validate-site-functionality.js
```

## Your Live Website

Once deployed, your changes will be visible at:

- **Production URL**: `https://d15sc9fc739ev2.cloudfront.net`

## Troubleshooting

If something goes wrong:

```bash
# Check deployment status
node scripts/deployment-status-dashboard.js

# Run comprehensive tests
node scripts/comprehensive-deployment-test.js

# Emergency rollback (if needed)
node scripts/rollback.js emergency
```

## Next Steps

1. **Push your changes** to GitHub (automatic deployment)
2. **Wait 5-10 minutes** for deployment to complete
3. **Visit your website** to see the new brand colors and testimonials
4. **Test on mobile** to ensure everything looks great

Your website will now have:

- ✅ Brand color `#F5276F` throughout
- ✅ Professional testimonials section
- ✅ Consistent styling across all pages
- ✅ Mobile-responsive design
