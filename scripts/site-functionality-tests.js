#!/usr/bin/env node

/**
 * Site Functionality Tests
 *
 * This script runs comprehensive site functionality tests including
 * critical user journeys, performance validation, and accessibility checks.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class SiteFunctionalityTests {
  constructor(options = {}) {
    this.verbose = options.verbose || false;
    this.outputDir = options.outputDir || './test-results';
    this.skipServer = options.skipServer || false;
    this.results = {
      timestamp: new Date().toISOString(),
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

  async validateBuildAndExport() {
    this.log('Validating build and export process...');

    await this.runTest('Build Process', async () => {
      try {
        execSync('npm run build', {
          encoding: 'utf8',
          timeout: 120000,
          stdio: this.verbose ? 'inherit' : 'pipe',
        });
        return { status: 'success' };
      } catch (error) {
        throw new Error(`Build failed: ${error.message}`);
      }
    });

    await this.runTest('Static Export', async () => {
      try {
        execSync('npm run export', {
          encoding: 'utf8',
          timeout: 60000,
          stdio: this.verbose ? 'inherit' : 'pipe',
        });

        // Check if out directory exists
        const outDir = path.join(process.cwd(), 'out');
        if (!fs.existsSync(outDir)) {
          throw new Error('Export directory not found');
        }

        // Check for index.html
        const indexFile = path.join(outDir, 'index.html');
        if (!fs.existsSync(indexFile)) {
          throw new Error('Index.html not found in export');
        }

        return { status: 'success', outputDir: outDir };
      } catch (error) {
        throw new Error(`Export failed: ${error.message}`);
      }
    });
  }

  async validateContentStructure() {
    this.log('Validating content structure...');

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
  }

  async validateEnvironmentConfiguration() {
    this.log('Validating environment configuration...');

    await this.runTest('Environment Variables', async () => {
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

    await this.runTest('Environment Testing', async () => {
      try {
        execSync('npm run env:test', {
          encoding: 'utf8',
          timeout: 30000,
          stdio: this.verbose ? 'inherit' : 'pipe',
        });
        return { status: 'valid' };
      } catch (error) {
        throw new Error(`Environment testing failed: ${error.message}`);
      }
    });
  }

  async validateUnitTests() {
    this.log('Running unit tests...');

    await this.runTest('Unit Test Suite', async () => {
      try {
        const output = execSync('npm run test', {
          encoding: 'utf8',
          timeout: 60000,
          stdio: this.verbose ? 'inherit' : 'pipe',
        });

        return {
          status: 'passed',
          output: output.substring(0, 500),
        };
      } catch (error) {
        throw new Error(`Unit tests failed: ${error.message}`);
      }
    });
  }

  async validateTypeChecking() {
    this.log('Validating TypeScript compilation...');

    await this.runTest('TypeScript Type Checking', async () => {
      try {
        execSync('npm run type-check', {
          encoding: 'utf8',
          timeout: 60000,
          stdio: this.verbose ? 'inherit' : 'pipe',
        });
        return { status: 'valid' };
      } catch (error) {
        throw new Error(`Type checking failed: ${error.message}`);
      }
    });
  }

  async validateLinting() {
    this.log('Validating code quality...');

    await this.runTest('ESLint Validation', async () => {
      try {
        execSync('npm run lint', {
          encoding: 'utf8',
          timeout: 60000,
          stdio: this.verbose ? 'inherit' : 'pipe',
        });
        return { status: 'valid' };
      } catch (error) {
        throw new Error(`Linting failed: ${error.message}`);
      }
    });

    await this.runTest('Prettier Format Check', async () => {
      try {
        execSync('npm run format:check', {
          encoding: 'utf8',
          timeout: 30000,
          stdio: this.verbose ? 'inherit' : 'pipe',
        });
        return { status: 'valid' };
      } catch (error) {
        throw new Error(`Format check failed: ${error.message}`);
      }
    });
  }

  async validateE2ETests() {
    this.log('Running E2E tests...');

    if (this.skipServer) {
      await this.runTest('E2E Tests', async () => {
        throw new Error('SKIP: E2E tests require development server');
      });
      return;
    }

    await this.runTest('Critical User Journeys', async () => {
      try {
        const output = execSync(
          'npx playwright test e2e/critical-user-journeys.spec.ts --reporter=json',
          {
            encoding: 'utf8',
            timeout: 120000,
          }
        );

        const results = JSON.parse(output);

        if (results.stats && results.stats.failed > 0) {
          throw new Error(
            `Critical user journey tests failed: ${results.stats.failed} failures`
          );
        }

        return {
          tests: results.stats?.expected || 0,
          passed: (results.stats?.expected || 0) - (results.stats?.failed || 0),
        };
      } catch (error) {
        if (
          error.message.includes('Timed out waiting') ||
          error.message.includes('ECONNREFUSED')
        ) {
          throw new Error('SKIP: Development server not running');
        }
        throw error;
      }
    });

    await this.runTest('Performance Tests', async () => {
      try {
        const output = execSync(
          'npx playwright test e2e/performance.spec.ts --reporter=json',
          {
            encoding: 'utf8',
            timeout: 120000,
          }
        );

        const results = JSON.parse(output);

        if (results.stats && results.stats.failed > 0) {
          throw new Error(
            `Performance tests failed: ${results.stats.failed} failures`
          );
        }

        return {
          tests: results.stats?.expected || 0,
          passed: (results.stats?.expected || 0) - (results.stats?.failed || 0),
        };
      } catch (error) {
        if (
          error.message.includes('Timed out waiting') ||
          error.message.includes('ECONNREFUSED')
        ) {
          throw new Error('SKIP: Development server not running');
        }
        throw error;
      }
    });

    await this.runTest('Accessibility Tests', async () => {
      try {
        const output = execSync(
          'npx playwright test e2e/accessibility.spec.ts --reporter=json',
          {
            encoding: 'utf8',
            timeout: 120000,
          }
        );

        const results = JSON.parse(output);

        if (results.stats && results.stats.failed > 0) {
          throw new Error(
            `Accessibility tests failed: ${results.stats.failed} failures`
          );
        }

        return {
          tests: results.stats?.expected || 0,
          passed: (results.stats?.expected || 0) - (results.stats?.failed || 0),
        };
      } catch (error) {
        if (
          error.message.includes('Timed out waiting') ||
          error.message.includes('ECONNREFUSED')
        ) {
          throw new Error('SKIP: Development server not running');
        }
        throw error;
      }
    });
  }

  async generateReport() {
    this.log('Generating test report...');

    // Ensure output directory exists
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }

    // Generate JSON report
    const jsonReport = path.join(
      this.outputDir,
      'site-functionality-tests.json'
    );
    fs.writeFileSync(jsonReport, JSON.stringify(this.results, null, 2));

    // Generate HTML report
    const htmlReport = this.generateHtmlReport();
    const htmlReportPath = path.join(
      this.outputDir,
      'site-functionality-tests.html'
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
    <title>Site Functionality Test Report</title>
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
            <h1>Site Functionality Test Report</h1>
            <p class="timestamp">Generated: ${this.results.timestamp}</p>
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
    this.log('Starting site functionality tests...');
    const startTime = Date.now();

    try {
      // Run all test categories
      await this.validateTypeChecking();
      await this.validateLinting();
      await this.validateEnvironmentConfiguration();
      await this.validateContentStructure();
      await this.validateUnitTests();
      await this.validateBuildAndExport();
      await this.validateE2ETests();

      // Generate reports
      const reportInfo = await this.generateReport();

      const totalTime = Date.now() - startTime;
      const { total, passed, failed, skipped } = this.results.summary;

      this.log(`\n=== TESTS COMPLETE ===`);
      this.log(`Total time: ${totalTime}ms`);
      this.log(
        `Tests: ${total} | Passed: ${passed} | Failed: ${failed} | Skipped: ${skipped}`
      );
      this.log(
        `Success rate: ${total > 0 ? ((passed / total) * 100).toFixed(1) : 0}%`
      );

      if (failed > 0) {
        this.log(
          `\n❌ Site functionality tests FAILED with ${failed} failures`
        );
        process.exit(1);
      } else {
        this.log(`\n✅ Site functionality tests PASSED`);
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
  const args = process.argv.slice(2);
  const options = {
    verbose: args.includes('--verbose') || args.includes('-v'),
    skipServer: args.includes('--skip-server'),
    outputDir: args.find(arg => arg.startsWith('--output='))?.split('=')[1],
  };

  console.log('Starting Site Functionality Tests...');
  if (options.verbose) {
    console.log('Options:', options);
  }

  const tester = new SiteFunctionalityTests(options);

  // Use async IIFE to handle the promise properly
  (async () => {
    try {
      await tester.run();
    } catch (error) {
      console.error('Tests failed:', error.message);
      process.exit(1);
    }
  })();
}

module.exports = SiteFunctionalityTests;
