#!/bin/bash
# SEO Metadata System Deployment Commands
# Date: February 20, 2026

# Ensure Homebrew (and node/npm) are available for non-interactive shells
eval "$(/opt/homebrew/bin/brew shellenv)"

echo "=========================================="
echo "SEO METADATA SYSTEM DEPLOYMENT"
echo "=========================================="
echo ""

# Step 1: Build
echo "Step 1: Building Next.js static export..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed! Please fix errors before deploying."
    exit 1
fi

echo "✅ Build completed successfully"
echo ""

# Step 2: Set environment variables
echo "Step 2: Setting AWS environment variables..."
export S3_BUCKET_NAME="mobile-marketing-site-prod-1759705011281-tyzuo9"
export CLOUDFRONT_DISTRIBUTION_ID="E2IBMHQ3GCW6ZK"
export AWS_REGION="us-east-1"

echo "✅ Environment variables set:"
echo "   S3_BUCKET_NAME: $S3_BUCKET_NAME"
echo "   CLOUDFRONT_DISTRIBUTION_ID: $CLOUDFRONT_DISTRIBUTION_ID"
echo "   AWS_REGION: $AWS_REGION"
echo ""

# Step 3: Deploy to S3 and invalidate CloudFront
echo "Step 3: Deploying to S3 and invalidating CloudFront..."
node scripts/deploy.js

if [ $? -ne 0 ]; then
    echo "❌ Deployment failed!"
    exit 1
fi

echo ""
echo "=========================================="
echo "✅ DEPLOYMENT COMPLETE"
echo "=========================================="
echo ""
echo "Post-deployment checklist:"
echo "1. Visit https://d15sc9fc739ev2.cloudfront.net/"
echo "2. Check page titles (should be ≤60 chars, brand once only)"
echo "3. Verify /services/ structured data URL"
echo "4. Check /thank-you/ has noindex"
echo "5. Verify blog cards show post titles (not 'Read Article')"
echo "6. Confirm GTM, Clarity, Ahrefs load once only"
echo ""
echo "Documentation: SEO-METADATA-IMPLEMENTATION-COMPLETE.md"
