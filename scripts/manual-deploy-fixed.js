#!/usr/bin/env node

/**
 * Fixed Manual Deployment Script for Windows
 * Handles Windows file permission issues
 */

const { execSync } = require('child_process');

console.log('🚀 Starting Manual Deployment (Windows Fixed)...\n');

// Set environment variables
process.env.S3_BUCKET_NAME = 'mobile-marketing-site-prod-1759705011281-tyzuo9';
process.env.CLOUDFRONT_DISTRIBUTION_ID = 'E2IBMHQ3GCW6ZK';
process.env.AWS_REGION = 'us-east-1';

try {
  console.log('📋 Configuration:');
  console.log(`   S3 Bucket: ${process.env.S3_BUCKET_NAME}`);
  console.log(`   CloudFront: ${process.env.CLOUDFRONT_DISTRIBUTION_ID}`);
  console.log(`   Region: ${process.env.AWS_REGION}\n`);

  console.log('🧹 Cleaning build directories...');
  execSync('node scripts/clean-build.js', { stdio: 'inherit' });

  console.log('\n🔨 Building site...');
  execSync('npm run build', { stdio: 'inherit' });

  console.log('\n📤 Deploying to AWS...');
  execSync('node scripts/deploy.js', { stdio: 'inherit' });

  console.log('\n✅ Manual deployment complete!');
  console.log('🌐 Site: https://d15sc9fc739ev2.cloudfront.net');

} catch (error) {
  console.error('\n❌ Deployment failed:', error.message);
  console.log('\n🔧 Quick fixes to try:');
  console.log('1. Clean and retry: node scripts/clean-build.js && npm run build');
  console.log('2. Check if any editors/IDEs are open (close them)');
  console.log('3. Run as administrator if needed');
  console.log('4. Use GitHub deployment instead: git push');
  process.exit(1);
}