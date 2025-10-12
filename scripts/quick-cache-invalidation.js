#!/usr/bin/env node

/**
 * Quick CloudFront Cache Invalidation Script
 * Invalidates all paths on the production CloudFront distribution
 */

const { execSync } = require('child_process');

// Production CloudFront Distribution ID from deployment config
const DISTRIBUTION_ID = 'E2IBMHQ3GCW6ZK';

function invalidateCache() {
  console.log('🔄 Invalidating CloudFront cache...');
  console.log(`Distribution ID: ${DISTRIBUTION_ID}`);
  
  try {
    // Check if AWS CLI is available
    execSync('aws --version', { stdio: 'pipe' });
    
    // Create invalidation for all paths
    const command = `aws cloudfront create-invalidation --distribution-id ${DISTRIBUTION_ID} --paths "/*"`;
    console.log(`Running: ${command}`);
    
    const result = execSync(command, { encoding: 'utf8' });
    console.log('✅ Cache invalidation created successfully!');
    console.log(result);
    
    console.log('\n📋 Next steps:');
    console.log('1. Wait 1-2 minutes for invalidation to complete');
    console.log('2. Check your site to see updated content');
    console.log('3. You can monitor invalidation status in AWS Console');
    
  } catch (error) {
    if (error.message.includes('aws: command not found') || error.message.includes('is not recognized')) {
      console.error('❌ AWS CLI not found. Please install and configure AWS CLI first.');
      console.log('\n📋 To install AWS CLI:');
      console.log('1. Download from: https://aws.amazon.com/cli/');
      console.log('2. Configure with: aws configure');
      console.log('3. Use your deployment IAM credentials');
    } else if (error.message.includes('Unable to locate credentials')) {
      console.error('❌ AWS credentials not configured.');
      console.log('\n📋 To configure credentials:');
      console.log('1. Run: aws configure');
      console.log('2. Enter your Access Key ID and Secret Access Key');
      console.log('3. Set region to: us-east-1');
    } else {
      console.error('❌ Cache invalidation failed:', error.message);
    }
    process.exit(1);
  }
}

// Alternative PowerShell command for Windows users
function showPowerShellCommand() {
  console.log('\n💡 Alternative PowerShell command:');
  console.log(`aws cloudfront create-invalidation --distribution-id ${DISTRIBUTION_ID} --paths "/*"`);
}

if (require.main === module) {
  invalidateCache();
  showPowerShellCommand();
}

module.exports = { invalidateCache, DISTRIBUTION_ID };