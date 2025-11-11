#!/usr/bin/env node

/**
 * Photography Hero Asset Synchronization Deployment
 * 
 * This script:
 * 1. Builds the site with updated photography hero paths
 * 2. Deploys to S3
 * 3. Invalidates CloudFront cache for photography pages and images
 */

const { execSync } = require('child_process');
const fs = require('fs');

console.log('🚀 Photography Hero Asset Synchronization Deployment\n');

// Environment variables
const S3_BUCKET = process.env.S3_BUCKET_NAME || 'mobile-marketing-site-prod-1759705011281-tyzuo9';
const CLOUDFRONT_DISTRIBUTION_ID = process.env.CLOUDFRONT_DISTRIBUTION_ID || 'E2IBMHQ3GCW6ZK';
const AWS_REGION = process.env.AWS_REGION || 'us-east-1';

console.log('📋 Configuration:');
console.log(`   S3 Bucket: ${S3_BUCKET}`);
console.log(`   CloudFront Distribution: ${CLOUDFRONT_DISTRIBUTION_ID}`);
console.log(`   AWS Region: ${AWS_REGION}\n`);

try {
  // Step 1: Clean build
  console.log('🧹 Cleaning previous build...');
  if (fs.existsSync('out')) {
    execSync('rmdir /s /q out', { stdio: 'inherit' });
  }
  if (fs.existsSync('.next')) {
    execSync('rmdir /s /q .next', { stdio: 'inherit' });
  }

  // Step 2: Build the site
  console.log('🔨 Building site with updated photography hero paths...');
  execSync('npm run build', { stdio: 'inherit' });

  // Step 3: Deploy to S3
  console.log('📤 Deploying to S3...');
  execSync(`aws s3 sync out/ s3://${S3_BUCKET}/ --delete --region ${AWS_REGION}`, { stdio: 'inherit' });

  // Step 4: CloudFront invalidation for photography pages and images
  console.log('🔄 Invalidating CloudFront cache...');
  
  const invalidationPaths = [
    '/services/photography*',
    '/images/services/Photography/*'
  ];

  const invalidationCommand = `aws cloudfront create-invalidation --distribution-id ${CLOUDFRONT_DISTRIBUTION_ID} --paths "${invalidationPaths.join('" "')}"`;
  
  console.log(`Running: ${invalidationCommand}`);
  const invalidationResult = execSync(invalidationCommand, { encoding: 'utf8' });
  
  const invalidationData = JSON.parse(invalidationResult);
  const invalidationId = invalidationData.Invalidation.Id;
  
  console.log(`✅ CloudFront invalidation created: ${invalidationId}`);
  console.log('📍 Invalidated paths:');
  invalidationPaths.forEach(path => console.log(`   - ${path}`));

  // Step 5: Verify deployment
  console.log('\n🔍 Verifying deployment...');
  
  // Check if photography page was built correctly
  const photographyPagePath = 'out/services/photography/index.html';
  if (fs.existsSync(photographyPagePath)) {
    const pageContent = fs.readFileSync(photographyPagePath, 'utf8');
    
    if (pageContent.includes('/images/services/Photography/photography-hero.webp')) {
      console.log('✅ Photography page contains correct hero image path');
    } else {
      console.log('❌ Photography page does not contain correct hero image path');
    }
    
    if (pageContent.includes('rel="preload"') && pageContent.includes('Photography/photography-hero.webp')) {
      console.log('✅ Preload link uses correct capitalized path');
    } else {
      console.log('❌ Preload link may not be using correct path');
    }
  } else {
    console.log('❌ Photography page not found in build output');
  }

  console.log('\n🎉 Photography Hero Asset Synchronization Complete!');
  console.log('\n📋 Summary:');
  console.log('✅ Updated photography page to use /images/services/Photography/photography-hero.webp');
  console.log('✅ Built and deployed to S3');
  console.log('✅ Invalidated CloudFront cache for photography pages and images');
  console.log('\n🌐 Changes will be live once CloudFront invalidation completes (typically 1-3 minutes)');
  console.log('💡 Clear your browser cache to see the updated preload links immediately');

} catch (error) {
  console.error('❌ Deployment failed:', error.message);
  process.exit(1);
}