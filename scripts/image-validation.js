#!/usr/bin/env node

/**
 * Image Validation Script for SCRAM Final Deployment
 * 
 * This script validates:
 * 1. No lazy loading on hero/above-the-fold images
 * 2. All gallery and hero images have proper alt text
 * 3. No 404 errors occur for image requests
 * 
 * Requirements: 4.3, 9.2, 9.3
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class ImageValidator {
  constructor() {
    this.results = {
      heroImages: {
        total: 0,
        withPriority: 0,
        withoutLazyLoading: 0,
        issues: []
      },
      altText: {
        total: 0,
        withAltText: 0,
        withDescriptiveAlt: 0,
        issues: []
      },
      imageFiles: {
        total: 0,
        accessible: 0,
        missing: [],
        issues: []
      },
      summary: {
        passed: 0,
        failed: 0,
        warnings: 0
      }
    };
  }

  /**
   * Validate hero/above-the-fold images have priority loading
   */
  validateHeroImages() {
    console.log('🔍 Validating hero/above-the-fold images...');
    
    const componentFiles = this.getComponentFiles();
    
    for (const file of componentFiles) {
      const content = fs.readFileSync(file, 'utf8');
      
      // Find Image components (including multi-line)
      const imageMatches = this.extractImageComponents(content);
      
      for (const imageMatch of imageMatches) {
        this.results.heroImages.total++;
        
        // Check if this is a hero/above-the-fold image
        const isHeroImage = this.isHeroImage(imageMatch, content, file);
        
        if (isHeroImage) {
          // Check for priority prop
          if (imageMatch.includes('priority')) {
            this.results.heroImages.withPriority++;
            this.results.heroImages.withoutLazyLoading++;
          } else {
            this.results.heroImages.issues.push({
              file: file,
              issue: 'Hero image missing priority prop',
              image: this.extractImageSrc(imageMatch),
              recommendation: 'Add priority={true} to hero/above-the-fold images'
            });
          }
        }
      }
    }
    
    console.log(`✅ Found ${this.results.heroImages.withPriority} hero images with priority loading`);
    if (this.results.heroImages.issues.length > 0) {
      console.log(`⚠️  Found ${this.results.heroImages.issues.length} hero image issues`);
    }
  }

  /**
   * Validate all images have proper alt text
   */
  validateAltText() {
    console.log('🔍 Validating image alt text...');
    
    const componentFiles = this.getComponentFiles();
    
    for (const file of componentFiles) {
      const content = fs.readFileSync(file, 'utf8');
      
      // Find all Image components (including multi-line)
      const imageMatches = this.extractImageComponents(content);
      
      for (const imageMatch of imageMatches) {
        this.results.altText.total++;
        
        const altMatch = imageMatch.match(/alt=["']([^"']*)["']/);
        
        if (!altMatch) {
          this.results.altText.issues.push({
            file: file,
            issue: 'Image missing alt attribute',
            image: this.extractImageSrc(imageMatch),
            recommendation: 'Add descriptive alt text for accessibility'
          });
        } else {
          const altText = altMatch[1];
          this.results.altText.withAltText++;
          
          // Check if alt text is descriptive (not empty, not just filename)
          if (this.isDescriptiveAltText(altText)) {
            this.results.altText.withDescriptiveAlt++;
          } else {
            this.results.altText.issues.push({
              file: file,
              issue: 'Alt text not descriptive enough',
              image: this.extractImageSrc(imageMatch),
              altText: altText,
              recommendation: 'Use descriptive alt text that explains the image content'
            });
          }
        }
      }
    }
    
    console.log(`✅ Found ${this.results.altText.withDescriptiveAlt} images with descriptive alt text`);
    if (this.results.altText.issues.length > 0) {
      console.log(`⚠️  Found ${this.results.altText.issues.length} alt text issues`);
    }
  }

  /**
   * Validate no 404 errors for image requests
   */
  validateImageFiles() {
    console.log('🔍 Validating image file accessibility...');
    
    const componentFiles = this.getComponentFiles();
    const referencedImages = new Set();
    
    // Collect all referenced images
    for (const file of componentFiles) {
      const content = fs.readFileSync(file, 'utf8');
      const imageMatches = this.extractImageComponents(content);
      
      for (const imageMatch of imageMatches) {
        const src = this.extractImageSrc(imageMatch);
        if (src && src.startsWith('/')) {
          referencedImages.add(src);
        }
      }
    }
    
    // Check if referenced images exist
    for (const imagePath of referencedImages) {
      this.results.imageFiles.total++;
      
      const fullPath = path.join(process.cwd(), 'public', imagePath);
      
      if (fs.existsSync(fullPath)) {
        this.results.imageFiles.accessible++;
      } else {
        this.results.imageFiles.missing.push(imagePath);
        this.results.imageFiles.issues.push({
          path: imagePath,
          issue: 'Image file not found',
          recommendation: 'Ensure image file exists in public directory'
        });
      }
    }
    
    console.log(`✅ Found ${this.results.imageFiles.accessible} accessible images`);
    if (this.results.imageFiles.missing.length > 0) {
      console.log(`❌ Found ${this.results.imageFiles.missing.length} missing images`);
    }
  }

  /**
   * Extract Image components from content (handles multi-line)
   */
  extractImageComponents(content) {
    const imageComponents = [];
    
    // Match <Image with any attributes until the closing >
    // This handles multi-line Image components
    const regex = /<Image\s[^>]*?>/gs;
    let match;
    
    while ((match = regex.exec(content)) !== null) {
      imageComponents.push(match[0]);
    }
    
    return imageComponents;
  }

  /**
   * Get all component files to scan
   */
  getComponentFiles() {
    const srcDir = path.join(process.cwd(), 'src');
    const files = [];
    
    const scanDir = (dir) => {
      const items = fs.readdirSync(dir);
      
      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          scanDir(fullPath);
        } else if (item.endsWith('.tsx') || item.endsWith('.ts')) {
          files.push(fullPath);
        }
      }
    };
    
    scanDir(srcDir);
    return files;
  }

  /**
   * Check if an image is a hero/above-the-fold image
   */
  isHeroImage(imageMatch, content, file) {
    const src = this.extractImageSrc(imageMatch);
    
    // Check if it's in a hero section by looking for the comment "Hero Section"
    const heroSectionStart = content.indexOf('/* Hero Section */');
    if (heroSectionStart !== -1) {
      const imagePosition = content.indexOf(imageMatch);
      
      // Find the next section after hero section
      const nextSectionStart = content.indexOf('/* ', heroSectionStart + 1);
      const heroSectionEnd = nextSectionStart !== -1 ? nextSectionStart : content.length;
      
      // Check if image is within hero section
      if (imagePosition > heroSectionStart && imagePosition < heroSectionEnd) {
        return true;
      }
    }
    
    // Also check for specific hero section patterns
    const heroSectionPattern = /<section[^>]*bg-brand-black[^>]*>[\s\S]*?<\/section>/gi;
    const heroSections = content.match(heroSectionPattern) || [];
    
    for (const section of heroSections) {
      if (section.includes(imageMatch)) {
        return true;
      }
    }
    
    return false;
  }

  /**
   * Extract image src from Image component
   */
  extractImageSrc(imageMatch) {
    // Try different patterns for src extraction
    const patterns = [
      /src=["']([^"']*)["']/,
      /src=\{["']([^"']*)["']\}/,
      /src=\{([^}]*)\}/
    ];
    
    for (const pattern of patterns) {
      const match = imageMatch.match(pattern);
      if (match) {
        return match[1];
      }
    }
    
    return null;
  }

  /**
   * Check if alt text is descriptive
   */
  isDescriptiveAltText(altText) {
    if (!altText || altText.trim().length === 0) {
      return false;
    }
    
    // Check for non-descriptive patterns
    const nonDescriptivePatterns = [
      /^image$/i,
      /^photo$/i,
      /^picture$/i,
      /^\d+\.(jpg|jpeg|png|webp)$/i,
      /^img_\d+$/i,
      /^screenshot$/i
    ];
    
    for (const pattern of nonDescriptivePatterns) {
      if (pattern.test(altText.trim())) {
        return false;
      }
    }
    
    // Descriptive alt text should be at least 10 characters and contain meaningful words
    return altText.trim().length >= 10 && altText.includes(' ');
  }

  /**
   * Generate validation summary
   */
  generateSummary() {
    const totalIssues = 
      this.results.heroImages.issues.length +
      this.results.altText.issues.length +
      this.results.imageFiles.issues.length;
    
    if (totalIssues === 0) {
      this.results.summary.passed = 1;
      console.log('\n✅ All image validation checks passed!');
    } else {
      this.results.summary.failed = totalIssues;
      console.log(`\n❌ Found ${totalIssues} image validation issues`);
    }
    
    return this.results;
  }

  /**
   * Generate detailed report
   */
  generateReport() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const reportPath = `image-validation-report-${timestamp}.json`;
    const summaryPath = `image-validation-summary-${timestamp}.md`;
    
    // Save detailed JSON report
    fs.writeFileSync(reportPath, JSON.stringify(this.results, null, 2));
    
    // Generate markdown summary
    const summary = this.generateMarkdownSummary();
    fs.writeFileSync(summaryPath, summary);
    
    console.log(`\n📊 Reports generated:`);
    console.log(`   - Detailed: ${reportPath}`);
    console.log(`   - Summary: ${summaryPath}`);
    
    return { reportPath, summaryPath };
  }

  /**
   * Generate markdown summary
   */
  generateMarkdownSummary() {
    const totalIssues = 
      this.results.heroImages.issues.length +
      this.results.altText.issues.length +
      this.results.imageFiles.issues.length;
    
    let summary = `# Image Validation Summary\n\n`;
    summary += `**Generated:** ${new Date().toISOString()}\n\n`;
    
    summary += `## Overall Status\n\n`;
    if (totalIssues === 0) {
      summary += `✅ **PASSED** - All image validation checks passed\n\n`;
    } else {
      summary += `❌ **FAILED** - Found ${totalIssues} issues requiring attention\n\n`;
    }
    
    summary += `## Hero Images Validation\n\n`;
    summary += `- **Total hero images:** ${this.results.heroImages.total}\n`;
    summary += `- **With priority loading:** ${this.results.heroImages.withPriority}\n`;
    summary += `- **Issues found:** ${this.results.heroImages.issues.length}\n\n`;
    
    if (this.results.heroImages.issues.length > 0) {
      summary += `### Hero Image Issues\n\n`;
      for (const issue of this.results.heroImages.issues) {
        summary += `- **${issue.file}**: ${issue.issue}\n`;
        summary += `  - Image: ${issue.image}\n`;
        summary += `  - Recommendation: ${issue.recommendation}\n\n`;
      }
    }
    
    summary += `## Alt Text Validation\n\n`;
    summary += `- **Total images:** ${this.results.altText.total}\n`;
    summary += `- **With alt text:** ${this.results.altText.withAltText}\n`;
    summary += `- **With descriptive alt text:** ${this.results.altText.withDescriptiveAlt}\n`;
    summary += `- **Issues found:** ${this.results.altText.issues.length}\n\n`;
    
    if (this.results.altText.issues.length > 0) {
      summary += `### Alt Text Issues\n\n`;
      for (const issue of this.results.altText.issues) {
        summary += `- **${issue.file}**: ${issue.issue}\n`;
        summary += `  - Image: ${issue.image}\n`;
        if (issue.altText) {
          summary += `  - Current alt text: "${issue.altText}"\n`;
        }
        summary += `  - Recommendation: ${issue.recommendation}\n\n`;
      }
    }
    
    summary += `## Image File Validation\n\n`;
    summary += `- **Total referenced images:** ${this.results.imageFiles.total}\n`;
    summary += `- **Accessible images:** ${this.results.imageFiles.accessible}\n`;
    summary += `- **Missing images:** ${this.results.imageFiles.missing.length}\n\n`;
    
    if (this.results.imageFiles.missing.length > 0) {
      summary += `### Missing Images\n\n`;
      for (const missing of this.results.imageFiles.missing) {
        summary += `- ${missing}\n`;
      }
      summary += `\n`;
    }
    
    summary += `## Requirements Compliance\n\n`;
    summary += `- **Requirement 4.3** (No lazy loading on hero images): ${this.results.heroImages.issues.length === 0 ? '✅ PASSED' : '❌ FAILED'}\n`;
    summary += `- **Requirement 9.2** (No 404 errors for images): ${this.results.imageFiles.missing.length === 0 ? '✅ PASSED' : '❌ FAILED'}\n`;
    summary += `- **Requirement 9.3** (Proper alt text): ${this.results.altText.issues.length === 0 ? '✅ PASSED' : '❌ FAILED'}\n\n`;
    
    return summary;
  }

  /**
   * Run all validations
   */
  async run() {
    console.log('🚀 Starting image validation for SCRAM Final Deployment...\n');
    
    try {
      this.validateHeroImages();
      this.validateAltText();
      this.validateImageFiles();
      
      const summary = this.generateSummary();
      const reports = this.generateReport();
      
      // Exit with error code if validation failed
      if (summary.summary.failed > 0) {
        process.exit(1);
      }
      
      return summary;
    } catch (error) {
      console.error('❌ Image validation failed:', error.message);
      process.exit(1);
    }
  }
}

// Run validation if called directly
if (require.main === module) {
  const validator = new ImageValidator();
  validator.run();
}

module.exports = ImageValidator;