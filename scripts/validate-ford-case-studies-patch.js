#!/usr/bin/env node

/**
 * Ford Case Studies Image Authority & De-duplication Validation
 * Validates implementation against the Kiro Patch requirements
 */

const fs = require('fs');
const path = require('path');

// Patch requirements mapping
const CANONICAL_IMAGE_MAPPING = {
  'ebay-model-ford-collection-part-1': {
    hero: '240617-Model_Car_Collection-91 (1).jpg',
    allowedBodyImages: [
      '240708-Model_Car_Collection-69 (1).jpg',
      '240617-Model_Car_Collection-66 (1).jpg'
    ],
    purpose: 'Inventory, photography quality, physical assets'
  },
  'ebay-photography-workflow-part-2': {
    hero: '240616-Model_Car_Collection-10 (1).jpg',
    allowedBodyImages: [
      'WhatsApp Image 2025-07-05 at 9.00.50 PM.jpg'
    ],
    purpose: 'Process efficiency and listing quality'
  },
  'ebay-model-car-sales-timing-bundles': {
    hero: '240708-Model_Car_Collection-21 (1).jpg',
    allowedBodyImages: [
      'Screenshot 2025-07-04 211333.webp',
      'image (1).jpg',
      'Screenshot 2025-07-04 193922 (1).webp'
    ],
    purpose: 'Conversion strategy and combined postage'
  },
  'ebay-repeat-buyers-part-4': {
    hero: '240804-Model_Car_Collection-46 (1).jpg',
    allowedBodyImages: [
      'WhatsApp Image 2025-07-04 at 8.44.20 PM (1).jpg',
      'WhatsApp Image 2025-07-06 at 9.09.08 PM.jpeg'
    ],
    purpose: 'Social proof and customer confidence'
  },
  'ebay-business-side-part-5': {
    hero: '240620-Model_Car_Collection-96 (1).jpg',
    allowedBodyImages: [
      'image (2).jpg',
      'Screenshot 2025-07-04 193922 (1).webp',
      'ezgif-675443f33cc2e4.webp'
    ],
    purpose: 'Financial tracking and risk management'
  }
};

class FordCaseStudiesValidator {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.successes = [];
    this.imageUsageMap = new Map();
  }

  log(type, message) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${type.toUpperCase()}: ${message}`;
    
    switch (type) {
      case 'error':
        this.errors.push(message);
        console.error(`❌ ${logMessage}`);
        break;
      case 'warning':
        this.warnings.push(message);
        console.warn(`⚠️  ${logMessage}`);
        break;
      case 'success':
        this.successes.push(message);
        console.log(`✅ ${logMessage}`);
        break;
      default:
        console.log(`ℹ️  ${logMessage}`);
    }
  }

  async validateFordCaseStudies() {
    this.log('info', 'Starting Ford Case Studies validation...');

    // Check each Ford case study file
    for (const [slug, requirements] of Object.entries(CANONICAL_IMAGE_MAPPING)) {
      await this.validateCaseStudy(slug, requirements);
    }

    // Check for duplicate images across articles
    this.validateNoDuplicateImages();

    // Generate report
    this.generateReport();
  }

  async validateCaseStudy(slug, requirements) {
    const filePath = path.join('src/content/blog', `${slug}.ts`);
    
    if (!fs.existsSync(filePath)) {
      this.log('error', `File not found: ${filePath}`);
      return;
    }

    const content = fs.readFileSync(filePath, 'utf8');
    
    // Extract hero image
    const heroMatch = content.match(/image:\s*['"`]([^'"`]+)['"`]/);
    const heroImage = heroMatch ? heroMatch[1].replace('/images/blog/', '') : null;

    // Extract all body images
    const bodyImageMatches = content.matchAll(/<img[^>]+src=['"`]\/images\/blog\/([^'"`]+)['"`]/g);
    const bodyImages = Array.from(bodyImageMatches, match => match[1]);

    this.log('info', `Validating ${slug}...`);

    // Validate hero image
    if (heroImage === requirements.hero) {
      this.log('success', `${slug}: Hero image correct (${heroImage})`);
    } else {
      this.log('error', `${slug}: Hero image mismatch. Expected: ${requirements.hero}, Found: ${heroImage}`);
    }

    // Check hero image doesn't appear in body
    if (bodyImages.includes(heroImage)) {
      this.log('error', `${slug}: Hero image appears in body content (violates isolation rule)`);
    } else {
      this.log('success', `${slug}: Hero image properly isolated`);
    }

    // Validate body images are allowed
    const unauthorizedImages = bodyImages.filter(img => !requirements.allowedBodyImages.includes(img));
    if (unauthorizedImages.length > 0) {
      this.log('error', `${slug}: Unauthorized body images: ${unauthorizedImages.join(', ')}`);
    } else {
      this.log('success', `${slug}: All body images authorized`);
    }

    // Track image usage for duplicate detection
    const allImages = [heroImage, ...bodyImages].filter(Boolean);
    allImages.forEach(img => {
      if (!this.imageUsageMap.has(img)) {
        this.imageUsageMap.set(img, []);
      }
      this.imageUsageMap.get(img).push(slug);
    });

    // Check for captions on body images
    const imagesWithCaptions = (content.match(/<img[^>]*\/>\s*<p><em>[^<]+<\/em><\/p>/g) || []).length;
    const totalBodyImages = bodyImages.length;
    
    if (imagesWithCaptions >= totalBodyImages) {
      this.log('success', `${slug}: All images have contextual captions`);
    } else {
      this.log('warning', `${slug}: Some images may be missing captions (${imagesWithCaptions}/${totalBodyImages})`);
    }
  }

  validateNoDuplicateImages() {
    this.log('info', 'Checking for duplicate image usage...');

    let duplicatesFound = false;
    for (const [image, usages] of this.imageUsageMap.entries()) {
      if (usages.length > 1) {
        this.log('error', `Image ${image} used in multiple articles: ${usages.join(', ')}`);
        duplicatesFound = true;
      }
    }

    if (!duplicatesFound) {
      this.log('success', 'No duplicate images found across Ford case studies');
    }
  }

  generateReport() {
    console.log('\n' + '='.repeat(60));
    console.log('FORD CASE STUDIES VALIDATION REPORT');
    console.log('='.repeat(60));
    
    console.log(`\n✅ Successes: ${this.successes.length}`);
    console.log(`⚠️  Warnings: ${this.warnings.length}`);
    console.log(`❌ Errors: ${this.errors.length}`);

    if (this.errors.length > 0) {
      console.log('\n❌ ERRORS TO FIX:');
      this.errors.forEach((error, i) => console.log(`${i + 1}. ${error}`));
    }

    if (this.warnings.length > 0) {
      console.log('\n⚠️  WARNINGS:');
      this.warnings.forEach((warning, i) => console.log(`${i + 1}. ${warning}`));
    }

    console.log('\n' + '='.repeat(60));
    
    const success = this.errors.length === 0;
    if (success) {
      console.log('🎉 VALIDATION PASSED - Ford Case Studies comply with patch requirements!');
    } else {
      console.log('💥 VALIDATION FAILED - Please fix errors above');
    }
    return success;
  }
}

// Run validation
async function main() {
  const validator = new FordCaseStudiesValidator();
  const success = await validator.validateFordCaseStudies();
  if (!success) {
    process.exit(1);
  }
  // Exit with 0 for success
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { FordCaseStudiesValidator };