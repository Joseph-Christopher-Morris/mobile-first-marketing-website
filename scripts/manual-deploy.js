#!/usr/bin/env node

/**
 * Simple Manual Deployment Script
 * Deploy directly to S3 + CloudFront without GitHub
 */

const { execSync } = require('child_process');

console.log('🚀 Starting Manual Deployment...\n');

// Set environment variables
process.env.S3_BUCKET_NAME = 'mobile-marketing-site-prod-1759705011281-tyzuo9';
process.env.CLOUDFRONT_DISTRIBUTION_ID = 'E2IBMHQ3GCW6ZK';
process.env.AWS_REGION = 'us-east-1';

try {
  console.log('📋 Configuration:');
  console.log(`   S3 Bucket: ${process.env.S3_BUCKET_NAME}`);
  console.log(`   CloudFront: ${process.env.CLOUDFRONT_DISTRIBUTION_ID}`);
  console.log(`   Region: ${process.env.AWS_REGION}\n`);

  console.log('🔨 Building site...');
  execSync('npm run build', { stdio: 'inherit' });

  console.log('\n📤 Deploying to AWS...');
  execSync('node scripts/deploy.js', { stdio: 'inherit' });

  console.log('\n✅ Manual deployment complete!');
  console.log('🌐 Site: https://d15sc9fc739ev2.cloudfront.net');

} catch (error) {
  console.error('\n❌ Deployment failed:', error.message);
  console.log('\n🔧 Troubleshooting:');
  console.log('1. Check AWS credentials: aws configure list');
  console.log('2. Verify build: npm run build');
  console.log('3. Check permissions: aws s3 ls s3://mobile-marketing-site-prod-1759705011281-tyzuo9');
  process.exit(1);
}