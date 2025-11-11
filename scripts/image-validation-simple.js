#!/usr/bin/env node

/**
 * Simplified Image Validation Script for SCRAM Final Deployment
 * 
 * This script validates the specific requirements:
 * 1. Hero images have priority loading (Requirement 4.3)
 * 2. All images have proper alt text (Requirement 9.3)
 * 3. No 404 errors for image requests (Requirement 9.2)
 */

const fs = require('fs');
const path = require('path');

class SimpleImageValidator {
  constructor() {
    this.results = {
      heroImagesPriority: { passed: true, issues: [] },
      altTextPresent: { passed: true, issues: [] },
      imageFilesExist: { passed: true, issues: [] }
    };
  }

  /**
   * Validate specific hero images have priority loading
   */
  validateHeroImagesPriority() {
    console.log('🔍 Validating hero images have priority loading...');
    
    const heroImageChecks = [
      {
        file: 'src/app/page.tsx',
        description: 'Homepage hero image',
        pattern: /src="\/images\/hero\/aston-martin-db6-website\.webp"[\s\S]*?priority/
      },
      {
        file: 'src/app/services/photography/page.tsx',
        description: 'Photography service hero image',
        pattern: /src='\/images\/services\/250928-hampson-auctions-sunday-11\.webp'[\s\S]*?priority/
      },
      {
        file: 'src/app/services/analytics/page.tsx',
        description: 'Analytics service hero image',
        pattern: /src='\/images\/services\/screenshot-2025-09-23-analytics-dashboard\.webp'[\s\S]*?priority/
      },
      {
        file: 'src/app/services/ad-campaigns/page.tsx',
        description: 'Ad campaigns service hero image',
        pattern: /src='\/images\/services\/ad-campaigns-hero\.webp'[\s\S]*?priority/
      }
    ];

    for (const check of heroImageChecks) {
      const filePath = path.join(process.cwd(), check.file);
      
      if (!fs.existsSync(filePath)) {
        this.results.heroImagesPriority.passed = false;
        this.results.heroImagesPriority.issues.push({
          file: check.file,
          issue: 'File not found',
          description: check.description
        });
        continue;
      }

      const content = fs.readFileSync(filePath, 'utf8');
      
      if (!check.pattern.test(content)) {
        this.results.heroImagesPriority.passed = false;
        this.results.heroImagesPriority.issues.push({
          file: check.file,
          issue: 'Hero image missing priority prop',
          description: check.description
        });
      }
    }

    if (this.results.heroImagesPriority.passed) {
      console.log('✅ All hero images have priority loading');
    } else {
      console.log(`❌ Found ${this.results.heroImagesPriority.issues.length} hero image priority issues`);
    }
  }

  /**
   * Validate key images have alt text
   */
  validateAltText() {
    console.log('🔍 Validating images have alt text...');
    
    const altTextChecks = [
      {
        file: 'src/app/page.tsx',
        description: 'Homepage hero image alt text',
        pattern: /alt="Professional automotive photography showcase[^"]*"/
      },
      {
        file: 'src/app/blog/page.tsx',
        description: 'Blog page featured post alt text',
        pattern: /alt=\{featuredPost\.title\}/
      },
      {
        file: 'src/app/blog/[slug]/page.tsx',
        description: 'Blog post image alt text',
        pattern: /alt=\{post\.title\}/
      },
      {
        file: 'src/components/sections/ServicesShowcase.tsx',
        description: 'Services showcase alt text',
        pattern: /alt=\{service\.title\}/
      }
    ];

    for (const check of altTextChecks) {
      const filePath = path.join(process.cwd(), check.file);
      
      if (!fs.existsSync(filePath)) {
        this.results.altTextPresent.passed = false;
        this.results.altTextPresent.issues.push({
          file: check.file,
          issue: 'File not found',
          description: check.description
        });
        continue;
      }

      const content = fs.readFileSync(filePath, 'utf8');
      
      if (!check.pattern.test(content)) {
        this.results.altTextPresent.passed = false;
        this.results.altTextPresent.issues.push({
          file: check.file,
          issue: 'Image missing proper alt text',
          description: check.description
        });
      }
    }

    if (this.results.altTextPresent.passed) {
      console.log('✅ All key images have proper alt text');
    } else {
      console.log(`❌ Found ${this.results.altTextPresent.issues.length} alt text issues`);
    }
  }

  /**
   * Validate critical image files exist
   */
  validateImageFilesExist() {
    console.log('🔍 Validating critical image files exist...');
    
    const criticalImages = [
      '/images/hero/aston-martin-db6-website.webp',
      '/images/services/photography-hero.webp',
      '/images/services/screenshot-2025-09-23-analytics-dashboard.webp',
      '/images/services/ad-campaigns-hero.webp',
      '/images/services/250928-hampson-auctions-sunday-11.webp',
      '/images/icons/vivid-auto-photography-logo.webp'
    ];

    for (const imagePath of criticalImages) {
      const fullPath = path.join(process.cwd(), 'public', imagePath);
      
      if (!fs.existsSync(fullPath)) {
        this.results.imageFilesExist.passed = false;
        this.results.imageFilesExist.issues.push({
          path: imagePath,
          issue: 'Critical image file not found'
        });
      }
    }

    if (this.results.imageFilesExist.passed) {
      console.log('✅ All critical image files exist');
    } else {
      console.log(`❌ Found ${this.results.imageFilesExist.issues.length} missing critical images`);
    }
  }

  /**
   * Generate validation summary
   */
  generateSummary() {
    const allPassed = 
      this.results.heroImagesPriority.passed &&
      this.results.altTextPresent.passed &&
      this.results.imageFilesExist.passed;

    console.log('\n📊 Image Validation Summary:');
    console.log(`   - Hero images priority: ${this.results.heroImagesPriority.passed ? '✅ PASSED' : '❌ FAILED'}`);
    console.log(`   - Alt text present: ${this.results.altTextPresent.passed ? '✅ PASSED' : '❌ FAILED'}`);
    console.log(`   - Image files exist: ${this.results.imageFilesExist.passed ? '✅ PASSED' : '❌ FAILED'}`);

    console.log('\n🎯 Requirements Compliance:');
    console.log(`   - Requirement 4.3 (No lazy loading on hero images): ${this.results.heroImagesPriority.passed ? '✅ PASSED' : '❌ FAILED'}`);
    console.log(`   - Requirement 9.2 (No 404 errors for images): ${this.results.imageFilesExist.passed ? '✅ PASSED' : '❌ FAILED'}`);
    console.log(`   - Requirement 9.3 (Proper alt text): ${this.results.altTextPresent.passed ? '✅ PASSED' : '❌ FAILED'}`);

    if (allPassed) {
      console.log('\n✅ All image validation requirements PASSED!');
    } else {
      console.log('\n❌ Some image validation requirements FAILED');
      
      // Show specific issues
      if (!this.results.heroImagesPriority.passed) {
        console.log('\nHero Image Priority Issues:');
        this.results.heroImagesPriority.issues.forEach(issue => {
          console.log(`   - ${issue.file}: ${issue.issue} (${issue.description})`);
        });
      }
      
      if (!this.results.altTextPresent.passed) {
        console.log('\nAlt Text Issues:');
        this.results.altTextPresent.issues.forEach(issue => {
          console.log(`   - ${issue.file}: ${issue.issue} (${issue.description})`);
        });
      }
      
      if (!this.results.imageFilesExist.passed) {
        console.log('\nMissing Image Files:');
        this.results.imageFilesExist.issues.forEach(issue => {
          console.log(`   - ${issue.path}: ${issue.issue}`);
        });
      }
    }

    return allPassed;
  }

  /**
   * Run all validations
   */
  async run() {
    console.log('🚀 Starting simplified image validation for SCRAM Final Deployment...\n');
    
    try {
      this.validateHeroImagesPriority();
      this.validateAltText();
      this.validateImageFilesExist();
      
      const allPassed = this.generateSummary();
      
      // Exit with error code if validation failed
      if (!allPassed) {
        process.exit(1);
      }
      
      return this.results;
    } catch (error) {
      console.error('❌ Image validation failed:', error.message);
      process.exit(1);
    }
  }
}

// Run validation if called directly
if (require.main === module) {
  const validator = new SimpleImageValidator();
  validator.run();
}

module.exports = SimpleImageValidator;