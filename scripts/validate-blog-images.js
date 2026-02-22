#!/usr/bin/env node

/**
 * Blog Image Validation Script
 * 
 * Validates that all blog post image references exist in /public/images/blog/
 * Checks both hero images (post.image) and content images (<img> tags)
 * Reports missing images and extension mismatches
 * 
 * Usage: npm run validate:images
 */

const fs = require('fs');
const path = require('path');

class BlogImageValidator {
  constructor() {
    this.blogDir = path.join(process.cwd(), 'src/content/blog');
    this.publicImagesDir = path.join(process.cwd(), 'public/images/blog');
    this.results = {
      totalPosts: 0,
      totalImages: 0,
      missingImages: [],
      extensionMismatches: [],
      validImages: 0,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Main validation entry point
   */
  async validate() {
    console.log('\n🔍 Blog Image Validation');
    console.log('═'.repeat(60));
    console.log(`Blog posts directory: ${this.blogDir}`);
    console.log(`Public images directory: ${this.publicImagesDir}`);
    console.log('═'.repeat(60));

    try {
      // Get all blog post files
      const blogFiles = this.getBlogPostFiles();
      this.results.totalPosts = blogFiles.length;

      console.log(`\n📄 Found ${blogFiles.length} blog post(s)\n`);

      // Validate each blog post
      for (const file of blogFiles) {
        await this.validateBlogPost(file);
      }

      // Print summary
      this.printSummary();

      // Return exit code based on results
      return this.results.missingImages.length === 0 && 
             this.results.extensionMismatches.length === 0;

    } catch (error) {
      console.error('❌ Validation failed:', error.message);
      return false;
    }
  }

  /**
   * Get all blog post TypeScript files
   */
  getBlogPostFiles() {
    if (!fs.existsSync(this.blogDir)) {
      throw new Error(`Blog directory not found: ${this.blogDir}`);
    }

    return fs.readdirSync(this.blogDir)
      .filter(file => file.endsWith('.ts'))
      .map(file => path.join(this.blogDir, file));
  }

  /**
   * Validate a single blog post file
   */
  async validateBlogPost(filePath) {
    const fileName = path.basename(filePath);
    const content = fs.readFileSync(filePath, 'utf-8');

    console.log(`\n📝 ${fileName}`);
    console.log('─'.repeat(60));

    // Extract hero image
    const heroImage = this.extractHeroImage(content);
    if (heroImage) {
      this.validateImage(heroImage, 'hero', fileName);
    }

    // Extract content images
    const contentImages = this.extractContentImages(content);
    for (const img of contentImages) {
      this.validateImage(img, 'content', fileName);
    }
  }

  /**
   * Extract hero image path from post.image property
   */
  extractHeroImage(content) {
    // Match: image: '/images/blog/filename.ext'
    const heroImageMatch = content.match(/image:\s*['"]([^'"]+)['"]/);
    if (heroImageMatch) {
      return heroImageMatch[1];
    }
    return null;
  }

  /**
   * Extract all image paths from <img> tags in content
   */
  extractContentImages(content) {
    const images = [];
    
    // Match: <img src="/images/blog/filename.ext"
    const imgRegex = /<img[^>]+src=["']([^"']+)["']/g;
    let match;

    while ((match = imgRegex.exec(content)) !== null) {
      const src = match[1];
      // Only include blog images
      if (src.startsWith('/images/blog/')) {
        images.push(src);
      }
    }

    return images;
  }

  /**
   * Validate a single image reference
   */
  validateImage(imagePath, type, sourceFile) {
    this.results.totalImages++;

    // Remove leading slash and /images/blog/ prefix to get filename
    // Also strip query strings (e.g., ?v=20251217)
    const cleanPath = imagePath.split('?')[0];
    const filename = cleanPath.replace(/^\/images\/blog\//, '');
    
    // Skip validation for non-blog images (e.g., /images/hero/)
    if (!imagePath.startsWith('/images/blog/')) {
      console.log(`⏭️  Skipped (${type}): ${imagePath} (not in /images/blog/)`);
      this.results.totalImages--; // Don't count skipped images
      return;
    }
    
    const fullPath = path.join(this.publicImagesDir, filename);

    // Check if file exists
    if (!fs.existsSync(fullPath)) {
      // Check if file exists with different extension
      const extensionMismatch = this.checkExtensionMismatch(filename);
      
      if (extensionMismatch) {
        console.log(`⚠️  Extension mismatch (${type}): ${filename}`);
        console.log(`   Expected: ${filename}`);
        console.log(`   Found: ${extensionMismatch}`);
        
        this.results.extensionMismatches.push({
          sourceFile,
          type,
          referenced: imagePath,
          expected: filename,
          actual: extensionMismatch
        });
      } else {
        console.log(`❌ Missing (${type}): ${filename}`);
        
        this.results.missingImages.push({
          sourceFile,
          type,
          path: imagePath,
          filename
        });
      }
    } else {
      console.log(`✅ Valid (${type}): ${filename}`);
      this.results.validImages++;
    }
  }

  /**
   * Check if file exists with a different extension
   */
  checkExtensionMismatch(filename) {
    const baseName = filename.replace(/\.[^.]+$/, '');
    const extensions = ['.webp', '.jpg', '.jpeg', '.png', '.gif'];

    for (const ext of extensions) {
      const testPath = path.join(this.publicImagesDir, baseName + ext);
      if (fs.existsSync(testPath)) {
        return baseName + ext;
      }
    }

    return null;
  }

  /**
   * Print validation summary
   */
  printSummary() {
    console.log('\n');
    console.log('═'.repeat(60));
    console.log('📊 VALIDATION SUMMARY');
    console.log('═'.repeat(60));
    console.log(`Total blog posts: ${this.results.totalPosts}`);
    console.log(`Total images checked: ${this.results.totalImages}`);
    console.log(`Valid images: ${this.results.validImages}`);
    console.log(`Extension mismatches: ${this.results.extensionMismatches.length}`);
    console.log(`Missing images: ${this.results.missingImages.length}`);
    console.log('═'.repeat(60));

    // Detailed reports
    if (this.results.extensionMismatches.length > 0) {
      console.log('\n⚠️  EXTENSION MISMATCHES:');
      console.log('─'.repeat(60));
      this.results.extensionMismatches.forEach(item => {
        console.log(`\nFile: ${path.basename(item.sourceFile)}`);
        console.log(`Type: ${item.type}`);
        console.log(`Referenced: ${item.referenced}`);
        console.log(`Should be: /images/blog/${item.actual}`);
      });
    }

    if (this.results.missingImages.length > 0) {
      console.log('\n❌ MISSING IMAGES:');
      console.log('─'.repeat(60));
      this.results.missingImages.forEach(item => {
        console.log(`\nFile: ${path.basename(item.sourceFile)}`);
        console.log(`Type: ${item.type}`);
        console.log(`Path: ${item.path}`);
      });
    }

    // Final status
    console.log('\n');
    if (this.results.missingImages.length === 0 && 
        this.results.extensionMismatches.length === 0) {
      console.log('✅ All blog images are valid!');
    } else {
      console.log('❌ Validation failed - please fix the issues above');
    }
    console.log('═'.repeat(60));
  }
}

// CLI execution
if (require.main === module) {
  const validator = new BlogImageValidator();
  
  validator.validate()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

module.exports = BlogImageValidator;
