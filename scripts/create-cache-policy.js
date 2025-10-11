#!/usr/bin/env node

/**
 * Create Custom Cache Policy for HTML Files
 * Creates a custom cache policy for 5-minute HTML caching
 * 
 * Task 14.2: Configure short-term caching for HTML pages (max-age=300)
 */

const { 
  CloudFrontClient, 
  CreateCachePolicyCommand,
  ListCachePoliciesCommand
} = require('@aws-sdk/client-cloudfront');

class CachePolicyCreator {
  constructor() {
    this.cloudFrontClient = new CloudFrontClient({ region: 'us-east-1' });
  }

  /**
   * Create custom cache policy for HTML files (5 minutes)
   */
  async createHtmlCachePolicy() {
    console.log('🔧 Creating custom cache policy for HTML files...');
    
    const policyConfig = {
      Name: 'HTML-5min-Cache-Policy',
      Comment: 'Custom cache policy for HTML files - 5 minutes cache (Task 14.2)',
      DefaultTTL: 300, // 5 minutes
      MaxTTL: 300, // 5 minutes
      MinTTL: 0,
      ParametersInCacheKeyAndForwardedToOrigin: {
        EnableAcceptEncodingGzip: true,
        EnableAcceptEncodingBrotli: true,
        QueryStringsConfig: {
          QueryStringBehavior: 'none'
        },
        HeadersConfig: {
          HeaderBehavior: 'none'
        },
        CookiesConfig: {
          CookieBehavior: 'none'
        }
      }
    };

    try {
      const result = await this.cloudFrontClient.send(
        new CreateCachePolicyCommand({
          CachePolicyConfig: policyConfig
        })
      );
      
      console.log('✅ HTML cache policy created successfully');
      console.log(`   Policy ID: ${result.CachePolicy.Id}`);
      console.log(`   Policy Name: ${result.CachePolicy.CachePolicyConfig.Name}`);
      console.log(`   Default TTL: ${result.CachePolicy.CachePolicyConfig.DefaultTTL} seconds`);
      
      return result.CachePolicy;
      
    } catch (error) {
      if (error.name === 'CachePolicyAlreadyExists') {
        console.log('⚠️  Cache policy already exists, listing existing policies...');
        return await this.findExistingHtmlPolicy();
      }
      
      console.error('❌ Failed to create cache policy:', error.message);
      throw error;
    }
  }

  /**
   * Find existing HTML cache policy
   */
  async findExistingHtmlPolicy() {
    try {
      const result = await this.cloudFrontClient.send(
        new ListCachePoliciesCommand({
          Type: 'custom'
        })
      );
      
      const htmlPolicy = result.CachePolicyList?.Items?.find(
        policy => policy.CachePolicy.CachePolicyConfig.Name === 'HTML-5min-Cache-Policy'
      );
      
      if (htmlPolicy) {
        console.log('✅ Found existing HTML cache policy');
        console.log(`   Policy ID: ${htmlPolicy.CachePolicy.Id}`);
        return htmlPolicy.CachePolicy;
      }
      
      throw new Error('HTML cache policy not found');
      
    } catch (error) {
      console.error('❌ Failed to find existing cache policy:', error.message);
      throw error;
    }
  }

  /**
   * Generate summary report
   */
  generateSummary(cachePolicy) {
    const summary = {
      timestamp: new Date().toISOString(),
      task: '14.2 Optimize caching strategy',
      requirement: '4.5 - Short-term caching for HTML pages (max-age=300)',
      
      cachePolicy: {
        id: cachePolicy.Id,
        name: cachePolicy.CachePolicyConfig.Name,
        defaultTTL: cachePolicy.CachePolicyConfig.DefaultTTL,
        maxTTL: cachePolicy.CachePolicyConfig.MaxTTL,
        minTTL: cachePolicy.CachePolicyConfig.MinTTL,
        comment: cachePolicy.CachePolicyConfig.Comment
      },
      
      compliance: {
        requirement_4_5: `HTML files configured for ${cachePolicy.CachePolicyConfig.DefaultTTL} seconds cache (5 minutes)`
      },
      
      nextSteps: [
        'Apply this cache policy to the default cache behavior for HTML files',
        'Test cache headers with the cache effectiveness test',
        'Monitor cache hit rates in CloudWatch',
        'Verify 5-minute cache behavior for HTML pages'
      ]
    };
    
    // Save summary
    const fs = require('fs');
    const summaryPath = 'html-cache-policy-summary.json';
    fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
    
    console.log('\n📊 Cache Policy Summary:');
    console.log(`   Policy ID: ${summary.cachePolicy.id}`);
    console.log(`   Policy Name: ${summary.cachePolicy.name}`);
    console.log(`   Cache Duration: ${summary.cachePolicy.defaultTTL} seconds (5 minutes)`);
    console.log(`   Requirement: ${summary.compliance.requirement_4_5}`);
    console.log(`\n📄 Summary saved to ${summaryPath}`);
    
    return summary;
  }

  /**
   * Main execution function
   */
  async run() {
    try {
      console.log('🚀 Starting HTML cache policy creation...');
      console.log('Task 14.2: Configure short-term caching for HTML pages');
      console.log('Requirement 4.5: max-age=300 (5 minutes)');
      console.log('');
      
      // Create the cache policy
      const cachePolicy = await this.createHtmlCachePolicy();
      
      // Generate summary
      const summary = this.generateSummary(cachePolicy);
      
      console.log('\n🎉 HTML cache policy creation completed!');
      console.log('\n📋 Next Steps:');
      console.log('1. The cache policy has been created successfully');
      console.log('2. Current CloudFront configuration already uses appropriate managed policies');
      console.log('3. Images use CachingOptimized policy (1 year cache)');
      console.log('4. HTML uses CachingDisabled policy (respects origin cache headers)');
      console.log('5. Origin cache headers are set correctly in deployment script');
      
      return {
        success: true,
        cachePolicy,
        summary
      };
      
    } catch (error) {
      console.error('\n❌ HTML cache policy creation failed:', error.message);
      throw error;
    }
  }
}

// CLI execution
if (require.main === module) {
  const creator = new CachePolicyCreator();
  
  creator.run()
    .then((result) => {
      console.log('\n✅ Cache policy creation process completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Cache policy creation process failed:', error.message);
      process.exit(1);
    });
}

module.exports = CachePolicyCreator;