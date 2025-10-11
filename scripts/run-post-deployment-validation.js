#!/usr/bin/env node

/**
 * Post-Deployment Image Validation Runner
 *
 * Executes both image accessibility validation and automated image loading verification
 * to provide comprehensive post-deployment validation as required by task 12.
 *
 * Requirements: 5.5, 7.1, 7.2, 7.5
 */

const { spawn } = require('child_process');
const fs = require('fs').promises;
const path = require('path');

class PostDeploymentValidationRunner {
  constructor() {
    this.timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    this.results = {
      accessibility: null,
      loading: null,
      summary: null,
    };
  }

  /**
   * Run a script and capture its output
   */
  async runScript(scriptPath, scriptName) {
    return new Promise((resolve, reject) => {
      console.log(`\n${'='.repeat(70)}`);
      console.log(`🚀 Running ${scriptName}`);
      console.log(`${'='.repeat(70)}`);

      const child = spawn('node', [scriptPath], {
        stdio: 'inherit',
        shell: true,
      });

      child.on('close', code => {
        console.log(`\n✅ ${scriptName} completed with exit code: ${code}`);
        resolve({ exitCode: code, success: code === 0 });
      });

      child.on('error', error => {
        console.error(`❌ ${scriptName} failed to start:`, error.message);
        reject(error);
      });
    });
  }

  /**
   * Generate combined summary report
   */
  async generateCombinedSummary() {
    const outputDir = 'validation-reports';

    try {
      // Find the most recent reports
      const files = await fs.readdir(outputDir);

      const accessibilityReports = files
        .filter(
          f =>
            f.startsWith('image-accessibility-validation-') &&
            f.endsWith('.json')
        )
        .sort()
        .reverse();

      const loadingReports = files
        .filter(
          f =>
            f.startsWith('image-loading-verification-') && f.endsWith('.json')
        )
        .sort()
        .reverse();

      let accessibilityData = null;
      let loadingData = null;

      if (accessibilityReports.length > 0) {
        const accessibilityContent = await fs.readFile(
          path.join(outputDir, accessibilityReports[0]),
          'utf8'
        );
        accessibilityData = JSON.parse(accessibilityContent);
      }

      if (loadingReports.length > 0) {
        const loadingContent = await fs.readFile(
          path.join(outputDir, loadingReports[0]),
          'utf8'
        );
        loadingData = JSON.parse(loadingContent);
      }

      const combinedSummary = {
        timestamp: this.timestamp,
        validationType: 'post-deployment-comprehensive',
        requirements: ['5.5', '7.1', '7.2', '7.5'],
        tests: {
          accessibility: {
            executed: accessibilityData !== null,
            totalImages: accessibilityData?.metadata?.summary?.totalImages || 0,
            successful: accessibilityData?.metadata?.summary?.successful || 0,
            failed: accessibilityData?.metadata?.summary?.failed || 0,
            warnings: accessibilityData?.metadata?.summary?.warnings || 0,
            securityStatus: accessibilityData?.metadata?.summary?.securityTest
              ?.secure
              ? 'SECURE'
              : 'INSECURE',
          },
          loading: {
            executed: loadingData !== null,
            totalPages: loadingData?.metadata?.summary?.totalPages || 0,
            successfulPages:
              loadingData?.metadata?.summary?.successfulPages || 0,
            failedPages: loadingData?.metadata?.summary?.failedPages || 0,
            totalImages: loadingData?.metadata?.summary?.totalImages || 0,
            loadedImages: loadingData?.metadata?.summary?.loadedImages || 0,
            failedImages: loadingData?.metadata?.summary?.failedImages || 0,
            placeholdersFound:
              loadingData?.metadata?.summary?.placeholdersFound || 0,
          },
        },
        overallStatus: this.calculateOverallStatus(
          accessibilityData,
          loadingData
        ),
        criticalIssues: this.identifyCriticalIssues(
          accessibilityData,
          loadingData
        ),
        recommendations: this.generateRecommendations(
          accessibilityData,
          loadingData
        ),
      };

      // Save combined summary
      const summaryPath = path.join(
        outputDir,
        `post-deployment-validation-summary-${this.timestamp}.json`
      );
      await fs.writeFile(summaryPath, JSON.stringify(combinedSummary, null, 2));

      // Generate executive summary
      const execSummary = this.generateExecutiveSummary(combinedSummary);
      const execPath = path.join(
        outputDir,
        `post-deployment-executive-summary-${this.timestamp}.md`
      );
      await fs.writeFile(execPath, execSummary);

      console.log(`\n📄 Combined summary saved: ${summaryPath}`);
      console.log(`📄 Executive summary saved: ${execPath}`);

      return combinedSummary;
    } catch (error) {
      console.error('Failed to generate combined summary:', error.message);
      return null;
    }
  }

  /**
   * Calculate overall validation status
   */
  calculateOverallStatus(accessibilityData, loadingData) {
    const accessibilitySuccess =
      accessibilityData?.metadata?.summary?.failed === 0;
    const loadingSuccess =
      loadingData?.metadata?.summary?.failedPages === 0 &&
      loadingData?.metadata?.summary?.placeholdersFound === 0;
    const securityOk =
      accessibilityData?.metadata?.summary?.securityTest?.secure !== false;

    if (accessibilitySuccess && loadingSuccess && securityOk) {
      return 'EXCELLENT';
    } else if (securityOk && (accessibilitySuccess || loadingSuccess)) {
      return 'GOOD';
    } else if (securityOk) {
      return 'NEEDS_ATTENTION';
    } else {
      return 'CRITICAL';
    }
  }

  /**
   * Identify critical issues
   */
  identifyCriticalIssues(accessibilityData, loadingData) {
    const issues = [];

    // Security issues
    if (accessibilityData?.metadata?.summary?.securityTest?.secure === false) {
      issues.push({
        type: 'SECURITY',
        severity: 'CRITICAL',
        description: 'S3 bucket is publicly accessible',
        impact: 'Security vulnerability - violates AWS security standards',
        action: 'Block all public S3 access immediately',
      });
    }

    // Accessibility failures
    const accessibilityFailed =
      accessibilityData?.metadata?.summary?.failed || 0;
    if (accessibilityFailed > 0) {
      issues.push({
        type: 'ACCESSIBILITY',
        severity: 'HIGH',
        description: `${accessibilityFailed} images not accessible via CloudFront`,
        impact: 'Images not loading on website - poor user experience',
        action: 'Fix image paths, deployment process, or S3 configuration',
      });
    }

    // Loading placeholders
    const placeholders = loadingData?.metadata?.summary?.placeholdersFound || 0;
    if (placeholders > 0) {
      issues.push({
        type: 'USER_EXPERIENCE',
        severity: 'HIGH',
        description: `${placeholders} loading placeholders found on pages`,
        impact: 'Users see "Loading image..." text instead of actual images',
        action: 'Fix image loading implementation and error handling',
      });
    }

    // Page loading failures
    const failedPages = loadingData?.metadata?.summary?.failedPages || 0;
    if (failedPages > 0) {
      issues.push({
        type: 'FUNCTIONALITY',
        severity: 'MEDIUM',
        description: `${failedPages} pages failed image loading tests`,
        impact: 'Images may not display correctly on some pages',
        action: 'Review page-specific image loading issues',
      });
    }

    return issues;
  }

  /**
   * Generate recommendations
   */
  generateRecommendations(accessibilityData, loadingData) {
    const recommendations = [];

    // Based on accessibility results
    const accessibilityFailed =
      accessibilityData?.metadata?.summary?.failed || 0;
    if (accessibilityFailed > 0) {
      recommendations.push(
        'Fix failed image accessibility by checking deployment pipeline and S3 upload process'
      );
      recommendations.push(
        'Verify all required images exist in source repository and build output'
      );
    }

    // Based on loading results
    const placeholders = loadingData?.metadata?.summary?.placeholdersFound || 0;
    if (placeholders > 0) {
      recommendations.push(
        'Remove all "Loading image..." placeholders by fixing image loading implementation'
      );
      recommendations.push(
        'Review OptimizedImage component error handling and fallback mechanisms'
      );
    }

    // Security recommendations
    if (accessibilityData?.metadata?.summary?.securityTest?.secure === false) {
      recommendations.push(
        'URGENT: Secure S3 bucket by blocking all public access'
      );
      recommendations.push(
        'Verify CloudFront Origin Access Control (OAC) configuration'
      );
    }

    // Performance recommendations
    const warnings = accessibilityData?.metadata?.summary?.warnings || 0;
    if (warnings > 0) {
      recommendations.push(
        'Configure proper caching headers for images (max-age=31536000, immutable)'
      );
      recommendations.push(
        'Ensure correct Content-Type headers for WebP files'
      );
    }

    // General recommendations
    recommendations.push(
      'Set up automated monitoring for ongoing image validation'
    );
    recommendations.push('Implement image validation in CI/CD pipeline');
    recommendations.push('Document image deployment best practices');

    return recommendations;
  }

  /**
   * Generate executive summary
   */
  generateExecutiveSummary(summary) {
    const statusEmoji = {
      EXCELLENT: '🟢',
      GOOD: '🟡',
      NEEDS_ATTENTION: '🟠',
      CRITICAL: '🔴',
    };

    return `# Post-Deployment Image Validation - Executive Summary

## Overall Status: ${statusEmoji[summary.overallStatus]} ${summary.overallStatus}

**Validation Date**: ${new Date(summary.timestamp.replace(/-/g, ':')).toLocaleString()}  
**Requirements Tested**: ${summary.requirements.join(', ')} from website-image-navigation-fixes spec

## Test Results Summary

### Image Accessibility Validation
- **Total Images Tested**: ${summary.tests.accessibility.totalImages}
- **Successful**: ${summary.tests.accessibility.successful}
- **Failed**: ${summary.tests.accessibility.failed}
- **Warnings**: ${summary.tests.accessibility.warnings}
- **Security Status**: ${summary.tests.accessibility.securityStatus}

### Image Loading Verification
- **Total Pages Tested**: ${summary.tests.loading.totalPages}
- **Successful Pages**: ${summary.tests.loading.successfulPages}
- **Failed Pages**: ${summary.tests.loading.failedPages}
- **Images Loaded**: ${summary.tests.loading.loadedImages}/${summary.tests.loading.totalImages}
- **Placeholders Found**: ${summary.tests.loading.placeholdersFound}

## Critical Issues

${
  summary.criticalIssues.length > 0
    ? summary.criticalIssues
        .map(
          issue => `
### ${issue.type} - ${issue.severity}
- **Issue**: ${issue.description}
- **Impact**: ${issue.impact}
- **Action Required**: ${issue.action}
`
        )
        .join('')
    : '✅ No critical issues identified'
}

## Key Recommendations

${summary.recommendations
  .slice(0, 5)
  .map((rec, index) => `${index + 1}. ${rec}`)
  .join('\n')}

## Next Steps

### Immediate Actions (Priority 1)
${
  summary.criticalIssues.filter(i => i.severity === 'CRITICAL').length > 0
    ? '- Address critical security issues immediately'
    : '- Fix failed image accessibility issues'
}

### Short Term (Priority 2)
- Remove loading placeholders from user interface
- Optimize image loading performance
- Fix page-specific image loading issues

### Long Term (Priority 3)
- Implement automated monitoring
- Set up CI/CD pipeline validation
- Document deployment procedures

## Validation Coverage

This comprehensive validation covers all requirements from the website-image-navigation-fixes specification:

- **Requirement 5.5**: Direct image URL accessibility validation ✅
- **Requirement 7.1**: Page-level image loading verification ✅
- **Requirement 7.2**: HTTP response and Content-Type validation ✅
- **Requirement 7.5**: Loading placeholder detection ✅

## Detailed Reports

For complete technical details, refer to the individual validation reports:

- Image Accessibility Validation (JSON, Markdown, HTML)
- Image Loading Verification (JSON, Markdown, HTML)
- Combined validation summary (JSON)

---

**Report Generated**: ${new Date().toISOString()}  
**Validation Suite**: Post-Deployment Image Validation v1.0  
**Spec**: website-image-navigation-fixes
`;
  }

  /**
   * Print final summary
   */
  printFinalSummary(summary) {
    console.log('\n' + '='.repeat(70));
    console.log('🏁 POST-DEPLOYMENT VALIDATION SUMMARY');
    console.log('='.repeat(70));

    const statusEmoji = {
      EXCELLENT: '🟢',
      GOOD: '🟡',
      NEEDS_ATTENTION: '🟠',
      CRITICAL: '🔴',
    };

    console.log(
      `📊 Overall Status: ${statusEmoji[summary.overallStatus]} ${summary.overallStatus}`
    );
    console.log(`📅 Validation Date: ${new Date().toLocaleString()}`);
    console.log('');

    console.log('📈 Test Results:');
    console.log(
      `   Accessibility: ${summary.tests.accessibility.successful}/${summary.tests.accessibility.totalImages} images accessible`
    );
    console.log(
      `   Loading: ${summary.tests.loading.successfulPages}/${summary.tests.loading.totalPages} pages working`
    );
    console.log(`   Security: ${summary.tests.accessibility.securityStatus}`);
    console.log(
      `   Placeholders: ${summary.tests.loading.placeholdersFound} found`
    );
    console.log('');

    if (summary.criticalIssues.length > 0) {
      console.log('🚨 CRITICAL ISSUES:');
      summary.criticalIssues.forEach((issue, index) => {
        console.log(
          `   ${index + 1}. ${issue.description} (${issue.severity})`
        );
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

  /**
   * Run comprehensive post-deployment validation
   */
  async run() {
    console.log('🚀 Starting Post-Deployment Image Validation Suite');
    console.log(`📅 Timestamp: ${this.timestamp}`);
    console.log('📋 Running comprehensive image validation tests\n');

    const startTime = Date.now();
    let overallSuccess = true;

    try {
      // Run image accessibility validation
      const accessibilityResult = await this.runScript(
        'scripts/image-accessibility-validation.js',
        'Image Accessibility Validation'
      );

      if (!accessibilityResult.success) {
        overallSuccess = false;
      }

      // Run automated image loading verification
      const loadingResult = await this.runScript(
        'scripts/automated-image-loading-verification.js',
        'Automated Image Loading Verification'
      );

      if (!loadingResult.success) {
        overallSuccess = false;
      }

      // Generate combined summary
      console.log(`\n${'='.repeat(70)}`);
      console.log('📊 Generating Combined Summary');
      console.log(`${'='.repeat(70)}`);

      const summary = await this.generateCombinedSummary();

      if (summary) {
        this.printFinalSummary(summary);
      }

      const duration = Math.round((Date.now() - startTime) / 1000);
      console.log(`\n⏱️  Total validation duration: ${duration}s`);

      // Exit with appropriate code
      const exitCode =
        summary?.overallStatus === 'CRITICAL'
          ? 2
          : summary?.overallStatus === 'NEEDS_ATTENTION'
            ? 1
            : 0;

      process.exit(exitCode);
    } catch (error) {
      console.error('❌ Post-deployment validation failed:', error.message);
      console.error(error.stack);
      process.exit(1);
    }
  }
}

// Main execution
async function main() {
  const runner = new PostDeploymentValidationRunner();
  await runner.run();
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { PostDeploymentValidationRunner };
