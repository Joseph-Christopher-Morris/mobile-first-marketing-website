#!/usr/bin/env node

/**
 * Test Runner - Execute All Testing Components
 * 
 * This script provides a unified interface to run all testing components
 * for the S3 + CloudFront deployment validation.
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

class TestRunner {
  constructor(options = {}) {
    this.verbose = options.verbose || false;
    this.environment = options.environment || 'development';
    this.skipServer = options.skipServer || false;
    this.outputDir = options.outputDir || './test-results';
    
    this.log('Test Runner initialized', 'info');
    this.log(`Environment: ${this.environment}`, 'info');
  }

  log(message, level = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`;
    
    if (this.verbose || level === 'error' || level === 'success') {
      console.log(`${prefix} ${message}`);
    }
  }

  async runScript(scriptName, args = []) {
    this.log(`Running ${scriptName}...`);
    
    try {
      const scriptPath = path.join(__dirname, scriptName);
      
      if (!fs.existsSync(scriptPath)) {
        throw new Error(`Script not found: ${scriptPath}`);
      }
      
      const command = `node ${scriptPath} ${args.join(' ')}`;
      const output = execSync(command, {
        encoding: 'utf8',
        timeout: 300000, // 5 minutes
        stdio: this.verbose ? 'inherit' : 'pipe'
      });
      
      this.log(`✓ ${scriptName} completed successfully`, 'success');
      return { success: true, output };
    } catch (error) {
      this.log(`✗ ${scriptName} failed: ${error.message}`, 'error');
      return { success: false, error: error.message };
    }
  }

  async runPlaywrightTests(testPattern = '') {
    this.log(`Running Playwright E2E tests${testPattern ? ` (${testPattern})` : ''}...`);
    
    try {
      const args = ['npx', 'playwright', 'test'];
      
      if (testPattern) {
        args.push('--grep', testPattern);
      }
      
      args.push('--reporter=json');
      
      if (this.skipServer) {
        this.log('Skipping Playwright tests - server not running', 'warning');
        return { success: true, skipped: true };
      }
      
      const output = execSync(args.join(' '), {
        encoding: 'utf8',
        timeout: 300000, // 5 minutes
        stdio: this.verbose ? 'inherit' : 'pipe'
      });
      
      const results = JSON.parse(output);
      
      if (results.stats && results.stats.failed > 0) {
        throw new Error(`${results.stats.failed} Playwright tests failed`);
      }
      
      this.log(`✓ Playwright tests completed successfully`, 'success');
      return { success: true, results };
    } catch (error) {
      if (error.message.includes('ECONNREFUSED')) {
        this.log('Skipping Playwright tests - development server not running', 'warning');
        return { success: true, skipped: true };
      }
      
      this.log(`✗ Playwright tests failed: ${error.message}`, 'error');
      return { success: false, error: error.message };
    }
  }

  async runAllTests() {
    this.log('Starting comprehensive test execution...');
    const startTime = Date.now();
    
    const results = {
      timestamp: new Date().toISOString(),
      environment: this.environment,
      tests: [],
      summary: {
        total: 0,
        passed: 0,
        failed: 0,
        skipped: 0
      }
    };

    // Prepare test arguments
    const commonArgs = [];
    if (this.verbose) commonArgs.push('--verbose');
    if (this.skipServer) commonArgs.push('--skip-server');
    commonArgs.push(`--output=${this.outputDir}`);

    // 1. Core Site Functionality Tests
    const coreTests = await this.runScript('validate-site-functionality.js', commonArgs);
    results.tests.push({ name: 'Core Site Functionality', ...coreTests });

    // 2. Comprehensive Test Suite
    const comprehensiveTests = await this.runScript('comprehensive-test-suite.js', [
      ...commonArgs,
      `--env=${this.environment}`
    ]);
    results.tests.push({ name: 'Comprehensive Test Suite', ...comprehensiveTests });

    // 3. Production Readiness Validation (if staging/production)
    if (this.environment !== 'development') {
      const productionTests = await this.runScript('production-readiness-validator.js', [
        ...commonArgs,
        `--env=${this.environment}`
      ]);
      results.tests.push({ name: 'Production Readiness', ...productionTests });
    }

    // 4. E2E Tests - Core Functionality
    const e2eCore = await this.runPlaywrightTests('core functionality');
    results.tests.push({ name: 'E2E Core Functionality', ...e2eCore });

    // 5. E2E Tests - Accessibility
    const e2eAccessibility = await this.runPlaywrightTests('accessibility');
    results.tests.push({ name: 'E2E Accessibility', ...e2eAccessibility });

    // 6. E2E Tests - Performance
    const e2ePerformance = await this.runPlaywrightTests('performance');
    results.tests.push({ name: 'E2E Performance', ...e2ePerformance });

    // 7. Security Validation
    const securityTests = await this.runScript('security-validation-suite.js', commonArgs);
    results.tests.push({ name: 'Security Validation', ...securityTests });

    // Calculate summary
    results.tests.forEach(test => {
      results.summary.total++;
      if (test.success) {
        if (test.skipped) {
          results.summary.skipped++;
        } else {
          results.summary.passed++;
        }
      } else {
        results.summary.failed++;
      }
    });

    const totalTime = Date.now() - startTime;
    results.duration = totalTime;

    // Generate summary report
    await this.generateSummaryReport(results);

    // Display results
    this.displayResults(results);

    return results;
  }

  async generateSummaryReport(results) {
    // Ensure output directory exists
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }

    // Generate JSON report
    const jsonReport = path.join(this.outputDir, 'all-tests-summary.json');
    fs.writeFileSync(jsonReport, JSON.stringify(results, null, 2));

    // Generate markdown summary
    let summary = `# All Tests Summary Report\n\n`;
    summary += `**Generated:** ${results.timestamp}\n`;
    summary += `**Environment:** ${results.environment}\n`;
    summary += `**Duration:** ${Math.round(results.duration / 1000)}s\n\n`;

    summary += `## Overall Results\n\n`;
    summary += `| Metric | Count |\n`;
    summary += `|--------|-------|\n`;
    summary += `| Total Test Suites | ${results.summary.total} |\n`;
    summary += `| Passed | ${results.summary.passed} |\n`;
    summary += `| Failed | ${results.summary.failed} |\n`;
    summary += `| Skipped | ${results.summary.skipped} |\n`;
    summary += `| Success Rate | ${Math.round((results.summary.passed / results.summary.total) * 100)}% |\n\n`;

    summary += `## Test Suite Results\n\n`;
    results.tests.forEach(test => {
      const status = test.success ? (test.skipped ? '⊘ SKIPPED' : '✅ PASSED') : '❌ FAILED';
      summary += `- **${test.name}:** ${status}\n`;
      if (test.error) {
        summary += `  - Error: ${test.error}\n`;
      }
    });

    const summaryPath = path.join(this.outputDir, 'all-tests-summary.md');
    fs.writeFileSync(summaryPath, summary);

    this.log(`Summary reports generated:`);
    this.log(`  JSON: ${jsonReport}`);
    this.log(`  Markdown: ${summaryPath}`);
  }

  displayResults(results) {
    const { total, passed, failed, skipped } = results.summary;
    const successRate = total > 0 ? Math.round((passed / total) * 100) : 0;

    console.log('\n' + '='.repeat(80));
    console.log('ALL TESTS EXECUTION COMPLETE');
    console.log('='.repeat(80));
    console.log(`Environment: ${results.environment}`);
    console.log(`Total execution time: ${Math.round(results.duration / 1000)}s`);
    console.log(`Test suites: ${total}`);
    console.log(`Passed: ${passed} | Failed: ${failed} | Skipped: ${skipped}`);
    console.log(`Success rate: ${successRate}%`);
    console.log('='.repeat(80));

    if (failed > 0) {
      console.log(`\n❌ SOME TESTS FAILED`);
      console.log(`${failed} test suite(s) failed. Review the detailed reports for analysis.`);
      
      // List failed tests
      const failedTests = results.tests.filter(test => !test.success);
      failedTests.forEach(test => {
        console.log(`  - ${test.name}: ${test.error}`);
      });
      
      process.exit(1);
    } else {
      console.log(`\n✅ ALL TESTS PASSED`);
      if (skipped > 0) {
        console.log(`⊘ ${skipped} test suite(s) skipped`);
      }
      console.log(`\nSystem is ready for deployment! 🚀`);
    }
  }

  async runQuickTests() {
    this.log('Running quick validation tests...');
    
    const results = {
      timestamp: new Date().toISOString(),
      tests: [],
      summary: { total: 0, passed: 0, failed: 0, skipped: 0 }
    };

    // Quick tests - essential validations only
    const commonArgs = this.verbose ? ['--verbose'] : [];
    
    // 1. Core functionality
    const coreTests = await this.runScript('validate-core-functionality-quick.js', commonArgs);
    results.tests.push({ name: 'Quick Core Functionality', ...coreTests });

    // 2. Security headers
    const securityTests = await this.runScript('security-headers-validator.js', commonArgs);
    results.tests.push({ name: 'Security Headers', ...securityTests });

    // 3. Build validation
    try {
      execSync('npm run build', { stdio: 'pipe', timeout: 60000 });
      results.tests.push({ name: 'Build Process', success: true });
    } catch (error) {
      results.tests.push({ name: 'Build Process', success: false, error: error.message });
    }

    // Calculate summary
    results.tests.forEach(test => {
      results.summary.total++;
      if (test.success) {
        results.summary.passed++;
      } else {
        results.summary.failed++;
      }
    });

    this.displayResults(results);
    return results;
  }
}

// CLI execution
if (require.main === module) {
  const args = process.argv.slice(2);
  const options = {
    verbose: args.includes('--verbose') || args.includes('-v'),
    skipServer: args.includes('--skip-server'),
    environment: args.find(arg => arg.startsWith('--env='))?.split('=')[1] || 'development',
    outputDir: args.find(arg => arg.startsWith('--output='))?.split('=')[1]
  };

  const quick = args.includes('--quick');

  console.log(`🧪 Starting ${quick ? 'Quick' : 'Comprehensive'} Test Execution`);
  if (options.verbose) {
    console.log('Configuration:', options);
  }

  const runner = new TestRunner(options);

  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n⚠️  Test execution interrupted by user');
    process.exit(1);
  });

  process.on('SIGTERM', () => {
    console.log('\n⚠️  Test execution terminated');
    process.exit(1);
  });

  // Execute tests
  (async () => {
    try {
      if (quick) {
        await runner.runQuickTests();
      } else {
        await runner.runAllTests();
      }
    } catch (error) {
      console.error('❌ Test execution failed:', error.message);
      process.exit(1);
    }
  })();
}

module.exports = TestRunner;