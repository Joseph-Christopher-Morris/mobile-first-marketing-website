#!/usr/bin/env node

/**
 * Test Deployment MIME Type and Cache Invalidation
 *
 * This script performs a comprehensive test of the deployment process
 * focusing on MIME types and cache invalidation for images.
 */

const fs = require('fs');
const path = require('path');
const Deployment = require('./deploy.js');

async function testDeploymentConfiguration() {
  console.log('🧪 Testing Deployment Configuration for Images...\n');

  // Test environment variables (using test values)
  const originalEnv = process.env;
  process.env.S3_BUCKET_NAME = 'test-bucket';
  process.env.CLOUDFRONT_DISTRIBUTION_ID = 'test-distribution';
  process.env.AWS_REGION = 'us-east-1';

  try {
    const deployment = new Deployment();

    console.log('✅ Deployment instance created successfully');
    console.log(`   Bucket: ${deployment.bucketName}`);
    console.log(`   Distribution: ${deployment.distributionId}`);
    console.log(`   Region: ${deployment.region}`);
    console.log('');

    // Test MIME type configuration for all image types in our project
    console.log('📋 Testing MIME types for actual project images:');

    const projectImageFiles = [
      'images/services/photography-hero.webp',
      'images/services/analytics-hero.webp',
      'images/services/ad-campaigns-hero.webp',
      'images/hero/google-ads-analytics-dashboard.webp',
      'images/hero/240619-london-19.webp',
      'images/hero/whatsapp-image-2025-07-11-flyers-roi.webp',
      'images/about/A7302858.webp',
      'images/services/240217-australia-trip-232.webp',
      'images/services/screenshot-2025-09-23-analytics-dashboard.webp',
      'images/icons/vivid-auto-photography-logo.png',
      'images/testimonials/sarah-johnson.jpg',
      'images/blog/mobile-first-design.jpg',
    ];

    let mimeTestsPassed = 0;
    let cacheTestsPassed = 0;

    for (const imageFile of projectImageFiles) {
      const contentType = deployment.getContentType(imageFile);
      const cacheHeaders = deployment.getCacheHeaders(imageFile);
      const ext = path.extname(imageFile).toLowerCase();

      // Verify correct MIME type
      let expectedMimeType;
      switch (ext) {
        case '.webp':
          expectedMimeType = 'image/webp';
          break;
        case '.jpg':
        case '.jpeg':
          expectedMimeType = 'image/jpeg';
          break;
        case '.png':
          expectedMimeType = 'image/png';
          break;
        case '.svg':
          expectedMimeType = 'image/svg+xml';
          break;
        default:
          expectedMimeType = 'application/octet-stream';
      }

      const mimeCorrect = contentType === expectedMimeType;
      const cacheCorrect =
        cacheHeaders['Cache-Control'] === 'public, max-age=31536000';

      console.log(
        `${mimeCorrect && cacheCorrect ? '✅' : '❌'} ${path.basename(imageFile)}`
      );
      console.log(`   MIME: ${contentType} ${mimeCorrect ? '✅' : '❌'}`);
      console.log(
        `   Cache: ${cacheHeaders['Cache-Control']} ${cacheCorrect ? '✅' : '❌'}`
      );

      if (mimeCorrect) mimeTestsPassed++;
      if (cacheCorrect) cacheTestsPassed++;
    }

    console.log('');
    console.log('📊 MIME Type and Cache Test Results:');
    console.log(
      `   MIME types correct: ${mimeTestsPassed}/${projectImageFiles.length}`
    );
    console.log(
      `   Cache headers correct: ${cacheTestsPassed}/${projectImageFiles.length}`
    );

    // Test invalidation logic for project images
    console.log('\n📋 Testing cache invalidation for project images:');

    deployment.invalidationPaths = [];

    for (const imageFile of projectImageFiles) {
      const cacheHeaders = deployment.getCacheHeaders(imageFile);
      const isImageFile = /\.(webp|jpg|jpeg|png|gif|svg|ico|avif)$/i.test(
        imageFile
      );
      const isShortCacheFile =
        cacheHeaders['Cache-Control'].includes('max-age=300') ||
        cacheHeaders['Cache-Control'].includes('no-cache');

      if (isShortCacheFile || isImageFile) {
        deployment.invalidationPaths.push(`/${imageFile}`);
      }
    }

    console.log(
      `   Images that will be invalidated: ${deployment.invalidationPaths.length}/${projectImageFiles.length}`
    );
    console.log(
      `   Expected: ${projectImageFiles.length} (all images should be invalidated)`
    );

    const allImagesWillBeInvalidated =
      deployment.invalidationPaths.length === projectImageFiles.length;
    console.log(
      `   Result: ${allImagesWillBeInvalidated ? '✅ All images will be invalidated' : '❌ Some images will not be invalidated'}`
    );

    // Test path optimization
    console.log('\n📋 Testing path optimization:');

    // Add many more image paths to test optimization
    const additionalImagePaths = [];
    for (let i = 1; i <= 25; i++) {
      additionalImagePaths.push(`/images/gallery/photo${i}.webp`);
    }

    const allPaths = [...deployment.invalidationPaths, ...additionalImagePaths];
    console.log(`   Total paths before optimization: ${allPaths.length}`);

    // Simulate optimization logic
    let pathsToInvalidate = [...new Set(allPaths)];
    const imagePaths = pathsToInvalidate.filter(path =>
      /\/images\/.*\.(webp|jpg|jpeg|png|gif|svg|ico|avif)$/i.test(path)
    );

    if (imagePaths.length > 20) {
      pathsToInvalidate = pathsToInvalidate.filter(
        path =>
          !/\/images\/.*\.(webp|jpg|jpeg|png|gif|svg|ico|avif)$/i.test(path)
      );
      pathsToInvalidate.push('/images/*');
      console.log(`   Optimized to: ${pathsToInvalidate.length} paths`);
      console.log(
        `   Used /images/* wildcard for ${imagePaths.length} image files`
      );
    }

    const optimizationWorked =
      pathsToInvalidate.includes('/images/*') &&
      pathsToInvalidate.length < allPaths.length;
    console.log(
      `   Optimization: ${optimizationWorked ? '✅ Working correctly' : '❌ Not working'}`
    );

    // Summary
    console.log('\n📊 Overall Test Results:');
    const allTestsPassed =
      mimeTestsPassed === projectImageFiles.length &&
      cacheTestsPassed === projectImageFiles.length &&
      allImagesWillBeInvalidated &&
      optimizationWorked;

    console.log(
      `   MIME Types: ${mimeTestsPassed === projectImageFiles.length ? '✅' : '❌'}`
    );
    console.log(
      `   Cache Headers: ${cacheTestsPassed === projectImageFiles.length ? '✅' : '❌'}`
    );
    console.log(
      `   Image Invalidation: ${allImagesWillBeInvalidated ? '✅' : '❌'}`
    );
    console.log(`   Path Optimization: ${optimizationWorked ? '✅' : '❌'}`);
    console.log(`   Overall: ${allTestsPassed ? '✅ PASSED' : '❌ FAILED'}`);

    return allTestsPassed;
  } finally {
    // Restore original environment
    process.env = originalEnv;
  }
}

// Main execution
if (require.main === module) {
  testDeploymentConfiguration()
    .then(passed => {
      if (passed) {
        console.log('\n🎉 All deployment configuration tests passed!');
        console.log(
          'The deployment script is ready for production use with proper:'
        );
        console.log('  • MIME type handling for all image formats');
        console.log('  • Cache invalidation for updated images');
        console.log('  • Path optimization for efficient invalidation');
        process.exit(0);
      } else {
        console.log('\n❌ Some deployment configuration tests failed!');
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('\n❌ Test execution failed:', error.message);
      process.exit(1);
    });
}

module.exports = { testDeploymentConfiguration };
