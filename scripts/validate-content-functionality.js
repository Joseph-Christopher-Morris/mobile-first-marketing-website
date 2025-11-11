#!/usr/bin/env node

/**
 * Content and Functionality Validation Script
 * Validates contact form, blog content, and services/photography page
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class ContentFunctionalityValidator {
  constructor() {
    this.results = {
      contactFormValidation: { passed: false, issues: [] },
      blogContentValidation: { passed: false, issues: [] },
      servicesImagesValidation: { passed: false, issues: [] }
    };
    this.srcDir = path.join(process.cwd(), 'src');
    this.publicDir = path.join(process.cwd(), 'public');
  }

  // Validate contact form fields, order, and labels
  validateContactForm() {
    console.log('📝 Validating contact form...');
    
    const contactFile = path.join(this.srcDir, 'app', 'contact', 'page.tsx');
    const formComponentFile = path.join(this.srcDir, 'components', 'sections', 'GeneralContactForm.tsx');
    const issues = [];

    // Check contact page exists
    if (!fs.existsSync(contactFile)) {
      issues.push({ issue: 'Contact page file not found', file: 'src/app/contact/page.tsx' });
    }

    // Check form component exists and has correct structure
    if (!fs.existsSync(formComponentFile)) {
      issues.push({ issue: 'GeneralContactForm component not found', file: 'src/components/sections/GeneralContactForm.tsx' });
    } else {
      const content = fs.readFileSync(formComponentFile, 'utf8');
      
      // Check for required form fields
      const requiredFields = [
        { pattern: /Full Name.*\*/i, name: 'Full Name field (required)' },
        { pattern: /Email Address.*\*/i, name: 'Email Address field (required)' },
        { pattern: /Phone.*optional/i, name: 'Phone field (optional)' },
        { pattern: /Service Interest/i, name: 'Service Interest field' },
        { pattern: /Message.*\*/i, name: 'Message field (required)' }
      ];

      requiredFields.forEach(field => {
        if (!field.pattern.test(content)) {
          issues.push({
            file: 'src/components/sections/GeneralContactForm.tsx',
            issue: `Missing or incorrect: ${field.name}`,
            line: 'N/A'
          });
        }
      });

      // Check for proper form structure
      const formStructureChecks = [
        { pattern: /htmlFor=['"]fullName['"]/, name: 'Accessible label for Full Name' },
        { pattern: /htmlFor=['"]email['"]/, name: 'Accessible label for Email' },
        { pattern: /htmlFor=['"]phone['"]/, name: 'Accessible label for Phone' },
        { pattern: /htmlFor=['"]serviceInterest['"]/, name: 'Accessible label for Service Interest' },
        { pattern: /htmlFor=['"]message['"]/, name: 'Accessible label for Message' },
        { pattern: /Send Message/, name: 'Send Message submit button' },
        { pattern: /bg-brand-pink/, name: 'Brand pink button styling' },
        { pattern: /hover:bg-brand-pink2/, name: 'Brand pink2 hover state' }
      ];

      formStructureChecks.forEach(check => {
        if (!check.pattern.test(content)) {
          issues.push({
            file: 'src/components/sections/GeneralContactForm.tsx',
            issue: `Missing: ${check.name}`,
            line: 'N/A'
          });
        }
      });

      // Check field order by looking for the sequence in the form structure
      const fieldOrderPattern = /fullName[\s\S]*?email[\s\S]*?phone[\s\S]*?serviceInterest[\s\S]*?message/i;
      if (!fieldOrderPattern.test(content)) {
        issues.push({
          file: 'src/components/sections/GeneralContactForm.tsx',
          issue: 'Form fields not in correct order: Full Name, Email Address, Phone, Service Interest, Message',
          line: 'N/A'
        });
      }
    }

    this.results.contactFormValidation = {
      passed: issues.length === 0,
      issues
    };

    if (issues.length === 0) {
      console.log('✅ Contact form validation passed');
    } else {
      console.log(`❌ Found ${issues.length} contact form issue(s)`);
      issues.forEach(issue => {
        console.log(`   ${issue.file} - ${issue.issue}`);
      });
    }
  }

  // Validate blog content restoration and Flyers ROI article
  validateBlogContent() {
    console.log('📚 Validating blog content...');
    
    const issues = [];
    
    // Check for Flyers ROI article
    const flyersROIFile = path.join(this.srcDir, 'content', 'blog', 'flyers-roi-breakdown.ts');
    if (!fs.existsSync(flyersROIFile)) {
      issues.push({
        file: 'src/content/blog/flyers-roi-breakdown.ts',
        issue: 'Flyers ROI article file not found',
        line: 'N/A'
      });
    } else {
      const content = fs.readFileSync(flyersROIFile, 'utf8');
      
      // Check for required metadata
      const requiredMetadata = [
        { pattern: /How I Turned £546 into £13\.5K With Flyers/i, name: 'Correct title' },
        { pattern: /flyers-roi-breakdown/i, name: 'Correct slug' },
        { pattern: /2025-08-12/i, name: 'Correct date' },
        { pattern: /whatsapp-image-2025-07-11-flyers-roi\.webp/i, name: 'Correct cover image' }
      ];

      requiredMetadata.forEach(meta => {
        if (!meta.pattern.test(content)) {
          issues.push({
            file: 'src/content/blog/flyers-roi-breakdown.ts',
            issue: `Missing or incorrect: ${meta.name}`,
            line: 'N/A'
          });
        }
      });
    }

    // Check blog index page
    const blogIndexFile = path.join(this.srcDir, 'app', 'blog', 'page.tsx');
    if (!fs.existsSync(blogIndexFile)) {
      issues.push({
        file: 'src/app/blog/page.tsx',
        issue: 'Blog index page not found',
        line: 'N/A'
      });
    } else {
      const content = fs.readFileSync(blogIndexFile, 'utf8');
      
      // Check for proper blog listing features
      const blogFeatures = [
        { pattern: /Read Article/i, name: 'Read Article button text' },
        { pattern: /aria-label.*Read the article/i, name: 'Accessible aria-label for blog links' }
      ];

      blogFeatures.forEach(feature => {
        if (!feature.pattern.test(content)) {
          issues.push({
            file: 'src/app/blog/page.tsx',
            issue: `Missing: ${feature.name}`,
            line: 'N/A'
          });
        }
      });

      // Check for date sorting by looking at getAllBlogPosts usage
      if (!content.includes('getAllBlogPosts')) {
        issues.push({
          file: 'src/app/blog/page.tsx',
          issue: 'Missing getAllBlogPosts function call for proper sorting',
          line: 'N/A'
        });
      }
    }

    // Check for original blog content restoration (check a few key files)
    const blogFiles = [
      'stock-photography-lessons.ts',
      'paid-ads-campaign-learnings.ts'
    ];

    blogFiles.forEach(filename => {
      const blogFile = path.join(this.srcDir, 'content', 'blog', filename);
      if (fs.existsSync(blogFile)) {
        const content = fs.readFileSync(blogFile, 'utf8');
        
        // Check that content appears to be original (not AI-generated placeholder)
        if (content.includes('Lorem ipsum') || content.includes('placeholder') || content.length < 500) {
          issues.push({
            file: `src/content/blog/${filename}`,
            issue: 'Blog content appears to be placeholder or too short',
            line: 'N/A'
          });
        }
      }
    });

    this.results.blogContentValidation = {
      passed: issues.length === 0,
      issues
    };

    if (issues.length === 0) {
      console.log('✅ Blog content validation passed');
    } else {
      console.log(`❌ Found ${issues.length} blog content issue(s)`);
      issues.forEach(issue => {
        console.log(`   ${issue.file} - ${issue.issue}`);
      });
    }
  }

  // Validate services/photography page shows all 7 images with no 404 errors
  validateServicesImages() {
    console.log('📸 Validating services/photography images...');
    
    const servicesFile = path.join(this.srcDir, 'app', 'services', 'photography', 'page.tsx');
    const issues = [];

    if (!fs.existsSync(servicesFile)) {
      issues.push({
        file: 'src/app/services/photography/page.tsx',
        issue: 'Services photography page not found',
        line: 'N/A'
      });
    } else {
      const content = fs.readFileSync(servicesFile, 'utf8');
      
      // Expected image files (kebab-case names)
      const expectedImages = [
        '250928-hampson-auctions-sunday-11.webp',
        '240217-australia-trip-232-1.webp',
        '240219-australia-trip-148.webp',
        '240619-london-19.webp',
        '240619-london-26-1.webp',
        '240619-london-64.webp',
        '250125-liverpool-40.webp'
      ];

      // Check that all expected images are referenced in the code
      expectedImages.forEach(imageName => {
        if (!content.includes(imageName)) {
          issues.push({
            file: 'src/app/services/photography/page.tsx',
            issue: `Missing image reference: ${imageName}`,
            line: 'N/A'
          });
        }
      });

      // Check that image files actually exist
      expectedImages.forEach(imageName => {
        const imagePath = path.join(this.publicDir, 'images', 'services', imageName);
        if (!fs.existsSync(imagePath)) {
          issues.push({
            file: `public/images/services/${imageName}`,
            issue: `Image file not found: ${imageName}`,
            line: 'N/A'
          });
        }
      });

      // Check for proper alt text in portfolio images
      const portfolioArrayPattern = /portfolioImages\s*=\s*\[([\s\S]*?)\]/;
      const portfolioMatch = content.match(portfolioArrayPattern);
      
      if (portfolioMatch) {
        const portfolioContent = portfolioMatch[1];
        const altTextPattern = /alt:\s*['"][^'"]*(?:Sydney|Australia|London|Liverpool|Hampson|Auctions)[^'"]*['"]/gi;
        const altMatches = portfolioContent.match(altTextPattern);
        
        if (!altMatches || altMatches.length < 7) {
          issues.push({
            file: 'src/app/services/photography/page.tsx',
            issue: 'Missing or insufficient descriptive alt text with location information in portfolio array',
            line: 'N/A'
          });
        }
      } else {
        issues.push({
          file: 'src/app/services/photography/page.tsx',
          issue: 'Portfolio images array not found',
          line: 'N/A'
        });
      }
    }

    this.results.servicesImagesValidation = {
      passed: issues.length === 0,
      issues
    };

    if (issues.length === 0) {
      console.log('✅ Services images validation passed');
    } else {
      console.log(`❌ Found ${issues.length} services images issue(s)`);
      issues.forEach(issue => {
        console.log(`   ${issue.file} - ${issue.issue}`);
      });
    }
  }

  // Generate validation report
  generateReport() {
    const timestamp = new Date().toISOString();
    const report = {
      timestamp,
      summary: {
        totalChecks: 3,
        passed: Object.values(this.results).filter(r => r.passed).length,
        failed: Object.values(this.results).filter(r => !r.passed).length
      },
      results: this.results,
      overallStatus: Object.values(this.results).every(r => r.passed) ? 'PASSED' : 'FAILED'
    };

    // Save detailed report
    const reportPath = `content-functionality-validation-report-${Date.now()}.json`;
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    // Generate summary
    const summaryPath = `content-functionality-validation-summary-${Date.now()}.md`;
    const summary = this.generateSummaryMarkdown(report);
    fs.writeFileSync(summaryPath, summary);

    console.log('\n📊 VALIDATION SUMMARY');
    console.log('='.repeat(50));
    console.log(`Overall Status: ${report.overallStatus}`);
    console.log(`Checks Passed: ${report.summary.passed}/${report.summary.totalChecks}`);
    console.log(`Report saved: ${reportPath}`);
    console.log(`Summary saved: ${summaryPath}`);

    return report;
  }

  // Generate markdown summary
  generateSummaryMarkdown(report) {
    return `# Content and Functionality Validation Summary

**Generated:** ${report.timestamp}
**Overall Status:** ${report.overallStatus}
**Checks Passed:** ${report.summary.passed}/${report.summary.totalChecks}

## Validation Results

### ✅ Contact Form Validation
- **Status:** ${report.results.contactFormValidation.passed ? 'PASSED' : 'FAILED'}
- **Issues:** ${report.results.contactFormValidation.issues.length}

### ✅ Blog Content Validation  
- **Status:** ${report.results.blogContentValidation.passed ? 'PASSED' : 'FAILED'}
- **Issues:** ${report.results.blogContentValidation.issues.length}

### ✅ Services Images Validation
- **Status:** ${report.results.servicesImagesValidation.passed ? 'PASSED' : 'FAILED'}  
- **Issues:** ${report.results.servicesImagesValidation.issues.length}

## Issues Found

${Object.entries(report.results).map(([key, result]) => {
  if (result.issues.length === 0) return '';
  return `### ${key}\n${result.issues.map(issue => 
    `- **${issue.file}** - ${issue.issue}`
  ).join('\n')}`;
}).filter(Boolean).join('\n\n')}

## Requirements Validation

- **Requirement 11.3:** ${report.results.contactFormValidation.passed ? '✅ PASSED' : '❌ FAILED'} - Contact form fields, order, and labels match pre-AI version
- **Requirement 11.4:** ${report.results.blogContentValidation.passed && report.results.servicesImagesValidation.passed ? '✅ PASSED' : '❌ FAILED'} - Blog originals restored, Flyers ROI visible, and services shows all 7 images
`;
  }

  // Run all validations
  async runAllValidations() {
    console.log('🚀 Starting Content and Functionality Validation...\n');
    
    this.validateContactForm();
    this.validateBlogContent();
    this.validateServicesImages();
    
    return this.generateReport();
  }
}

// Run validation if called directly
if (require.main === module) {
  const validator = new ContentFunctionalityValidator();
  validator.runAllValidations()
    .then(report => {
      process.exit(report.overallStatus === 'PASSED' ? 0 : 1);
    })
    .catch(error => {
      console.error('❌ Validation failed:', error);
      process.exit(1);
    });
}

module.exports = ContentFunctionalityValidator;