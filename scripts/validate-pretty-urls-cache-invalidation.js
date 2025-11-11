#!/usr/bin/env node

/**
 * Validation script for pretty URLs cache invalidation
 * Verifies that cache invalidation was successful and pretty URLs are working
 */

const https = require('https');
const { URL } = require('url');

// Configuration
const BASE_URL = 'https://d15sc9fc739ev2.cloudfront.net';
const DISTRIBUTION_ID = 'E2IBMHQ3GCW6ZK';

// Test URLs for validation
const TEST_URLS = [
  {
    url: '/',
    description: 'Root URL serves index.html',
    expectedStatus: 200,
    expectedContentType: 'text/html',
    mustContain: ['Vivid Auto Photography', '<html']
  },
  {
    url: '/about/',
    description: 'Directory URL serves index.html',
    expectedStatus: 200,
    expectedContentType: 'text/html',
    mustContain: ['About Me', '<html']
  },
  {
    url: '/about',
    description: 'Extensionless URL works (CloudFront Function rewrite)',
    expectedStatus: 200,
    expectedContentType: 'text/html',
    mustContain: ['About Me', '<html']
  },
  {
    url: '/contact/',
    description: 'Contact directory URL',
    expectedStatus: 200,
    expectedContentType: 'text/html',
    mustContain: ['Contact Me', '<html']
  },
  {
    url: '/contact',
    description: 'Contact extensionless URL',
    expectedStatus: 200,
    expectedContentType: 'text/html',
    mustContain: ['Contact Me', '<html']
  },
  {
    url: '/privacy-policy/',
    description: 'Privacy policy directory URL',
    expectedStatus: 200,
    expectedContentType: 'text/html',
    mustContain: ['Privacy Policy', '<html']
  },
  {
    url: '/privacy-policy',
    description: 'Privacy policy extensionless URL',
    expectedStatus: 200,
    expectedContentType: 'text/html',
    mustContain: ['Privacy Policy', '<html']
  },
  {
    url: '/about/index.html',
    description: 'Explicit file path (backward compatibility)',
    expectedStatus: 200,
    expectedContentType: 'text/html',
    mustContain: ['About Me', '<html']
  },
  {
    url: '/contact/index.html',
    description: 'Explicit contact file path',
    expectedStatus: 200,
    expectedContentType: 'text/html',
    mustContain: ['Contact Me', '<html']
  }
];

console.log('🧪 Pretty URLs Cache Invalidation Validation');
console.log('============================================\n');

console.log(`🌐 Base URL: ${BASE_URL}`);
console.log(`📡 Distribution: ${DISTRIBUTION_ID}`);
console.log(`🔍 Testing ${TEST_URLS.length} URLs...\n`);

/**
 * Make HTTP request and return response details
 */
function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    
    const options = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || 443,
      path: parsedUrl.pathname + parsedUrl.search,
      method: 'GET',
      headers: {
        'User-Agent': 'Pretty-URLs-Validator/1.0',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      },
      timeout: 10000
    };

    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data,
          url: url
        });
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.end();
  });
}

/**
 * Validate a single URL
 */
async function validateUrl(testCase) {
  const fullUrl = BASE_URL + testCase.url;
  
  try {
    console.log(`🔗 Testing: ${testCase.url}`);
    console.log(`   Description: ${testCase.description}`);
    
    const response = await makeRequest(fullUrl);
    
    const results = {
      url: testCase.url,
      fullUrl: fullUrl,
      description: testCase.description,
      passed: true,
      issues: []
    };
    
    // Check status code
    if (response.statusCode !== testCase.expectedStatus) {
      results.passed = false;
      results.issues.push(`Expected status ${testCase.expectedStatus}, got ${response.statusCode}`);
    }
    
    // Check content type
    const contentType = response.headers['content-type'] || '';
    if (!contentType.includes(testCase.expectedContentType)) {
      results.passed = false;
      results.issues.push(`Expected content-type to contain '${testCase.expectedContentType}', got '${contentType}'`);
    }
    
    // Check required content
    if (testCase.mustContain) {
      for (const requiredText of testCase.mustContain) {
        if (!response.body.includes(requiredText)) {
          results.passed = false;
          results.issues.push(`Response body missing required text: '${requiredText}'`);
        }
      }
    }
    
    // Log results
    if (results.passed) {
      console.log(`   ✅ PASS - Status: ${response.statusCode}, Content-Type: ${contentType.split(';')[0]}`);
    } else {
      console.log(`   ❌ FAIL - Issues found:`);
      results.issues.forEach(issue => {
        console.log(`      • ${issue}`);
      });
    }
    
    // Additional info
    console.log(`   📊 Response size: ${response.body.length} bytes`);
    
    // Check for CloudFront headers
    if (response.headers['x-amz-cf-id']) {
      console.log(`   🌐 CloudFront ID: ${response.headers['x-amz-cf-id']}`);
    }
    
    if (response.headers['x-cache']) {
      console.log(`   💾 Cache status: ${response.headers['x-cache']}`);
    }
    
    console.log('');
    
    return results;
    
  } catch (error) {
    console.log(`   ❌ ERROR - ${error.message}\n`);
    
    return {
      url: testCase.url,
      fullUrl: fullUrl,
      description: testCase.description,
      passed: false,
      issues: [`Request failed: ${error.message}`]
    };
  }
}

/**
 * Run all validations
 */
async function runValidation() {
  const results = [];
  let passedCount = 0;
  let failedCount = 0;
  
  console.log('🚀 Starting validation tests...\n');
  
  for (const testCase of TEST_URLS) {
    const result = await validateUrl(testCase);
    results.push(result);
    
    if (result.passed) {
      passedCount++;
    } else {
      failedCount++;
    }
    
    // Small delay between requests to be respectful
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  // Summary
  console.log('📊 Validation Summary');
  console.log('====================');
  console.log(`✅ Passed: ${passedCount}/${TEST_URLS.length}`);
  console.log(`❌ Failed: ${failedCount}/${TEST_URLS.length}`);
  console.log('');
  
  if (failedCount > 0) {
    console.log('❌ Failed Tests:');
    results.filter(r => !r.passed).forEach(result => {
      console.log(`   • ${result.url} - ${result.description}`);
      result.issues.forEach(issue => {
        console.log(`     - ${issue}`);
      });
    });
    console.log('');
  }
  
  // Recommendations
  console.log('💡 Recommendations:');
  
  if (failedCount === 0) {
    console.log('   🎉 All tests passed! Pretty URLs cache invalidation was successful.');
    console.log('   ✨ Your CloudFront configuration is working correctly.');
  } else {
    console.log('   ⚠️  Some tests failed. This could indicate:');
    console.log('      1. Cache invalidation is still propagating (wait 5-15 minutes)');
    console.log('      2. CloudFront Function is not properly attached');
    console.log('      3. Default root object is not configured correctly');
    console.log('      4. S3 bucket content is missing or incorrect');
    console.log('');
    console.log('   🔧 Troubleshooting steps:');
    console.log('      1. Wait 10-15 minutes and run validation again');
    console.log('      2. Check CloudFront Function is attached to viewer-request');
    console.log('      3. Verify default root object is set to "index.html"');
    console.log('      4. Check S3 bucket has the required index.html files');
  }
  
  console.log('');
  console.log('🔍 Additional Checks:');
  console.log('   • CloudFront Console: https://console.aws.amazon.com/cloudfront/');
  console.log(`   • Distribution: ${DISTRIBUTION_ID}`);
  console.log('   • Check invalidation status in AWS Console');
  console.log('   • Monitor CloudWatch metrics for errors');
  
  return {
    totalTests: TEST_URLS.length,
    passed: passedCount,
    failed: failedCount,
    success: failedCount === 0,
    results: results
  };
}

/**
 * Main execution
 */
async function main() {
  try {
    const validationResults = await runValidation();
    
    if (validationResults.success) {
      console.log('\n🎉 Validation completed successfully!');
      process.exit(0);
    } else {
      console.log('\n⚠️  Validation completed with failures.');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('\n💥 Validation failed with error:', error.message);
    process.exit(1);
  }
}

// Export for use in other scripts
module.exports = {
  validateUrl,
  runValidation,
  TEST_URLS,
  BASE_URL
};

// Run if called directly
if (require.main === module) {
  main();
}