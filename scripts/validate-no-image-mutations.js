#!/usr/bin/env node

/**
 * Ford Series Image Congruence Guardrail Script
 * 
 * This script validates that no automation processes mutate blog images,
 * especially for the Ford case study series. It enforces the strict
 * image allocation rules and prevents clickbait mismatches.
 */

const fs = require('fs');
const path = require('path');

// Protected Ford series image paths that must NOT be mutated
const PROTECTED_FORD_IMAGES = [
  '/images/blog/240708-Model_Car_Collection-21 (1).jpg',
  '/images/blog/240804-Model_Car_Collection-46 (1).jpg', 
  '/images/blog/240620-Model_Car_Collection-96 (1).jpg',
  '/images/blog/Screenshot 2025-07-04 193922 (1).webp',
  '/images/blog/Screenshot 2025-07-04 211333.webp',
  '/images/blog/image (1).jpg',
  '/images/blog/image (2).jpg',
  '/images/blog/WhatsApp Image 2025-07-04 at 8.44.20 PM (1).jpg',
  '/images/blog/WhatsApp Image 2025-07-06 at 9.09.08 PM.jpeg',
  '/images/blog/ezgif-675443f33cc2e4.webp',
  '/images/blog/240617-Model_Car_Collection-91 (1).jpg',
  '/images/blog/WhatsApp Image 2025-07-05 at 9.00.50 PM.jpg'
];

// Ford series blog files that must maintain image congruence
const FORD_SERIES_FILES = [
  'src/content/blog/ebay-model-ford-collection-part-1.ts',
  'src/content/blog/ebay-photography-workflow-part-2.ts', 
  'src/content/blog/ebay-model-car-sales-timing-bundles.ts',
  'src/content/blog/ebay-repeat-buyers-part-4.ts',
  'src/content/blog/ebay-business-side-part-5.ts'
];

// Strict allocation rules - each image should appear in only ONE post
const STRICT_ALLOCATION = {
  'Part 3 ONLY': [
    '/images/blog/240708-Model_Car_Collection-21 (1).jpg',
    '/images/blog/image (1).jpg',
    '/images/blog/Screenshot 2025-07-04 211333.webp'
  ],
  'Part 4 ONLY': [
    '/images/blog/240804-Model_Car_Collection-46 (1).jpg',
    '/images/blog/Screenshot 2025-07-04 193922 (1).webp',
    '/images/blog/WhatsApp Image 2025-07-04 at 8.44.20 PM (1).jpg',
    '/images/blog/WhatsApp Image 2025-07-06 at 9.09.08 PM.jpeg'
  ],
  'Part 5 ONLY': [
    '/images/blog/240620-Model_Car_Collection-96 (1).jpg',
    '/images/blog/image (2).jpg',
    '/images/blog/ezgif-675443f33cc2e4.webp'
  ]
};

function validateImagePaths() {
  console.log('🔍 Validating Ford Series Image Congruence...\n');
  
  let hasViolations = false;
  const imageUsage = {};
  
  // Track image usage across all Ford series files
  FORD_SERIES_FILES.forEach(filePath => {
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  File not found: ${filePath}`);
      return;
    }
    
    const content = fs.readFileSync(filePath, 'utf8');
    const fileName = path.basename(filePath);
    
    PROTECTED_FORD_IMAGES.forEach(imagePath => {
      if (content.includes(imagePath)) {
        if (!imageUsage[imagePath]) {
          imageUsage[imagePath] = [];
        }
        imageUsage[imagePath].push(fileName);
      }
    });
  });
  
  // Check for duplicate usage violations
  Object.entries(imageUsage).forEach(([imagePath, files]) => {
    if (files.length > 1) {
      console.log(`❌ DUPLICATE IMAGE VIOLATION:`);
      console.log(`   Image: ${imagePath}`);
      console.log(`   Used in: ${files.join(', ')}`);
      console.log(`   Rule: Each proof image should appear in ONE post only\n`);
      hasViolations = true;
    }
  });
  
  // Validate strict allocation rules
  Object.entries(STRICT_ALLOCATION).forEach(([rule, images]) => {
    images.forEach(imagePath => {
      const usage = imageUsage[imagePath] || [];
      if (usage.length === 0) {
        console.log(`⚠️  Missing required image for ${rule}:`);
        console.log(`   Image: ${imagePath}`);
        console.log(`   Expected in: ${rule}\n`);
      } else if (usage.length > 1) {
        console.log(`❌ ALLOCATION VIOLATION:`);
        console.log(`   Image: ${imagePath}`);
        console.log(`   Rule: ${rule}`);
        console.log(`   Actually used in: ${usage.join(', ')}\n`);
        hasViolations = true;
      }
    });
  });
  
  // Check thumbnail-to-hero congruence
  const thumbnailHeroChecks = [
    {
      file: 'ebay-model-car-sales-timing-bundles.ts',
      expectedImage: '/images/blog/240708-Model_Car_Collection-21 (1).jpg',
      part: 'Part 3'
    },
    {
      file: 'ebay-repeat-buyers-part-4.ts', 
      expectedImage: '/images/blog/240804-Model_Car_Collection-46 (1).jpg',
      part: 'Part 4'
    },
    {
      file: 'ebay-business-side-part-5.ts',
      expectedImage: '/images/blog/240620-Model_Car_Collection-96 (1).jpg', 
      part: 'Part 5'
    }
  ];
  
  thumbnailHeroChecks.forEach(check => {
    const filePath = `src/content/blog/${check.file}`;
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Check thumbnail field
      const thumbnailMatch = content.match(/image:\s*['"`]([^'"`]+)['"`]/);
      if (thumbnailMatch && thumbnailMatch[1] !== check.expectedImage) {
        console.log(`❌ THUMBNAIL MISMATCH in ${check.part}:`);
        console.log(`   Expected: ${check.expectedImage}`);
        console.log(`   Found: ${thumbnailMatch[1]}\n`);
        hasViolations = true;
      }
    }
  });
  
  if (hasViolations) {
    console.log('💥 VALIDATION FAILED - Image congruence violations detected!');
    console.log('🚫 Deployment blocked until violations are resolved.\n');
    process.exit(1);
  } else {
    console.log('✅ Ford Series Image Congruence validation passed!');
    console.log('📸 All images properly allocated, no duplicates detected.');
    console.log('🎯 Thumbnail-to-hero congruence maintained.\n');
  }
}

function checkForImageMutations(beforeSnapshot, afterSnapshot) {
  const mutations = [];
  
  PROTECTED_FORD_IMAGES.forEach(imagePath => {
    const beforeHash = beforeSnapshot[imagePath];
    const afterHash = afterSnapshot[imagePath];
    
    if (beforeHash && afterHash && beforeHash !== afterHash) {
      mutations.push({
        path: imagePath,
        before: beforeHash,
        after: afterHash
      });
    }
  });
  
  if (mutations.length > 0) {
    console.log('🚨 IMAGE MUTATION DETECTED!');
    mutations.forEach(mutation => {
      console.log(`   File: ${mutation.path}`);
      console.log(`   Before: ${mutation.before}`);
      console.log(`   After: ${mutation.after}`);
    });
    console.log('\n💥 HARD GUARDRAIL VIOLATION - Exiting with error code');
    process.exit(1);
  }
}

// Main execution
if (require.main === module) {
  validateImagePaths();
}

module.exports = {
  validateImagePaths,
  checkForImageMutations,
  PROTECTED_FORD_IMAGES,
  STRICT_ALLOCATION
};