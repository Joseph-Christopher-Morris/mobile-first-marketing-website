#!/usr/bin/env node

/**
 * CloudFront Cache Invalidation for Pretty URLs Configuration Update
 * Task 8.2.3: Perform cache invalidation for updated configuration
 * 
 * This script invalidates CloudFront cache for all paths affected by the pretty URLs
 * configuration changes, including both pretty URL paths and explicit file paths.
 */

const {
  CloudFrontClient,
  CreateInvalidationCommand,
  GetInvalidationCommand,
} = require('@aws-sdk/client-cloudfront');

// Production configuration from deployment config
const DISTRIBUTION_ID = process.env.CLOUDFRONT_DISTRIBUTION_ID || 'E2IBMHQ3GCW6ZK';
const AWS_REGION = process.env.AWS_REGION || 'us-east-1';

// Comprehensive invalidation paths for pretty URLs configuration
const INVALIDATION_PATHS = [
  // Root and index paths
  '/',
  '/index.html',
  
  // Pretty URL paths (directory style)
  '/about/',
  '/contact/',
  '/services/',
  '/blog/',
  '/privacy-policy/',
  
  // Explicit file paths that should continue working
  '/about/index.html',
  '/contact/index.html',
  '/services/index.html',
  '/blog/index.html',
  '/privacy-policy/index.html',
  
  // Extensionless URLs that will be rewritten
  '/about',
  '/contact',
  '/services',
  '/blog',
  '/privacy-policy',
  
  // Service pages (both pretty and explicit)
  '/services/photography/',
  '/services/photography/index.html',
  '/services/photography',
  '/services/analytics/',
  '/services/analytics/index.html',
  '/services/analytics',
  '/services/ad-campaigns/',
  '/services/ad-campaigns/index.html',
  '/services/ad-campaigns',
  
  // Blog posts and pages
  '/blog/*',
  
  // Wildcard for any other affected paths
  '/*'
];

console.log('🔄 CloudFront Cache Invalidation for Pretty URLs Configuration');
console.log(`📡 Distribution ID: ${DISTRIBUTION_ID}`);
console.log(`🌍 Region: ${AWS_REGION}`);
console.log(`📋 Total paths to invalidate: ${INVALIDATION_PATHS.length}`);

/**
 * Create CloudFront cache invalidation
 */
async function createInvalidation() {
  try {
    // Initialize CloudFront client
    const cloudfront = new CloudFrontClient({
      region: AWS_REGION,
      maxAttempts: 3,
      retryMode: 'adaptive'
    });

    // Create invalidation request
    const invalidationParams = {
      DistributionId: DISTRIBUTION_ID,
      InvalidationBatch: {
        Paths: {
          Quantity: INVALIDATION_PATHS.length,
          Items: INVALIDATION_PATHS,
        },
        CallerReference: `pretty-urls-config-${Date.now()}`,
      },
    };

    console.log('🚀 Creating cache invalidation request...');
    console.log('📋 Invalidating paths for pretty URLs configuration:');
    
    // Group paths by type for better logging
    const rootPaths = INVALIDATION_PATHS.filter(p => p === '/' || p === '/index.html');
    const prettyPaths = INVALIDATION_PATHS.filter(p => p.endsWith('/') && p !== '/');
    const explicitPaths = INVALIDATION_PATHS.filter(p => p.endsWith('/index.html'));
    const extensionlessPaths = INVALIDATION_PATHS.filter(p => !p.includes('.') && !p.endsWith('/') && p !== '/' && !p.includes('*'));
    const wildcardPaths = INVALIDATION_PATHS.filter(p => p.includes('*'));

    console.log(`   📁 Root paths (${rootPaths.length}):`, rootPaths.join(', '));
    console.log(`   🎯 Pretty URL paths (${prettyPaths.length}):`, prettyPaths.slice(0, 5).join(', ') + (prettyPaths.length > 5 ? '...' : ''));
    console.log(`   📄 Explicit file paths (${explicitPaths.length}):`, explicitPaths.slice(0, 5).join(', ') + (explicitPaths.length > 5 ? '...' : ''));
    console.log(`   🔗 Extensionless paths (${extensionlessPaths.length}):`, extensionlessPaths.slice(0, 5).join(', ') + (extensionlessPaths.length > 5 ? '...' : ''));
    console.log(`   🌐 Wildcard paths (${wildcardPaths.length}):`, wildcardPaths.join(', '));

    const command = new CreateInvalidationCommand(invalidationParams);
    const response = await cloudfront.send(command);

    console.log('\n✅ Cache invalidation created successfully!');
    console.log(`📋 Invalidation ID: ${response.Invalidation.Id}`);
    console.log(`📊 Status: ${response.Invalidation.Status}`);
    console.log(`🕒 Created: ${response.Invalidation.CreateTime}`);
    console.log(`📈 Paths invalidated: ${response.Invalidation.InvalidationBatch.Paths.Quantity}`);

    return {
      invalidationId: response.Invalidation.Id,
      status: response.Invalidation.Status,
      createTime: response.Invalidation.CreateTime,
      pathCount: response.Invalidation.InvalidationBatch.Paths.Quantity
    };

  } catch (error) {
    console.error('❌ Error creating cache invalidation:', error.message);

    if (error.name === 'CredentialsError' || error.message.includes('credentials')) {
      console.log('\n💡 AWS credentials not found. Please ensure:');
      console.log('   1. AWS CLI is configured: aws configure');
      console.log('   2. Environment variables are set: AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY');
      console.log('   3. IAM role has CloudFront invalidation permissions');
    } else if (error.name === 'AccessDenied' || error.message.includes('AccessDenied')) {
      console.log('\n💡 Access denied. Please check:');
      console.log('   1. IAM user/role has cloudfront:CreateInvalidation permission');
      console.log('   2. Distribution ID is correct:', DISTRIBUTION_ID);
      console.log('   3. AWS region is correct:', AWS_REGION);
    } else if (error.message.includes('TooManyInvalidationsInProgress')) {
      console.log('\n💡 Too many invalidations in progress. Please:');
      console.log('   1. Wait for current invalidations to complete');
      console.log('   2. Check AWS Console for invalidation status');
      console.log('   3. Retry in a few minutes');
    } else {
      console.log('\n💡 Please check your AWS configuration and try again.');
      console.log('   Distribution ID:', DISTRIBUTION_ID);
      console.log('   Region:', AWS_REGION);
    }

    throw error;
  }
}

/**
 * Monitor invalidation completion status
 */
async function monitorInvalidation(invalidationId) {
  try {
    const cloudfront = new CloudFrontClient({
      region: AWS_REGION,
      maxAttempts: 3,
    });

    console.log(`\n🔍 Monitoring invalidation progress: ${invalidationId}`);
    
    let attempts = 0;
    const maxAttempts = 20; // Monitor for up to 10 minutes (30s intervals)
    
    while (attempts < maxAttempts) {
      const command = new GetInvalidationCommand({
        DistributionId: DISTRIBUTION_ID,
        Id: invalidationId
      });
      
      const response = await cloudfront.send(command);
      const status = response.Invalidation.Status;
      
      console.log(`📊 Status check ${attempts + 1}/${maxAttempts}: ${status}`);
      
      if (status === 'Completed') {
        console.log('✅ Cache invalidation completed successfully!');
        console.log(`🕒 Completion time: ${new Date().toISOString()}`);
        return { status: 'Completed', attempts: attempts + 1 };
      }
      
      if (status === 'InProgress') {
        console.log('⏳ Invalidation in progress... checking again in 30 seconds');
        await new Promise(resolve => setTimeout(resolve, 30000)); // Wait 30 seconds
        attempts++;
      } else {
        console.log(`⚠️  Unexpected status: ${status}`);
        break;
      }
    }
    
    if (attempts >= maxAttempts) {
      console.log('⏰ Monitoring timeout reached. Invalidation may still be in progress.');
      console.log('💡 Check AWS Console for final status: https://console.aws.amazon.com/cloudfront/');
    }
    
    return { status: 'Monitoring timeout', attempts };
    
  } catch (error) {
    console.error('❌ Error monitoring invalidation:', error.message);
    return { status: 'Error', error: error.message };
  }
}

/**
 * Validate that pretty URLs are working after invalidation
 */
async function validatePrettyURLs() {
  console.log('\n🧪 Validating pretty URLs functionality...');
  
  const testUrls = [
    'https://d15sc9fc739ev2.cloudfront.net/',
    'https://d15sc9fc739ev2.cloudfront.net/about/',
    'https://d15sc9fc739ev2.cloudfront.net/about',
    'https://d15sc9fc739ev2.cloudfront.net/services/',
    'https://d15sc9fc739ev2.cloudfront.net/contact/',
  ];
  
  const results = [];
  
  for (const url of testUrls) {
    try {
      console.log(`🔗 Testing: ${url}`);
      
      // Note: In a real environment, you would use fetch() here
      // For now, we'll just log the URLs that should be tested
      results.push({
        url,
        status: 'pending',
        message: 'Manual validation required'
      });
      
    } catch (error) {
      results.push({
        url,
        status: 'error',
        message: error.message
      });
    }
  }
  
  console.log('\n📋 Validation Results:');
  results.forEach(result => {
    const icon = result.status === 'success' ? '✅' : result.status === 'error' ? '❌' : '⏳';
    console.log(`   ${icon} ${result.url}: ${result.message}`);
  });
  
  console.log('\n💡 Manual validation steps:');
  console.log('   1. Wait 2-3 minutes for invalidation to propagate');
  console.log('   2. Test each URL in a browser or with curl');
  console.log('   3. Verify that all URLs return the correct HTML content');
  console.log('   4. Check that pretty URLs work without /index.html');
  
  return results;
}

/**
 * Main execution function
 */
async function main() {
  try {
    console.log('🎯 Starting CloudFront cache invalidation for pretty URLs configuration...\n');
    
    // Step 1: Create invalidation
    const invalidationResult = await createInvalidation();
    
    // Step 2: Monitor completion (optional, can be skipped for faster execution)
    const shouldMonitor = process.argv.includes('--monitor');
    if (shouldMonitor) {
      await monitorInvalidation(invalidationResult.invalidationId);
    } else {
      console.log('\n⏭️  Skipping monitoring. Use --monitor flag to track completion.');
      console.log('⏱️  Cache invalidation typically takes 5-15 minutes to complete globally');
    }
    
    // Step 3: Provide validation guidance
    await validatePrettyURLs();
    
    console.log('\n🎉 Pretty URLs cache invalidation process completed!');
    console.log('🌐 Your updated CloudFront configuration should be active shortly.');
    console.log(`📋 Invalidation ID: ${invalidationResult.invalidationId}`);
    
    // Return success result
    return {
      success: true,
      invalidationId: invalidationResult.invalidationId,
      pathsInvalidated: invalidationResult.pathCount,
      distributionId: DISTRIBUTION_ID
    };
    
  } catch (error) {
    console.error('\n💥 Cache invalidation failed:', error.message);
    process.exit(1);
  }
}

// Export for use in other scripts
module.exports = {
  createInvalidation,
  monitorInvalidation,
  validatePrettyURLs,
  DISTRIBUTION_ID,
  INVALIDATION_PATHS
};

// Run if called directly
if (require.main === module) {
  main();
}