#!/usr/bin/env node

/**
 * AGGRESSIVE CloudFront Cache Invalidation
 * Nuclear option - invalidates EVERYTHING to force complete cache refresh
 */

const {
  CloudFrontClient,
  CreateInvalidationCommand,
  GetInvalidationCommand,
} = require('@aws-sdk/client-cloudfront');

// Configuration
const DISTRIBUTION_ID = process.env.CLOUDFRONT_DISTRIBUTION_ID || 'E2IBMHQ3GCW6ZK';
const AWS_REGION = process.env.AWS_REGION || 'us-east-1';

// AGGRESSIVE invalidation paths - covers everything
const AGGRESSIVE_PATHS = [
  '/*',           // Everything
  '/index.html',  // Root
  '/about/*',     // About pages
  '/services/*',  // Services pages
  '/blog/*',      // Blog pages
  '/contact/*',   // Contact pages
  '/privacy-policy/*', // Privacy
  '/thank-you/*', // Thank you pages
  '/*.html',      // All HTML files
  '/*.js',        // All JavaScript
  '/*.css',       // All CSS
  '/*.webp',      // All images
  '/*.jpg',       // All JPG images
  '/*.png',       // All PNG images
  '/*.svg',       // All SVG images
  '/*.json',      // All JSON files
  '/*.xml',       // All XML files (sitemap, etc)
  '/*.txt',       // All text files
  '/*.ico',       // Favicon
];

console.log('💥 AGGRESSIVE CloudFront Cache Invalidation');
console.log('⚠️  WARNING: This will invalidate ALL cached content');
console.log(`📡 Distribution ID: ${DISTRIBUTION_ID}`);
console.log(`🌍 Region: ${AWS_REGION}`);
console.log(`📋 Paths to invalidate: ${AGGRESSIVE_PATHS.length}`);

async function aggressiveInvalidation() {
  try {
    // Initialize CloudFront client
    const cloudfront = new CloudFrontClient({
      region: AWS_REGION,
      maxAttempts: 5,
      retryMode: 'adaptive'
    });

    // Create invalidation request
    const invalidationParams = {
      DistributionId: DISTRIBUTION_ID,
      InvalidationBatch: {
        Paths: {
          Quantity: AGGRESSIVE_PATHS.length,
          Items: AGGRESSIVE_PATHS,
        },
        CallerReference: `aggressive-invalidation-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      },
    };

    console.log('🚀 Creating AGGRESSIVE invalidation request...');
    console.log('⏳ This may take a moment...');

    const command = new CreateInvalidationCommand(invalidationParams);
    const response = await cloudfront.send(command);

    console.log('✅ AGGRESSIVE cache invalidation created successfully!');
    console.log(`📋 Invalidation ID: ${response.Invalidation.Id}`);
    console.log(`📊 Status: ${response.Invalidation.Status}`);
    console.log(`🕒 Created: ${response.Invalidation.CreateTime}`);

    console.log('\n📋 Invalidated Paths (showing first 10):');
    AGGRESSIVE_PATHS.slice(0, 10).forEach(path => {
      console.log(`   💥 ${path}`);
    });
    if (AGGRESSIVE_PATHS.length > 10) {
      console.log(`   ... and ${AGGRESSIVE_PATHS.length - 10} more paths`);
    }

    // Monitor invalidation status
    console.log('\n🔍 Monitoring invalidation status...');
    await monitorInvalidation(cloudfront, response.Invalidation.Id);

    console.log('\n🎉 AGGRESSIVE cache invalidation complete!');
    console.log('🌐 All content should now be fresh at:');
    console.log('   https://d15sc9fc739ev2.cloudfront.net');
    
    return response;
  } catch (error) {
    console.error('❌ Error creating aggressive cache invalidation:', error.message);
    
    if (error.name === 'CredentialsError') {
      console.log('💡 AWS credentials not found. Please ensure AWS CLI is configured.');
    } else if (error.name === 'AccessDenied') {
      console.log('💡 Access denied. Check AWS permissions for CloudFront invalidations.');
    } else if (error.name === 'TooManyInvalidationsInProgress') {
      console.log('💡 Too many invalidations in progress. Wait a few minutes and try again.');
    } else {
      console.log('💡 Please check your AWS configuration and try again.');
    }
    
    process.exit(1);
  }
}

async function monitorInvalidation(cloudfront, invalidationId) {
  const maxAttempts = 20;
  let attempts = 0;
  
  while (attempts < maxAttempts) {
    try {
      const getCommand = new GetInvalidationCommand({
        DistributionId: DISTRIBUTION_ID,
        Id: invalidationId
      });
      
      const result = await cloudfront.send(getCommand);
      const status = result.Invalidation.Status;
      
      console.log(`📊 Status check ${attempts + 1}: ${status}`);
      
      if (status === 'Completed') {
        console.log('✅ Invalidation completed successfully!');
        return;
      }
      
      if (status === 'InProgress') {
        console.log('⏳ Still in progress... waiting 30 seconds');
        await new Promise(resolve => setTimeout(resolve, 30000));
      }
      
      attempts++;
    } catch (error) {
      console.log(`⚠️  Error checking status: ${error.message}`);
      break;
    }
  }
  
  console.log('⏰ Stopped monitoring after maximum attempts. Invalidation may still be in progress.');
}

// Run the aggressive invalidation
aggressiveInvalidation();