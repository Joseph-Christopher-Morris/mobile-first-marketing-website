#!/usr/bin/env node

/**
 * Cache Behavior Verification Script
 * Verifies actual caching behavior by testing response times and cache hits
 * 
 * Task 14.2: Verify cache behavior and invalidation effectiveness
 */

const https = require('https');
const { URL } = require('url');

class CacheBehaviorVerifier {
  constructor() {
    this.distributionDomain = process.env.CLOUDFRONT_DOMAIN || 'd15sc9fc739ev2.cloudfront.net';
    this.baseUrl = `https://${this.distributionDomain}`;
    
    // Test files for verification
    this.testFiles = [
      '/images/about/A7302858.webp',
      '/index.html',
      '/_next/static/chunks/255-3260b6c822d7a91e.js'
    ];
  }

  /**
   * Make HTTP request and measure response time
   */
  async makeTimedRequest(url) {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      const urlObj = new URL(url);
      
      const options = {
        hostname: urlObj.hostname,
        port: 443,
        path: urlObj.pathname,
        method: 'GET',
        headers: {
          'User-Agent': 'Cache-Behavior-Verifier/1.0',
          'Cache-Control': 'no-cache' // Force fresh request
        }
      };
      
      const req = https.request(options, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          const endTime = Date.now();
          const responseTime = endTime - startTime;
          
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            responseTime,
            contentLength: data.length,
            url: url,
            cacheHit: res.headers['x-cache']?.includes('Hit') || false,
            cloudFrontPop: res.headers['x-amz-cf-pop'] || 'unknown'
          });
        });
      });
      
      req.on('error', (error) => {
        reject(error);
      });
      
      req.setTimeout(15000, () => {
        req.destroy();
        reject(new Error('Request timeout'));
      });
      
      req.end();
    });
  }

  /**
   * Test cache behavior by making multiple requests
   */
  async testCacheBehavior(url) {
    console.log(`🧪 Testing cache behavior for ${url}...`);
    
    const results = {
      url,
      requests: [],
      cacheEffective: false,
      averageResponseTime: 0,
      cacheHitRate: 0
    };
    
    try {
      // Make 3 requests to test caching
      for (let i = 1; i <= 3; i++) {
        console.log(`   Request ${i}/3...`);
        
        const result = await this.makeTimedRequest(url);
        results.requests.push({
          requestNumber: i,
          responseTime: result.responseTime,
          statusCode: result.statusCode,
          cacheHit: result.cacheHit,
          cloudFrontPop: result.cloudFrontPop,
          contentLength: result.contentLength,
          etag: result.headers.etag,
          lastModified: result.headers['last-modified'],
          xCache: result.headers['x-cache']
        });
        
        console.log(`     Response time: ${result.responseTime}ms`);
        console.log(`     Status: ${result.statusCode}`);
        console.log(`     X-Cache: ${result.headers['x-cache'] || 'not-set'}`);
        console.log(`     CloudFront POP: ${result.cloudFrontPop}`);
        
        // Wait between requests to allow caching
        if (i < 3) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }
      
      // Analyze results
      const totalResponseTime = results.requests.reduce((sum, req) => sum + req.responseTime, 0);
      results.averageResponseTime = Math.round(totalResponseTime / results.requests.length);
      
      const cacheHits = results.requests.filter(req => req.cacheHit || (req.xCache && req.xCache.includes('Hit'))).length;
      results.cacheHitRate = ((cacheHits / results.requests.length) * 100).toFixed(1);
      
      // Check if subsequent requests are faster (indicating caching)
      const firstRequestTime = results.requests[0].responseTime;
      const subsequentRequests = results.requests.slice(1);
      const averageSubsequentTime = subsequentRequests.reduce((sum, req) => sum + req.responseTime, 0) / subsequentRequests.length;
      
      results.cacheEffective = averageSubsequentTime < (firstRequestTime * 0.8); // 20% improvement indicates caching
      
      console.log(`   📊 Average response time: ${results.averageResponseTime}ms`);
      console.log(`   📊 Cache hit rate: ${results.cacheHitRate}%`);
      console.log(`   📊 Cache effective: ${results.cacheEffective ? 'Yes' : 'No'}`);
      console.log('');
      
      return results;
      
    } catch (error) {
      console.error(`   ❌ Test failed: ${error.message}`);
      results.error = error.message;
      return results;
    }
  }

  /**
   * Verify CloudFront cache policies are working
   */
  async verifyCachePolicies() {
    console.log('🔍 Verifying CloudFront cache policies...');
    
    const testResults = {
      timestamp: new Date().toISOString(),
      baseUrl: this.baseUrl,
      tests: [],
      summary: {
        totalTests: 0,
        effectiveCache: 0,
        averageCacheHitRate: 0,
        overallEffective: false
      }
    };
    
    // Test each file type
    for (const testFile of this.testFiles) {
      const url = `${this.baseUrl}${testFile}`;
      const result = await this.testCacheBehavior(url);
      testResults.tests.push(result);
      testResults.summary.totalTests++;
      
      if (result.cacheEffective) {
        testResults.summary.effectiveCache++;
      }
    }
    
    // Calculate overall metrics
    const totalCacheHitRate = testResults.tests.reduce((sum, test) => sum + parseFloat(test.cacheHitRate || 0), 0);
    testResults.summary.averageCacheHitRate = (totalCacheHitRate / testResults.tests.length).toFixed(1);
    testResults.summary.overallEffective = testResults.summary.effectiveCache >= (testResults.summary.totalTests * 0.6); // 60% threshold
    
    return testResults;
  }

  /**
   * Generate verification report
   */
  generateVerificationReport(testResults) {
    console.log('📊 Cache Behavior Verification Report:');
    console.log(`   Base URL: ${testResults.baseUrl}`);
    console.log(`   Tests Performed: ${testResults.summary.totalTests}`);
    console.log(`   Effective Caching: ${testResults.summary.effectiveCache}/${testResults.summary.totalTests}`);
    console.log(`   Average Cache Hit Rate: ${testResults.summary.averageCacheHitRate}%`);
    console.log(`   Overall Effective: ${testResults.summary.overallEffective ? 'Yes' : 'No'}`);
    console.log('');
    
    // Detailed results
    console.log('📋 Detailed Test Results:');
    testResults.tests.forEach((test, index) => {
      const fileType = test.url.includes('/images/') ? 'Image' : 
                      test.url.includes('.html') ? 'HTML' : 
                      test.url.includes('/_next/') ? 'Static Asset' : 'Other';
      
      console.log(`   ${index + 1}. ${fileType}: ${test.url.split('/').pop()}`);
      console.log(`      Average Response Time: ${test.averageResponseTime}ms`);
      console.log(`      Cache Hit Rate: ${test.cacheHitRate}%`);
      console.log(`      Cache Effective: ${test.cacheEffective ? 'Yes' : 'No'}`);
      
      if (test.requests && test.requests.length > 0) {
        const firstRequest = test.requests[0];
        const lastRequest = test.requests[test.requests.length - 1];
        console.log(`      First Request: ${firstRequest.responseTime}ms`);
        console.log(`      Last Request: ${lastRequest.responseTime}ms`);
        console.log(`      Improvement: ${((firstRequest.responseTime - lastRequest.responseTime) / firstRequest.responseTime * 100).toFixed(1)}%`);
      }
      console.log('');
    });
    
    // Requirements assessment
    console.log('📋 Requirements Assessment:');
    
    const imageTest = testResults.tests.find(test => test.url.includes('/images/'));
    const htmlTest = testResults.tests.find(test => test.url.includes('.html'));
    
    if (imageTest) {
      const imagesCached = imageTest.cacheEffective || parseFloat(imageTest.cacheHitRate) > 50;
      console.log(`   ${imagesCached ? '✅' : '⚠️'} Requirement 4.4 (Images long-term caching): ${imagesCached ? 'Effective' : 'Needs attention'}`);
    }
    
    if (htmlTest) {
      const htmlCached = htmlTest.cacheEffective || parseFloat(htmlTest.cacheHitRate) > 0;
      console.log(`   ${htmlCached ? '✅' : '⚠️'} Requirement 4.5 (HTML short-term caching): ${htmlCached ? 'Effective' : 'Needs attention'}`);
    }
    
    console.log('');
    
    // Save results
    const fs = require('fs');
    const resultsPath = 'cache-behavior-verification-results.json';
    fs.writeFileSync(resultsPath, JSON.stringify(testResults, null, 2));
    console.log(`📄 Verification results saved to ${resultsPath}`);
    
    return testResults;
  }

  /**
   * Main execution function
   */
  async run() {
    const startTime = Date.now();
    
    try {
      console.log('🚀 Starting cache behavior verification...');
      console.log('Task 14.2: Verify cache behavior and invalidation effectiveness');
      console.log(`Base URL: ${this.baseUrl}`);
      console.log('');
      
      // Verify cache policies
      const testResults = await this.verifyCachePolicies();
      
      // Generate report
      this.generateVerificationReport(testResults);
      
      const duration = Math.round((Date.now() - startTime) / 1000);
      
      console.log('🎉 Cache behavior verification completed!');
      console.log(`⏱️  Duration: ${duration} seconds`);
      
      if (testResults.summary.overallEffective) {
        console.log('✅ Cache optimization is working effectively!');
      } else {
        console.log('⚠️  Cache optimization may need adjustment.');
      }
      
      return {
        success: true,
        duration,
        testResults,
        effective: testResults.summary.overallEffective
      };
      
    } catch (error) {
      console.error('\n❌ Cache behavior verification failed:', error.message);
      throw error;
    }
  }
}

// CLI execution
if (require.main === module) {
  const verifier = new CacheBehaviorVerifier();
  
  verifier.run()
    .then((result) => {
      console.log('\n✅ Cache behavior verification completed');
      process.exit(result.effective ? 0 : 1);
    })
    .catch((error) => {
      console.error('\n❌ Cache behavior verification failed:', error.message);
      process.exit(1);
    });
}

module.exports = CacheBehaviorVerifier;