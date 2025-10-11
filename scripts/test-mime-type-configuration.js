#!/usr/bin/env node

/**
 * Test MIME Type Configuration
 *
 * This script tests the deployment script's MIME type handling
 * to ensure all image file types are configured correctly.
 */

const Deployment = require('./deploy.js');

function testMimeTypeConfiguration() {
  console.log('🧪 Testing MIME Type Configuration...\n');

  // Create a deployment instance for testing
  const deployment = new Deployment();

  // Test cases for different image file types
  const testCases = [
    { file: 'test.webp', expected: 'image/webp' },
    { file: 'test.jpg', expected: 'image/jpeg' },
    { file: 'test.jpeg', expected: 'image/jpeg' },
    { file: 'test.png', expected: 'image/png' },
    { file: 'test.gif', expected: 'image/gif' },
    { file: 'test.svg', expected: 'image/svg+xml' },
    { file: 'test.ico', expected: 'image/x-icon' },
    { file: 'test.avif', expected: 'image/avif' },
    { file: 'images/services/photo.webp', expected: 'image/webp' },
    { file: 'images/hero/background.jpg', expected: 'image/jpeg' },
    { file: 'images/icons/logo.png', expected: 'image/png' },
  ];

  let passed = 0;
  let failed = 0;

  console.log('📋 Testing MIME type mappings:');
  console.log('');

  for (const testCase of testCases) {
    const actual = deployment.getContentType(testCase.file);
    const success = actual === testCase.expected;

    if (success) {
      console.log(`✅ ${testCase.file} → ${actual}`);
      passed++;
    } else {
      console.log(
        `❌ ${testCase.file} → ${actual} (expected: ${testCase.expected})`
      );
      failed++;
    }
  }

  console.log('');
  console.log('📊 Test Results:');
  console.log(`   Passed: ${passed}`);
  console.log(`   Failed: ${failed}`);
  console.log(`   Total: ${testCases.length}`);

  if (failed === 0) {
    console.log('\n🎉 All MIME type tests passed!');
    return true;
  } else {
    console.log('\n❌ Some MIME type tests failed!');
    return false;
  }
}

// Test cache headers for images
function testCacheHeaders() {
  console.log('\n🧪 Testing Cache Headers for Images...\n');

  const deployment = new Deployment();

  const testCases = [
    {
      file: 'images/services/photo.webp',
      expectedCacheControl: 'public, max-age=31536000',
    },
    {
      file: 'images/hero/background.jpg',
      expectedCacheControl: 'public, max-age=31536000',
    },
    {
      file: 'images/icons/logo.png',
      expectedCacheControl: 'public, max-age=31536000',
    },
    {
      file: 'index.html',
      expectedCacheControl: 'public, max-age=300, must-revalidate',
    },
    {
      file: '_next/static/chunks/main.js',
      expectedCacheControl: 'public, max-age=31536000, immutable',
    },
  ];

  let passed = 0;
  let failed = 0;

  console.log('📋 Testing cache headers:');
  console.log('');

  for (const testCase of testCases) {
    const headers = deployment.getCacheHeaders(testCase.file);
    const actual = headers['Cache-Control'];
    const success = actual === testCase.expectedCacheControl;

    if (success) {
      console.log(`✅ ${testCase.file} → ${actual}`);
      passed++;
    } else {
      console.log(`❌ ${testCase.file} → ${actual}`);
      console.log(`   Expected: ${testCase.expectedCacheControl}`);
      failed++;
    }
  }

  console.log('');
  console.log('📊 Cache Header Test Results:');
  console.log(`   Passed: ${passed}`);
  console.log(`   Failed: ${failed}`);
  console.log(`   Total: ${testCases.length}`);

  if (failed === 0) {
    console.log('\n🎉 All cache header tests passed!');
    return true;
  } else {
    console.log('\n❌ Some cache header tests failed!');
    return false;
  }
}

// Main execution
if (require.main === module) {
  try {
    const mimeTestsPassed = testMimeTypeConfiguration();
    const cacheTestsPassed = testCacheHeaders();

    if (mimeTestsPassed && cacheTestsPassed) {
      console.log('\n✅ All deployment configuration tests passed!');
      console.log(
        'The deployment script is properly configured for MIME types and caching.'
      );
      process.exit(0);
    } else {
      console.log('\n❌ Some deployment configuration tests failed!');
      process.exit(1);
    }
  } catch (error) {
    console.error('\n❌ Test execution failed:', error.message);
    process.exit(1);
  }
}

module.exports = { testMimeTypeConfiguration, testCacheHeaders };
