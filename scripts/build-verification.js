#!/usr/bin/env node

/**
 * Build Verification Script
 *
 * This script validates that all required images exist in the Next.js build output
 * and implements automated checks for missing images as part of the deployment pipeline.
 *
 * Requirements: 5.1 - Build Pipeline Image Verification
 */

const fs = require('fs');
const path = require('path');

// Configuration
const BUILD_DIR = 'out';
const SOURCE_IMAGES_DIR = 'public/images';
const BUILD_IMAGES_DIR = path.join(BUILD_DIR, 'images');

// Required images based on requirements document
const REQUIRED_IMAGES = {
  // Homepage service cards
  homepage: {
    services: [
      'services/photography-hero.webp',
      'services/analytics-hero.webp',
      'services/ad-campaigns-hero.webp',
    ],
  },

  // Services pages hero images (Requirement 2)
  services: {
    photography: {
      hero: 'services/250928-hampson-auctions-sunday-11.webp',
      portfolio: [
        'services/240217-australia-trip-232.webp',
        'services/240219-australia-trip-148.webp',
        'services/240619-london-19.webp',
        'services/240619-london-26.webp',
        'services/240619-london-64.webp',
        'services/250125-liverpool-40.webp',
      ],
    },
    analytics: {
      hero: 'services/screenshot-2025-09-23-analytics-dashboard.webp',
      portfolio: [
        'services/screenshot-2025-08-12-analytics-report.webp',
        'hero/stock-photography-samira.webp',
        'services/output-5-analytics-chart.webp',
      ],
    },
    adCampaigns: {
      hero: 'services/ad-campaigns-hero.webp',
      portfolio: [
        'services/accessible-top8-campaigns-source.webp',
        'services/top-3-mediums-by-conversion-rate.webp',
        'services/screenshot-2025-08-12-analytics-report.webp',
      ],
    },
  },

  // About page (Requirement 3.1)
  about: {
    hero: 'about/A7302858.webp',
  },

  // Blog images
  blog: [
    'hero/google-ads-analytics-dashboard.webp',
    'hero/whatsapp-image-2025-07-11-flyers-roi.webp',
    'hero/240619-london-19.webp',
  ],
};

/**
 * Verification result structure
 */
class VerificationResult {
  constructor() {
    this.timestamp = new Date().toISOString();
    this.totalImages = 0;
    this.successfulImages = 0;
    this.failedImages = [];
    this.buildExists = false;
    this.sourceImageCount = 0;
    this.buildImageCount = 0;
    this.status = 'unknown';
  }
}

/**
 * Image verification details
 */
class ImageVerification {
  constructor(imagePath) {
    this.imagePath = imagePath;
    this.fileExists = false;
    this.buildIncluded = false;
    this.sourceExists = false;
    this.errorMessage = null;
  }
}

/**
 * Check if build directory exists
 */
function checkBuildExists() {
  return fs.existsSync(BUILD_DIR) && fs.existsSync(BUILD_IMAGES_DIR);
}

/**
 * Get all image files from a directory recursively
 */
function getImageFiles(directory) {
  const imageExtensions = ['.webp', '.jpg', '.jpeg', '.png', '.gif', '.svg'];
  const images = [];

  if (!fs.existsSync(directory)) {
    return images;
  }

  function scanDirectory(dir) {
    const items = fs.readdirSync(dir);

    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        scanDirectory(fullPath);
      } else if (imageExtensions.includes(path.extname(item).toLowerCase())) {
        // Get relative path from images directory
        const relativePath = path
          .relative(directory, fullPath)
          .replace(/\\/g, '/');
        images.push(relativePath);
      }
    }
  }

  scanDirectory(directory);
  return images;
}

/**
 * Flatten required images object into array
 */
function flattenRequiredImages() {
  const images = [];

  // Homepage services
  images.push(...REQUIRED_IMAGES.homepage.services);

  // Services pages
  images.push(REQUIRED_IMAGES.services.photography.hero);
  images.push(...REQUIRED_IMAGES.services.photography.portfolio);
  images.push(REQUIRED_IMAGES.services.analytics.hero);
  images.push(...REQUIRED_IMAGES.services.analytics.portfolio);
  images.push(REQUIRED_IMAGES.services.adCampaigns.hero);
  images.push(...REQUIRED_IMAGES.services.adCampaigns.portfolio);

  // About page
  images.push(REQUIRED_IMAGES.about.hero);

  // Blog images
  images.push(...REQUIRED_IMAGES.blog);

  // Remove duplicates
  return [...new Set(images)];
}

/**
 * Verify a single image
 */
function verifyImage(imagePath) {
  const verification = new ImageVerification(imagePath);

  // Check if source exists
  const sourcePath = path.join(SOURCE_IMAGES_DIR, imagePath);
  verification.sourceExists = fs.existsSync(sourcePath);

  // Check if build includes the image
  const buildPath = path.join(BUILD_IMAGES_DIR, imagePath);
  verification.buildIncluded = fs.existsSync(buildPath);
  verification.fileExists = verification.buildIncluded;

  if (!verification.sourceExists) {
    verification.errorMessage = 'Source image does not exist';
  } else if (!verification.buildIncluded) {
    verification.errorMessage = 'Image not included in build output';
  }

  return verification;
}

/**
 * Main verification function
 */
function verifyBuildImages() {
  const result = new VerificationResult();

  console.log('🔍 Starting build image verification...\n');

  // Check if build exists
  result.buildExists = checkBuildExists();
  if (!result.buildExists) {
    console.error(
      '❌ Build directory not found. Please run "npm run build" first.'
    );
    result.status = 'failed';
    return result;
  }

  console.log('✅ Build directory found');

  // Count source and build images
  result.sourceImageCount = getImageFiles(SOURCE_IMAGES_DIR).length;
  result.buildImageCount = getImageFiles(BUILD_IMAGES_DIR).length;

  console.log(`📊 Source images: ${result.sourceImageCount}`);
  console.log(`📊 Build images: ${result.buildImageCount}`);

  // Verify required images
  const requiredImages = flattenRequiredImages();
  result.totalImages = requiredImages.length;

  console.log(`\n🎯 Verifying ${result.totalImages} required images...\n`);

  for (const imagePath of requiredImages) {
    const verification = verifyImage(imagePath);

    if (verification.fileExists && verification.sourceExists) {
      result.successfulImages++;
      console.log(`✅ ${imagePath}`);
    } else {
      result.failedImages.push(verification);
      console.log(`❌ ${imagePath} - ${verification.errorMessage}`);
    }
  }

  // Determine overall status
  if (result.failedImages.length === 0) {
    result.status = 'success';
    console.log(
      `\n🎉 All ${result.totalImages} required images verified successfully!`
    );
  } else {
    result.status = 'failed';
    console.log(
      `\n💥 ${result.failedImages.length} images failed verification:`
    );
    result.failedImages.forEach(img => {
      console.log(`   - ${img.imagePath}: ${img.errorMessage}`);
    });
  }

  // Additional checks
  console.log('\n📋 Additional Checks:');

  // Check if all source images are included in build
  const sourceImages = getImageFiles(SOURCE_IMAGES_DIR);
  const buildImages = getImageFiles(BUILD_IMAGES_DIR);
  const missingInBuild = sourceImages.filter(img => !buildImages.includes(img));

  if (missingInBuild.length === 0) {
    console.log('✅ All source images included in build');
  } else {
    console.log(
      `❌ ${missingInBuild.length} source images missing from build:`
    );
    missingInBuild.forEach(img => console.log(`   - ${img}`));
  }

  // Check for unexpected images in build (not in source)
  const unexpectedInBuild = buildImages.filter(
    img => !sourceImages.includes(img)
  );
  if (unexpectedInBuild.length > 0) {
    console.log(`⚠️  ${unexpectedInBuild.length} unexpected images in build:`);
    unexpectedInBuild.forEach(img => console.log(`   - ${img}`));
  }

  return result;
}

/**
 * Save verification report
 */
function saveReport(result) {
  const reportPath = `build-verification-report-${Date.now()}.json`;
  fs.writeFileSync(reportPath, JSON.stringify(result, null, 2));
  console.log(`\n📄 Report saved to: ${reportPath}`);
  return reportPath;
}

/**
 * Main execution
 */
function main() {
  console.log('🚀 Build Image Verification Script');
  console.log('==================================\n');

  const result = verifyBuildImages();
  const reportPath = saveReport(result);

  console.log('\n📊 Summary:');
  console.log(`   Status: ${result.status.toUpperCase()}`);
  console.log(`   Total Required: ${result.totalImages}`);
  console.log(`   Successful: ${result.successfulImages}`);
  console.log(`   Failed: ${result.failedImages.length}`);
  console.log(`   Source Images: ${result.sourceImageCount}`);
  console.log(`   Build Images: ${result.buildImageCount}`);

  // Exit with appropriate code
  process.exit(result.status === 'success' ? 0 : 1);
}

// Export for testing
module.exports = {
  verifyBuildImages,
  checkBuildExists,
  getImageFiles,
  flattenRequiredImages,
  verifyImage,
  REQUIRED_IMAGES,
};

// Run if called directly
if (require.main === module) {
  main();
}
