#!/usr/bin/env node

const {
  CloudFrontClient,
  CreateInvalidationCommand,
} = require('@aws-sdk/client-cloudfront');

const distributionId = process.env.CLOUDFRONT_DISTRIBUTION_ID;
const region = 'us-east-1';

if (!distributionId) {
  console.error(
    '❌ CLOUDFRONT_DISTRIBUTION_ID environment variable is required'
  );
  process.exit(1);
}

const cloudFrontClient = new CloudFrontClient({ region });

async function forceInvalidation() {
  try {
    console.log('🔄 Forcing CloudFront cache invalidation...');

    const invalidationParams = {
      DistributionId: distributionId,
      InvalidationBatch: {
        Paths: {
          Quantity: 2,
          Items: ['/about', '/about/*'],
        },
        CallerReference: `force-invalidation-${Date.now()}`,
      },
    };

    const command = new CreateInvalidationCommand(invalidationParams);
    const response = await cloudFrontClient.send(command);

    console.log('✅ Cache invalidation created successfully');
    console.log(`   Invalidation ID: ${response.Invalidation.Id}`);
    console.log(`   Status: ${response.Invalidation.Status}`);
    console.log('   Note: Changes may take 5-15 minutes to propagate globally');
  } catch (error) {
    console.error('❌ Failed to create invalidation:', error.message);
    process.exit(1);
  }
}

forceInvalidation();
