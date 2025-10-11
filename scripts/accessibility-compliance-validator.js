#!/usr/bin/env node

/**
 * WCAG 2.1 AA Accessibility Compliance Validator
 *
 * This script validates accessibility compliance for the website
 * by running comprehensive accessibility tests and generating reports.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class AccessibilityValidator {
  constructor() {
    this.results = {
      passed: 0,
      failed: 0,
      skipped: 0,
      violations: [],
      timestamp: new Date().toISOString(),
    };
  }

  log(message, type = 'info') {
    const timestamp = new Date().toLocaleTimeString();
    const prefix =
      {
        info: '📋',
        success: '✅',
        error: '❌',
        warning: '⚠️',
      }[type] || 'ℹ️';

    console.log(`[${timestamp}] ${prefix} ${message}`);
  }

  async validateEnvironment() {
    this.log('Validating environment for accessibility testing...', 'info');

    try {
      // Check if Playwright is installed
      execSync('npx playwright --version', { stdio: 'pipe' });
      this.log('Playwright is available', 'success');

      // Check if axe-core is installed
      const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      if (packageJson.devDependencies['@axe-core/playwright']) {
        this.log('Axe-core Playwright integration is available', 'success');
      } else {
        throw new Error('@axe-core/playwright is not installed');
      }

      // Check if accessibility test file exists
      if (fs.existsSync('e2e/accessibility.spec.ts')) {
        this.log('Accessibility test file found', 'success');
      } else {
        throw new Error('Accessibility test file not found');
      }

      return true;
    } catch (error) {
      this.log(`Environment validation failed: ${error.message}`, 'error');
      return false;
    }
  }

  async runAccessibilityTests() {
    this.log('Running WCAG 2.1 AA compliance tests...', 'info');

    try {
      // Run accessibility tests with detailed output
      const result = execSync(
        'npx playwright test e2e/accessibility.spec.ts --reporter=json',
        {
          stdio: 'pipe',
          encoding: 'utf8',
          timeout: 300000, // 5 minutes timeout
        }
      );

      const testResults = JSON.parse(result);

      // Process test results
      testResults.suites.forEach(suite => {
        suite.specs.forEach(spec => {
          spec.tests.forEach(test => {
            if (test.results[0].status === 'passed') {
              this.results.passed++;
            } else if (test.results[0].status === 'failed') {
              this.results.failed++;
              this.results.violations.push({
                title: test.title,
                error: test.results[0].error?.message || 'Unknown error',
                location: test.location,
              });
            } else {
              this.results.skipped++;
            }
          });
        });
      });

      return true;
    } catch (error) {
      this.log(`Accessibility tests failed: ${error.message}`, 'error');

      // Try to parse error output for test results
      try {
        const errorOutput = error.stdout || error.stderr || '';
        if (errorOutput.includes('failed')) {
          this.results.failed++;
          this.results.violations.push({
            title: 'Test execution error',
            error: errorOutput,
            location: 'Test runner',
          });
        }
      } catch (parseError) {
        // Ignore parsing errors
      }

      return false;
    }
  }

  async generateReport() {
    this.log('Generating accessibility compliance report...', 'info');

    const report = {
      summary: {
        total: this.results.passed + this.results.failed + this.results.skipped,
        passed: this.results.passed,
        failed: this.results.failed,
        skipped: this.results.skipped,
        compliance: this.results.failed === 0 ? 'COMPLIANT' : 'NON-COMPLIANT',
        timestamp: this.results.timestamp,
      },
      violations: this.results.violations,
      recommendations: this.generateRecommendations(),
    };

    // Save JSON report
    const reportPath = 'accessibility-compliance-report.json';
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    this.log(`JSON report saved to ${reportPath}`, 'success');

    // Generate markdown summary
    const markdownReport = this.generateMarkdownReport(report);
    const markdownPath = 'accessibility-compliance-summary.md';
    fs.writeFileSync(markdownPath, markdownReport);
    this.log(`Markdown summary saved to ${markdownPath}`, 'success');

    return report;
  }

  generateRecommendations() {
    const recommendations = [];

    if (this.results.failed > 0) {
      recommendations.push({
        priority: 'HIGH',
        category: 'Compliance',
        description:
          'Fix failing accessibility tests to achieve WCAG 2.1 AA compliance',
        action: 'Review test failures and implement necessary fixes',
      });
    }

    recommendations.push({
      priority: 'MEDIUM',
      category: 'Testing',
      description:
        'Run accessibility tests regularly as part of CI/CD pipeline',
      action: 'Integrate accessibility testing into deployment process',
    });

    recommendations.push({
      priority: 'LOW',
      category: 'Enhancement',
      description: 'Consider implementing automated accessibility monitoring',
      action: 'Set up continuous accessibility monitoring tools',
    });

    return recommendations;
  }

  generateMarkdownReport(report) {
    return `# Accessibility Compliance Report

## Summary

- **Total Tests**: ${report.summary.total}
- **Passed**: ${report.summary.passed}
- **Failed**: ${report.summary.failed}
- **Skipped**: ${report.summary.skipped}
- **Compliance Status**: ${report.summary.compliance}
- **Generated**: ${report.summary.timestamp}

## WCAG 2.1 AA Compliance Status

${
  report.summary.compliance === 'COMPLIANT'
    ? '✅ **COMPLIANT** - All accessibility tests passed'
    : '❌ **NON-COMPLIANT** - Some accessibility tests failed'
}

${
  report.violations.length > 0
    ? `
## Violations

${report.violations
  .map(
    (violation, index) => `
### ${index + 1}. ${violation.title}

**Error**: ${violation.error}
**Location**: ${violation.location}
`
  )
  .join('\n')}
`
    : ''
}

## Recommendations

${report.recommendations
  .map(
    (rec, index) => `
### ${index + 1}. ${rec.description} (${rec.priority} Priority)

**Category**: ${rec.category}
**Action**: ${rec.action}
`
  )
  .join('\n')}

## Test Coverage

This report covers the following WCAG 2.1 AA compliance areas:

- **Perceivable**: Color contrast, text alternatives, adaptable content
- **Operable**: Keyboard accessibility, timing, navigation
- **Understandable**: Readable content, predictable functionality
- **Robust**: Compatible with assistive technologies

## Next Steps

1. Review any failing tests and implement fixes
2. Re-run accessibility tests to verify compliance
3. Integrate accessibility testing into CI/CD pipeline
4. Consider implementing continuous accessibility monitoring

---

*Report generated by Accessibility Compliance Validator*
`;
  }

  async run() {
    this.log(
      'Starting WCAG 2.1 AA Accessibility Compliance Validation',
      'info'
    );

    // Validate environment
    const envValid = await this.validateEnvironment();
    if (!envValid) {
      process.exit(1);
    }

    // Run accessibility tests
    const testsSuccessful = await this.runAccessibilityTests();

    // Generate report regardless of test results
    const report = await this.generateReport();

    // Log summary
    this.log(`Accessibility validation completed`, 'info');
    this.log(`Tests passed: ${this.results.passed}`, 'success');

    if (this.results.failed > 0) {
      this.log(`Tests failed: ${this.results.failed}`, 'error');
      this.log(`Compliance status: NON-COMPLIANT`, 'error');
    } else {
      this.log(`Compliance status: COMPLIANT`, 'success');
    }

    if (this.results.skipped > 0) {
      this.log(`Tests skipped: ${this.results.skipped}`, 'warning');
    }

    // Exit with appropriate code
    process.exit(this.results.failed > 0 ? 1 : 0);
  }
}

// Handle command line arguments
const args = process.argv.slice(2);
const verbose = args.includes('--verbose');
const skipServer = args.includes('--skip-server');

if (require.main === module) {
  const validator = new AccessibilityValidator();
  validator.run().catch(error => {
    console.error('❌ Accessibility validation failed:', error);
    process.exit(1);
  });
}

module.exports = AccessibilityValidator;
