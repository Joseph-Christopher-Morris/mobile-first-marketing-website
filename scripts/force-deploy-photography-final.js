#!/usr/bin/env node

/**
 * Force Deploy Photography Page - Final Implementation
 * 
 * This script forces deployment of the balanced photography grid changes
 * with proper environment setup and cache invalidation.
 */

const { execSync } = require('child_process');

console.log('🚀 Force Deploying Photography Page Changes (Final)...\n');

try {
  // Set up environment variables for deployment
  console.log('🔧 Setting up deployment environment...');
  
  process.env.S3_BUCKET_NAME = 'mobile-marketing-site-prod-1759705011281-tyzuo9';
  process.env.CLOUDFRONT_DISTRIBUTION_ID = 'E2IBMHQ3GCW6ZK';
  process.env.AWS_REGION = 'us-east-1';
  
  console.log(`✅ S3 Bucket: ${process.env.S3_BUCKET_NAME}`);
  console.log(`✅ CloudFront: ${process.env.CLOUDFRONT_DISTRIBUTION_ID}`);
  
  // Step 1: Clean build
  console.log('\n🧹 Cleaning previous build...');
  try {
    execSync('rmdir /s /q out', { stdio: 'pipe' });
  } catch (error) {
    // Directory might not exist, that's fine
  }
  
  // Step 2: Fresh build
  console.log('\n🔨 Building fresh static site...');
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ Build completed successfully');
  
  // Step 3: Verify build output
  const fs = require('fs');
  if (!fs.existsSync('out')) {
    throw new Error('Build output directory not found');
  }
  
  const buildFiles = fs.readdirSync('out');
  console.log(`✅ Build output contains ${buildFiles.length} files/directories`);
  
  // Check if photography page was built
  if (fs.existsSync('out/services/photography/index.html')) {
    console.log('✅ Photography page built successfully');
  } else {
    console.log('⚠️  Photography page not found in build output');
  }
  
  // Step 4: Deploy to S3 with AWS CLI
  console.log('\n📤 Deploying to S3...');
  const deployCommand = `aws s3 sync out/ s3://${process.env.S3_BUCKET_NAME}/ --delete --region ${process.env.AWS_REGION}`;
  execSync(deployCommand, { stdio: 'inherit' });
  console.log('✅ S3 deployment completed');
  
  // Step 5: Invalidate CloudFront cache
  console.log('\n🔄 Invalidating CloudFront cache...');
  const invalidateCommand = `aws cloudfront create-invalidation --distribution-id ${process.env.CLOUDFRONT_DISTRIBUTION_ID} --paths "/*" --region ${process.env.AWS_REGION}`;
  execSync(invalidateCommand, { stdio: 'inherit' });
  console.log('✅ CloudFront cache invalidation initiated');
  
  // Step 6: Specific photography page cache clear
  console.log('\n📸 Clearing photography page cache specifically...');
  const photoInvalidateCommand = `aws cloudfront create-invalidation --distribution-id ${process.env.CLOUDFRONT_DISTRIBUTION_ID} --paths "/services/photography*" --region ${process.env.AWS_REGION}`;
  execSync(photoInvalidateCommand, { stdio: 'inherit' });
  console.log('✅ Photography page cache cleared');
  
  console.log('\n🎉 Force deployment completed successfully!');
  
  // Deployment summary
  console.log('\n📋 Deployment Summary:');
  console.log('✅ Fresh build created');
  console.log('✅ Files uploaded to S3');
  console.log('✅ CloudFront cache invalidated');
  console.log('✅ Photography page cache specifically cleared');
  
  console.log('\n🌐 Your photography page should be live at:');
  console.log('https://d15sc9fc739ev2.cloudfront.net/services/photography');
  
  console.log('\n⏰ Timeline:');
  console.log('• Cache invalidation: 1-2 minutes');
  console.log('• Full propagation: 5-15 minutes');
  console.log('• Hard refresh recommended: Ctrl+F5 or Cmd+Shift+R');
  
  console.log('\n🔍 Verification Steps:');
  console.log('1. Wait 2-3 minutes for cache to clear');
  console.log('2. Visit the photography page');
  console.log('3. Check for Financial Times editorial card with beige background');
  console.log('4. Verify balanced grid layout on desktop and mobile');
  console.log('5. Test in incognito/private browsing mode');

} catch (error) {
  console.error('❌ Force deployment failed:', error.message);
  
  console.log('\n🆘 Emergency Steps:');
  console.log('1. Check AWS credentials: aws sts get-caller-identity');
  console.log('2. Manual build: npm run build');
  console.log('3. Manual deploy: aws s3 sync out/ s3://mobile-marketing-site-prod-1759705011281-tyzuo9/ --delete');
  console.log('4. Manual invalidate: aws cloudfront create-invalidation --distribution-id E2IBMHQ3GCW6ZK --paths "/*"');
  
  process.exit(1);
}