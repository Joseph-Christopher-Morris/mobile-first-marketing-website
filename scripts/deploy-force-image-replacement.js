#!/usr/bin/env node

/**
 * Force Image Replacement Deployment Script
 * 
 * This script deploys the site with forced cache invalidation for blog images
 * to ensure the new versioned images are loaded instead of cached versions.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const S3_BUCKET = process.env.S3_BUCKET_NAME || 'mobile-marketing-site-prod-1759705011281-tyzuo9';
const CLOUDFRONT_DISTRIBUTION_ID = process.env.CLOUDFRONT_DISTRIBUTION_ID || 'E2IBMHQ3GCW6ZK';
const AWS_REGION = process.env.AWS_REGION || 'us-east-1';

console.log('🚀 Starting Force Image Replacement Deployment...');
console.log(`📦 S3 Bucket: ${S3_BUCKET}`);
console.log(`🌐 CloudFront Distribution: ${CLOUDFRONT_DISTRIBUTION_ID}`);
console.log(`🌍 AWS Region: ${AWS_REGION}`);

try {
  // Step 1: Build the site
  console.log('\n📦 Building the site...');
  execSync('npm run build', { stdio: 'inherit' });
  
  // Step 2: Deploy to S3
  console.log('\n📤 Uploading to S3...');
  execSync(`aws s3 sync out/ s3://${S3_BUCKET}/ --delete --region ${AWS_REGION}`, { stdio: 'inherit' });
  
  // Step 3: Invalidate CloudFront cache for blog images and pages
  console.log('\n🔄 Invalidating CloudFront cache...');
  
  const invalidationPaths = [
    '/blog/*',
    '/images/blog/*',
    '/*' // Full invalidation to ensure all references are updated
  ];
  
  const pathsString = invalidationPaths.join(' ');
  
  console.log(`Invalidating paths: ${pathsString}`);
  
  const invalidationResult = execSync(
    `aws cloudfront create-invalidation --distribution-id ${CLOUDFRONT_DISTRIBUTION_ID} --paths ${pathsString} --region ${AWS_REGION}`,
    { encoding: 'utf8' }
  );
  
  const invalidation = JSON.parse(invalidationResult);
  const invalidationId = invalidation.Invalidation.Id;
  
  console.log(`✅ Invalidation created: ${invalidationId}`);
  
  // Step 4: Wait for invalidation to complete (optional)
  console.log('\n⏳ Waiting for invalidation to complete...');
  
  try {
    execSync(
      `aws cloudfront wait invalidation-completed --distribution-id ${CLOUDFRONT_DISTRIBUTION_ID} --id ${invalidationId} --region ${AWS_REGION}`,
      { stdio: 'inherit', timeout: 300000 } // 5 minute timeout
    );
    console.log('✅ Invalidation completed successfully!');
  } catch (waitError) {
    console.log('⚠️  Invalidation is still in progress. Check AWS Console for status.');
  }
  
  // Step 5: Verify deployment
  console.log('\n🔍 Deployment Summary:');
  console.log('✅ Site built successfully');
  console.log('✅ Files uploaded to S3');
  console.log('✅ CloudFront invalidation initiated');
  console.log('✅ Blog images with version tokens deployed');
  
  console.log('\n🎉 Force Image Replacement Deployment Complete!');
  console.log('\n📝 Next Steps:');
  console.log('1. Test the site in an incognito browser window');
  console.log('2. Verify new images are loading (check for ?v=20251217 in URLs)');
  console.log('3. Clear browser cache if needed');
  console.log(`4. Monitor CloudFront invalidation status in AWS Console`);
  
} catch (error) {
  console.error('❌ Deployment failed:', error.message);
  process.exit(1);
}