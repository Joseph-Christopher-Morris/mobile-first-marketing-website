#!/usr/bin/env node

/**
 * Accessibility Validation Script for SCRAM Final Deployment
 * 
 * This script validates:
 * 1. All images have descriptive alt text
 * 2. Accessible link labels throughout the site
 * 3. Color contrast meets WCAG AA standards
 * 
 * Requirements: 9.3, 9.4
 */

const fs = require('fs');
const path = require('path');

class AccessibilityValidator {
  constructor() {
    this.results = {
      imageAltText: {
        total: 0,
        withDescriptiveAlt: 0,
        issues: []
      },
      linkLabels: {
        total: 0,
        withAccessibleLabels: 0,
        issues: []
      },
      colorContrast: {
        total: 0,
        compliant: 0,
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
   * Validate all images have descriptive alt text
   */
  validateImageAltText() {
    console.log('🔍 Validating image alt text accessibility...');
    
    const componentFiles = this.getComponentFiles();
    
    for (const file of componentFiles) {
      const content = fs.readFileSync(file, 'utf8');
      
      // Find Image components with more flexible pattern
      const imagePattern = /<Image[\s\S]*?(?:\/?>|<\/Image>)/g;
      let match;
      
      while ((match = imagePattern.exec(content)) !== null) {
        const imageComponent = match[0];
        this.results.imageAltText.total++;
        
        // Check for alt attribute
        const altMatch = imageComponent.match(/alt=(?:["']([^"']*)["']|\{([^}]*)\})/);
        
        if (!altMatch) {
          this.results.imageAltText.issues.push({
            file: this.getRelativePath(file),
            issue: 'Image missing alt attribute',
            component: this.truncateComponent(imageComponent),
            recommendation: 'Add descriptive alt text for accessibility'
          });
        } else {
          const altText = altMatch[1] || altMatch[2];
          
          // Check if alt text is descriptive
          if (this.isDescriptiveAltText(altText)) {
            this.results.imageAltText.withDescriptiveAlt++;
          } else {
            this.results.imageAltText.issues.push({
              file: this.getRelativePath(file),
              issue: 'Alt text not descriptive enough',
              altText: altText,
              component: this.truncateComponent(imageComponent),
              recommendation: 'Use descriptive alt text that explains the image content and context'
            });
          }
        }
      }
    }
    
    console.log(`✅ Found ${this.results.imageAltText.withDescriptiveAlt}/${this.results.imageAltText.total} images with descriptive alt text`);
    if (this.results.imageAltText.issues.length > 0) {
      console.log(`⚠️  Found ${this.results.imageAltText.issues.length} alt text accessibility issues`);
    }
  }

  /**
   * Validate accessible link labels
   */
  validateLinkLabels() {
    console.log('🔍 Validating accessible link labels...');
    
    const componentFiles = this.getComponentFiles();
    
    for (const file of componentFiles) {
      const content = fs.readFileSync(file, 'utf8');
      
      // Find Link components
      const linkPattern = /<Link[\s\S]*?(?:>[\s\S]*?<\/Link>|\/?>)/g;
      let match;
      
      while ((match = linkPattern.exec(content)) !== null) {
        const linkComponent = match[0];
        this.results.linkLabels.total++;
        
        // Check for aria-label or descriptive text content
        const hasAriaLabel = /aria-label=["']([^"']*)["']/.test(linkComponent);
        const hasDescriptiveText = this.hasDescriptiveLinkText(linkComponent);
        
        if (hasAriaLabel || hasDescriptiveText) {
          this.results.linkLabels.withAccessibleLabels++;
        } else {
          this.results.linkLabels.issues.push({
            file: this.getRelativePath(file),
            issue: 'Link missing accessible label',
            component: this.truncateComponent(linkComponent),
            recommendation: 'Add aria-label or descriptive text content for screen readers'
          });
        }
      }
    }
    
    console.log(`✅ Found ${this.results.linkLabels.withAccessibleLabels}/${this.results.linkLabels.total} links with accessible labels`);
    if (this.results.linkLabels.issues.length > 0) {
      console.log(`⚠️  Found ${this.results.linkLabels.issues.length} link accessibility issues`);
    }
  }

  /**
   * Validate color contrast meets WCAG AA standards
   */
  validateColorContrast() {
    console.log('🔍 Validating color contrast compliance...');
    
    // Check brand colors defined in tailwind config
    const tailwindConfigPath = path.join(process.cwd(), 'tailwind.config.js');
    
    if (!fs.existsSync(tailwindConfigPath)) {
      this.results.colorContrast.issues.push({
        file: 'tailwind.config.js',
        issue: 'Tailwind config file not found',
        recommendation: 'Ensure tailwind.config.js exists with brand color definitions'
      });
      return;
    }
    
    const tailwindConfig = fs.readFileSync(tailwindConfigPath, 'utf8');
    
    // Define brand color combinations to check
    const colorCombinations = [
      {
        name: 'Brand Pink on White',
        foreground: '#ff2d7a', // brand-pink
        background: '#ffffff', // white
        usage: 'Primary buttons, links'
      },
      {
        name: 'Brand Pink2 on White',
        foreground: '#d81b60', // brand-pink2
        background: '#ffffff', // white
        usage: 'Hover states, secondary elements'
      },
      {
        name: 'White on Brand Black',
        foreground: '#ffffff', // white
        background: '#0b0b0b', // brand-black
        usage: 'Hero sections, dark backgrounds'
      },
      {
        name: 'Brand Pink on Brand Black',
        foreground: '#ff2d7a', // brand-pink
        background: '#0b0b0b', // brand-black
        usage: 'Accent elements on dark backgrounds'
      }
    ];
    
    for (const combo of colorCombinations) {
      this.results.colorContrast.total++;
      
      const contrastRatio = this.calculateContrastRatio(combo.foreground, combo.background);
      const isCompliant = contrastRatio >= 4.5; // WCAG AA standard for normal text
      
      if (isCompliant) {
        this.results.colorContrast.compliant++;
      } else {
        this.results.colorContrast.issues.push({
          combination: combo.name,
          foreground: combo.foreground,
          background: combo.background,
          usage: combo.usage,
          contrastRatio: contrastRatio.toFixed(2),
          issue: `Contrast ratio ${contrastRatio.toFixed(2)}:1 is below WCAG AA standard (4.5:1)`,
          recommendation: 'Adjust colors to meet WCAG AA contrast requirements'
        });
      }
    }
    
    console.log(`✅ Found ${this.results.colorContrast.compliant}/${this.results.colorContrast.total} color combinations meeting WCAG AA standards`);
    if (this.results.colorContrast.issues.length > 0) {
      console.log(`⚠️  Found ${this.results.colorContrast.issues.length} color contrast issues`);
    }
  }

  /**
   * Check if alt text is descriptive
   */
  isDescriptiveAltText(altText) {
    if (!altText || typeof altText !== 'string') {
      return false;
    }
    
    const text = altText.trim();
    
    // Check for non-descriptive patterns
    const nonDescriptivePatterns = [
      /^image$/i,
      /^photo$/i,
      /^picture$/i,
      /^\d+\.(jpg|jpeg|png|webp)$/i,
      /^img_\d+$/i,
      /^screenshot$/i,
      /^logo$/i,
      /^icon$/i
    ];
    
    for (const pattern of nonDescriptivePatterns) {
      if (pattern.test(text)) {
        return false;
      }
    }
    
    // Descriptive alt text should be at least 10 characters and contain meaningful words
    return text.length >= 10 && text.includes(' ');
  }

  /**
   * Check if link has descriptive text content
   */
  hasDescriptiveLinkText(linkComponent) {
    // Extract text content between Link tags
    const textMatch = linkComponent.match(/>([^<]+)</);
    if (!textMatch) return false;
    
    const text = textMatch[1].trim();
    
    // Check for non-descriptive link text
    const nonDescriptiveTexts = [
      'click here',
      'read more',
      'learn more',
      'here',
      'more',
      'link'
    ];
    
    const isNonDescriptive = nonDescriptiveTexts.some(bad => 
      text.toLowerCase().includes(bad.toLowerCase())
    );
    
    return !isNonDescriptive && text.length > 3;
  }

  /**
   * Calculate contrast ratio between two colors
   */
  calculateContrastRatio(color1, color2) {
    const luminance1 = this.getLuminance(color1);
    const luminance2 = this.getLuminance(color2);
    
    const lighter = Math.max(luminance1, luminance2);
    const darker = Math.min(luminance1, luminance2);
    
    return (lighter + 0.05) / (darker + 0.05);
  }

  /**
   * Get relative luminance of a color
   */
  getLuminance(hex) {
    // Convert hex to RGB
    const rgb = this.hexToRgb(hex);
    if (!rgb) return 0;
    
    // Convert to relative luminance
    const rsRGB = rgb.r / 255;
    const gsRGB = rgb.g / 255;
    const bsRGB = rgb.b / 255;
    
    const r = rsRGB <= 0.03928 ? rsRGB / 12.92 : Math.pow((rsRGB + 0.055) / 1.055, 2.4);
    const g = gsRGB <= 0.03928 ? gsRGB / 12.92 : Math.pow((gsRGB + 0.055) / 1.055, 2.4);
    const b = bsRGB <= 0.03928 ? bsRGB / 12.92 : Math.pow((bsRGB + 0.055) / 1.055, 2.4);
    
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  }

  /**
   * Convert hex color to RGB
   */
  hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
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
   * Get relative path from project root
   */
  getRelativePath(fullPath) {
    return path.relative(process.cwd(), fullPath);
  }

  /**
   * Truncate component for display
   */
  truncateComponent(component) {
    return component.length > 100 ? component.substring(0, 100) + '...' : component;
  }

  /**
   * Generate validation summary
   */
  generateSummary() {
    const totalIssues = 
      this.results.imageAltText.issues.length +
      this.results.linkLabels.issues.length +
      this.results.colorContrast.issues.length;
    
    if (totalIssues === 0) {
      this.results.summary.passed = 1;
      console.log('\n✅ All accessibility validation checks passed!');
    } else {
      this.results.summary.failed = totalIssues;
      console.log(`\n❌ Found ${totalIssues} accessibility issues`);
    }
    
    return this.results;
  }

  /**
   * Generate detailed report
   */
  generateReport() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const reportPath = `accessibility-validation-report-${timestamp}.json`;
    const summaryPath = `accessibility-validation-summary-${timestamp}.md`;
    
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
      this.results.imageAltText.issues.length +
      this.results.linkLabels.issues.length +
      this.results.colorContrast.issues.length;
    
    let summary = `# Accessibility Validation Summary\n\n`;
    summary += `**Generated:** ${new Date().toISOString()}\n\n`;
    
    summary += `## Overall Status\n\n`;
    if (totalIssues === 0) {
      summary += `✅ **PASSED** - All accessibility validation checks passed\n\n`;
    } else {
      summary += `❌ **FAILED** - Found ${totalIssues} accessibility issues requiring attention\n\n`;
    }
    
    summary += `## Image Alt Text Validation\n\n`;
    summary += `- **Total images:** ${this.results.imageAltText.total}\n`;
    summary += `- **With descriptive alt text:** ${this.results.imageAltText.withDescriptiveAlt}\n`;
    summary += `- **Issues found:** ${this.results.imageAltText.issues.length}\n\n`;
    
    if (this.results.imageAltText.issues.length > 0) {
      summary += `### Image Alt Text Issues\n\n`;
      for (const issue of this.results.imageAltText.issues) {
        summary += `- **${issue.file}**: ${issue.issue}\n`;
        if (issue.altText) {
          summary += `  - Current alt text: "${issue.altText}"\n`;
        }
        summary += `  - Recommendation: ${issue.recommendation}\n\n`;
      }
    }
    
    summary += `## Link Labels Validation\n\n`;
    summary += `- **Total links:** ${this.results.linkLabels.total}\n`;
    summary += `- **With accessible labels:** ${this.results.linkLabels.withAccessibleLabels}\n`;
    summary += `- **Issues found:** ${this.results.linkLabels.issues.length}\n\n`;
    
    if (this.results.linkLabels.issues.length > 0) {
      summary += `### Link Label Issues\n\n`;
      for (const issue of this.results.linkLabels.issues) {
        summary += `- **${issue.file}**: ${issue.issue}\n`;
        summary += `  - Recommendation: ${issue.recommendation}\n\n`;
      }
    }
    
    summary += `## Color Contrast Validation\n\n`;
    summary += `- **Total color combinations:** ${this.results.colorContrast.total}\n`;
    summary += `- **WCAG AA compliant:** ${this.results.colorContrast.compliant}\n`;
    summary += `- **Issues found:** ${this.results.colorContrast.issues.length}\n\n`;
    
    if (this.results.colorContrast.issues.length > 0) {
      summary += `### Color Contrast Issues\n\n`;
      for (const issue of this.results.colorContrast.issues) {
        summary += `- **${issue.combination}**: ${issue.issue}\n`;
        summary += `  - Foreground: ${issue.foreground}\n`;
        summary += `  - Background: ${issue.background}\n`;
        summary += `  - Usage: ${issue.usage}\n`;
        summary += `  - Contrast Ratio: ${issue.contrastRatio}:1\n`;
        summary += `  - Recommendation: ${issue.recommendation}\n\n`;
      }
    }
    
    summary += `## Requirements Compliance\n\n`;
    summary += `- **Requirement 9.3** (Descriptive alt text): ${this.results.imageAltText.issues.length === 0 ? '✅ PASSED' : '❌ FAILED'}\n`;
    summary += `- **Requirement 9.4** (Accessible link labels): ${this.results.linkLabels.issues.length === 0 ? '✅ PASSED' : '❌ FAILED'}\n`;
    summary += `- **Requirement 9.4** (WCAG AA color contrast): ${this.results.colorContrast.issues.length === 0 ? '✅ PASSED' : '❌ FAILED'}\n\n`;
    
    return summary;
  }

  /**
   * Run all validations
   */
  async run() {
    console.log('🚀 Starting accessibility validation for SCRAM Final Deployment...\n');
    
    try {
      this.validateImageAltText();
      this.validateLinkLabels();
      this.validateColorContrast();
      
      const summary = this.generateSummary();
      const reports = this.generateReport();
      
      // Exit with error code if validation failed
      if (summary.summary.failed > 0) {
        process.exit(1);
      }
      
      return summary;
    } catch (error) {
      console.error('❌ Accessibility validation failed:', error.message);
      process.exit(1);
    }
  }
}

// Run validation if called directly
if (require.main === module) {
  const validator = new AccessibilityValidator();
  validator.run();
}

module.exports = AccessibilityValidator;