#!/usr/bin/env node

/**
 * Comprehensive Requirements Compliance Validator
 * Validates all requirements from the Vivid Auto Brand Restoration spec
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class RequirementsValidator {
  constructor() {
    this.results = {
      brandColors: { passed: 0, failed: 0, issues: [] },
      images: { passed: 0, failed: 0, issues: [] },
      contactForm: { passed: 0, failed: 0, issues: [] },
      content: { passed: 0, failed: 0, issues: [] },
      testimonials: { passed: 0, failed: 0, issues: [] },
      performance: { passed: 0, failed: 0, issues: [] }
    };
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : 'ℹ️';
    console.log(`${prefix} [${timestamp}] ${message}`);
  }

  // Requirement 1: Brand Color Enforcement (1.1-1.5)
  async validateBrandColors() {
    this.log('Validating brand color enforcement...', 'info');
    
    try {
      // Check Tailwind config has only approved colors
      const tailwindConfig = fs.readFileSync('tailwind.config.js', 'utf8');
      if (tailwindConfig.includes('brand: {') && 
          tailwindConfig.includes('pink: \'#ff2d7a\'') &&
          tailwindConfig.includes('pink2: \'#d81b60\'') &&
          tailwindConfig.includes('black: \'#0b0b0b\'') &&
          tailwindConfig.includes('white: \'#ffffff\'') &&
          tailwindConfig.includes('grey: \'#969696\'')) {
        this.results.brandColors.passed++;
        this.log('✓ Tailwind config contains approved brand colors', 'success');
      } else {
        this.results.brandColors.failed++;
        this.results.brandColors.issues.push('Tailwind config missing or incorrect brand colors');
      }

      // Check for non-brand colors in components
      const nonBrandColors = [
        'bg-blue', 'bg-purple', 'bg-yellow', 'bg-indigo', 'bg-violet', 
        'bg-amber', 'bg-lime', 'bg-emerald', 'bg-cyan', 'bg-sky', 
        'bg-teal', 'bg-orange', 'bg-red', 'bg-green',
        'text-blue', 'text-purple', 'text-yellow', 'text-indigo', 
        'text-violet', 'text-amber', 'text-lime', 'text-emerald', 
        'text-cyan', 'text-sky', 'text-teal', 'text-orange', 
        'text-red', 'text-green'
      ];

      let hasNonBrandColors = false;
      for (const color of nonBrandColors) {
        try {
          const result = execSync(`grep -r "${color}" src/ --include="*.tsx" --include="*.ts" --include="*.jsx" --include="*.js"`, { encoding: 'utf8' });
          if (result.trim()) {
            hasNonBrandColors = true;
            this.results.brandColors.issues.push(`Found non-brand color usage: ${color}`);
          }
        } catch (e) {
          // No matches found, which is good
        }
      }

      if (!hasNonBrandColors) {
        this.results.brandColors.passed++;
        this.log('✓ No non-brand colors found in components', 'success');
      } else {
        this.results.brandColors.failed++;
      }

      // Check for gradients
      try {
        const gradientResult = execSync(`grep -r "bg-gradient" src/ --include="*.tsx" --include="*.ts" --include="*.jsx" --include="*.js"`, { encoding: 'utf8' });
        if (gradientResult.trim()) {
          this.results.brandColors.failed++;
          this.results.brandColors.issues.push('Found gradient backgrounds that should be flat colors');
        } else {
          this.results.brandColors.passed++;
          this.log('✓ No gradient backgrounds found', 'success');
        }
      } catch (e) {
        this.results.brandColors.passed++;
        this.log('✓ No gradient backgrounds found', 'success');
      }

    } catch (error) {
      this.results.brandColors.failed++;
      this.results.brandColors.issues.push(`Brand color validation error: ${error.message}`);
    }
  }

  // Requirement 3: Image Loading Validation (3.1-3.6)
  async validateImages() {
    this.log('Validating image loading and references...', 'info');

    try {
      // Check critical images exist
      const criticalImages = [
        'public/images/hero/aston-martin-db6-website.webp',
        'public/images/services/photography-hero.webp',
        'public/images/services/screenshot-2025-09-23-analytics-dashboard.webp',
        'public/images/services/ad-campaigns-hero.webp',
        'public/images/services/250928-hampson-auctions-sunday-11.webp',
        'public/images/about/A7302858.webp',
        'public/images/icons/vivid-auto-photography-logo.webp'
      ];

      let allImagesExist = true;
      for (const imagePath of criticalImages) {
        if (fs.existsSync(imagePath)) {
          this.log(`✓ Image exists: ${imagePath}`, 'success');
        } else {
          allImagesExist = false;
          this.results.images.issues.push(`Missing critical image: ${imagePath}`);
        }
      }

      if (allImagesExist) {
        this.results.images.passed++;
      } else {
        this.results.images.failed++;
      }

      // Check for kebab-case naming convention
      const servicesDir = 'public/images/services';
      if (fs.existsSync(servicesDir)) {
        const files = fs.readdirSync(servicesDir);
        let hasProperNaming = true;
        
        for (const file of files) {
          if (file.includes(' ') || file.includes('(') || file.includes(')')) {
            hasProperNaming = false;
            this.results.images.issues.push(`Image file not in kebab-case: ${file}`);
          }
        }

        if (hasProperNaming) {
          this.results.images.passed++;
          this.log('✓ All images follow kebab-case naming convention', 'success');
        } else {
          this.results.images.failed++;
        }
      }

      // Check for next/image usage
      const imageUsageCheck = execSync(`grep -r "import.*Image.*from.*next/image" src/ --include="*.tsx" --include="*.ts"`, { encoding: 'utf8' });
      if (imageUsageCheck.trim()) {
        this.results.images.passed++;
        this.log('✓ Using next/image for optimization', 'success');
      } else {
        this.results.images.failed++;
        this.results.images.issues.push('Not using next/image for image optimization');
      }

    } catch (error) {
      this.results.images.failed++;
      this.results.images.issues.push(`Image validation error: ${error.message}`);
    }
  }

  // Requirement 4: Contact Form Validation (4.1-4.6)
  async validateContactForm() {
    this.log('Validating contact form functionality...', 'info');

    try {
      const contactFormPath = 'src/components/sections/GeneralContactForm.tsx';
      if (fs.existsSync(contactFormPath)) {
        const formContent = fs.readFileSync(contactFormPath, 'utf8');
        
        // Check for required fields
        const requiredFields = ['fullName', 'email', 'phone', 'serviceInterest', 'message'];
        let hasAllFields = true;
        
        for (const field of requiredFields) {
          if (formContent.includes(`name='${field}'`) || formContent.includes(`name="${field}"`)) {
            this.log(`✓ Contact form has ${field} field`, 'success');
          } else {
            hasAllFields = false;
            this.results.contactForm.issues.push(`Missing form field: ${field}`);
          }
        }

        if (hasAllFields) {
          this.results.contactForm.passed++;
        } else {
          this.results.contactForm.failed++;
        }

        // Check for proper labels and accessibility
        if (formContent.includes('htmlFor=') && formContent.includes('aria-describedby')) {
          this.results.contactForm.passed++;
          this.log('✓ Contact form has proper accessibility attributes', 'success');
        } else {
          this.results.contactForm.failed++;
          this.results.contactForm.issues.push('Contact form missing accessibility attributes');
        }

        // Check for brand styling
        if (formContent.includes('bg-brand-pink') || formContent.includes('focus:ring-brand-pink')) {
          this.results.contactForm.passed++;
          this.log('✓ Contact form uses brand styling', 'success');
        } else {
          this.results.contactForm.failed++;
          this.results.contactForm.issues.push('Contact form not using brand styling');
        }

      } else {
        this.results.contactForm.failed++;
        this.results.contactForm.issues.push('Contact form component not found');
      }

    } catch (error) {
      this.results.contactForm.failed++;
      this.results.contactForm.issues.push(`Contact form validation error: ${error.message}`);
    }
  }

  // Requirement 5: Blog Content Validation (5.1-5.6)
  async validateBlogContent() {
    this.log('Validating blog content restoration...', 'info');

    try {
      // Check for Flyers ROI article
      const flyersRoiPath = 'src/content/blog/flyers-roi-breakdown.ts';
      if (fs.existsSync(flyersRoiPath)) {
        const flyersContent = fs.readFileSync(flyersRoiPath, 'utf8');
        if (flyersContent.includes('How I Turned £546 into £13.5K With Flyers')) {
          this.results.content.passed++;
          this.log('✓ Flyers ROI article exists with correct title', 'success');
        } else {
          this.results.content.failed++;
          this.results.content.issues.push('Flyers ROI article missing correct title');
        }
      } else {
        this.results.content.failed++;
        this.results.content.issues.push('Flyers ROI article not found');
      }

      // Check blog page exists
      const blogPagePath = 'src/app/blog/page.tsx';
      if (fs.existsSync(blogPagePath)) {
        this.results.content.passed++;
        this.log('✓ Blog page exists', 'success');
      } else {
        this.results.content.failed++;
        this.results.content.issues.push('Blog page not found');
      }

      // Check for proper blog metadata
      const blogDir = 'src/content/blog';
      if (fs.existsSync(blogDir)) {
        const blogFiles = fs.readdirSync(blogDir).filter(f => f.endsWith('.ts'));
        let hasProperMetadata = true;
        
        for (const file of blogFiles) {
          const content = fs.readFileSync(path.join(blogDir, file), 'utf8');
          if (!content.includes('title:') || !content.includes('slug:') || !content.includes('date:')) {
            hasProperMetadata = false;
            this.results.content.issues.push(`Blog file missing metadata: ${file}`);
          }
        }

        if (hasProperMetadata) {
          this.results.content.passed++;
          this.log('✓ All blog files have proper metadata', 'success');
        } else {
          this.results.content.failed++;
        }
      }

    } catch (error) {
      this.results.content.failed++;
      this.results.content.issues.push(`Blog content validation error: ${error.message}`);
    }
  }

  // Requirement 9: Testimonials Validation (9.1-9.12)
  async validateTestimonials() {
    this.log('Validating testimonials carousel...', 'info');

    try {
      const testimonialsPath = 'src/components/sections/TestimonialsCarousel.tsx';
      if (fs.existsSync(testimonialsPath)) {
        const testimonialsContent = fs.readFileSync(testimonialsPath, 'utf8');
        
        // Check for Lee and Scott testimonials
        if (testimonialsContent.includes('Lee') && testimonialsContent.includes('Scott')) {
          this.results.testimonials.passed++;
          this.log('✓ Testimonials carousel includes Lee and Scott', 'success');
        } else {
          this.results.testimonials.failed++;
          this.results.testimonials.issues.push('Testimonials missing Lee or Scott content');
        }

        // Check for accessibility features
        if (testimonialsContent.includes('aria-label') && testimonialsContent.includes('role=')) {
          this.results.testimonials.passed++;
          this.log('✓ Testimonials carousel has accessibility features', 'success');
        } else {
          this.results.testimonials.failed++;
          this.results.testimonials.issues.push('Testimonials carousel missing accessibility features');
        }

        // Check for brand colors only
        if (!testimonialsContent.includes('bg-blue') && !testimonialsContent.includes('bg-purple') && !testimonialsContent.includes('bg-yellow')) {
          this.results.testimonials.passed++;
          this.log('✓ Testimonials carousel uses only brand colors', 'success');
        } else {
          this.results.testimonials.failed++;
          this.results.testimonials.issues.push('Testimonials carousel uses non-brand colors');
        }

      } else {
        this.results.testimonials.failed++;
        this.results.testimonials.issues.push('Testimonials carousel component not found');
      }

      // Check if testimonials are integrated on home page
      const homePagePath = 'src/app/page.tsx';
      if (fs.existsSync(homePagePath)) {
        const homeContent = fs.readFileSync(homePagePath, 'utf8');
        if (homeContent.includes('TestimonialsCarousel')) {
          this.results.testimonials.passed++;
          this.log('✓ Testimonials carousel integrated on home page', 'success');
        } else {
          this.results.testimonials.failed++;
          this.results.testimonials.issues.push('Testimonials carousel not integrated on home page');
        }
      }

    } catch (error) {
      this.results.testimonials.failed++;
      this.results.testimonials.issues.push(`Testimonials validation error: ${error.message}`);
    }
  }

  // Performance and SEO validation
  async validatePerformanceAndSEO() {
    this.log('Validating performance and SEO elements...', 'info');

    try {
      // Check robots.txt
      if (fs.existsSync('public/robots.txt')) {
        const robotsContent = fs.readFileSync('public/robots.txt', 'utf8');
        if (robotsContent.includes('User-agent: *') && robotsContent.includes('Allow: /')) {
          this.results.performance.passed++;
          this.log('✓ robots.txt exists and allows crawlers', 'success');
        } else {
          this.results.performance.failed++;
          this.results.performance.issues.push('robots.txt exists but has incorrect content');
        }
      } else {
        this.results.performance.failed++;
        this.results.performance.issues.push('robots.txt not found');
      }

      // Check sitemap
      if (fs.existsSync('public/sitemap.xml')) {
        this.results.performance.passed++;
        this.log('✓ sitemap.xml exists', 'success');
      } else {
        this.results.performance.failed++;
        this.results.performance.issues.push('sitemap.xml not found');
      }

      // Check for proper meta tags in layout
      const layoutPath = 'src/app/layout.tsx';
      if (fs.existsSync(layoutPath)) {
        const layoutContent = fs.readFileSync(layoutPath, 'utf8');
        if (layoutContent.includes('metadata') || layoutContent.includes('<meta')) {
          this.results.performance.passed++;
          this.log('✓ Layout includes metadata configuration', 'success');
        } else {
          this.results.performance.failed++;
          this.results.performance.issues.push('Layout missing metadata configuration');
        }
      }

    } catch (error) {
      this.results.performance.failed++;
      this.results.performance.issues.push(`Performance/SEO validation error: ${error.message}`);
    }
  }

  // Generate comprehensive report
  generateReport() {
    const timestamp = new Date().toISOString();
    const totalPassed = Object.values(this.results).reduce((sum, category) => sum + category.passed, 0);
    const totalFailed = Object.values(this.results).reduce((sum, category) => sum + category.failed, 0);
    const totalTests = totalPassed + totalFailed;
    const successRate = totalTests > 0 ? ((totalPassed / totalTests) * 100).toFixed(1) : 0;

    const report = {
      timestamp,
      summary: {
        totalTests,
        passed: totalPassed,
        failed: totalFailed,
        successRate: `${successRate}%`
      },
      categories: this.results,
      recommendations: this.generateRecommendations()
    };

    // Write detailed report
    fs.writeFileSync(
      `requirements-compliance-report-${Date.now()}.json`,
      JSON.stringify(report, null, 2)
    );

    // Write summary report
    const summaryReport = `# Requirements Compliance Report

Generated: ${timestamp}

## Summary
- **Total Tests**: ${totalTests}
- **Passed**: ${totalPassed}
- **Failed**: ${totalFailed}
- **Success Rate**: ${successRate}%

## Category Breakdown

### Brand Colors (Requirements 1.1-1.5)
- Passed: ${this.results.brandColors.passed}
- Failed: ${this.results.brandColors.failed}
${this.results.brandColors.issues.length > 0 ? '- Issues:\n  - ' + this.results.brandColors.issues.join('\n  - ') : '- No issues found'}

### Images (Requirements 3.1-3.6)
- Passed: ${this.results.images.passed}
- Failed: ${this.results.images.failed}
${this.results.images.issues.length > 0 ? '- Issues:\n  - ' + this.results.images.issues.join('\n  - ') : '- No issues found'}

### Contact Form (Requirements 4.1-4.6)
- Passed: ${this.results.contactForm.passed}
- Failed: ${this.results.contactForm.failed}
${this.results.contactForm.issues.length > 0 ? '- Issues:\n  - ' + this.results.contactForm.issues.join('\n  - ') : '- No issues found'}

### Blog Content (Requirements 5.1-5.6)
- Passed: ${this.results.content.passed}
- Failed: ${this.results.content.failed}
${this.results.content.issues.length > 0 ? '- Issues:\n  - ' + this.results.content.issues.join('\n  - ') : '- No issues found'}

### Testimonials (Requirements 9.1-9.12)
- Passed: ${this.results.testimonials.passed}
- Failed: ${this.results.testimonials.failed}
${this.results.testimonials.issues.length > 0 ? '- Issues:\n  - ' + this.results.testimonials.issues.join('\n  - ') : '- No issues found'}

### Performance & SEO (Requirements 6.1-6.6, 7.1-7.4)
- Passed: ${this.results.performance.passed}
- Failed: ${this.results.performance.failed}
${this.results.performance.issues.length > 0 ? '- Issues:\n  - ' + this.results.performance.issues.join('\n  - ') : '- No issues found'}

## Recommendations

${report.recommendations.join('\n')}

## Status

${successRate >= 90 ? '✅ **PASSED** - Requirements compliance meets quality standards' : 
  successRate >= 75 ? '⚠️ **NEEDS ATTENTION** - Some requirements need to be addressed' : 
  '❌ **FAILED** - Critical requirements compliance issues found'}
`;

    fs.writeFileSync(
      `requirements-compliance-summary-${Date.now()}.md`,
      summaryReport
    );

    return report;
  }

  generateRecommendations() {
    const recommendations = [];
    
    if (this.results.brandColors.failed > 0) {
      recommendations.push('- Fix brand color violations by replacing non-brand colors with approved palette');
    }
    
    if (this.results.images.failed > 0) {
      recommendations.push('- Ensure all critical images exist and follow kebab-case naming convention');
    }
    
    if (this.results.contactForm.failed > 0) {
      recommendations.push('- Update contact form to include all required fields and proper accessibility');
    }
    
    if (this.results.content.failed > 0) {
      recommendations.push('- Restore missing blog content and ensure proper metadata');
    }
    
    if (this.results.testimonials.failed > 0) {
      recommendations.push('- Complete testimonials carousel implementation with proper accessibility');
    }
    
    if (this.results.performance.failed > 0) {
      recommendations.push('- Add missing SEO elements (robots.txt, sitemap.xml, meta tags)');
    }

    if (recommendations.length === 0) {
      recommendations.push('- All requirements are compliant! Ready for deployment.');
    }

    return recommendations;
  }

  async runAllValidations() {
    this.log('Starting comprehensive requirements validation...', 'info');
    
    await this.validateBrandColors();
    await this.validateImages();
    await this.validateContactForm();
    await this.validateBlogContent();
    await this.validateTestimonials();
    await this.validatePerformanceAndSEO();
    
    const report = this.generateReport();
    
    this.log(`Validation complete! Success rate: ${report.summary.successRate}`, 
      report.summary.successRate >= '90.0%' ? 'success' : 'error');
    
    return report;
  }
}

// Run validation if called directly
if (require.main === module) {
  const validator = new RequirementsValidator();
  validator.runAllValidations()
    .then(report => {
      console.log('\n📊 Validation Summary:');
      console.log(`Total Tests: ${report.summary.totalTests}`);
      console.log(`Passed: ${report.summary.passed}`);
      console.log(`Failed: ${report.summary.failed}`);
      console.log(`Success Rate: ${report.summary.successRate}`);
      
      if (report.summary.failed > 0) {
        console.log('\n❌ Issues found that need attention:');
        Object.entries(report.categories).forEach(([category, results]) => {
          if (results.issues.length > 0) {
            console.log(`\n${category.toUpperCase()}:`);
            results.issues.forEach(issue => console.log(`  - ${issue}`));
          }
        });
        process.exit(1);
      } else {
        console.log('\n✅ All requirements validation passed!');
        process.exit(0);
      }
    })
    .catch(error => {
      console.error('❌ Validation failed:', error);
      process.exit(1);
    });
}

module.exports = RequirementsValidator;