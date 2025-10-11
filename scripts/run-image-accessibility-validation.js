#!/usr/bin/env node

/**
 * Image Accessibility Validation Test Runner
 * 
 * Comprehensive test suite for validating image accessibility
 * after deployment to CloudFront CDN.
 */

const { ImageAccessibilityValidator } = require('./post-deployment-image-validation.js');
const { BlogImageTester } = require('./test-blog-image-accessibility.js');
const fs = require('fs').promises;
const path = require('path');

class ValidationTestRunner {
  constructor() {
    this.timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    this.results = {
      comprehensive: null,
      blogSpecific: null,
      summary: null
    };
  }

  /**
   * Run all validation tests
   */
  async runAllTests() {
    console.log('🚀 Starting Comprehensive Image Accessibility Validation');
    console.log('='.repeat(70));
    console.log(`📅 Timestamp: ${this.timestamp}`);
    console.log('');

    try {
      // 1. Run comprehensive validation
      console.log('📋 Phase 1: Comprehensive Image Validation');
      console.log('-'.repeat(50));
      const comprehensiveValidator = new ImageAccessibilityValidator();
      this.results.comprehensive = await comprehensiveValidator.runValidation();

      console.log('\n');

      // 2. Run blog-specific test
      console.log('🎯 Phase 2: Blog Image Specific Test');
      console.log('-'.repeat(50));
      const blogTester = new BlogImageTester();
      this.results.blogSpecific = await blogTester.testBlogImage();

      console.log('\n');

      // 3. Generate combined summary
      console.log('📊 Phase 3: Generating Combined Summary');
      console.log('-'.repeat(50));
      await this.generateCombinedSummary();

      // 4. Print final results
      this.printFinalSummary();

      return this.results;

    } catch (error) {
      console.error('❌ Validation test runner failed:', error.message);
      throw error;
    }
  }

  /**
   * Generate combined summary report
   */
  async generateCombinedSummary() {
    const summary = {
      timestamp: this.timestamp,
      testPhases: {
        comprehensive: {
          totalImages: this.results.comprehensive.totalImages,
          successful: this.results.comprehensive.successful,
          failed: this.results.comprehensive.failed,
          warnings: this.results.comprehensive.warnings,
          duration: this.results.comprehensive.duration
        },
        blogSpecific: {
          targetImage: '/images/hero/paid-ads-analytics-screenshot.webp',
          status: this.results.blogSpecific.analysis.primaryImageStatus,
          securityStatus: this.results.blogSpecific.analysis.securityStatus,
          recommendations: this.results.blogSpecific.analysis.recommendations.length,
          nextSteps: this.results.blogSpecific.analysis.nextSteps.length
        }
      },
      overallStatus: this.calculateOverallStatus(),
      criticalIssues: this.identifyCriticalIssues(),
      recommendations: this.generateOverallRecommendations()
    };

    this.results.summary = summary;

    // Save combined summary
    await fs.mkdir('validation-reports', { recursive: true });
    const summaryPath = path.join('validation-reports', `validation-summary-${this.timestamp}.json`);
    await fs.writeFile(summaryPath, JSON.stringify(summary, null, 2));

    // Generate executive summary markdown
    const execSummary = this.generateExecutiveSummary(summary);
    const execPath = path.join('validation-reports', `executive-summary-${this.timestamp}.md`);
    await fs.writeFile(execPath, execSummary);

    console.log(`📄 Combined summary saved: ${summaryPath}`);
    console.log(`📄 Executive summary saved: ${execPath}`);
  }

  /**
   * Calculate overall validation status
   */
  calculateOverallStatus() {
    const comprehensiveSuccess = this.results.comprehensive.failed === 0;
    const blogImageSuccess = this.results.blogSpecific.analysis.primaryImageStatus === 'WORKING';
    const securityOk = this.results.blogSpecific.analysis.securityStatus === 'SECURE';

    if (comprehensiveSuccess && blogImageSuccess && securityOk) {
      return 'EXCELLENT';
    } else if (blogImageSuccess && securityOk) {
      return 'GOOD';
    } else if (blogImageSuccess || (this.results.comprehensive.successful > this.results.comprehensive.failed)) {
      return 'NEEDS_ATTENTION';
    } else {
      return 'CRITICAL';
    }
  }

  /**
   * Identify critical issues that need immediate attention
   */
  identifyCriticalIssues() {
    const issues = [];

    // Security issues
    if (this.results.blogSpecific.analysis.securityStatus === 'INSECURE') {
      issues.push({
        type: 'SECURITY',
        severity: 'CRITICAL',
        description: 'S3 bucket is publicly accessible',
        impact: 'Security vulnerability - violates AWS security standards',
        action: 'Block all public S3 access immediately'
      });
    }

    // Blog image failure
    if (this.results.blogSpecific.analysis.primaryImageStatus === 'FAILED') {
      issues.push({
        type: 'FUNCTIONALITY',
        severity: 'HIGH',
        description: 'Primary blog image not accessible',
        impact: 'Poor user experience on homepage blog preview',
        action: 'Fix image path or deployment process'
      });
    }

    // Multiple image failures
    if (this.results.comprehensive.failed > this.results.comprehensive.successful) {
      issues.push({
        type: 'DEPLOYMENT',
        severity: 'HIGH',
        description: 'Majority of images failing to load',
        impact: 'Widespread image loading issues across site',
        action: 'Review deployment pipeline and S3 upload process'
      });
    }

    return issues;
  }

  /**
   * Generate overall recommendations
   */
  generateOverallRecommendations() {
    const recommendations = [];

    // Based on comprehensive results
    if (this.results.comprehensive.failed > 0) {
      recommendations.push('Fix failed image loads by checking deployment pipeline');
      recommendations.push('Verify all images exist in source and are included in build');
    }

    // Based on blog-specific results
    if (this.results.blogSpecific.analysis.nextSteps.length > 0) {
      recommendations.push('Address blog image specific issues as outlined in detailed report');
    }

    // Security recommendations
    if (this.results.blogSpecific.analysis.securityStatus === 'INSECURE') {
      recommendations.push('URGENT: Secure S3 bucket by blocking public access');
      recommendations.push('Verify CloudFront OAC configuration is working correctly');
    }

    // Performance recommendations
    if (this.results.comprehensive.warnings > 0) {
      recommendations.push('Review and address performance warnings');
      recommendations.push('Optimize images with slow loading times');
    }

    // General recommendations
    recommendations.push('Set up monitoring for ongoing image accessibility');
    recommendations.push('Implement automated testing in CI/CD pipeline');
    recommendations.push('Document image deployment best practices');

    return recommendations;
  }

  /**
   * Generate executive summary
   */
  generateExecutiveSummary(summary) {
    const statusEmoji = {
      'EXCELLENT': '🟢',
      'GOOD': '🟡',
      'NEEDS_ATTENTION': '🟠',
      'CRITICAL': '🔴'
    };

    return `# Image Accessibility Validation - Executive Summary

## Overall Status: ${statusEmoji[summary.overallStatus]} ${summary.overallStatus}

**Validation Date**: ${new Date(summary.timestamp.replace(/-/g, ':')).toLocaleString()}

## Key Metrics

### Comprehensive Test Results
- **Total Images Tested**: ${summary.testPhases.comprehensive.totalImages}
- **Successful**: ${summary.testPhases.comprehensive.successful}
- **Failed**: ${summary.testPhases.comprehensive.failed}
- **Warnings**: ${summary.testPhases.comprehensive.warnings}
- **Test Duration**: ${Math.round(summary.testPhases.comprehensive.duration / 1000)}s

### Blog Image Specific Test
- **Target Image**: ${summary.testPhases.blogSpecific.targetImage}
- **Status**: ${summary.testPhases.blogSpecific.status}
- **Security**: ${summary.testPhases.blogSpecific.securityStatus}

## Critical Issues

${summary.criticalIssues.length > 0 ? 
  summary.criticalIssues.map(issue => `
### ${issue.type} - ${issue.severity}
- **Issue**: ${issue.description}
- **Impact**: ${issue.impact}
- **Action Required**: ${issue.action}
`).join('') : 
  '✅ No critical issues identified'}

## Recommendations

${summary.recommendations.map((rec, index) => `${index + 1}. ${rec}`).join('\n')}

## Next Steps

1. **Immediate Actions**: Address any critical issues identified above
2. **Short Term**: Fix failed image loads and optimize performance
3. **Long Term**: Implement monitoring and automated testing

## Detailed Reports

For complete technical details, refer to the following reports generated during this validation:

- Comprehensive validation report (JSON and HTML)
- Blog image specific test report (JSON and Markdown)
- Individual test results and technical analysis

---

**Report Generated**: ${new Date().toISOString()}  
**Validation Tool**: Image Accessibility Validation Suite v1.0
`;
  }

  /**
   * Print final summary to console
   */
  printFinalSummary() {
    const { summary } = this.results;
    
    console.log('\n' + '='.repeat(70));
    console.log('🏁 FINAL VALIDATION SUMMARY');
    console.log('='.repeat(70));
    
    const statusEmoji = {
      'EXCELLENT': '🟢',
      'GOOD': '🟡', 
      'NEEDS_ATTENTION': '🟠',
      'CRITICAL': '🔴'
    };
    
    console.log(`📊 Overall Status: ${statusEmoji[summary.overallStatus]} ${summary.overallStatus}`);
    console.log(`📅 Validation Date: ${new Date().toLocaleString()}`);
    console.log('');
    
    console.log('📈 Test Results:');
    console.log(`   Comprehensive: ${summary.testPhases.comprehensive.successful}/${summary.testPhases.comprehensive.totalImages} images working`);
    console.log(`   Blog Image: ${summary.testPhases.blogSpecific.status}`);
    console.log(`   Security: ${summary.testPhases.blogSpecific.securityStatus}`);
    console.log('');

    if (summary.criticalIssues.length > 0) {
      console.log('🚨 CRITICAL ISSUES:');
      summary.criticalIssues.forEach((issue, index) => {
        console.log(`   ${index + 1}. ${issue.description} (${issue.severity})`);
      });
      console.log('');
    }

    console.log('💡 TOP RECOMMENDATIONS:');
    summary.recommendations.slice(0, 3).forEach((rec, index) => {
      console.log(`   ${index + 1}. ${rec}`);
    });

    console.log('');
    console.log('📄 Detailed reports saved in validation-reports/ directory');
    console.log('='.repeat(70));
  }
}

// Main execution
async function main() {
  try {
    const runner = new ValidationTestRunner();
    const results = await runner.runAllTests();
    
    // Exit with appropriate code based on overall status
    const exitCode = results.summary.overallStatus === 'CRITICAL' ? 2 : 
                    results.summary.overallStatus === 'NEEDS_ATTENTION' ? 1 : 0;
    
    process.exit(exitCode);
    
  } catch (error) {
    console.error('❌ Validation test runner failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { ValidationTestRunner };