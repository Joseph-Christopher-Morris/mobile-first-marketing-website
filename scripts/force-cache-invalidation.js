#!/usr/bin/env node

/**
 * Force CloudFront Cache Invalidation
 * Purges specific paths to ensure updated content is visible immediately
 */

const { CloudFrontClient, CreateInvalidationCommand } = require('@aws-sdk/client-cloudfront');

// Configuration
const DISTRIBUTION_ID = process.env.CLOUDFRONT_DISTRIBUTION_ID || 'E2IBMHQ3GCW6ZK';
const AWS_REGION = process.env.AWS_REGION || 'us-east-1';

// Paths to invalidate
const INVALIDATION_PATHS = [
  '/about',
  '/about/*',
  '/about.html',
  '/*' // Invalidate everything to be sure
];

console.log('🔄 Force CloudFront Cache Invalidation');
console.log(`📡 Distribution ID: ${DISTRIBUTION_ID}`);
console.log(`🌍 Region: ${AWS_REGION}`);
console.log(`📋 Paths to invalidate: ${INVALIDATION_PATHS.length}`);

async function invalidateCache() {
  try {
    // Initialize CloudFront client
    const cloudfront = new CloudFrontClient({ 
      region: AWS_REGION,
      maxAttempts: 3
    });

    // Create invalidation request
    const invalidationParams = {
      DistributionId: DISTRIBUTION_ID,
      InvalidationBatch: {
        Paths: {
          Quantity: INVALIDATION_PATHS.length,
          Items: INVALIDATION_PATHS
        },
        CallerReference: `force-invalidation-${Date.now()}`
      }
    };

    console.log('🚀 Creating invalidation request...');
    
    const command = new CreateInvalidationCommand(invalidationParams);
    const response = await command.send(cloudfront);

    console.log('✅ Cache invalidation created successfully!');
    console.log(`📋 Invalidation ID: ${response.Invalidation.Id}`);
    console.log(`📊 Status: ${response.Invalidation.Status}`);
    console.log(`🕒 Created: ${response.Invalidation.CreateTime}`);
    
    console.log('\n📋 Invalidated Paths:');
    INVALIDATION_PATHS.forEach(path => {
      console.log(`   ✓ ${path}`);
    });

    console.log('\n⏱️  Cache invalidation typically takes 5-15 minutes to complete globally');
    console.log('🌐 Your updated about page should be visible shortly at:');
    console.log('   https://d15sc9fc739ev2.cloudfront.net/about');
    
    return response;

  } catch (error) {
    console.error('❌ Error creating cache invalidation:', error.message);
    
    if (error.name === 'CredentialsError') {
      console.log('💡 AWS credentials not found. Please ensure AWS CLI is configured or environment variables are set.');
    } else if (error.name === 'AccessDenied') {
      console.log('💡 Access denied. Please check your AWS permissions for CloudFront invalidations.');
    } else {
      console.log('💡 Please check your AWS configuration and try again.');
    }
    
    process.exit(1);
  }
}

// Run the invalidation
invalidateCache();