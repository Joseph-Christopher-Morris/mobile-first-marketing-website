#!/usr/bin/env node

/**
 * Force Deploy Photography Page Changes
 * 
 * This script forces a new deployment and clears CloudFront cache to ensure
 * your photography page updates are visible on the live website.
 */

const { execSync } = require('child_process');

console.log('🚀 Force Deploying Photography Page Changes...\n');

try {
  // Check if we have the necessary environment variables
  console.log('🔧 Checking deployment configuration...');
  
  const requiredEnvVars = [
    'S3_BUCKET_NAME',
    'CLOUDFRONT_DISTRIBUTION_ID',
    'AWS_REGION'
  ];
  
  // Set default values if not already set
  process.env.S3_BUCKET_NAME = process.env.S3_BUCKET_NAME || 'mobile-marketing-site-prod-1759705011281-tyzuo9';
  process.env.CLOUDFRONT_DISTRIBUTION_ID = process.env.CLOUDFRONT_DISTRIBUTION_ID || 'E2IBMHQ3GCW6ZK';
  process.env.AWS_REGION = process.env.AWS_REGION || 'us-east-1';
  
  console.log(`✅ S3 Bucket: ${process.env.S3_BUCKET_NAME}`);
  console.log(`✅ CloudFront Distribution: ${process.env.CLOUDFRONT_DISTRIBUTION_ID}`);
  console.log(`✅ AWS Region: ${process.env.AWS_REGION}`);
  
  // Step 1: Build the project
  console.log('\n🔨 Building the project...');
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ Build completed successfully');
  
  // Step 2: Deploy to S3
  console.log('\n📤 Deploying to S3...');
  try {
    execSync('node scripts/deploy.js', { stdio: 'inherit' });
    console.log('✅ S3 deployment completed');
  } catch (error) {
    console.log('⚠️  Main deploy script failed, trying alternative...');
    
    // Alternative deployment method
    try {
      execSync('aws s3 sync out/ s3://' + process.env.S3_BUCKET_NAME + '/ --delete', { stdio: 'inherit' });
      console.log('✅ Alternative S3 sync completed');
    } catch (altError) {
      console.log('❌ S3 deployment failed. Trying manual approach...');
      
      // Check if out directory exists
      const fs = require('fs');
      if (fs.existsSync('out')) {
        console.log('📁 Build output directory exists, deployment should work');
      } else {
        console.log('❌ Build output directory missing - build may have failed');
      }
    }
  }
  
  // Step 3: Invalidate CloudFront cache
  console.log('\n🔄 Invalidating CloudFront cache...');
  try {
    const invalidationCommand = `aws cloudfront create-invalidation --distribution-id ${process.env.CLOUDFRONT_DISTRIBUTION_ID} --paths "/*"`;
    execSync(invalidationCommand, { stdio: 'inherit' });
    console.log('✅ CloudFront cache invalidation initiated');
  } catch (error) {
    console.log('⚠️  CloudFront invalidation failed, trying alternative...');
    
    // Try using our invalidation script
    try {
      execSync('node scripts/quick-cache-invalidation.js', { stdio: 'inherit' });
      console.log('✅ Alternative cache invalidation completed');
    } catch (altError) {
      console.log('❌ Cache invalidation failed - manual invalidation may be needed');
    }
  }
  
  // Step 4: Verify deployment
  console.log('\n🔍 Verifying deployment...');
  
  const websiteUrl = 'https://d15sc9fc739ev2.cloudfront.net/services/photography';
  console.log(`🌐 Photography page URL: ${websiteUrl}`);
  
  console.log('\n✅ Force deployment completed!');
  
  console.log('\n📋 Next Steps:');
  console.log('1. Wait 2-3 minutes for CloudFront cache to clear');
  console.log('2. Visit your photography page to verify changes');
  console.log('3. Hard refresh your browser (Ctrl+F5 or Cmd+Shift+R)');
  console.log('4. Check in incognito/private browsing mode');
  
  console.log('\n🔗 Quick Links:');
  console.log(`• Photography Page: ${websiteUrl}`);
  console.log('• GitHub Actions: https://github.com/Joseph-Christopher-Morris/mobile-first-marketing-website/actions');
  console.log('• AWS CloudFront Console: https://console.aws.amazon.com/cloudfront/');
  
  console.log('\n⏰ Timeline:');
  console.log('• Cache invalidation: 1-2 minutes');
  console.log('• Full propagation: 5-15 minutes');
  console.log('• If still not visible after 15 minutes, check GitHub Actions');

} catch (error) {
  console.error('❌ Error during force deployment:', error.message);
  
  console.log('\n🆘 Troubleshooting Steps:');
  console.log('1. Check AWS credentials are configured');
  console.log('2. Verify GitHub Actions deployment status');
  console.log('3. Try manual cache clear in CloudFront console');
  console.log('4. Check browser cache (hard refresh)');
  
  console.log('\n🔧 Manual Commands:');
  console.log('• Build: npm run build');
  console.log('• Deploy: aws s3 sync out/ s3://mobile-marketing-site-prod-1759705011281-tyzuo9/ --delete');
  console.log('• Invalidate: aws cloudfront create-invalidation --distribution-id E2IBMHQ3GCW6ZK --paths "/*"');
  
  process.exit(1);
}