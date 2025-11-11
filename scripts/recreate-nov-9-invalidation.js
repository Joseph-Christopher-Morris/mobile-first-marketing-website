#!/usr/bin/env node

/**
 * Recreate the exact November 9, 2025 CloudFront Invalidation
 * Date: November 9, 2025 at 10:24:11 PM UTC (22:24:11)
 * Status: Completed
 */

const { CloudFrontClient, CreateInvalidationCommand } = require('@aws-sdk/client-cloudfront');

const distributionId = process.env.CLOUDFRONT_DISTRIBUTION_ID || 'E2IBMHQ3GCW6ZK';

// The exact paths from the November 9 invalidation
const paths = [
  '/_next/static/chunks/app/page-e6d83047ead03bc2.js',
  '/404/index.html',
  '/privacy-policy/index.html',
  '/index.html',
  '/404.html'
];

async function recreateInvalidation() {
  console.log('\n🔄 Recreating November 9, 2025 CloudFront Invalidation');
  console.log('='.repeat(60));
  console.log(`Distribution: ${distributionId}`);
  console.log(`Original Date: November 9, 2025 at 10:24:11 PM UTC`);
  console.log(`Paths: ${paths.length}`);
  console.log('');

  const client = new CloudFrontClient({ region: 'us-east-1' });

  try {
    const command = new CreateInvalidationCommand({
      DistributionId: distributionId,
      InvalidationBatch: {
        CallerReference: `nov-9-recreation-${Date.now()}`,
        Paths: {
          Quantity: paths.length,
          Items: paths
        }
      }
    });

    console.log('📤 Creating invalidation...');
    const result = await client.send(command);

    console.log('\n✅ Invalidation created successfully!');
    console.log('');
    console.log('📋 Details:');
    console.log(`   New Invalidation ID: ${result.Invalidation.Id}`);
    console.log(`   Status: ${result.Invalidation.Status}`);
    console.log(`   Created: ${result.Invalidation.CreateTime}`);
    console.log(`   Paths: ${paths.length}`);
    console.log('');
    console.log('⏱️  Propagation time: 5-15 minutes');
    console.log('🌐 Changes will be visible globally once complete');
    console.log('');
    console.log('Invalidated paths:');
    paths.forEach(path => console.log(`   ✓ ${path}`));

    return result;
  } catch (error) {
    console.error('\n❌ Failed to create invalidation:', error.message);
    throw error;
  }
}

if (require.main === module) {
  recreateInvalidation()
    .then(() => {
      console.log('\n✅ Done!');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ Error:', error.message);
      process.exit(1);
    });
}

module.exports = recreateInvalidation;
