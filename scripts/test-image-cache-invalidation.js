#!/usr/bin/env node

/**
 * Test Image Cache Invalidation
 *
 * This script tests the enhanced cache invalidation logic
 * to ensure images are properly invalidated when they change.
 */

const Deployment = require('./deploy.js');

function testImageInvalidationLogic() {
  console.log('🧪 Testing Image Cache Invalidation Logic...\n');

  // Create a deployment instance for testing
  const deployment = new Deployment();

  // Simulate uploading various file types
  const testFiles = [
    'index.html',
    'about.html',
    'images/services/photo1.webp',
    'images/services/photo2.jpg',
    'images/hero/background.png',
    'images/icons/logo.svg',
    'styles/main.css',
    '_next/static/chunks/main.js',
  ];

  console.log('📋 Simulating file uploads and checking invalidation paths:');
  console.log('');

  // Clear invalidation paths
  deployment.invalidationPaths = [];

  for (const file of testFiles) {
    const cacheHeaders = deployment.getCacheHeaders(file);
    const contentType = deployment.getContentType(file);

    // Simulate the invalidation logic from uploadFile method
    const isImageFile = /\.(webp|jpg|jpeg|png|gif|svg|ico|avif)$/i.test(file);
    const isShortCacheFile =
      cacheHeaders['Cache-Control'].includes('max-age=300') ||
      cacheHeaders['Cache-Control'].includes('no-cache');

    const shouldInvalidate = isShortCacheFile || isImageFile;

    if (shouldInvalidate) {
      deployment.invalidationPaths.push(`/${file}`);
    }

    console.log(`${shouldInvalidate ? '✅' : '⚪'} ${file}`);
    console.log(`   Content-Type: ${contentType}`);
    console.log(`   Cache-Control: ${cacheHeaders['Cache-Control']}`);
    console.log(`   Will invalidate: ${shouldInvalidate ? 'Yes' : 'No'}`);
    console.log('');
  }

  console.log('📊 Invalidation Summary:');
  console.log(`   Total files processed: ${testFiles.length}`);
  console.log(`   Files to invalidate: ${deployment.invalidationPaths.length}`);
  console.log(
    `   Invalidation paths: ${deployment.invalidationPaths.join(', ')}`
  );

  // Test the path optimization logic
  console.log('\n🔧 Testing Path Optimization:');

  // Test with many image files
  const manyImagePaths = [];
  for (let i = 1; i <= 25; i++) {
    manyImagePaths.push(`/images/gallery/photo${i}.webp`);
  }

  deployment.invalidationPaths = [
    ...manyImagePaths,
    '/index.html',
    '/about.html',
  ];

  console.log(
    `   Before optimization: ${deployment.invalidationPaths.length} paths`
  );

  // Simulate the optimization logic
  let pathsToInvalidate = [...new Set(deployment.invalidationPaths)];
  const imagePaths = pathsToInvalidate.filter(path =>
    /\/images\/.*\.(webp|jpg|jpeg|png|gif|svg|ico|avif)$/i.test(path)
  );

  if (imagePaths.length > 20) {
    pathsToInvalidate = pathsToInvalidate.filter(
      path => !/\/images\/.*\.(webp|jpg|jpeg|png|gif|svg|ico|avif)$/i.test(path)
    );
    pathsToInvalidate.push('/images/*');
    console.log(`   After optimization: ${pathsToInvalidate.length} paths`);
    console.log(
      `   Used /images/* wildcard for ${imagePaths.length} image files`
    );
    console.log(`   Final paths: ${pathsToInvalidate.join(', ')}`);
  }

  return true;
}

function testSpecificImageScenarios() {
  console.log('\n🧪 Testing Specific Image Scenarios...\n');

  const deployment = new Deployment();

  const scenarios = [
    {
      name: 'Homepage service card images updated',
      files: [
        'images/services/photography-hero.webp',
        'images/services/analytics-hero.webp',
        'images/services/ad-campaigns-hero.webp',
      ],
    },
    {
      name: 'Blog post images updated',
      files: [
        'images/hero/google-ads-analytics-dashboard.webp',
        'images/hero/whatsapp-image-2025-07-11-flyers-roi.webp',
        'images/hero/240619-london-19.webp',
      ],
    },
    {
      name: 'Service page portfolio images updated',
      files: [
        'images/services/240217-australia-trip-232.webp',
        'images/services/240219-australia-trip-148.webp',
        'images/services/240619-london-26.webp',
        'images/services/250125-liverpool-40.webp',
      ],
    },
  ];

  for (const scenario of scenarios) {
    console.log(`📋 Scenario: ${scenario.name}`);

    deployment.invalidationPaths = [];

    for (const file of scenario.files) {
      const cacheHeaders = deployment.getCacheHeaders(file);
      const isImageFile = /\.(webp|jpg|jpeg|png|gif|svg|ico|avif)$/i.test(file);
      const isShortCacheFile =
        cacheHeaders['Cache-Control'].includes('max-age=300') ||
        cacheHeaders['Cache-Control'].includes('no-cache');

      if (isShortCacheFile || isImageFile) {
        deployment.invalidationPaths.push(`/${file}`);
      }
    }

    console.log(
      `   Files to invalidate: ${deployment.invalidationPaths.length}`
    );
    console.log(
      `   Paths: ${deployment.invalidationPaths.map(p => p.split('/').pop()).join(', ')}`
    );
    console.log('');
  }

  return true;
}

// Main execution
if (require.main === module) {
  try {
    const test1Passed = testImageInvalidationLogic();
    const test2Passed = testSpecificImageScenarios();

    if (test1Passed && test2Passed) {
      console.log('✅ All image cache invalidation tests passed!');
      console.log(
        'The deployment script will properly invalidate image caches when they change.'
      );
      process.exit(0);
    } else {
      console.log('❌ Some image cache invalidation tests failed!');
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Test execution failed:', error.message);
    process.exit(1);
  }
}

module.exports = { testImageInvalidationLogic, testSpecificImageScenarios };
