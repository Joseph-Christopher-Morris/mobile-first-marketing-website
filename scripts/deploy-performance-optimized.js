#!/usr/bin/env node

/**
 * Performance-Optimized Deployment Script
 * Deploys with performance optimizations and validation
 */

const { execSync } = require('child_process');
const fs = require('fs');

const S3_BUCKET_NAME = process.env.S3_BUCKET_NAME || 'mobile-marketing-site-prod-1759705011281-tyzuo9';
const CLOUDFRONT_DISTRIBUTION_ID = process.env.CLOUDFRONT_DISTRIBUTION_ID || 'E2IBMHQ3GCW6ZK';
const AWS_REGION = process.env.AWS_REGION || 'us-east-1';

async function deployPerformanceOptimized() {
  console.log('🚀 Starting performance-optimized deployment...');
  console.log(`   S3 Bucket: ${S3_BUCKET_NAME}`);
  console.log(`   CloudFront Distribution: ${CLOUDFRONT_DISTRIBUTION_ID}`);
  
  try {
    // Step 1: Build with optimizations
    console.log('\n🔨 Building with performance optimizations...');
    execSync('npm run build', { stdio: 'inherit' });
    
    // Step 2: Upload optimized assets with proper cache headers
    console.log('\n📤 Uploading optimized assets...');
    await uploadOptimizedAssets();
    
    // Step 3: Upload HTML with no-store headers
    console.log('\n📄 Uploading HTML with no-store headers...');
    await uploadHtmlFiles();
    
    // Step 4: Validate performance targets
    console.log('\n🎯 Validating performance targets...');
    try {
      execSync('node scripts/validate-mobile-performance-targets.js', { stdio: 'inherit' });
      console.log('✅ Performance targets validated successfully!');
    } catch (error) {
      console.log('⚠️  Performance validation failed, but deployment continues...');
    }
    
    console.log('\n🎉 Performance-optimized deployment completed!');
    
  } catch (error) {
    console.error('❌ Deployment failed:', error.message);
    process.exit(1);
  }
}

async function uploadOptimizedAssets() {
  // Upload images with immutable cache headers
  console.log('   📸 Uploading images with immutable cache...');
  
  // Upload WebP images
  execSync(`aws s3 sync out/images "s3://${S3_BUCKET_NAME}/images" --exclude "*" --include "*.webp" --cache-control "public,max-age=31536000,immutable" --content-type "image/webp"`, { stdio: 'inherit' });
  
  // Upload SVG images
  execSync(`aws s3 sync out/images "s3://${S3_BUCKET_NAME}/images" --exclude "*" --include "*.svg" --cache-control "public,max-age=31536000,immutable" --content-type "image/svg+xml"`, { stdio: 'inherit' });
  
  // Upload PNG images
  execSync(`aws s3 sync out/images "s3://${S3_BUCKET_NAME}/images" --exclude "*" --include "*.png" --cache-control "public,max-age=31536000,immutable" --content-type "image/png"`, { stdio: 'inherit' });
  
  // Upload JS/CSS with immutable cache headers
  console.log('   📦 Uploading JS/CSS with immutable cache...');
  execSync(`aws s3 sync out/_next "s3://${S3_BUCKET_NAME}/_next" --cache-control "public,max-age=31536000,immutable"`, { stdio: 'inherit' });
  
  // Upload other static assets
  console.log('   🗂️  Uploading other static assets...');
  execSync(`aws s3 sync out "s3://${S3_BUCKET_NAME}/" --exclude "*.html" --exclude "images/*" --exclude "_next/*" --cache-control "public,max-age=86400"`, { stdio: 'inherit' });
}

async function uploadHtmlFiles() {
  // Upload HTML files with no-store headers (leveraging CloudFront no-cache behaviors)
  console.log('   📄 Uploading HTML files...');
  execSync(`aws s3 sync out "s3://${S3_BUCKET_NAME}/" --include "*.html" --cache-control "no-store, must-revalidate"`, { stdio: 'inherit' });
}

// Validate environment
if (!S3_BUCKET_NAME || !CLOUDFRONT_DISTRIBUTION_ID) {
  console.error('❌ Required environment variables missing');
  console.error('   S3_BUCKET_NAME and CLOUDFRONT_DISTRIBUTION_ID required');
  process.exit(1);
}

// Run deployment
deployPerformanceOptimized().catch(error => {
  console.error('❌ Unexpected error:', error);
  process.exit(1);
});