#!/usr/bin/env node

/**
 * Test Result Aggregator
 *
 * This script aggregates test results from different test runners and formats
 * them for deployment pipeline reporting and dashboard display.
 */

const fs = require('fs');
const path = require('path');

class TestResultAggregator {
  constructor(options = {}) {
    this.outputDir = options.outputDir || './test-results';
    this.verbose = options.verbose || false;
    this.aggregatedResults = {
      timestamp: new Date().toISOString(),
      summary: {
        totalTests: 0,
        passedTests: 0,
        failedTests: 0,
        skippedTests: 0,
        totalSuites: 0,
        passedSuites: 0,
        failedSuites: 0,
        duration: 0,
      },
      testSuites: [],
      coverage: null,
      performance: null,
      accessibility: null,
    };
  }

  log(message, level = 'info') {
    if (this.verbose || level === 'error' || level === 'success') {
      const timestamp = new Date().toISOString();
      console.log(`[${timestamp}] [${level.toUpperCase()}] ${message}`);
    }
  }

  async aggregateViTestResults() {
    this.log('Aggregating Vitest results...');

    const vitestReportPath = path.join(this.outputDir, 'vitest-results.json');

    if (!fs.existsSync(vitestReportPath)) {
      this.log('Vitest results not found, skipping...', 'warning');
      return;
    }

    try {
      const vitestResults = JSON.parse(
        fs.readFileSync(vitestReportPath, 'utf8')
      );

      const suite = {
        name: 'Unit Tests (Vitest)',
        type: 'unit',
        status: vitestResults.success ? 'passed' : 'failed',
        duration: vitestResults.duration || 0,
        tests: {
          total: vitestResults.numTotalTests || 0,
          passed: vitestResults.numPassedTests || 0,
          failed: vitestResults.numFailedTests || 0,
          skipped: vitestResults.numPendingTests || 0,
        },
        coverage: vitestResults.coverage || null,
        files: vitestResults.testResults || [],
      };

      this.aggregatedResults.testSuites.push(suite);
      this.log(`Added Vitest results: ${suite.tests.total} tests`);
    } catch (error) {
      this.log(`Error aggregating Vitest results: ${error.message}`, 'error');
    }
  }

  async aggregatePlaywrightResults() {
    this.log('Aggregating Playwright results...');

    const playwrightReportPath = path.join(
      this.outputDir,
      'playwright-results.json'
    );

    if (!fs.existsSync(playwrightReportPath)) {
      this.log('Playwright results not found, skipping...', 'warning');
      return;
    }

    try {
      const playwrightResults = JSON.parse(
        fs.readFileSync(playwrightReportPath, 'utf8')
      );

      const suite = {
        name: 'End-to-End Tests (Playwright)',
        type: 'e2e',
        status:
          playwrightResults.stats?.expected === playwrightResults.stats?.passed
            ? 'passed'
            : 'failed',
        duration: playwrightResults.stats?.duration || 0,
        tests: {
          total: playwrightResults.stats?.expected || 0,
          passed: playwrightResults.stats?.passed || 0,
          failed: playwrightResults.stats?.failed || 0,
          skipped: playwrightResults.stats?.skipped || 0,
        },
        coverage: null,
        files: playwrightResults.suites || [],
      };

      this.aggregatedResults.testSuites.push(suite);
      this.log(`Added Playwright results: ${suite.tests.total} tests`);
    } catch (error) {
      this.log(
        `Error aggregating Playwright results: ${error.message}`,
        'error'
      );
    }
  }

  async aggregateCustomTestResults() {
    this.log('Aggregating custom test results...');

    // Aggregate accessibility test results
    await this.aggregateAccessibilityResults();

    // Aggregate performance test results
    await this.aggregatePerformanceResults();

    // Aggregate functionality test results
    await this.aggregateFunctionalityResults();
  }

  async aggregateAccessibilityResults() {
    const accessibilityReportPath = path.join(
      this.outputDir,
      'accessibility-results.json'
    );

    if (!fs.existsSync(accessibilityReportPath)) {
      this.log('Accessibility results not found, skipping...', 'warning');
      return;
    }

    try {
      const accessibilityResults = JSON.parse(
        fs.readFileSync(accessibilityReportPath, 'utf8')
      );

      const suite = {
        name: 'Accessibility Tests',
        type: 'accessibility',
        status:
          accessibilityResults.summary?.violations === 0 ? 'passed' : 'failed',
        duration: accessibilityResults.duration || 0,
        tests: {
          total: accessibilityResults.summary?.total || 0,
          passed: accessibilityResults.summary?.passed || 0,
          failed: accessibilityResults.summary?.violations || 0,
          skipped: 0,
        },
        coverage: null,
        files: accessibilityResults.results || [],
      };

      this.aggregatedResults.testSuites.push(suite);
      this.aggregatedResults.accessibility = accessibilityResults;
      this.log(`Added accessibility results: ${suite.tests.total} tests`);
    } catch (error) {
      this.log(
        `Error aggregating accessibility results: ${error.message}`,
        'error'
      );
    }
  }

  async aggregatePerformanceResults() {
    const performanceReportPath = path.join(
      this.outputDir,
      'performance-results.json'
    );

    if (!fs.existsSync(performanceReportPath)) {
      this.log('Performance results not found, skipping...', 'warning');
      return;
    }

    try {
      const performanceResults = JSON.parse(
        fs.readFileSync(performanceReportPath, 'utf8')
      );

      const suite = {
        name: 'Performance Tests',
        type: 'performance',
        status: performanceResults.summary?.passed ? 'passed' : 'failed',
        duration: performanceResults.duration || 0,
        tests: {
          total: performanceResults.summary?.total || 0,
          passed: performanceResults.summary?.passed || 0,
          failed: performanceResults.summary?.failed || 0,
          skipped: 0,
        },
        coverage: null,
        files: performanceResults.results || [],
      };

      this.aggregatedResults.testSuites.push(suite);
      this.aggregatedResults.performance = performanceResults;
      this.log(`Added performance results: ${suite.tests.total} tests`);
    } catch (error) {
      this.log(
        `Error aggregating performance results: ${error.message}`,
        'error'
      );
    }
  }

  async aggregateFunctionalityResults() {
    const functionalityReportPath = path.join(
      this.outputDir,
      'functionality-results.json'
    );

    if (!fs.existsSync(functionalityReportPath)) {
      this.log('Functionality results not found, skipping...', 'warning');
      return;
    }

    try {
      const functionalityResults = JSON.parse(
        fs.readFileSync(functionalityReportPath, 'utf8')
      );

      const suite = {
        name: 'Functionality Tests',
        type: 'functionality',
        status: functionalityResults.summary?.passed ? 'passed' : 'failed',
        duration: functionalityResults.duration || 0,
        tests: {
          total: functionalityResults.summary?.total || 0,
          passed: functionalityResults.summary?.passed || 0,
          failed: functionalityResults.summary?.failed || 0,
          skipped: 0,
        },
        coverage: null,
        files: functionalityResults.results || [],
      };

      this.aggregatedResults.testSuites.push(suite);
      this.log(`Added functionality results: ${suite.tests.total} tests`);
    } catch (error) {
      this.log(
        `Error aggregating functionality results: ${error.message}`,
        'error'
      );
    }
  }

  calculateSummary() {
    this.log('Calculating aggregated summary...');

    let totalTests = 0;
    let passedTests = 0;
    let failedTests = 0;
    let skippedTests = 0;
    const totalSuites = this.aggregatedResults.testSuites.length;
    let passedSuites = 0;
    let failedSuites = 0;
    let totalDuration = 0;

    for (const suite of this.aggregatedResults.testSuites) {
      totalTests += suite.tests.total;
      passedTests += suite.tests.passed;
      failedTests += suite.tests.failed;
      skippedTests += suite.tests.skipped;
      totalDuration += suite.duration;

      if (suite.status === 'passed') {
        passedSuites++;
      } else if (suite.status === 'failed') {
        failedSuites++;
      }
    }

    this.aggregatedResults.summary = {
      totalTests,
      passedTests,
      failedTests,
      skippedTests,
      totalSuites,
      passedSuites,
      failedSuites,
      duration: totalDuration,
    };

    this.log(
      `Summary calculated: ${passedTests}/${totalTests} tests passed, ${passedSuites}/${totalSuites} suites passed`
    );
  }

  async generateReport(format = 'json') {
    this.log(`Generating ${format} report...`);

    const reportPath = path.join(
      this.outputDir,
      `aggregated-test-results.${format}`
    );

    if (format === 'json') {
      fs.writeFileSync(
        reportPath,
        JSON.stringify(this.aggregatedResults, null, 2)
      );
    } else if (format === 'html') {
      const htmlContent = this.generateHtmlReport();
      fs.writeFileSync(reportPath, htmlContent);
    }

    this.log(`Report generated: ${reportPath}`, 'success');
    return reportPath;
  }

  generateHtmlReport() {
    const { summary, testSuites } = this.aggregatedResults;
    const successRate =
      summary.totalTests > 0
        ? ((summary.passedTests / summary.totalTests) * 100).toFixed(1)
        : 0;

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Aggregated Test Results</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; }
        .content { padding: 20px; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .metric { background: #f8fafc; padding: 20px; border-radius: 8px; text-align: center; }
        .metric-value { font-size: 2em; font-weight: bold; margin-bottom: 5px; }
        .passed { color: #059669; }
        .failed { color: #dc2626; }
        .skipped { color: #d97706; }
        .test-suite { border: 1px solid #e5e7eb; border-radius: 6px; margin-bottom: 15px; overflow: hidden; }
        .suite-header { padding: 15px; background: #f9fafb; font-weight: 600; }
        .suite-header.passed { border-left: 4px solid #059669; }
        .suite-header.failed { border-left: 4px solid #dc2626; }
        .suite-details { padding: 15px; background: white; }
        .timestamp { color: #6b7280; font-size: 0.9em; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📊 Aggregated Test Results</h1>
            <p class="timestamp">Generated: ${this.aggregatedResults.timestamp}</p>
            <p>Total Duration: ${(summary.duration / 1000).toFixed(1)} seconds</p>
        </div>
        
        <div class="content">
            <div class="summary">
                <div class="metric">
                    <div class="metric-value">${summary.totalTests}</div>
                    <div>Total Tests</div>
                </div>
                <div class="metric">
                    <div class="metric-value passed">${summary.passedTests}</div>
                    <div>Passed</div>
                </div>
                <div class="metric">
                    <div class="metric-value failed">${summary.failedTests}</div>
                    <div>Failed</div>
                </div>
                <div class="metric">
                    <div class="metric-value skipped">${summary.skippedTests}</div>
                    <div>Skipped</div>
                </div>
                <div class="metric">
                    <div class="metric-value">${successRate}%</div>
                    <div>Success Rate</div>
                </div>
            </div>
            
            <div class="test-suites">
                <h2>Test Suite Results</h2>
                ${testSuites
                  .map(
                    suite => `
                    <div class="test-suite">
                        <div class="suite-header ${suite.status}">
                            ${suite.status === 'passed' ? '✅' : '❌'} ${suite.name}
                            <span style="float: right;">${(suite.duration / 1000).toFixed(1)}s</span>
                        </div>
                        <div class="suite-details">
                            <p><strong>Type:</strong> ${suite.type}</p>
                            <p><strong>Tests:</strong> ${suite.tests.passed}/${suite.tests.total} passed</p>
                            ${suite.tests.failed > 0 ? `<p><strong>Failed:</strong> ${suite.tests.failed}</p>` : ''}
                            ${suite.tests.skipped > 0 ? `<p><strong>Skipped:</strong> ${suite.tests.skipped}</p>` : ''}
                        </div>
                    </div>
                `
                  )
                  .join('')}
            </div>
        </div>
    </div>
</body>
</html>`;
  }

  async run() {
    try {
      this.log('Starting test result aggregation...');

      // Ensure output directory exists
      if (!fs.existsSync(this.outputDir)) {
        fs.mkdirSync(this.outputDir, { recursive: true });
      }

      // Aggregate results from different test runners
      await this.aggregateViTestResults();
      await this.aggregatePlaywrightResults();
      await this.aggregateCustomTestResults();

      // Calculate summary
      this.calculateSummary();

      // Generate reports
      const jsonReport = await this.generateReport('json');
      const htmlReport = await this.generateReport('html');

      this.log('Test result aggregation completed successfully', 'success');
      this.log(`JSON Report: ${jsonReport}`);
      this.log(`HTML Report: ${htmlReport}`);

      return this.aggregatedResults;
    } catch (error) {
      this.log(`Test result aggregation failed: ${error.message}`, 'error');
      throw error;
    }
  }
}

// CLI interface
if (require.main === module) {
  const args = process.argv.slice(2);
  const options = {
    outputDir:
      args.find(arg => arg.startsWith('--output='))?.split('=')[1] ||
      './test-results',
    verbose: args.includes('--verbose') || args.includes('-v'),
  };

  const aggregator = new TestResultAggregator(options);

  aggregator
    .run()
    .then(results => {
      const { summary } = results;
      console.log('\n=== AGGREGATION SUMMARY ===');
      console.log(`Total Tests: ${summary.totalTests}`);
      console.log(`Passed: ${summary.passedTests}`);
      console.log(`Failed: ${summary.failedTests}`);
      console.log(
        `Success Rate: ${summary.totalTests > 0 ? ((summary.passedTests / summary.totalTests) * 100).toFixed(1) : 0}%`
      );

      process.exit(summary.failedTests > 0 ? 1 : 0);
    })
    .catch(error => {
      console.error('Aggregation failed:', error.message);
      process.exit(1);
    });
}

module.exports = TestResultAggregator;
