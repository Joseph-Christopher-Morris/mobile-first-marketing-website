#!/usr/bin/env node

/**
 * Content Restoration and Testimonials Validator
 * Validates blog content restoration and testimonials functionality
 */

const fs = require('fs');
const path = require('path');

class ContentValidator {
  constructor() {
    this.results = {
      blogContent: { passed: 0, failed: 0, issues: [] },
      testimonials: { passed: 0, failed: 0, issues: [] }
    };
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : 'ℹ️';
    console.log(`${prefix} [${timestamp}] ${message}`);
  }

  // Validate blog content restoration (Requirements 5.1-5.6)
  async validateBlogContent() {
    this.log('Validating blog content restoration...', 'info');

    try {
      // Check Flyers ROI article exists and has correct content
      const flyersRoiPath = 'src/content/blog/flyers-roi-breakdown.ts';
      if (fs.existsSync(flyersRoiPath)) {
        const flyersContent = fs.readFileSync(flyersRoiPath, 'utf8');
        
        // Check title
        if (flyersContent.includes('How I Turned £546 into £13.5K With Flyers')) {
          this.results.blogContent.passed++;
          this.log('✓ Flyers ROI article has correct title', 'success');
        } else {
          this.results.blogContent.failed++;
          this.results.blogContent.issues.push('Flyers ROI article missing correct title');
        }

        // Check metadata
        if (flyersContent.includes('slug:') && 
            flyersContent.includes('title:') && 
            flyersContent.includes('excerpt:')) {
          this.results.blogContent.passed++;
          this.log('✓ Flyers ROI article has proper metadata', 'success');
        } else {
          this.results.blogContent.failed++;
          this.results.blogContent.issues.push('Flyers ROI article missing proper metadata');
        }

        // Check for original content markers
        if (flyersContent.includes('£546') && flyersContent.includes('£13.5K')) {
          this.results.blogContent.passed++;
          this.log('✓ Flyers ROI article contains original financial data', 'success');
        } else {
          this.results.blogContent.failed++;
          this.results.blogContent.issues.push('Flyers ROI article missing original financial data');
        }

      } else {
        this.results.blogContent.failed++;
        this.results.blogContent.issues.push('Flyers ROI article file not found');
      }

      // Check blog page exists and functions
      const blogPagePath = 'src/app/blog/page.tsx';
      if (fs.existsSync(blogPagePath)) {
        const blogPageContent = fs.readFileSync(blogPagePath, 'utf8');
        
        if (blogPageContent.includes('getAllBlogPosts')) {
          this.results.blogContent.passed++;
          this.log('✓ Blog page properly loads all posts', 'success');
        } else {
          this.results.blogContent.failed++;
          this.results.blogContent.issues.push('Blog page not properly loading posts');
        }

        // Check for proper sorting (should show newest first)
        if (blogPageContent.includes('featuredPosts') && blogPageContent.includes('regularPosts')) {
          this.results.blogContent.passed++;
          this.log('✓ Blog page has proper post organization', 'success');
        } else {
          this.results.blogContent.failed++;
          this.results.blogContent.issues.push('Blog page missing proper post organization');
        }

        // Check for descriptive link text instead of generic "Read More"
        if (blogPageContent.includes('aria-label') && blogPageContent.includes('Read full article')) {
          this.results.blogContent.passed++;
          this.log('✓ Blog page uses descriptive link text', 'success');
        } else {
          this.results.blogContent.failed++;
          this.results.blogContent.issues.push('Blog page using generic link text');
        }

      } else {
        this.results.blogContent.failed++;
        this.results.blogContent.issues.push('Blog page not found');
      }

      // Check other blog posts for proper metadata
      const blogDir = 'src/content/blog';
      if (fs.existsSync(blogDir)) {
        const blogFiles = fs.readdirSync(blogDir).filter(f => f.endsWith('.ts'));
        let allHaveMetadata = true;
        
        for (const file of blogFiles) {
          const content = fs.readFileSync(path.join(blogDir, file), 'utf8');
          if (!content.includes('slug:') || !content.includes('title:') || !content.includes('excerpt:')) {
            allHaveMetadata = false;
            this.results.blogContent.issues.push(`Blog file missing metadata: ${file}`);
          }
        }

        if (allHaveMetadata) {
          this.results.blogContent.passed++;
          this.log('✓ All blog files have proper metadata', 'success');
        } else {
          this.results.blogContent.failed++;
        }
      }

    } catch (error) {
      this.results.blogContent.failed++;
      this.results.blogContent.issues.push(`Blog content validation error: ${error.message}`);
    }
  }

  // Validate testimonials carousel (Requirements 9.1-9.12)
  async validateTestimonials() {
    this.log('Validating testimonials carousel...', 'info');

    try {
      const testimonialsPath = 'src/components/sections/TestimonialsCarousel.tsx';
      if (fs.existsSync(testimonialsPath)) {
        const testimonialsContent = fs.readFileSync(testimonialsPath, 'utf8');
        
        // Check for Lee and Scott testimonials
        if (testimonialsContent.includes('Lee Murfitt') && testimonialsContent.includes('Scott Beercroft')) {
          this.results.testimonials.passed++;
          this.log('✓ Testimonials carousel includes Lee and Scott', 'success');
        } else {
          this.results.testimonials.failed++;
          this.results.testimonials.issues.push('Testimonials missing Lee or Scott content');
        }

        // Check for original testimonial text (not AI modified)
        if (testimonialsContent.includes('Fantastic photographer from Cheshire') && 
            testimonialsContent.includes('very flexible at the JSCC Scholarships')) {
          this.results.testimonials.passed++;
          this.log('✓ Testimonials contain original text content', 'success');
        } else {
          this.results.testimonials.failed++;
          this.results.testimonials.issues.push('Testimonials may have been AI-modified');
        }

        // Check for accessibility features
        if (testimonialsContent.includes('aria-label') && 
            testimonialsContent.includes('role=') &&
            testimonialsContent.includes('aria-live')) {
          this.results.testimonials.passed++;
          this.log('✓ Testimonials carousel has proper accessibility', 'success');
        } else {
          this.results.testimonials.failed++;
          this.results.testimonials.issues.push('Testimonials carousel missing accessibility features');
        }

        // Check for keyboard navigation
        if (testimonialsContent.includes('onKeyDown') && testimonialsContent.includes('tabIndex')) {
          this.results.testimonials.passed++;
          this.log('✓ Testimonials carousel supports keyboard navigation', 'success');
        } else {
          this.results.testimonials.failed++;
          this.results.testimonials.issues.push('Testimonials carousel missing keyboard navigation');
        }

        // Check for auto-advance with pause functionality
        if (testimonialsContent.includes('setIsPaused') && 
            testimonialsContent.includes('prefersReducedMotion')) {
          this.results.testimonials.passed++;
          this.log('✓ Testimonials carousel respects motion preferences', 'success');
        } else {
          this.results.testimonials.failed++;
          this.results.testimonials.issues.push('Testimonials carousel not respecting motion preferences');
        }

        // Check for brand colors only (no blue, purple, yellow)
        if (!testimonialsContent.includes('bg-blue') && 
            !testimonialsContent.includes('bg-purple') && 
            !testimonialsContent.includes('bg-yellow') &&
            testimonialsContent.includes('bg-brand-')) {
          this.results.testimonials.passed++;
          this.log('✓ Testimonials carousel uses only brand colors', 'success');
        } else {
          this.results.testimonials.failed++;
          this.results.testimonials.issues.push('Testimonials carousel uses non-brand colors');
        }

        // Check for text-only display (no images/avatars)
        if (!testimonialsContent.includes('<img') && 
            !testimonialsContent.includes('Image from') &&
            !testimonialsContent.includes('avatar')) {
          this.results.testimonials.passed++;
          this.log('✓ Testimonials carousel is text-only (no images)', 'success');
        } else {
          this.results.testimonials.failed++;
          this.results.testimonials.issues.push('Testimonials carousel includes images/avatars');
        }

      } else {
        this.results.testimonials.failed++;
        this.results.testimonials.issues.push('Testimonials carousel component not found');
      }

      // Check if testimonials are integrated on home page only
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

      // Check that testimonials are NOT on other pages
      const otherPages = [
        'src/app/services/page.tsx',
        'src/app/contact/page.tsx',
        'src/app/about/page.tsx',
        'src/app/blog/page.tsx'
      ];

      let testimonialsOnlyOnHome = true;
      for (const pagePath of otherPages) {
        if (fs.existsSync(pagePath)) {
          const pageContent = fs.readFileSync(pagePath, 'utf8');
          if (pageContent.includes('TestimonialsCarousel')) {
            testimonialsOnlyOnHome = false;
            this.results.testimonials.issues.push(`Testimonials found on non-home page: ${pagePath}`);
          }
        }
      }

      if (testimonialsOnlyOnHome) {
        this.results.testimonials.passed++;
        this.log('✓ Testimonials carousel only appears on home page', 'success');
      } else {
        this.results.testimonials.failed++;
      }

    } catch (error) {
      this.results.testimonials.failed++;
      this.results.testimonials.issues.push(`Testimonials validation error: ${error.message}`);
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
      `content-restoration-report-${Date.now()}.json`,
      JSON.stringify(report, null, 2)
    );

    // Write summary report
    const summaryReport = `# Content Restoration and Testimonials Validation Report

Generated: ${timestamp}

## Summary
- **Total Tests**: ${totalTests}
- **Passed**: ${totalPassed}
- **Failed**: ${totalFailed}
- **Success Rate**: ${successRate}%

## Category Breakdown

### Blog Content Restoration (Requirements 5.1-5.6)
- Passed: ${this.results.blogContent.passed}
- Failed: ${this.results.blogContent.failed}
${this.results.blogContent.issues.length > 0 ? '- Issues:\n  - ' + this.results.blogContent.issues.join('\n  - ') : '- No issues found'}

### Testimonials Carousel (Requirements 9.1-9.12)
- Passed: ${this.results.testimonials.passed}
- Failed: ${this.results.testimonials.failed}
${this.results.testimonials.issues.length > 0 ? '- Issues:\n  - ' + this.results.testimonials.issues.join('\n  - ') : '- No issues found'}

## Recommendations

${report.recommendations.join('\n')}

## Status

${successRate >= 90 ? '✅ **PASSED** - Content restoration meets quality standards' : 
  successRate >= 75 ? '⚠️ **NEEDS ATTENTION** - Some content issues need to be addressed' : 
  '❌ **FAILED** - Critical content restoration issues found'}
`;

    fs.writeFileSync(
      `content-restoration-summary-${Date.now()}.md`,
      summaryReport
    );

    return report;
  }

  generateRecommendations() {
    const recommendations = [];
    
    if (this.results.blogContent.failed > 0) {
      recommendations.push('- Ensure all blog content is restored to original text and has proper metadata');
    }
    
    if (this.results.testimonials.failed > 0) {
      recommendations.push('- Complete testimonials carousel implementation with proper accessibility and brand compliance');
    }

    if (recommendations.length === 0) {
      recommendations.push('- All content restoration requirements are met! Blog and testimonials are properly implemented.');
    }

    return recommendations;
  }

  async runAllValidations() {
    this.log('Starting content restoration validation...', 'info');
    
    await this.validateBlogContent();
    await this.validateTestimonials();
    
    const report = this.generateReport();
    
    this.log(`Content validation complete! Success rate: ${report.summary.successRate}`, 
      report.summary.successRate >= '90.0%' ? 'success' : 'error');
    
    return report;
  }
}

// Run validation if called directly
if (require.main === module) {
  const validator = new ContentValidator();
  validator.runAllValidations()
    .then(report => {
      console.log('\n📊 Content Validation Summary:');
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
        console.log('\n✅ All content restoration validation passed!');
        process.exit(0);
      }
    })
    .catch(error => {
      console.error('❌ Content validation failed:', error);
      process.exit(1);
    });
}

module.exports = ContentValidator;