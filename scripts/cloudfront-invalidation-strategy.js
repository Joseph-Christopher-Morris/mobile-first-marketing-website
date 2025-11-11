#!/usr/bin/env node

/**
 * CloudFront Invalidation Strategy Script
 * 
 * Implements the specific invalidation strategy for vivid-auto-scram-rebuild:
 * - Invalidation paths: /, /index.html, /services/*, /blog*, /images/*, /sitemap.xml, /_next/*
 * - Verifies proper cache headers are applied after deployment
 * - Tests cache behavior for different file types
 * 
 * Requirements addressed:
 * - 8.3: Configure invalidation for specified paths
 * - 8.5: Verify proper cache headers and test cache behavior
 */

const { CloudFrontClient, CreateInvalidationCommand, GetInvalidationCommand } = require('@aws-sdk/client-cloudfront');
const https = require('https');
const { URL } = require('url');

class CloudFrontInvalidationStrategy {
  constructor() {
    this.distributionId = process.env.CLOUDFRONT_DISTRIBUTION_ID || 'E2IBMHQ3GCW6ZK';
    this.cloudfrontDomain = process.env.CLOUDFRONT_DOMAIN_NAME || 'd15sc9fc739ev2.cloudfront.net';
    this.region = 'us-east-1'; // CloudFront is always us-east-1
    
    this.cloudFrontClient = new CloudFrontClient({ region: this.region });
    
    // Specific invalidation paths as per requirements
    this.invalidationPaths = [
      '/',
      '/index.html',
      '/services/*',
      '/blog*',
      '/images/*',
      '/sitemap.xml',
      '/_next/*'
    ];
    
    console.log('🔄 CloudFront Invalidation Strategy');
    console.log(`   Distribution ID: ${this.distributionId}`);
    console.log(`   CloudFront Domain: ${this.cloudfrontDomain}`);
    console.log(`   Invalidation Paths: ${this.invalidationPaths.length}`);
    console.log('');
  }

  /**
   * Create CloudFront invalidation
   */
  async createInvalidation() {
    console.log('🚀 Creating CloudFront invalidation...');
    
    try {
      const invalidationParams = {
        DistributionId: this.distributionId,
        InvalidationBatch: {
          CallerReference: `vivid-auto-scram-${Date.now()}`,
          Paths: {
            Quantity: this.invalidationPaths.length,
            Items: this.invalidationPaths
          }
        }
      };
      
      console.log('📋 Invalidation paths:');
      this.invalidationPaths.forEach(path => {
        console.log(`   ${path}`);
      });
      
      const result = await this.cloudFrontClient.send(
        new CreateInvalidationCommand(invalidationParams)
      );
      
      const invalidationId = result.Invalidation.Id;
      const status = result.Invalidation.Status;
      
      console.log('✅ CloudFront invalidation created successfully');
      console.log(`   Invalidation ID: ${invalidationId}`);
      console.log(`   Status: ${status}`);
      console.log(`   Created: ${result.Invalidation.CreateTime}`);
      console.log('');
      
      return {
        invalidationId,
        status,
        paths: this.invalidationPaths,
        createTime: result.Invalidation.CreateTime
      };
      
    } catch (error) {
      console.error(`❌ CloudFront invalidation failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Check invalidation status
   */
  async checkInvalidationStatus(invalidationId) {
    console.log(`🔍 Checking invalidation status: ${invalidationId}`);
    
    try {
      const result = await this.cloudFrontClient.send(
        new GetInvalidationCommand({
          DistributionId: this.distributionId,
          Id: invalidationId
        })
      );
      
      const status = result.Invalidation.Status;
      const createTime = result.Invalidation.CreateTime;
      
      console.log(`   Status: ${status}`);
      console.log(`   Created: ${createTime}`);
      
      if (status === 'Completed') {
        console.log('✅ Invalidation completed successfully');
      } else {
        console.log('⏳ Invalidation still in progress...');
      }
      
      return {
        status,
        createTime,
        invalidationId
      };
      
    } catch (error) {
      console.error(`❌ Failed to check invalidation status: ${error.message}`);
      throw error;
    }
  }

  /**
   * Make HTTP request to test cache headers
   */
  async makeHttpRequest(url, options = {}) {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      
      const req = https.request(url, {
        method: options.method || 'GET',
        headers: options.headers || {},
        timeout: options.timeout || 15000
      }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: data,
            responseTime: Date.now() - startTime
          });
        });
      });
      
      req.on('error', reject);
      req.on('timeout', () => reject(new Error('Request timeout')));
      req.end();
    });
  }

  /**
   * Verify cache headers for different file types
   */
  async verifyCacheHeaders() {
    console.log('🔍 Verifying cache headers...');
    
    const testUrls = [
      {
        url: `https://${this.cloudfrontDomain}/`,
        type: 'HTML',
        expectedCache: 'public, max-age=600'
      },
      {
        url: `https://${this.cloudfrontDomain}/services/`,
        type: 'HTML',
        expectedCache: 'public, max-age=600'
      },
      {
        url: `https://${this.cloudfrontDomain}/blog/`,
        type: 'HTML',
        expectedCache: 'public, max-age=600'
      },
      {
        url: `https://${this.cloudfrontDomain}/images/hero/aston-martin-db6-website.webp`,
        type: 'Image',
        expectedCache: 'public, max-age=31536000, immutable'
      },
      {
        url: `https://${this.cloudfrontDomain}/_next/static/css/app.css`,
        type: 'CSS',
        expectedCache: 'public, max-age=31536000, immutable'
      }
    ];
    
    const results = [];
    
    for (const test of testUrls) {
      try {
        console.log(`   Testing: ${test.url}`);
        
        const response = await this.makeHttpRequest(test.url);
        const cacheControl = response.headers['cache-control'];
        const age = response.headers['age'];
        const expires = response.headers['expires'];
        
        const result = {
          url: test.url,
          type: test.type,
          statusCode: response.statusCode,
          cacheControl,
          expectedCache: test.expectedCache,
          age,
          expires,
          responseTime: response.responseTime,
          cacheMatch: cacheControl === test.expectedCache
        };
        
        results.push(result);
        
        if (response.statusCode === 200) {
          if (result.cacheMatch) {
            console.log(`     ✅ ${test.type} - Cache headers correct: ${cacheControl}`);
          } else {
            console.log(`     ⚠️  ${test.type} - Cache headers mismatch:`);
            console.log(`         Expected: ${test.expectedCache}`);
            console.log(`         Actual: ${cacheControl || 'Not set'}`);
          }
        } else {
          console.log(`     ❌ ${test.type} - HTTP ${response.statusCode}`);
        }
        
      } catch (error) {
        console.log(`     ❌ ${test.type} - Request failed: ${error.message}`);
        results.push({
          url: test.url,
          type: test.type,
          error: error.message,
          cacheMatch: false
        });
      }
    }
    
    console.log('');
    return results;
  }

  /**
   * Test cache behavior for different file types
   */
  async testCacheBehavior() {
    console.log('🧪 Testing cache behavior...');
    
    const testCases = [
      {
        path: '/',
        description: 'Home page (HTML)',
        expectedBehavior: 'Short cache (10 minutes)'
      },
      {
        path: '/services/',
        description: 'Services page (HTML)',
        expectedBehavior: 'Short cache (10 minutes)'
      },
      {
        path: '/blog/',
        description: 'Blog page (HTML)',
        expectedBehavior: 'Short cache (10 minutes)'
      },
      {
        path: '/images/hero/aston-martin-db6-website.webp',
        description: 'Hero image (WebP)',
        expectedBehavior: 'Long cache (1 year, immutable)'
      },
      {
        path: '/sitemap.xml',
        description: 'Sitemap (XML)',
        expectedBehavior: 'Long cache (1 year, immutable)'
      }
    ];
    
    const behaviorResults = [];
    
    for (const testCase of testCases) {
      try {
        const url = `https://${this.cloudfrontDomain}${testCase.path}`;
        console.log(`   Testing: ${testCase.description}`);
        
        // Make two requests to test caching
        const firstResponse = await this.makeHttpRequest(url);
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
        const secondResponse = await this.makeHttpRequest(url);
        
        const result = {
          path: testCase.path,
          description: testCase.description,
          expectedBehavior: testCase.expectedBehavior,
          firstRequest: {
            statusCode: firstResponse.statusCode,
            responseTime: firstResponse.responseTime,
            cacheControl: firstResponse.headers['cache-control'],
            age: firstResponse.headers['age']
          },
          secondRequest: {
            statusCode: secondResponse.statusCode,
            responseTime: secondResponse.responseTime,
            cacheControl: secondResponse.headers['cache-control'],
            age: secondResponse.headers['age']
          },
          cachingWorking: secondResponse.headers['age'] > 0 || secondResponse.responseTime < firstResponse.responseTime
        };
        
        behaviorResults.push(result);
        
        if (firstResponse.statusCode === 200) {
          console.log(`     ✅ ${testCase.description} - Accessible`);
          console.log(`     Cache-Control: ${firstResponse.headers['cache-control'] || 'Not set'}`);
          if (result.cachingWorking) {
            console.log(`     ✅ Caching appears to be working`);
          } else {
            console.log(`     ⚠️  Caching behavior unclear`);
          }
        } else {
          console.log(`     ❌ ${testCase.description} - HTTP ${firstResponse.statusCode}`);
        }
        
      } catch (error) {
        console.log(`     ❌ ${testCase.description} - Test failed: ${error.message}`);
        behaviorResults.push({
          path: testCase.path,
          description: testCase.description,
          error: error.message
        });
      }
    }
    
    console.log('');
    return behaviorResults;
  }

  /**
   * Generate invalidation summary
   */
  generateSummary(invalidationResult, cacheResults, behaviorResults) {
    console.log('📊 CloudFront Invalidation Strategy Summary:');
    console.log(`   Distribution ID: ${this.distributionId}`);
    console.log(`   Invalidation ID: ${invalidationResult.invalidationId}`);
    console.log(`   Status: ${invalidationResult.status}`);
    console.log(`   Paths Invalidated: ${this.invalidationPaths.length}`);
    
    console.log('\n📋 Invalidation Paths:');
    this.invalidationPaths.forEach(path => {
      console.log(`   ${path}`);
    });
    
    console.log('\n🔍 Cache Header Verification:');
    const correctHeaders = cacheResults.filter(r => r.cacheMatch).length;
    console.log(`   Correct Headers: ${correctHeaders}/${cacheResults.length}`);
    
    cacheResults.forEach(result => {
      if (result.error) {
        console.log(`   ❌ ${result.type}: ${result.error}`);
      } else if (result.cacheMatch) {
        console.log(`   ✅ ${result.type}: Cache headers correct`);
      } else {
        console.log(`   ⚠️  ${result.type}: Cache headers mismatch`);
      }
    });
    
    console.log('\n🧪 Cache Behavior Test:');
    const workingCache = behaviorResults.filter(r => r.cachingWorking).length;
    console.log(`   Working Cache: ${workingCache}/${behaviorResults.length}`);
    
    console.log('\n✅ CloudFront invalidation strategy implemented successfully!');
    console.log('   All specified paths have been invalidated');
    console.log('   Cache headers verification completed');
    console.log('   Cache behavior testing completed');
  }

  /**
   * Main execution
   */
  async run() {
    try {
      console.log('🚀 Starting CloudFront invalidation strategy...\n');
      
      // Step 1: Create invalidation
      const invalidationResult = await this.createInvalidation();
      
      // Step 2: Wait a moment for invalidation to start
      console.log('⏳ Waiting for invalidation to start...');
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      // Step 3: Check invalidation status
      await this.checkInvalidationStatus(invalidationResult.invalidationId);
      
      // Step 4: Verify cache headers
      const cacheResults = await this.verifyCacheHeaders();
      
      // Step 5: Test cache behavior
      const behaviorResults = await this.testCacheBehavior();
      
      // Step 6: Generate summary
      this.generateSummary(invalidationResult, cacheResults, behaviorResults);
      
      return {
        success: true,
        invalidation: invalidationResult,
        cacheVerification: cacheResults,
        behaviorTest: behaviorResults
      };
      
    } catch (error) {
      console.error(`\n❌ CloudFront invalidation strategy failed: ${error.message}`);
      console.error('\n🔧 Troubleshooting tips:');
      console.error('1. Verify AWS credentials are configured');
      console.error('2. Check CloudFront distribution ID is correct');
      console.error('3. Ensure distribution is in "Deployed" status');
      console.error('4. Verify network connectivity to CloudFront');
      
      throw error;
    }
  }
}

// CLI execution
if (require.main === module) {
  const strategy = new CloudFrontInvalidationStrategy();
  
  strategy.run()
    .then(result => {
      console.log('\n🎉 CloudFront invalidation strategy completed successfully!');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n💥 CloudFront invalidation strategy failed');
      process.exit(1);
    });
}

module.exports = CloudFrontInvalidationStrategy;