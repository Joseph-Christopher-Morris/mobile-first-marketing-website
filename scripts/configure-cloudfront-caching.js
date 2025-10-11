#!/usr/bin/env node

/**
 * CloudFront Caching Configuration Script
 * Configures optimal caching strategies for different content types
 * 
 * Requirements addressed:
 * - 2.2: Cache behaviors for different content types
 * - 2.3: Enable compression for all text-based content
 * - Performance optimization with appropriate TTL values
 */

const { 
  CloudFrontClient, 
  CreateCachePolicyCommand,
  GetCachePolicyCommand,
  UpdateDistributionCommand,
  GetDistributionConfigCommand
} = require('@aws-sdk/client-cloudfront');

const fs = require('fs');
const path = require('path');

class CloudFrontCachingConfig {
  constructor() {
    this.cloudFrontClient = new CloudFrontClient({ 
      region: 'us-east-1' // CloudFront is global but API calls go to us-east-1
    });
    this.distributionId = process.env.CLOUDFRONT_DISTRIBUTION_ID;
    this.environment = process.env.ENVIRONMENT || 'production';
    
    if (!this.distributionId) {
      console.warn('⚠️  CLOUDFRONT_DISTRIBUTION_ID not provided, will create policies only');
    }
  }

  /**
   * Create cache policy for static assets (long cache)
   */
  async createStaticAssetsCachePolicy() {
    console.log('Creating static assets cache policy...');
    
    const policyConfig = {
      Name: `mobile-marketing-static-assets-${this.environment}`,
      Comment: 'Long-term caching for static assets (JS, CSS, images, fonts)',
      CachePolicyConfig: {
        Name: `mobile-marketing-static-assets-${this.environment}`,
        Comment: 'Optimized for static assets with versioned filenames',
        DefaultTTL: 31536000, // 1 year
        MaxTTL: 31536000,     // 1 year
        MinTTL: 31536000,     // 1 year
        
        ParametersInCacheKeyAndForwardedToOrigin: {
          EnableAcceptEncodingGzip: true,
          EnableAcceptEncodingBrotli: true,
          
          QueryStringsConfig: {
            QueryStringBehavior: 'none' // Static assets don't need query strings
          },
          
          HeadersConfig: {
            HeaderBehavior: 'whitelist',
            Headers: {
              Items: [
                'CloudFront-Is-Mobile-Viewer',
                'CloudFront-Viewer-Country'
              ]
            }
          },
          
          CookiesConfig: {
            CookieBehavior: 'none' // Static assets don't need cookies
          }
        }
      }
    };

    try {
      const result = await this.cloudFrontClient.send(
        new CreateCachePolicyCommand(policyConfig)
      );
      
      console.log('✅ Static assets cache policy created successfully');
      console.log(`Policy ID: ${result.CachePolicy.Id}`);
      
      return result.CachePolicy;
    } catch (error) {
      if (error.name === 'CachePolicyAlreadyExists') {
        console.log('⚠️  Static assets cache policy already exists, continuing...');
        return null;
      }
      throw error;
    }
  }

  /**
   * Create cache policy for HTML files (short cache)
   */
  async createHTMLCachePolicy() {
    console.log('Creating HTML cache policy...');
    
    const policyConfig = {
      Name: `mobile-marketing-html-${this.environment}`,
      Comment: 'Short-term caching for HTML files (5 minutes)',
      CachePolicyConfig: {
        Name: `mobile-marketing-html-${this.environment}`,
        Comment: 'Optimized for HTML with frequent updates',
        DefaultTTL: 300,  // 5 minutes
        MaxTTL: 86400,    // 1 day max
        MinTTL: 0,        // Allow immediate updates
        
        ParametersInCacheKeyAndForwardedToOrigin: {
          EnableAcceptEncodingGzip: true,
          EnableAcceptEncodingBrotli: true,
          
          QueryStringsConfig: {
            QueryStringBehavior: 'whitelist',
            QueryStrings: {
              Items: [
                'utm_source',
                'utm_medium', 
                'utm_campaign',
                'utm_content',
                'utm_term',
                'ref'
              ]
            }
          },
          
          HeadersConfig: {
            HeaderBehavior: 'whitelist',
            Headers: {
              Items: [
                'CloudFront-Is-Mobile-Viewer',
                'CloudFront-Viewer-Country',
                'Accept',
                'Accept-Language'
              ]
            }
          },
          
          CookiesConfig: {
            CookieBehavior: 'none' // HTML pages don't need cookies for caching
          }
        }
      }
    };

    try {
      const result = await this.cloudFrontClient.send(
        new CreateCachePolicyCommand(policyConfig)
      );
      
      console.log('✅ HTML cache policy created successfully');
      console.log(`Policy ID: ${result.CachePolicy.Id}`);
      
      return result.CachePolicy;
    } catch (error) {
      if (error.name === 'CachePolicyAlreadyExists') {
        console.log('⚠️  HTML cache policy already exists, continuing...');
        return null;
      }
      throw error;
    }
  }

  /**
   * Create cache policy for service worker (no cache)
   */
  async createServiceWorkerCachePolicy() {
    console.log('Creating service worker cache policy...');
    
    const policyConfig = {
      Name: `mobile-marketing-service-worker-${this.environment}`,
      Comment: 'No caching for service worker files',
      CachePolicyConfig: {
        Name: `mobile-marketing-service-worker-${this.environment}`,
        Comment: 'Service worker must always be fresh',
        DefaultTTL: 0,  // No cache
        MaxTTL: 0,      // No cache
        MinTTL: 0,      // No cache
        
        ParametersInCacheKeyAndForwardedToOrigin: {
          EnableAcceptEncodingGzip: true,
          EnableAcceptEncodingBrotli: true,
          
          QueryStringsConfig: {
            QueryStringBehavior: 'all' // Forward all query strings
          },
          
          HeadersConfig: {
            HeaderBehavior: 'whitelist',
            Headers: {
              Items: [
                'Accept',
                'Accept-Encoding',
                'Accept-Language',
                'Cache-Control',
                'If-Modified-Since',
                'If-None-Match'
              ]
            }
          },
          
          CookiesConfig: {
            CookieBehavior: 'none'
          }
        }
      }
    };

    try {
      const result = await this.cloudFrontClient.send(
        new CreateCachePolicyCommand(policyConfig)
      );
      
      console.log('✅ Service worker cache policy created successfully');
      console.log(`Policy ID: ${result.CachePolicy.Id}`);
      
      return result.CachePolicy;
    } catch (error) {
      if (error.name === 'CachePolicyAlreadyExists') {
        console.log('⚠️  Service worker cache policy already exists, continuing...');
        return null;
      }
      throw error;
    }
  }

  /**
   * Create cache policy for manifest files (medium cache)
   */
  async createManifestCachePolicy() {
    console.log('Creating manifest cache policy...');
    
    const policyConfig = {
      Name: `mobile-marketing-manifest-${this.environment}`,
      Comment: 'Medium-term caching for manifest files (1 day)',
      CachePolicyConfig: {
        Name: `mobile-marketing-manifest-${this.environment}`,
        Comment: 'Balanced caching for manifest files',
        DefaultTTL: 86400,  // 1 day
        MaxTTL: 86400,      // 1 day
        MinTTL: 3600,       // 1 hour minimum
        
        ParametersInCacheKeyAndForwardedToOrigin: {
          EnableAcceptEncodingGzip: true,
          EnableAcceptEncodingBrotli: true,
          
          QueryStringsConfig: {
            QueryStringBehavior: 'none'
          },
          
          HeadersConfig: {
            HeaderBehavior: 'whitelist',
            Headers: {
              Items: [
                'CloudFront-Is-Mobile-Viewer',
                'Accept'
              ]
            }
          },
          
          CookiesConfig: {
            CookieBehavior: 'none'
          }
        }
      }
    };

    try {
      const result = await this.cloudFrontClient.send(
        new CreateCachePolicyCommand(policyConfig)
      );
      
      console.log('✅ Manifest cache policy created successfully');
      console.log(`Policy ID: ${result.CachePolicy.Id}`);
      
      return result.CachePolicy;
    } catch (error) {
      if (error.name === 'CachePolicyAlreadyExists') {
        console.log('⚠️  Manifest cache policy already exists, continuing...');
        return null;
      }
      throw error;
    }
  }

  /**
   * Generate optimized cache behaviors
   */
  generateCacheBehaviors(policies) {
    const behaviors = [];
    
    // Next.js static assets - highest priority, longest cache
    if (policies.staticAssets) {
      behaviors.push({
        PathPattern: '/_next/static/*',
        TargetOriginId: 's3-private-origin',
        ViewerProtocolPolicy: 'redirect-to-https',
        AllowedMethods: {
          Quantity: 2,
          Items: ['GET', 'HEAD'],
          CachedMethods: {
            Quantity: 2,
            Items: ['GET', 'HEAD']
          }
        },
        Compress: true,
        CachePolicyId: policies.staticAssets.Id,
        OriginRequestPolicyId: '88a5eaf4-2fd4-4709-b370-b4c650ea3fcf', // Managed-CORS-S3Origin
        ResponseHeadersPolicyId: '67f7725c-6f97-4210-82d7-5512b31e9d03' // Managed-SecurityHeadersPolicy
      });
    }
    
    // Static assets (images, fonts, etc.) - long cache
    if (policies.staticAssets) {
      behaviors.push({
        PathPattern: '*.{js,css,png,jpg,jpeg,gif,ico,svg,woff,woff2,ttf,eot,webp,avif}',
        TargetOriginId: 's3-private-origin',
        ViewerProtocolPolicy: 'redirect-to-https',
        AllowedMethods: {
          Quantity: 2,
          Items: ['GET', 'HEAD'],
          CachedMethods: {
            Quantity: 2,
            Items: ['GET', 'HEAD']
          }
        },
        Compress: true,
        CachePolicyId: policies.staticAssets.Id,
        OriginRequestPolicyId: '88a5eaf4-2fd4-4709-b370-b4c650ea3fcf',
        ResponseHeadersPolicyId: '67f7725c-6f97-4210-82d7-5512b31e9d03'
      });
    }
    
    // HTML files - short cache
    if (policies.html) {
      behaviors.push({
        PathPattern: '*.html',
        TargetOriginId: 's3-private-origin',
        ViewerProtocolPolicy: 'redirect-to-https',
        AllowedMethods: {
          Quantity: 3,
          Items: ['GET', 'HEAD', 'OPTIONS'],
          CachedMethods: {
            Quantity: 2,
            Items: ['GET', 'HEAD']
          }
        },
        Compress: true,
        CachePolicyId: policies.html.Id,
        OriginRequestPolicyId: '88a5eaf4-2fd4-4709-b370-b4c650ea3fcf',
        ResponseHeadersPolicyId: '67f7725c-6f97-4210-82d7-5512b31e9d03'
      });
    }
    
    // Service worker - no cache
    if (policies.serviceWorker) {
      behaviors.push({
        PathPattern: '/sw.js',
        TargetOriginId: 's3-private-origin',
        ViewerProtocolPolicy: 'redirect-to-https',
        AllowedMethods: {
          Quantity: 3,
          Items: ['GET', 'HEAD', 'OPTIONS'],
          CachedMethods: {
            Quantity: 2,
            Items: ['GET', 'HEAD']
          }
        },
        Compress: true,
        CachePolicyId: policies.serviceWorker.Id,
        OriginRequestPolicyId: '88a5eaf4-2fd4-4709-b370-b4c650ea3fcf',
        ResponseHeadersPolicyId: '67f7725c-6f97-4210-82d7-5512b31e9d03'
      });
    }
    
    // Manifest files - medium cache
    if (policies.manifest) {
      behaviors.push({
        PathPattern: '/manifest.json',
        TargetOriginId: 's3-private-origin',
        ViewerProtocolPolicy: 'redirect-to-https',
        AllowedMethods: {
          Quantity: 2,
          Items: ['GET', 'HEAD'],
          CachedMethods: {
            Quantity: 2,
            Items: ['GET', 'HEAD']
          }
        },
        Compress: true,
        CachePolicyId: policies.manifest.Id,
        OriginRequestPolicyId: '88a5eaf4-2fd4-4709-b370-b4c650ea3fcf',
        ResponseHeadersPolicyId: '67f7725c-6f97-4210-82d7-5512b31e9d03'
      });
    }
    
    return behaviors;
  }

  /**
   * Update distribution with caching configuration
   */
  async updateDistributionCaching(policies) {
    if (!this.distributionId) {
      console.log('⚠️  No distribution ID provided, skipping distribution update');
      return;
    }

    console.log('Updating CloudFront distribution with caching configuration...');
    
    try {
      // Get current distribution configuration
      const getConfigResult = await this.cloudFrontClient.send(
        new GetDistributionConfigCommand({ Id: this.distributionId })
      );
      
      const config = getConfigResult.DistributionConfig;
      const etag = getConfigResult.ETag;
      
      // Update default cache behavior for HTML files
      if (policies.html) {
        config.DefaultCacheBehavior.CachePolicyId = policies.html.Id;
        config.DefaultCacheBehavior.Compress = true;
      }
      
      // Update cache behaviors
      const newBehaviors = this.generateCacheBehaviors(policies);
      config.CacheBehaviors = {
        Quantity: newBehaviors.length,
        Items: newBehaviors
      };
      
      // Update the distribution
      const updateResult = await this.cloudFrontClient.send(
        new UpdateDistributionCommand({
          Id: this.distributionId,
          DistributionConfig: config,
          IfMatch: etag
        })
      );
      
      console.log('✅ CloudFront distribution updated with caching configuration');
      console.log(`Distribution Status: ${updateResult.Distribution.Status}`);
      
      return updateResult.Distribution;
      
    } catch (error) {
      console.error('❌ Failed to update distribution:', error.message);
      throw error;
    }
  }

  /**
   * Save caching configuration
   */
  async saveCachingConfig(policies) {
    const configDir = path.join(process.cwd(), 'config');
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }
    
    const cachingConfig = {
      environment: this.environment,
      distributionId: this.distributionId,
      createdAt: new Date().toISOString(),
      policies: {
        staticAssets: policies.staticAssets ? {
          id: policies.staticAssets.Id,
          name: policies.staticAssets.CachePolicyConfig.Name,
          ttl: policies.staticAssets.CachePolicyConfig.DefaultTTL
        } : null,
        html: policies.html ? {
          id: policies.html.Id,
          name: policies.html.CachePolicyConfig.Name,
          ttl: policies.html.CachePolicyConfig.DefaultTTL
        } : null,
        serviceWorker: policies.serviceWorker ? {
          id: policies.serviceWorker.Id,
          name: policies.serviceWorker.CachePolicyConfig.Name,
          ttl: policies.serviceWorker.CachePolicyConfig.DefaultTTL
        } : null,
        manifest: policies.manifest ? {
          id: policies.manifest.Id,
          name: policies.manifest.CachePolicyConfig.Name,
          ttl: policies.manifest.CachePolicyConfig.DefaultTTL
        } : null
      },
      cachingStrategies: {
        staticAssets: {
          ttl: 31536000, // 1 year
          compression: true,
          description: 'Long-term caching for versioned static assets'
        },
        htmlFiles: {
          ttl: 300, // 5 minutes
          compression: true,
          description: 'Short-term caching for HTML files'
        },
        serviceWorker: {
          ttl: 0, // No cache
          compression: true,
          description: 'No caching for service worker'
        },
        manifestFiles: {
          ttl: 86400, // 1 day
          compression: true,
          description: 'Medium-term caching for manifest files'
        }
      }
    };
    
    const configPath = path.join(configDir, 'cloudfront-caching.json');
    fs.writeFileSync(configPath, JSON.stringify(cachingConfig, null, 2));
    
    console.log(`✅ Caching configuration saved to ${configPath}`);
  }

  /**
   * Main execution function
   */
  async run() {
    try {
      console.log('⚡ Starting CloudFront caching configuration...');
      console.log(`Environment: ${this.environment}`);
      console.log(`Distribution ID: ${this.distributionId || 'Not provided'}`);
      
      // Create cache policies
      const staticAssetsPolicy = await this.createStaticAssetsCachePolicy();
      const htmlPolicy = await this.createHTMLCachePolicy();
      const serviceWorkerPolicy = await this.createServiceWorkerCachePolicy();
      const manifestPolicy = await this.createManifestCachePolicy();
      
      const policies = {
        staticAssets: staticAssetsPolicy,
        html: htmlPolicy,
        serviceWorker: serviceWorkerPolicy,
        manifest: manifestPolicy
      };
      
      // Update distribution if ID is provided
      if (this.distributionId) {
        await this.updateDistributionCaching(policies);
      }
      
      // Save configuration
      await this.saveCachingConfig(policies);
      
      console.log('\n🎉 CloudFront caching configuration completed successfully!');
      console.log('\n📋 Caching strategies configured:');
      console.log('⚡ Static assets (/_next/static/*): 1 year cache');
      console.log('⚡ Images & fonts (*.{js,css,png,jpg,...}): 1 year cache');
      console.log('⚡ HTML files (*.html): 5 minutes cache');
      console.log('⚡ Service worker (/sw.js): No cache');
      console.log('⚡ Manifest (/manifest.json): 1 day cache');
      console.log('⚡ Compression enabled for all text-based content');
      
      console.log('\n🔑 Cache Policy IDs:');
      if (staticAssetsPolicy) console.log(`Static Assets: ${staticAssetsPolicy.Id}`);
      if (htmlPolicy) console.log(`HTML Files: ${htmlPolicy.Id}`);
      if (serviceWorkerPolicy) console.log(`Service Worker: ${serviceWorkerPolicy.Id}`);
      if (manifestPolicy) console.log(`Manifest: ${manifestPolicy.Id}`);
      
      return policies;
      
    } catch (error) {
      console.error('\n❌ CloudFront caching configuration failed:', error.message);
      process.exit(1);
    }
  }
}

// Run the script if called directly
if (require.main === module) {
  const cachingConfig = new CloudFrontCachingConfig();
  cachingConfig.run();
}

module.exports = CloudFrontCachingConfig;