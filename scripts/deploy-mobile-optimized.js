#!/usr/bin/env node

/**
 * Mobile-Optimized Deployment Script
 * Builds and deploys with mobile performance optimizations
 */

const { execSync } = require('child_process');
const fs = require('fs');

console.log('📱 Starting Mobile-Optimized Deployment...');

// Environment variables
const S3_BUCKET = 'mobile-marketing-site-prod-1759705011281-tyzuo9';
const CLOUDFRONT_DISTRIBUTION = 'E2IBMHQ3GCW6ZK';

async function deployMobileOptimized() {
  try {
    console.log('🧹 Cleaning previous build...');
    if (fs.existsSync('.next')) {
      fs.rmSync('.next', { recursive: true, force: true });
    }

    console.log('📦 Building with mobile optimizations...');
    execSync('npm run build', { stdio: 'inherit' });

    console.log('☁️  Deploying to S3...');
    execSync(`aws s3 sync out/ s3://${S3_BUCKET}/ --delete --cache-control "public,max-age=31536000,immutable" --exclude "*.html" --exclude "*.xml" --exclude "*.txt"`, { stdio: 'inherit' });
    
    console.log('📄 Deploying HTML with mobile-optimized cache headers...');
    execSync(`aws s3 sync out/ s3://${S3_BUCKET}/ --delete --cache-control "public,max-age=0,must-revalidate" --include "*.html" --include "*.xml" --include "*.txt"`, { stdio: 'inherit' });

    console.log('🔄 Invalidating CloudFront cache...');
    execSync(`aws cloudfront create-invalidation --distribution-id ${CLOUDFRONT_DISTRIBUTION} --paths "/*"`, { stdio: 'inherit' });

    console.log('✅ Mobile-optimized deployment completed!');
    console.log('🎯 Target: Mobile Performance Score 99+');
    console.log('🌐 Live URL: https://d15sc9fc739ev2.cloudfront.net');
    
    return { success: true };
  } catch (error) {
    console.error('❌ Deployment failed:', error.message);
    return { success: false, error: error.message };
  }
}

deployMobileOptimized();