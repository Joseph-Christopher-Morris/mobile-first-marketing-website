#!/usr/bin/env node

/**
 * Build Integrity Validation Script
 * Validates that metadata is correctly generated and no errors are introduced
 */

const fs = require('fs');
const path = require('path');

class MetadataValidator {
  constructor() {
    this.buildDir = 'out';
    this.errors = [];
    this.warnings = [];
    this.validatedPages = 0;
  }

  /**
   * Main validation entry point
   */
  async validate() {
    console.log('🔍 Validating metadata in build output...\n');

    // Check if build directory exists
    if (!fs.existsSync(this.buildDir)) {
      this.errors.push(`Build directory "${this.buildDir}" does not exist`);
      this.printResults();
      process.exit(1);
    }

    // Validate HTML files
    await this.validateHtmlFiles();

    // Print results
    this.printResults();

    // Exit with error code if validation failed
    if (this.errors.length > 0) {
      process.exit(1);
    }
  }

  /**
   * Recursively find all HTML files in build directory
   */
  findHtmlFiles(dir) {
    const files = [];
    const items = fs.readdirSync(dir);

    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        files.push(...this.findHtmlFiles(fullPath));
      } else if (item.endsWith('.html')) {
        files.push(fullPath);
      }
    }

    return files;
  }

  /**
   * Validate all HTML files
   */
  async validateHtmlFiles() {
    const htmlFiles = this.findHtmlFiles(this.buildDir);

    console.log(`Found ${htmlFiles.length} HTML files to validate\n`);

    for (const file of htmlFiles) {
      await this.validateHtmlFile(file);
    }
  }

  /**
   * Validate a single HTML file
   */
  async validateHtmlFile(filePath) {
    const relativePath = path.relative(this.buildDir, filePath);
    const content = fs.readFileSync(filePath, 'utf-8');

    // Check for required metadata
    const checks = {
      title: /<title>(.+?)<\/title>/i.test(content),
      description: /<meta\s+name="description"\s+content="(.+?)"/i.test(content),
      ogTitle: /<meta\s+property="og:title"\s+content="(.+?)"/i.test(content),
      ogDescription: /<meta\s+property="og:description"\s+content="(.+?)"/i.test(content),
      ogImage: /<meta\s+property="og:image"\s+content="(.+?)"/i.test(content),
      ogUrl: /<meta\s+property="og:url"\s+content="(.+?)"/i.test(content),
      twitterCard: /<meta\s+name="twitter:card"\s+content="(.+?)"/i.test(content),
      twitterTitle: /<meta\s+name="twitter:title"\s+content="(.+?)"/i.test(content),
      twitterDescription: /<meta\s+name="twitter:description"\s+content="(.+?)"/i.test(content),
      twitterImage: /<meta\s+name="twitter:image"\s+content="(.+?)"/i.test(content),
      canonical: /<link\s+rel="canonical"\s+href="(.+?)"/i.test(content),
    };

    // Track missing metadata
    const missing = Object.entries(checks)
      .filter(([key, value]) => !value)
      .map(([key]) => key);

    if (missing.length > 0) {
      this.warnings.push(`${relativePath}: Missing metadata - ${missing.join(', ')}`);
    }

    // Check for console errors in the HTML (shouldn't be any)
    if (content.includes('console.error')) {
      this.errors.push(`${relativePath}: Contains console.error statements`);
    }

    // Validate image URLs are absolute
    const ogImageMatch = content.match(/<meta\s+property="og:image"\s+content="(.+?)"/i);
    if (ogImageMatch && ogImageMatch[1]) {
      const imageUrl = ogImageMatch[1];
      if (!imageUrl.startsWith('http://') && !imageUrl.startsWith('https://')) {
        this.errors.push(`${relativePath}: og:image is not an absolute URL: ${imageUrl}`);
      }
    }

    // Validate URLs are absolute
    const ogUrlMatch = content.match(/<meta\s+property="og:url"\s+content="(.+?)"/i);
    if (ogUrlMatch && ogUrlMatch[1]) {
      const url = ogUrlMatch[1];
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        this.errors.push(`${relativePath}: og:url is not an absolute URL: ${url}`);
      }
    }

    this.validatedPages++;
  }

  /**
   * Print validation results
   */
  printResults() {
    console.log('\n' + '='.repeat(60));
    console.log('VALIDATION RESULTS');
    console.log('='.repeat(60) + '\n');

    console.log(`✅ Validated ${this.validatedPages} pages\n`);

    if (this.warnings.length > 0) {
      console.log(`⚠️  ${this.warnings.length} warnings:\n`);
      this.warnings.forEach((warning) => {
        console.log(`   ${warning}`);
      });
      console.log('');
    }

    if (this.errors.length > 0) {
      console.log(`❌ ${this.errors.length} errors:\n`);
      this.errors.forEach((error) => {
        console.log(`   ${error}`);
      });
      console.log('');
    }

    if (this.errors.length === 0 && this.warnings.length === 0) {
      console.log('✅ All metadata validation checks passed!\n');
    } else if (this.errors.length === 0) {
      console.log('✅ No critical errors found (warnings can be addressed)\n');
    } else {
      console.log('❌ Validation failed - please fix errors before deploying\n');
    }
  }
}

// Run validation
const validator = new MetadataValidator();
validator.validate().catch((error) => {
  console.error('❌ Validation failed with error:', error);
  process.exit(1);
});
