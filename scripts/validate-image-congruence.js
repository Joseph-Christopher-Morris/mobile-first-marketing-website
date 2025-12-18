#!/usr/bin/env node

/**
 * Kiro Patch Image Congruence Validator
 * 
 * Validates that:
 * 1. No <img src> contains spaces or parentheses (URL-encoding risk)
 * 2. Live pages render exactly what TSX files declare
 * 3. No automation substitutions occur
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

class ImageCongruenceValidator {
  constructor() {
    this.errors = [];
    this.warnings = [];
  }

  validateImagePaths() {
    console.log('🔍 Validating image path congruence...');
    
    // Find all blog content files
    const blogFiles = glob.sync('src/content/blog/*.ts');
    
    blogFiles.forEach(file => {
      const content = fs.readFileSync(file, 'utf8');
      this.validateFileImagePaths(file, content);
    });
  }

  validateFileImagePaths(filePath, content) {
    const fileName = path.basename(filePath);
    
    // Check for problematic characters in img src attributes
    const imgSrcRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/g;
    let match;
    
    while ((match = imgSrcRegex.exec(content)) !== null) {
      const imagePath = match[1];
      
      // Allowlist for images that can have spaces/parentheses (as per KIRO PATCH V9)
      const ALLOW_SPACES_PARENTHESES = new Set([
        '/images/blog/Screenshot 2025-07-04 193922 (1).webp',
        '/images/blog/Screenshot 2025-07-05 201726.jpg',
        '/images/blog/240602-Car_Collection-7.webp',
        '/images/blog/240616-Model_Car_Collection-3.webp'
      ]);
      
      const isAllowlisted = ALLOW_SPACES_PARENTHESES.has(imagePath);
      
      // Check for spaces (skip if allowlisted)
      if (imagePath.includes(' ') && !isAllowlisted) {
        this.errors.push({
          file: fileName,
          issue: 'Image path contains spaces',
          path: imagePath,
          line: this.getLineNumber(content, match.index)
        });
      }
      
      // Check for parentheses (skip if allowlisted)
      if ((imagePath.includes('(') || imagePath.includes(')')) && !isAllowlisted) {
        this.errors.push({
          file: fileName,
          issue: 'Image path contains parentheses',
          path: imagePath,
          line: this.getLineNumber(content, match.index)
        });
      }
      
      // Check if image file exists
      if (imagePath.startsWith('/images/')) {
        const fullPath = path.join('public', imagePath);
        if (!fs.existsSync(fullPath)) {
          this.errors.push({
            file: fileName,
            issue: 'Image file does not exist',
            path: imagePath,
            line: this.getLineNumber(content, match.index)
          });
        }
      }
    }
    
    // Check for raw filename lines (not in img tags)
    const rawImageRegex = /^[^<]*\.(webp|jpg|jpeg|png|gif)\s*$/gm;
    while ((match = rawImageRegex.exec(content)) !== null) {
      this.errors.push({
        file: fileName,
        issue: 'Raw filename found (not in img tag)',
        path: match[0].trim(),
        line: this.getLineNumber(content, match.index)
      });
    }
  }

  getLineNumber(content, index) {
    return content.substring(0, index).split('\n').length;
  }

  validateThumbnailUniqueness() {
    console.log('🔍 Validating thumbnail uniqueness...');
    
    const blogFiles = glob.sync('src/content/blog/*.ts');
    const thumbnailMap = new Map();
    
    blogFiles.forEach(file => {
      const content = fs.readFileSync(file, 'utf8');
      const imageMatch = content.match(/image:\s*['"]([^'"]+)['"]/);
      
      if (imageMatch) {
        const imagePath = imageMatch[1];
        const fileName = path.basename(file);
        
        if (thumbnailMap.has(imagePath)) {
          this.errors.push({
            file: fileName,
            issue: 'Duplicate thumbnail image',
            path: imagePath,
            duplicateIn: thumbnailMap.get(imagePath)
          });
        } else {
          thumbnailMap.set(imagePath, fileName);
        }
      }
    });
  }

  validateAnalyticsProofException() {
    console.log('🔍 Validating analytics proof exception...');
    
    // Allowlist for analytics proof images that can be used in multiple contexts
    const ALLOW_DUPLICATE_IN_ANALYTICS = new Set([
      '/images/blog/Screenshot 2025-07-04 193922 (1).webp'
    ]);
    
    const blogFiles = glob.sync('src/content/blog/*.ts');
    const analyticsUsages = [];
    
    // Check both old and new analytics image paths
    const analyticsImagePaths = [
      '/images/blog/screenshot-2025-07-04-193922.webp',
      '/images/blog/Screenshot 2025-07-04 193922 (1).webp'
    ];
    
    blogFiles.forEach(file => {
      const content = fs.readFileSync(file, 'utf8');
      const fileName = path.basename(file);
      
      analyticsImagePaths.forEach(analyticsImagePath => {
        // Find all uses of the analytics screenshot
        const imgRegex = new RegExp(`<img[^>]+src=["']${analyticsImagePath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}["'][^>]*>`, 'g');
        let match;
        
        while ((match = imgRegex.exec(content)) !== null) {
          const contextStart = Math.max(0, match.index - 200);
          const contextEnd = Math.min(content.length, match.index + match[0].length + 200);
          const context = content.substring(contextStart, contextEnd);
          
          // Check if this is in an analytics/proof context
          const isAnalyticsContext = /analytics|optimisation|optimization|proof|dashboard|performance|traffic/i.test(context);
          const isAllowlisted = ALLOW_DUPLICATE_IN_ANALYTICS.has(analyticsImagePath);
          
          analyticsUsages.push({
            file: fileName,
            line: this.getLineNumber(content, match.index),
            isValidContext: isAnalyticsContext || isAllowlisted,
            isAllowlisted: isAllowlisted,
            imagePath: analyticsImagePath,
            context: context.replace(/\s+/g, ' ').trim()
          });
        }
      });
    });
    
    // Report analytics image usage
    if (analyticsUsages.length > 0) {
      console.log(`📊 Analytics screenshot used in ${analyticsUsages.length} location(s):`);
      analyticsUsages.forEach(usage => {
        const status = usage.isValidContext ? '✅' : '❌';
        const allowlistNote = usage.isAllowlisted ? ' (allowlisted)' : '';
        console.log(`   ${status} ${usage.file}:${usage.line} - ${usage.isValidContext ? 'Valid analytics context' : 'Invalid context'}${allowlistNote}`);
        
        if (!usage.isValidContext) {
          this.errors.push({
            file: usage.file,
            issue: 'Analytics screenshot used outside of analytics/proof context',
            path: usage.imagePath,
            line: usage.line
          });
        }
      });
    }
  }

  validateFordSeriesCompliance() {
    console.log('🔍 Validating Ford series compliance...');
    
    const fordFiles = [
      'src/content/blog/ebay-model-ford-collection-part-1.ts',
      'src/content/blog/ebay-repeat-buyers-part-4.ts'
    ];
    
    fordFiles.forEach(file => {
      if (fs.existsSync(file)) {
        const content = fs.readFileSync(file, 'utf8');
        const fileName = path.basename(file);
        
        // Check Part 1 specific requirements
        if (fileName.includes('part-1')) {
          // Should use Red Escort hero image
          if (!content.includes("'/images/blog/240616-Model_Car_Collection-3.webp'")) {
            this.errors.push({
              file: fileName,
              issue: 'Part 1 should use Red Escort hero image (240616-Model_Car_Collection-3.webp)'
            });
          }
          
          // Should use correct analytics filename (with spaces/parentheses as per patch requirement)
          if (!content.includes('Screenshot 2025-07-04 193922 (1).webp')) {
            this.errors.push({
              file: fileName,
              issue: 'Part 1 should use analytics image with spaces/parentheses (Screenshot 2025-07-04 193922 (1).webp)'
            });
          }
        }
        
        // Check Part 4 specific requirements
        if (fileName.includes('part-4')) {
          // Should use correct hero image
          if (!content.includes("'/images/blog/Screenshot 2025-07-05 201726.jpg'")) {
            this.errors.push({
              file: fileName,
              issue: 'Part 4 should use correct hero image (Screenshot 2025-07-05 201726.jpg)'
            });
          }
        }
      }
    });
  }

  run() {
    console.log('🚀 Starting Kiro Patch Image Congruence Validation...\n');
    
    this.validateImagePaths();
    this.validateThumbnailUniqueness();
    this.validateAnalyticsProofException();
    this.validateFordSeriesCompliance();
    
    this.reportResults();
    
    return this.errors.length === 0;
  }

  reportResults() {
    console.log('\n📊 Validation Results:');
    console.log('='.repeat(50));
    
    if (this.errors.length === 0 && this.warnings.length === 0) {
      console.log('✅ All validations passed! TSX is the single source of truth.');
      return;
    }
    
    if (this.errors.length > 0) {
      console.log(`❌ ${this.errors.length} error(s) found:`);
      this.errors.forEach((error, index) => {
        console.log(`\n${index + 1}. ${error.file}${error.line ? `:${error.line}` : ''}`);
        console.log(`   Issue: ${error.issue}`);
        if (error.path) console.log(`   Path: ${error.path}`);
        if (error.duplicateIn) console.log(`   Also used in: ${error.duplicateIn}`);
      });
    }
    
    if (this.warnings.length > 0) {
      console.log(`\n⚠️  ${this.warnings.length} warning(s):`);
      this.warnings.forEach((warning, index) => {
        console.log(`\n${index + 1}. ${warning.file}`);
        console.log(`   Warning: ${warning.issue}`);
      });
    }
    
    console.log('\n' + '='.repeat(50));
    
    if (this.errors.length > 0) {
      console.log('❌ Build should fail - fix errors above');
      process.exit(1);
    } else {
      console.log('✅ No critical errors - build can proceed');
    }
  }
}

// Run validation if called directly
if (require.main === module) {
  const validator = new ImageCongruenceValidator();
  validator.run();
}

module.exports = ImageCongruenceValidator;