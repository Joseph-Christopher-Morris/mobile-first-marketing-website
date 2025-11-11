#!/usr/bin/env node

/**
 * Recreate the exact November 10, 2025 CloudFront Invalidation
 * Invalidation ID: I85VOJ3TGR6EEZ5UEIYA5P4RR7
 * Date: November 10, 2025 at 2:55:58 PM UTC (14:55:58)
 */

const { CloudFrontClient, CreateInvalidationCommand } = require('@aws-sdk/client-cloudfront');

const distributionId = process.env.CLOUDFRONT_DISTRIBUTION_ID || 'E2IBMHQ3GCW6ZK';

// The exact 39 paths from the November 10 invalidation
const paths = [
  '/images/press-logos/autotrader-logo.svg',
  '/images/press-logos/business-insider-logo.svg',
  '/services/website-hosting/index.html',
  '/blog/stock-photography-breakthrough/index.html',
  '/privacy-policy/index.html',
  '/blog/ebay-model-car-sales-timing-bundles/index.html',
  '/blog/stock-photography-income-growth/index.html',
  '/services/website-design/index.html',
  '/blog/flyer-marketing-case-study-part-2/index.html',
  '/images/press-logos/bbc-logo.svg',
  '/services/ad-campaigns/index.html',
  '/blog/flyer-marketing-case-study-part-1/index.html',
  '/blog/stock-photography-lessons/index.html',
  '/blog/paid-ads-campaign-learnings/index.html',
  '/services/photography/index.html',
  '/images/press-logos/financial-times-logo.svg',
  '/blog/ebay-photography-workflow-part-2/index.html',
  '/_next/static/css/f4d6aaef5af2f5e7.css',
  '/images/press-logos/cnn-logo.svg',
  '/404/index.html',
  '/_next/static/chunks/app/thank-you/page-b0e93fe3337c9640.js',
  '/pricing/index.html',
  '/blog/ebay-model-ford-collection-part-1/index.html',
  '/blog/index.html',
  '/blog/flyers-roi-breakdown/index.html',
  '/blog/stock-photography-getting-started/index.html',
  '/images/press-logos/daily-mail-logo.svg',
  '/blog/ebay-business-side-part-5/index.html',
  '/contact/index.html',
  '/services/hosting/index.html',
  '/images/press-logos/forbes-logo.svg',
  '/about/index.html',
  '/blog/ebay-repeat-buyers-part-4/index.html',
  '/services/index.html',
  '/thank-you/index.html',
  '/blog/exploring-istock-data-deepmeta/index.html',
  '/index.html',
  '/404.html',
  '/services/analytics/index.html'
];

async function recreateInvalidation() {
  console.log('\n🔄 Recreating November 10, 2025 CloudFront Invalidation');
  console.log('='.repeat(60));
  console.log(`Distribution: ${distributionId}`);
  console.log(`Original Invalidation ID: I85VOJ3TGR6EEZ5UEIYA5P4RR7`);
  console.log(`Original Date: November 10, 2025 at 2:55:58 PM UTC`);
  console.log(`Paths: ${paths.length}`);
  console.log('');

  const client = new CloudFrontClient({ region: 'us-east-1' });

  try {
    const command = new CreateInvalidationCommand({
      DistributionId: distributionId,
      InvalidationBatch: {
        CallerReference: `nov-10-recreation-${Date.now()}`,
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
