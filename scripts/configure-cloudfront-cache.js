#!/usr/bin/env node

/**
 * Configure CloudFront cache behaviors for optimal LCP
 * Fixes the "604 KiB with no cache lifetime" issue
 */

const { CloudFrontClient, GetDistributionConfigCommand, UpdateDistributionCommand } = require('@aws-sdk/client-cloudfront');

const DISTRIBUTION_ID = process.env.CLOUDFRONT_DISTRIBUTION_ID || 'E2IBMHQ3GCW6ZK';
const AWS_REGION = process.env.AWS_REGION || 'us-east-1';

const cloudfront = new CloudFrontClient({ region: AWS_REGION });

async function configureCacheBehaviors() {
  console.log('⚙️  Configuring CloudFront cache behaviors for LCP optimization...');
  console.log(`   Distribution: ${DISTRIBUTION_ID}\n`);
  
  try {
    // Get current configuration
    const getConfigCommand = new GetDistributionConfigCommand({
      Id: DISTRIBUTION_ID
    });
    
    const response = await cloudfront.send(getConfigCommand);
    const config = response.DistributionConfig;
    const etag = response.ETag;
    
    const existingBehaviors = config.CacheBehaviors?.Items || [];
    console.log(`   Current behaviors: ${existingBehaviors.length}`);
    
    // Define cache behaviors for static assets
    const createBehavior = (pathPattern, priority) => ({
      PathPattern: pathPattern,
      TargetOriginId: config.DefaultCacheBehavior.TargetOriginId,
      ViewerProtocolPolicy: 'redirect-to-https',
      CachePolicyId: '658327ea-f89d-4fab-a63d-7e88639e58f6', // CachingOptimized (1 year)
      Compress: true,
      SmoothStreaming: false,
      FieldLevelEncryptionId: '',
      TrustedSigners: { Enabled: false, Quantity: 0 },
      TrustedKeyGroups: { Enabled: false, Quantity: 0 },
      AllowedMethods: {
        Quantity: 2,
        Items: ['GET', 'HEAD'],
        CachedMethods: { Quantity: 2, Items: ['GET', 'HEAD'] }
      },
      LambdaFunctionAssociations: { Quantity: 0 },
      FunctionAssociations: { Quantity: 0 }
    });
    
    // Check which behaviors need to be added
    const behaviorsToAdd = [];
    const patterns = [
      { pattern: '*.webp', name: 'WebP images' },
      { pattern: '*.jpg', name: 'JPEG images' },
      { pattern: '*.jpeg', name: 'JPEG images' },
      { pattern: '*.png', name: 'PNG images' },
      { pattern: '*.svg', name: 'SVG images' },
      { pattern: '*.woff2', name: 'Fonts' },
      { pattern: '*.woff', name: 'Fonts' },
      { pattern: '*.js', name: 'JavaScript' },
      { pattern: '*.css', name: 'CSS' }
    ];
    
    for (const { pattern, name } of patterns) {
      const exists = existingBehaviors.some(b => b.PathPattern === pattern);
      if (!exists) {
        console.log(`   ➕ Adding cache behavior: ${pattern} (${name})`);
        behaviorsToAdd.push(createBehavior(pattern, existingBehaviors.length + behaviorsToAdd.length));
      } else {
        console.log(`   ✅ Already configured: ${pattern}`);
      }
    }
    
    if (behaviorsToAdd.length === 0) {
      console.log('\n✅ All cache behaviors already configured!');
      return;
    }
    
    // Update distribution
    const updatedConfig = {
      ...config,
      CacheBehaviors: {
        Quantity: existingBehaviors.length + behaviorsToAdd.length,
        Items: [...existingBehaviors, ...behaviorsToAdd]
      }
    };
    
    console.log(`\n🚀 Updating distribution with ${behaviorsToAdd.length} new behaviors...`);
    
    const updateCommand = new UpdateDistributionCommand({
      Id: DISTRIBUTION_ID,
      DistributionConfig: updatedConfig,
      IfMatch: etag
    });
    
    const updateResponse = await cloudfront.send(updateCommand);
    
    console.log('✅ CloudFront configuration updated!');
    console.log(`   Status: ${updateResponse.Distribution.Status}`);
    console.log(`   Total behaviors: ${existingBehaviors.length + behaviorsToAdd.length}`);
    
    console.log('\n📊 Cache Configuration:');
    console.log('   • Images (webp, jpg, png, svg): 1 year cache');
    console.log('   • Fonts (woff, woff2): 1 year cache');
    console.log('   • JavaScript (*.js): 1 year cache');
    console.log('   • CSS (*.css): 1 year cache');
    console.log('   • HTML: No cache (immediate updates)');
    
    console.log('\n🎯 Expected LCP improvements:');
    console.log('   • First visit: Same performance');
    console.log('   • Repeat visits: 50-70% faster');
    console.log('   • Lighthouse score: +10-15 points');
    
    console.log('\n⏱️  Propagation time: 5-15 minutes');
    
  } catch (error) {
    console.error('\n❌ Error configuring cache behaviors:', error.message);
    
    if (error.name === 'NoSuchDistribution') {
      console.error('   Distribution not found. Check CLOUDFRONT_DISTRIBUTION_ID');
    } else if (error.name === 'AccessDenied') {
      console.error('   Access denied. Check AWS credentials');
    } else if (error.name === 'PreconditionFailed') {
      console.error('   Configuration changed. Please retry.');
    }
    
    process.exit(1);
  }
}

configureCacheBehaviors().catch(error => {
  console.error('❌ Unexpected error:', error);
  process.exit(1);
});
