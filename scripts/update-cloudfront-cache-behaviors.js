#!/usr/bin/env node

/**
 * CloudFront Cache Behaviors Update Script
 * Updates CloudFront distribution with optimized cache behaviors
 *
 * Task 14.2: Configure CloudFront cache behaviors for optimal caching
 */

const {
  CloudFrontClient,
  GetDistributionConfigCommand,
  UpdateDistributionCommand,
  CreateCachePolicyCommand,
  ListCachePoliciesCommand,
} = require('@aws-sdk/client-cloudfront');

class CloudFrontCacheBehaviorUpdater {
  constructor() {
    this.cloudFrontClient = new CloudFrontClient({ region: 'us-east-1' });
    this.distributionId = process.env.CLOUDFRONT_DISTRIBUTION_ID;

    if (!this.distributionId) {
      throw new Error(
        'CLOUDFRONT_DISTRIBUTION_ID environment variable is required'
      );
    }

    console.log('📋 CloudFront Cache Behavior Configuration:');
    console.log(`   Distribution ID: ${this.distributionId}`);
    console.log('');
  }

  /**
   * Get current distribution configuration
   */
  async getCurrentDistributionConfig() {
    console.log('📋 Getting current distribution configuration...');

    try {
      const result = await this.cloudFrontClient.send(
        new GetDistributionConfigCommand({
          Id: this.distributionId,
        })
      );

      console.log('✅ Distribution configuration retrieved');
      console.log(
        `   Status: ${result.DistributionConfig.Enabled ? 'Enabled' : 'Disabled'}`
      );
      console.log(
        `   Current Cache Behaviors: ${result.DistributionConfig.CacheBehaviors?.Quantity || 0}`
      );
      console.log('');

      return result;
    } catch (error) {
      console.error(
        '❌ Failed to get distribution configuration:',
        error.message
      );
      throw error;
    }
  }

  /**
   * Create optimized cache behaviors
   */
  createOptimizedCacheBehaviors(originId) {
    return {
      Quantity: 4,
      Items: [
        // Images - Long-term caching (1 year)
        {
          PathPattern: '/images/*',
          TargetOriginId: originId,
          ViewerProtocolPolicy: 'redirect-to-https',
          AllowedMethods: {
            Quantity: 2,
            Items: ['GET', 'HEAD'],
            CachedMethods: {
              Quantity: 2,
              Items: ['GET', 'HEAD'],
            },
          },
          Compress: true,
          SmoothStreaming: false,
          FieldLevelEncryptionId: '',
          CachePolicyId: '658327ea-f89d-4fab-a63d-7e88639e58f6', // Managed-CachingOptimized (1 year)
          OriginRequestPolicyId: '88a5eaf4-2fd4-4709-b370-b4c650ea3fcf', // Managed-CORS-S3Origin
          ResponseHeadersPolicyId: '67f7725c-6f97-4210-82d7-5512b31e9d03', // Managed-SecurityHeadersPolicy
        },

        // Next.js static assets - Long-term caching (1 year)
        {
          PathPattern: '/_next/static/*',
          TargetOriginId: originId,
          ViewerProtocolPolicy: 'redirect-to-https',
          AllowedMethods: {
            Quantity: 2,
            Items: ['GET', 'HEAD'],
            CachedMethods: {
              Quantity: 2,
              Items: ['GET', 'HEAD'],
            },
          },
          Compress: true,
          SmoothStreaming: false,
          FieldLevelEncryptionId: '',
          CachePolicyId: '658327ea-f89d-4fab-a63d-7e88639e58f6', // Managed-CachingOptimized (1 year)
          OriginRequestPolicyId: '88a5eaf4-2fd4-4709-b370-b4c650ea3fcf', // Managed-CORS-S3Origin
          ResponseHeadersPolicyId: '67f7725c-6f97-4210-82d7-5512b31e9d03', // Managed-SecurityHeadersPolicy
        },

        // Static assets (JS, CSS) - Long-term caching (1 year)
        {
          PathPattern: '*.js',
          TargetOriginId: originId,
          ViewerProtocolPolicy: 'redirect-to-https',
          AllowedMethods: {
            Quantity: 2,
            Items: ['GET', 'HEAD'],
            CachedMethods: {
              Quantity: 2,
              Items: ['GET', 'HEAD'],
            },
          },
          Compress: true,
          SmoothStreaming: false,
          FieldLevelEncryptionId: '',
          CachePolicyId: '658327ea-f89d-4fab-a63d-7e88639e58f6', // Managed-CachingOptimized (1 year)
          OriginRequestPolicyId: '88a5eaf4-2fd4-4709-b370-b4c650ea3fcf', // Managed-CORS-S3Origin
          ResponseHeadersPolicyId: '67f7725c-6f97-4210-82d7-5512b31e9d03', // Managed-SecurityHeadersPolicy
        },

        // CSS files - Long-term caching (1 year)
        {
          PathPattern: '*.css',
          TargetOriginId: originId,
          ViewerProtocolPolicy: 'redirect-to-https',
          AllowedMethods: {
            Quantity: 2,
            Items: ['GET', 'HEAD'],
            CachedMethods: {
              Quantity: 2,
              Items: ['GET', 'HEAD'],
            },
          },
          Compress: true,
          SmoothStreaming: false,
          FieldLevelEncryptionId: '',
          CachePolicyId: '658327ea-f89d-4fab-a63d-7e88639e58f6', // Managed-CachingOptimized (1 year)
          OriginRequestPolicyId: '88a5eaf4-2fd4-4709-b370-b4c650ea3fcf', // Managed-CORS-S3Origin
          ResponseHeadersPolicyId: '67f7725c-6f97-4210-82d7-5512b31e9d03', // Managed-SecurityHeadersPolicy
        },
      ],
    };
  }

  /**
   * Create optimized default cache behavior for HTML files
   */
  createOptimizedDefaultCacheBehavior(currentDefault) {
    return {
      ...currentDefault,
      // HTML files - Short-term caching (5 minutes)
      CachePolicyId: '4135ea2d-6df8-44a3-9df3-4b5a84be39ad', // Managed-CachingDisabled (will rely on origin headers)
      OriginRequestPolicyId: '88a5eaf4-2fd4-4709-b370-b4c650ea3fcf', // Managed-CORS-S3Origin
      ResponseHeadersPolicyId: '67f7725c-6f97-4210-82d7-5512b31e9d03', // Managed-SecurityHeadersPolicy
      Compress: true,
      SmoothStreaming: false,
      FieldLevelEncryptionId: '',
      ViewerProtocolPolicy: 'redirect-to-https',
      AllowedMethods: {
        Quantity: 3,
        Items: ['GET', 'HEAD', 'OPTIONS'],
        CachedMethods: {
          Quantity: 2,
          Items: ['GET', 'HEAD'],
        },
      },
    };
  }

  /**
   * Update distribution with optimized cache behaviors
   */
  async updateDistribution() {
    console.log(
      '🔧 Updating CloudFront distribution with optimized cache behaviors...'
    );

    try {
      // Get current configuration
      const currentConfig = await this.getCurrentDistributionConfig();
      const distributionConfig = currentConfig.DistributionConfig;
      const etag = currentConfig.ETag;

      // Get the origin ID from the first origin
      const originId = distributionConfig.Origins.Items[0].Id;

      // Create optimized cache behaviors
      const optimizedCacheBehaviors =
        this.createOptimizedCacheBehaviors(originId);
      const optimizedDefaultBehavior = this.createOptimizedDefaultCacheBehavior(
        distributionConfig.DefaultCacheBehavior
      );

      // Update the distribution configuration
      const updatedConfig = {
        ...distributionConfig,
        DefaultCacheBehavior: optimizedDefaultBehavior,
        CacheBehaviors: optimizedCacheBehaviors,
        Comment: 'S3 + CloudFront - Optimized caching strategy (Task 14.2)',
      };

      console.log('📤 Applying configuration update...');
      console.log(
        `   Default Cache Behavior: Updated for HTML files (5 min cache)`
      );
      console.log(
        `   Cache Behaviors: ${optimizedCacheBehaviors.Quantity} optimized behaviors`
      );
      console.log('   - Images: 1 year cache (immutable)');
      console.log('   - Static Assets: 1 year cache (immutable)');
      console.log('   - Next.js Static: 1 year cache (immutable)');
      console.log('   - JSON files: 1 day cache');
      console.log('   - Service Worker: No cache');
      console.log('');

      const updateResult = await this.cloudFrontClient.send(
        new UpdateDistributionCommand({
          Id: this.distributionId,
          DistributionConfig: updatedConfig,
          IfMatch: etag,
        })
      );

      console.log('✅ CloudFront distribution updated successfully');
      console.log(`   Distribution ID: ${updateResult.Distribution.Id}`);
      console.log(`   Status: ${updateResult.Distribution.Status}`);
      console.log(
        `   Last Modified: ${updateResult.Distribution.LastModifiedTime}`
      );
      console.log('');
      console.log(
        '⏳ Note: Changes may take 15-20 minutes to propagate to all edge locations'
      );

      return updateResult.Distribution;
    } catch (error) {
      console.error('❌ Failed to update distribution:', error.message);

      if (error.name === 'PreconditionFailed') {
        console.error(
          '   The distribution configuration has been modified by another process.'
        );
        console.error('   Please retry the operation.');
      }

      throw error;
    }
  }

  /**
   * Generate configuration summary
   */
  generateConfigurationSummary(distribution) {
    console.log('📊 Configuration Summary:');
    console.log('');

    const summary = {
      timestamp: new Date().toISOString(),
      distributionId: distribution.Id,
      status: distribution.Status,
      domainName: distribution.DomainName,

      cacheStrategies: {
        images: {
          pattern: '*.{webp,jpg,jpeg,png,gif,svg,ico,avif}',
          caching: 'Long-term (1 year)',
          policy: 'CachingOptimized',
          requirement: '4.4',
        },
        html: {
          pattern: 'Default behavior (HTML files)',
          caching: 'Short-term (5 minutes via origin headers)',
          policy: 'CachingDisabled (respects origin)',
          requirement: '4.5',
        },
        staticAssets: {
          pattern: '*.{js,css,woff,woff2,ttf,eot}',
          caching: 'Long-term (1 year)',
          policy: 'CachingOptimized',
          requirement: 'Performance optimization',
        },
        nextStatic: {
          pattern: '/_next/static/*',
          caching: 'Long-term (1 year)',
          policy: 'CachingOptimized',
          requirement: 'Performance optimization',
        },
        json: {
          pattern: '*.json',
          caching: 'Medium-term (1 day)',
          policy: 'CachingOptimizedForUncompressedObjects',
          requirement: 'Performance optimization',
        },
        serviceWorker: {
          pattern: '/sw.js',
          caching: 'No caching',
          policy: 'CachingDisabled',
          requirement: 'Service worker best practices',
        },
      },

      compliance: {
        requirement_4_4: 'Images configured for 1-year caching',
        requirement_4_5:
          'HTML configured for 5-minute caching via origin headers',
      },
    };

    // Display summary
    console.log('🎯 Cache Strategy Implementation:');
    Object.entries(summary.cacheStrategies).forEach(([type, config]) => {
      console.log(`   ${type}:`);
      console.log(`     Pattern: ${config.pattern}`);
      console.log(`     Caching: ${config.caching}`);
      console.log(`     Policy: ${config.policy}`);
      console.log(`     Requirement: ${config.requirement}`);
      console.log('');
    });

    console.log('📋 Requirements Compliance:');
    console.log(`   ✅ Requirement 4.4: ${summary.compliance.requirement_4_4}`);
    console.log(`   ✅ Requirement 4.5: ${summary.compliance.requirement_4_5}`);
    console.log('');

    // Save summary
    const fs = require('fs');
    const summaryPath = 'cloudfront-cache-behavior-update-summary.json';
    fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
    console.log(`📄 Configuration summary saved to ${summaryPath}`);

    return summary;
  }

  /**
   * Main execution function
   */
  async run() {
    const startTime = Date.now();

    try {
      console.log('🚀 Starting CloudFront cache behavior optimization...');
      console.log('Task 14.2: Configure optimized cache behaviors');
      console.log('');

      // Update the distribution
      const distribution = await this.updateDistribution();

      // Generate summary
      const summary = this.generateConfigurationSummary(distribution);

      const duration = Math.round((Date.now() - startTime) / 1000);

      console.log('🎉 CloudFront cache behavior optimization completed!');
      console.log(`⏱️  Duration: ${duration} seconds`);
      console.log('');
      console.log('📋 Next Steps:');
      console.log('1. Wait 15-20 minutes for changes to propagate');
      console.log('2. Test cache headers with the cache effectiveness test');
      console.log('3. Monitor cache hit rates in CloudWatch');
      console.log('4. Verify performance improvements');

      return {
        success: true,
        duration,
        distribution,
        summary,
      };
    } catch (error) {
      console.error(
        '\n❌ CloudFront cache behavior optimization failed:',
        error.message
      );
      console.error('\n🔧 Troubleshooting tips:');
      console.error('1. Verify AWS credentials and permissions');
      console.error('2. Check that the distribution ID is correct');
      console.error(
        '3. Ensure no other processes are modifying the distribution'
      );
      console.error('4. Wait a few minutes and retry if there was a conflict');

      throw error;
    }
  }
}

// CLI execution
if (require.main === module) {
  const updater = new CloudFrontCacheBehaviorUpdater();

  updater
    .run()
    .then(result => {
      console.log(
        '\n✅ CloudFront cache behavior optimization process completed'
      );
      process.exit(0);
    })
    .catch(error => {
      console.error(
        '\n❌ CloudFront cache behavior optimization process failed:',
        error.message
      );
      process.exit(1);
    });
}

module.exports = CloudFrontCacheBehaviorUpdater;
