#!/usr/bin/env node

/**
 * Configure CloudFront to disable caching for HTML files
 * This eliminates the need for HTML invalidations while keeping static assets cached
 */

const { CloudFrontClient, GetDistributionConfigCommand, UpdateDistributionCommand } = require('@aws-sdk/client-cloudfront');

const DISTRIBUTION_ID = process.env.CLOUDFRONT_DISTRIBUTION_ID || 'E2IBMHQ3GCW6ZK';
const AWS_REGION = process.env.AWS_REGION || 'us-east-1';

const cloudfront = new CloudFrontClient({ region: AWS_REGION });

async function configureHtmlNoCache() {
  console.log('🔧 Configuring CloudFront HTML no-cache behaviors...');
  console.log(`   Distribution ID: ${DISTRIBUTION_ID}`);
  
  try {
    // Get current distribution configuration
    console.log('📋 Fetching current distribution configuration...');
    const getConfigCommand = new GetDistributionConfigCommand({
      Id: DISTRIBUTION_ID
    });
    
    const response = await cloudfront.send(getConfigCommand);
    const config = response.DistributionConfig;
    const etag = response.ETag;
    
    console.log(`   Current behaviors: ${config.CacheBehaviors?.Quantity || 0}`);
    
    // Check if HTML no-cache behaviors already exist
    const existingBehaviors = config.CacheBehaviors?.Items || [];
    const hasIndexHtml = existingBehaviors.some(b => b.PathPattern === 'index.html');
    const hasAllHtml = existingBehaviors.some(b => b.PathPattern === '*.html');
    
    if (hasIndexHtml && hasAllHtml) {
      console.log('✅ HTML no-cache behaviors already configured');
      return;
    }
    
    // Create new cache behaviors for HTML files
    const newBehaviors = [...existingBehaviors];
    
    // Create base behavior template from default behavior
    const createBehavior = (pathPattern) => ({
      PathPattern: pathPattern,
      TargetOriginId: config.DefaultCacheBehavior.TargetOriginId,
      ViewerProtocolPolicy: 'redirect-to-https',
      CachePolicyId: '4135ea2d-6df8-44a3-9df3-4b5a84be39ad', // CachingDisabled (AWS managed)
      OriginRequestPolicyId: '88a5eaf4-2fd4-4709-b370-b4c650ea3fcf', // AllViewer (AWS managed)
      Compress: true,
      SmoothStreaming: false,
      FieldLevelEncryptionId: '',
      TrustedSigners: {
        Enabled: false,
        Quantity: 0
      },
      TrustedKeyGroups: {
        Enabled: false,
        Quantity: 0
      },
      AllowedMethods: {
        Quantity: 7,
        Items: ['GET', 'HEAD', 'OPTIONS', 'PUT', 'POST', 'PATCH', 'DELETE'],
        CachedMethods: {
          Quantity: 2,
          Items: ['GET', 'HEAD']
        }
      },
      LambdaFunctionAssociations: {
        Quantity: 0
      },
      FunctionAssociations: {
        Quantity: 0
      }
    });

    // Add index.html behavior if not exists
    if (!hasIndexHtml) {
      console.log('➕ Adding index.html no-cache behavior...');
      newBehaviors.push(createBehavior('index.html'));
    }
    
    // Add *.html behavior if not exists
    if (!hasAllHtml) {
      console.log('➕ Adding *.html no-cache behavior...');
      newBehaviors.push(createBehavior('*.html'));
    }
    
    // Update distribution configuration
    const updatedConfig = {
      ...config,
      CacheBehaviors: {
        Quantity: newBehaviors.length,
        Items: newBehaviors
      }
    };
    
    console.log('🚀 Updating CloudFront distribution...');
    const updateCommand = new UpdateDistributionCommand({
      Id: DISTRIBUTION_ID,
      DistributionConfig: updatedConfig,
      IfMatch: etag
    });
    
    const updateResponse = await cloudfront.send(updateCommand);
    
    console.log('✅ CloudFront configuration updated successfully!');
    console.log(`   Distribution Status: ${updateResponse.Distribution.Status}`);
    console.log(`   Total Cache Behaviors: ${newBehaviors.length}`);
    
    console.log('\n📋 HTML Caching Configuration:');
    console.log('   • index.html: No caching (immediate updates)');
    console.log('   • *.html: No caching (immediate updates)');
    console.log('   • Static assets: Cached normally (performance)');
    
    console.log('\n🎉 Benefits:');
    console.log('   • HTML changes appear immediately');
    console.log('   • No more HTML cache invalidations needed');
    console.log('   • Static assets remain cached for performance');
    console.log('   • Faster deployments');
    
    console.log('\n⏱️  Note: Changes may take 5-15 minutes to propagate globally');
    
  } catch (error) {
    console.error('❌ Error configuring HTML no-cache:', error.message);
    
    if (error.name === 'NoSuchDistribution') {
      console.error('   Distribution not found. Check CLOUDFRONT_DISTRIBUTION_ID');
    } else if (error.name === 'AccessDenied') {
      console.error('   Access denied. Check AWS credentials and permissions');
    } else if (error.name === 'PreconditionFailed') {
      console.error('   Distribution configuration changed. Retrying...');
      // Could implement retry logic here
    }
    
    process.exit(1);
  }
}

// Validate environment
if (!DISTRIBUTION_ID) {
  console.error('❌ CLOUDFRONT_DISTRIBUTION_ID environment variable required');
  process.exit(1);
}

// Run configuration
configureHtmlNoCache().catch(error => {
  console.error('❌ Unexpected error:', error);
  process.exit(1);
});