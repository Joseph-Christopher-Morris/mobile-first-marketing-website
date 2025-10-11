#!/usr/bin/env node

console.log('DEBUG: Script file loaded');

/**
 * Core Site Functionality Validator
 *
 * This script validates core site functionality including:
 * - Basic page loading and navigation
 * - Contact form functionality and validation
 * - Social media links and external integrations
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class CoreSiteFunctionalityValidator {
  constructor(options = {}) {
    this.baseUrl =
      options.baseUrl ||
      process.env.NEXT_PUBLIC_SITE_URL ||
      'http://localhost:3000';
    this.verbose = options.verbose || false;
    this.outputDir = options.outputDir || './test-results';
    this.skipServer = options.skipServer || false;
    this.results = {
      timestamp: new Date().toISOString(),
      baseUrl: this.baseUrl,
      tests: [],
      summary: {
        total: 0,
        passed: 0,
        failed: 0,
        skipped: 0,
      },
    };
  }

  log(message, level = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`;

    if (this.verbose || level === 'error' || level === 'success') {
      console.log(`${prefix} ${message}`);
    }
  }

  async runTest(testName, testFunction) {
    this.log(`Running test: ${testName}`);
    const startTime = Date.now();

    try {
      const result = await testFunction();
      const duration = Date.now() - startTime;

      this.results.tests.push({
        name: testName,
        status: 'passed',
        duration,
        result,
      });

      this.results.summary.passed++;
      this.log(`✓ ${testName} (${duration}ms)`, 'success');
      return true;
    } catch (error) {
      const duration = Date.now() - startTime;

      if (error.message.includes('SKIP')) {
        this.results.tests.push({
          name: testName,
          status: 'skipped',
          duration,
          reason: error.message,
        });

        this.results.summary.skipped++;
        this.log(`⊘ ${testName}: ${error.message} (${duration}ms)`, 'warning');
        return null;
      } else {
        this.results.tests.push({
          name: testName,
          status: 'failed',
          duration,
          error: error.message,
        });

        this.results.summary.failed++;
        this.log(`✗ ${testName}: ${error.message} (${duration}ms)`, 'error');
        return false;
      }
    } finally {
      this.results.summary.total++;
    }
  }

  async validateBasicPageLoading() {
    this.log('Validating basic page loading and navigation...');

    if (this.skipServer) {
      await this.runTest('Homepage Loading', async () => {
        throw new Error('SKIP: Server not running, cannot test page loading');
      });

      await this.runTest('Navigation Menu', async () => {
        throw new Error('SKIP: Server not running, cannot test navigation');
      });

      await this.runTest('Page Routing', async () => {
        throw new Error('SKIP: Server not running, cannot test routing');
      });

      return;
    }

    await this.runTest('Homepage Loading', async () => {
      try {
        const output = execSync(
          `npx playwright test --grep "homepage.*load" --reporter=json`,
          {
            encoding: 'utf8',
            timeout: 60000,
          }
        );

        const results = JSON.parse(output);

        if (results.stats && results.stats.failed > 0) {
          throw new Error(
            `Homepage loading tests failed: ${results.stats.failed} failures`
          );
        }

        return {
          tests: results.stats?.expected || 0,
          passed: (results.stats?.expected || 0) - (results.stats?.failed || 0),
          baseUrl: this.baseUrl,
        };
      } catch (error) {
        if (
          error.message.includes('ECONNREFUSED') ||
          error.message.includes('Timed out waiting')
        ) {
          throw new Error('SKIP: Development server not running');
        }
        throw error;
      }
    });

    await this.runTest('Navigation Menu', async () => {
      try {
        const output = execSync(
          `npx playwright test --grep "navigation" --reporter=json`,
          {
            encoding: 'utf8',
            timeout: 60000,
          }
        );

        const results = JSON.parse(output);

        if (results.stats && results.stats.failed > 0) {
          throw new Error(
            `Navigation tests failed: ${results.stats.failed} failures`
          );
        }

        return {
          tests: results.stats?.expected || 0,
          passed: (results.stats?.expected || 0) - (results.stats?.failed || 0),
        };
      } catch (error) {
        if (
          error.message.includes('ECONNREFUSED') ||
          error.message.includes('Timed out waiting')
        ) {
          throw new Error('SKIP: Development server not running');
        }
        throw error;
      }
    });

    await this.runTest('Page Routing', async () => {
      try {
        const output = execSync(
          `npx playwright test --grep "routing|page.*load" --reporter=json`,
          {
            encoding: 'utf8',
            timeout: 60000,
          }
        );

        const results = JSON.parse(output);

        if (results.stats && results.stats.failed > 0) {
          throw new Error(
            `Page routing tests failed: ${results.stats.failed} failures`
          );
        }

        return {
          tests: results.stats?.expected || 0,
          passed: (results.stats?.expected || 0) - (results.stats?.failed || 0),
        };
      } catch (error) {
        if (
          error.message.includes('ECONNREFUSED') ||
          error.message.includes('Timed out waiting')
        ) {
          throw new Error('SKIP: Development server not running');
        }
        throw error;
      }
    });
  }

  async validateContactFormFunctionality() {
    this.log('Validating contact form functionality and validation...');

    if (this.skipServer) {
      await this.runTest('Contact Form Loading', async () => {
        throw new Error('SKIP: Server not running, cannot test contact form');
      });

      await this.runTest('Form Validation', async () => {
        throw new Error(
          'SKIP: Server not running, cannot test form validation'
        );
      });

      await this.runTest('Form Submission', async () => {
        throw new Error(
          'SKIP: Server not running, cannot test form submission'
        );
      });

      return;
    }

    await this.runTest('Contact Form Loading', async () => {
      try {
        const output = execSync(
          `npx playwright test --grep "contact.*form.*load" --reporter=json`,
          {
            encoding: 'utf8',
            timeout: 60000,
          }
        );

        const results = JSON.parse(output);

        if (results.stats && results.stats.failed > 0) {
          throw new Error(
            `Contact form loading tests failed: ${results.stats.failed} failures`
          );
        }

        return {
          tests: results.stats?.expected || 0,
          passed: (results.stats?.expected || 0) - (results.stats?.failed || 0),
        };
      } catch (error) {
        if (
          error.message.includes('ECONNREFUSED') ||
          error.message.includes('Timed out waiting')
        ) {
          throw new Error('SKIP: Development server not running');
        }
        throw error;
      }
    });

    await this.runTest('Form Validation', async () => {
      try {
        const output = execSync(
          `npx playwright test --grep "form.*validation|validation.*form" --reporter=json`,
          {
            encoding: 'utf8',
            timeout: 60000,
          }
        );

        const results = JSON.parse(output);

        if (results.stats && results.stats.failed > 0) {
          throw new Error(
            `Form validation tests failed: ${results.stats.failed} failures`
          );
        }

        return {
          tests: results.stats?.expected || 0,
          passed: (results.stats?.expected || 0) - (results.stats?.failed || 0),
        };
      } catch (error) {
        if (
          error.message.includes('ECONNREFUSED') ||
          error.message.includes('Timed out waiting')
        ) {
          throw new Error('SKIP: Development server not running');
        }
        throw error;
      }
    });

    await this.runTest('Form Submission', async () => {
      try {
        const output = execSync(
          `npx playwright test --grep "form.*submit|submit.*form" --reporter=json`,
          {
            encoding: 'utf8',
            timeout: 60000,
          }
        );

        const results = JSON.parse(output);

        if (results.stats && results.stats.failed > 0) {
          throw new Error(
            `Form submission tests failed: ${results.stats.failed} failures`
          );
        }

        return {
          tests: results.stats?.expected || 0,
          passed: (results.stats?.expected || 0) - (results.stats?.failed || 0),
        };
      } catch (error) {
        if (
          error.message.includes('ECONNREFUSED') ||
          error.message.includes('Timed out waiting')
        ) {
          throw new Error('SKIP: Development server not running');
        }
        throw error;
      }
    });
  }

  async validateSocialMediaAndIntegrations() {
    this.log('Validating social media links and external integrations...');

    await this.runTest('Environment Variables Validation', async () => {
      try {
        execSync('npm run env:validate', {
          encoding: 'utf8',
          timeout: 30000,
          stdio: this.verbose ? 'inherit' : 'pipe',
        });
        return { status: 'valid' };
      } catch (error) {
        throw new Error(`Environment validation failed: ${error.message}`);
      }
    });

    await this.runTest('Social Media Links Configuration', async () => {
      // Check if social media environment variables are configured
      const socialVars = [
        'NEXT_PUBLIC_FACEBOOK_URL',
        'NEXT_PUBLIC_TWITTER_URL',
        'NEXT_PUBLIC_LINKEDIN_URL',
        'NEXT_PUBLIC_INSTAGRAM_URL',
      ];

      const configuredSocial = socialVars.filter(
        varName => process.env[varName]
      );

      return {
        configured: configuredSocial.length,
        total: socialVars.length,
        socialNetworks: configuredSocial,
      };
    });

    await this.runTest('Analytics Integration', async () => {
      // Check if analytics are configured
      const analyticsVars = [
        'NEXT_PUBLIC_GA_ID',
        'NEXT_PUBLIC_GTM_ID',
        'NEXT_PUBLIC_FACEBOOK_PIXEL_ID',
      ];

      const configuredAnalytics = analyticsVars.filter(
        varName => process.env[varName]
      );

      return {
        configured: configuredAnalytics.length,
        total: analyticsVars.length,
        analyticsServices: configuredAnalytics,
      };
    });

    if (!this.skipServer) {
      await this.runTest('External Links Functionality', async () => {
        try {
          const output = execSync(
            `npx playwright test --grep "external.*link|social.*link" --reporter=json`,
            {
              encoding: 'utf8',
              timeout: 60000,
            }
          );

          const results = JSON.parse(output);

          if (results.stats && results.stats.failed > 0) {
            throw new Error(
              `External links tests failed: ${results.stats.failed} failures`
            );
          }

          return {
            tests: results.stats?.expected || 0,
            passed:
              (results.stats?.expected || 0) - (results.stats?.failed || 0),
          };
        } catch (error) {
          if (
            error.message.includes('ECONNREFUSED') ||
            error.message.includes('Timed out waiting')
          ) {
            throw new Error('SKIP: Development server not running');
          }
          throw error;
        }
      });
    } else {
      await this.runTest('External Links Functionality', async () => {
        throw new Error('SKIP: Server not running, cannot test external links');
      });
    }
  }

  async validateContentIntegrity() {
    this.log('Validating content structure and integrity...');

    await this.runTest('Content Structure Validation', async () => {
      try {
        execSync('npm run content:validate-structure', {
          encoding: 'utf8',
          timeout: 30000,
          stdio: this.verbose ? 'inherit' : 'pipe',
        });
        return { status: 'valid' };
      } catch (error) {
        throw new Error(
          `Content structure validation failed: ${error.message}`
        );
      }
    });

    await this.runTest('Content Validation', async () => {
      try {
        execSync('npm run content:validate', {
          encoding: 'utf8',
          timeout: 30000,
          stdio: this.verbose ? 'inherit' : 'pipe',
        });
        return { status: 'valid' };
      } catch (error) {
        throw new Error(`Content validation failed: ${error.message}`);
      }
    });

    if (!this.skipServer) {
      await this.runTest('Image Loading and Optimization', async () => {
        try {
          const output = execSync(
            `npx playwright test --grep "image.*load|image.*optim" --reporter=json`,
            {
              encoding: 'utf8',
              timeout: 60000,
            }
          );

          const results = JSON.parse(output);

          if (results.stats && results.stats.failed > 0) {
            throw new Error(
              `Image loading tests failed: ${results.stats.failed} failures`
            );
          }

          return {
            tests: results.stats?.expected || 0,
            passed:
              (results.stats?.expected || 0) - (results.stats?.failed || 0),
          };
        } catch (error) {
          if (
            error.message.includes('ECONNREFUSED') ||
            error.message.includes('Timed out waiting')
          ) {
            throw new Error('SKIP: Development server not running');
          }
          throw error;
        }
      });
    } else {
      await this.runTest('Image Loading and Optimization', async () => {
        throw new Error('SKIP: Server not running, cannot test image loading');
      });
    }
  }

  async generateReport() {
    this.log('Generating core functionality test report...');

    // Ensure output directory exists
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }

    // Generate JSON report
    const jsonReport = path.join(
      this.outputDir,
      'core-site-functionality.json'
    );
    fs.writeFileSync(jsonReport, JSON.stringify(this.results, null, 2));

    // Generate HTML report
    const htmlReport = this.generateHtmlReport();
    const htmlReportPath = path.join(
      this.outputDir,
      'core-site-functionality.html'
    );
    fs.writeFileSync(htmlReportPath, htmlReport);

    this.log(`Reports generated:`);
    this.log(`  JSON: ${jsonReport}`);
    this.log(`  HTML: ${htmlReportPath}`);

    return {
      json: jsonReport,
      html: htmlReportPath,
      summary: this.results.summary,
    };
  }

  generateHtmlReport() {
    const { total, passed, failed, skipped } = this.results.summary;
    const successRate = total > 0 ? ((passed / total) * 100).toFixed(1) : 0;

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Core Site Functionality Test Report</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { background: #2563eb; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
        .content { padding: 20px; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .metric { background: #f8fafc; padding: 20px; border-radius: 8px; text-align: center; }
        .metric-value { font-size: 2em; font-weight: bold; margin-bottom: 5px; }
        .passed { color: #059669; }
        .failed { color: #dc2626; }
        .skipped { color: #d97706; }
        .test-results { margin-top: 30px; }
        .test-item { border: 1px solid #e5e7eb; border-radius: 6px; margin-bottom: 10px; overflow: hidden; }
        .test-header { padding: 15px; background: #f9fafb; font-weight: 600; cursor: pointer; }
        .test-header.passed { border-left: 4px solid #059669; }
        .test-header.failed { border-left: 4px solid #dc2626; }
        .test-header.skipped { border-left: 4px solid #d97706; }
        .test-details { padding: 15px; display: none; background: white; }
        .test-details.show { display: block; }
        .timestamp { color: #6b7280; font-size: 0.9em; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Core Site Functionality Test Report</h1>
            <p class="timestamp">Generated: ${this.results.timestamp}</p>
            <p>Base URL: ${this.results.baseUrl}</p>
        </div>
        
        <div class="content">
            <div class="summary">
                <div class="metric">
                    <div class="metric-value">${total}</div>
                    <div>Total Tests</div>
                </div>
                <div class="metric">
                    <div class="metric-value passed">${passed}</div>
                    <div>Passed</div>
                </div>
                <div class="metric">
                    <div class="metric-value failed">${failed}</div>
                    <div>Failed</div>
                </div>
                <div class="metric">
                    <div class="metric-value skipped">${skipped}</div>
                    <div>Skipped</div>
                </div>
                <div class="metric">
                    <div class="metric-value">${successRate}%</div>
                    <div>Success Rate</div>
                </div>
            </div>
            
            <div class="test-results">
                <h2>Test Results</h2>
                ${this.results.tests
                  .map(
                    (test, index) => `
                    <div class="test-item">
                        <div class="test-header ${test.status}" onclick="toggleDetails(${index})">
                            ${test.status === 'passed' ? '✓' : test.status === 'skipped' ? '⊘' : '✗'} ${test.name} (${test.duration}ms)
                        </div>
                        <div class="test-details" id="details-${index}">
                            ${test.status === 'failed' ? `<p><strong>Error:</strong> ${test.error}</p>` : ''}
                            ${test.status === 'skipped' ? `<p><strong>Reason:</strong> ${test.reason}</p>` : ''}
                            ${test.result ? `<pre>${JSON.stringify(test.result, null, 2)}</pre>` : ''}
                        </div>
                    </div>
                `
                  )
                  .join('')}
            </div>
        </div>
    </div>
    
    <script>
        function toggleDetails(index) {
            const details = document.getElementById('details-' + index);
            details.classList.toggle('show');
        }
    </script>
</body>
</html>`;
  }

  async run() {
    this.log('Starting core site functionality validation...');
    const startTime = Date.now();

    try {
      // Run all validation categories
      await this.validateBasicPageLoading();
      await this.validateContactFormFunctionality();
      await this.validateSocialMediaAndIntegrations();
      await this.validateContentIntegrity();

      // Generate reports
      const reportInfo = await this.generateReport();

      const totalTime = Date.now() - startTime;
      const { total, passed, failed, skipped } = this.results.summary;

      this.log(`\n=== CORE FUNCTIONALITY TESTS COMPLETE ===`);
      this.log(`Total time: ${totalTime}ms`);
      this.log(
        `Tests: ${total} | Passed: ${passed} | Failed: ${failed} | Skipped: ${skipped}`
      );
      this.log(
        `Success rate: ${total > 0 ? ((passed / total) * 100).toFixed(1) : 0}%`
      );

      if (failed > 0) {
        this.log(
          `\n❌ Core site functionality tests FAILED with ${failed} failures`
        );
        process.exit(1);
      } else {
        this.log(`\n✅ Core site functionality tests PASSED`);
        if (skipped > 0) {
          this.log(`⊘ ${skipped} tests skipped`);
        }
      }

      return reportInfo;
    } catch (error) {
      this.log(`Fatal error during testing: ${error.message}`, 'error');
      process.exit(1);
    }
  }
}

// CLI execution
if (require.main === module) {
  console.log('Script starting...');

  const args = process.argv.slice(2);
  const options = {
    verbose: args.includes('--verbose') || args.includes('-v'),
    skipServer: args.includes('--skip-server'),
    baseUrl: args.find(arg => arg.startsWith('--url='))?.split('=')[1],
    outputDir: args.find(arg => arg.startsWith('--output='))?.split('=')[1],
  };

  console.log('Starting Core Site Functionality Validator...');
  if (options.verbose) {
    console.log('Options:', options);
  }

  const validator = new CoreSiteFunctionalityValidator(options);

  // Use async IIFE to handle the promise properly
  (async () => {
    try {
      await validator.run();
    } catch (error) {
      console.error('Core functionality tests failed:', error.message);
      process.exit(1);
    }
  })();
}

module.exports = CoreSiteFunctionalityValidator;
