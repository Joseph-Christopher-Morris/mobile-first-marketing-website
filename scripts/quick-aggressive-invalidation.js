#!/usr/bin/env node

/**
 * QUICK Aggressive Cache Invalidation
 * Fast nuclear option - invalidates everything immediately
 */

const {
  CloudFrontClient,
  CreateInvalidationCommand,
} = require('@aws-sdk/client-cloudfront');

const DISTRIBUTION_ID = 'E2IBMHQ3GCW6ZK';
const AWS_REGION = 'us-east-1';

// Nuclear paths - covers absolutely everything
const NUCLEAR_PATHS = [
  '/*',
  '/index.html',
  '/*.html',
  '/*.js',
  '/*.css',
  '/*.webp',
  '/*.jpg',
  '/*.png',
  '/*.svg',
  '/*.json',
  '/*.xml',
  '/*.txt',
  '/*.ico'
];

console.log('💥 QUICK AGGRESSIVE INVALIDATION');
console.log(`📡 Distribution: ${DISTRIBUTION_ID}`);

async function quickNuke() {
  try {
    const cloudfront = new CloudFrontClient({ region: AWS_REGION });
    
    const params = {
      DistributionId: DISTRIBUTION_ID,
      InvalidationBatch: {
        Paths: {
          Quantity: NUCLEAR_PATHS.length,
          Items: NUCLEAR_PATHS,
        },
        CallerReference: `nuke-${Date.now()}`,
      },
    };

    console.log('🚀 Nuking cache...');
    const command = new CreateInvalidationCommand(params);
    const response = await cloudfront.send(command);

    console.log(`✅ NUKED! ID: ${response.Invalidation.Id}`);
    console.log(`📊 Status: ${response.Invalidation.Status}`);
    console.log('🌐 Fresh content incoming in 5-15 minutes!');
    
    return response;
  } catch (error) {
    console.error(`❌ Nuke failed: ${error.message}`);
    process.exit(1);
  }
}

quickNuke();