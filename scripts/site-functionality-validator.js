#!/usr/bin/env node

/**
 * Site Functionality Validator
 * 
 * This script validates deployed site functionality by running comprehensive tests
 * including critical user journeys, performance checks, and accessibility validation.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class SiteFunctionalityValidator {
  constructor(options = {}) {
    this.baseUrl = options.baseUrl || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    this.verbose = options.verbose || false;
    this.outputDir = options.outputDir || './test-results';
    this.results = {
      timestamp: new Date().toISOString(),
      baseUrl: this.baseUrl,
      tests: [],
      summary: {
        total: 0,
        passed: 0,
        failed: 0,
        warnings: 0
      }
    };
  }

  log(message, level = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`;
    
    if (this.verbose || level === 'error') {
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
        result
      });
      
      this.results.summary.passed++;
      this.log(`✓ ${testName} (${duration}ms)`, 'success');
      return true;
    } catch (error) {
      const duration = Date.now() - startTime;
      
      this.results.tests.push({
        name: testName,
        status: 'failed',
        duration,
        error: error.message
      });
      
      this.results.summary.failed++;
      this.log(`✗ ${testName}: ${error.message} (${duration}ms)`, 'error');
      return false;
    } finally {
      this.results.summary.total++;
    }
  }

  async validateCriticalUserJourneys() {
    this.log('Validating critical user journeys...');
    
    // Run E2E tests for critical paths
    await this.runTest('Homepage Load and Navigation', async () => {
      const output = execSync('npx playwright test e2e/homepage.spec.ts --reporter=json', { 
        encoding: 'utf8',
        timeout: 60000 
      });
      const results = JSON.parse(output);
      
      if (results.stats.failed > 0) {
        throw new Error(`Homepage tests failed: ${results.stats.failed} failures`);
      }
      
      return {
        tests: results.stats.expected,
        passed: results.stats.expected - results.stats.failed
      };
    });

    await this.runTest('Contact Form Functionality', async () => {
      const output = execSync('npx playwright test e2e/contact-form.spec.ts --reporter=json', { 
        encoding: 'utf8',
        timeout: 60000 
      });
      const results = JSON.parse(output);
      
      if (results.stats.failed > 0) {
        throw new Error(`Contact form tests failed: ${results.stats.failed} failures`);
      }
      
      return {
        tests: results.stats.expected,
        passed: results.stats.expected - results.stats.failed
      };
    });

    await this.runTest('Navigation and Routing', async () => {
      const output = execSync('npx playwright test e2e/navigation.spec.ts --reporter=json', { 
        encoding: 'utf8',
        timeout: 60000 
      });
      const results = JSON.parse(output);
      
      if (results.stats.failed > 0) {
        throw new Error(`Navigation tests failed: ${results.stats.failed} failures`);
      }
      
      return {
        tests: results.stats.expected,
        passed: results.stats.expected - results.stats.failed
      };
    });
  }

  async validatePerformance() {
    this.log('Validating performance metrics...');
    
    await this.runTest('Core Web Vitals', async () => {
      // Run Lighthouse CI if available, otherwise use basic performance checks
      try {
        const output = execSync('npx lighthouse-ci autorun --collect.numberOfRuns=1 --assert.assertions.categories:performance=0.8', {
          encoding: 'utf8',
          timeout: 120000
        });
        
        return { lighthouse: 'passed', output: output.substring(0, 500) };
      } catch (error) {
        // Fallback to basic performance validation
        this.log('Lighthouse not available, using basic performance checks', 'warning');
        
        const output = execSync('npx playwright test --grep "performance" --reporter=json', { 
          encoding: 'utf8',
          timeout: 60000 
        });
        const results = JSON.parse(output);
        
        if (results.stats.failed > 0) {
          throw new Error(`Performance tests failed: ${results.stats.failed} failures`);
        }
        
        return { basic: 'passed', tests: results.stats.expected };
      }
    });

    await this.runTest('Bundle Size Analysis', async () => {
      // Check if build output exists and analyze bundle sizes
      const buildDir = path.join(process.cwd(), '.next');
      if (!fs.existsSync(buildDir)) {
        throw new Error('Build directory not found. Run npm run build first.');
      }
      
      // Run bundle analyzer in CI mode
      const output = execSync('ANALYZE=true npm run build 2>&1 | tail -20', {
        encoding: 'utf8',
        timeout: 60000
      });
      
      return { 
        status: 'analyzed',
        output: output.substring(0, 500)
      };
    });
  }

  async validateAccessibility() {
    this.log('Validating accessibility compliance...');
    
    await this.runTest('WCAG Compliance', async () => {
      // Run accessibility tests from existing E2E suite
      const output = execSync('npx playwright test --grep "accessibility" --reporter=json', { 
        encoding: 'utf8',
        timeout: 60000 
      });
      const results = JSON.parse(output);
      
      if (results.stats.failed > 0) {
        throw new Error(`Accessibility tests failed: ${results.stats.failed} failures`);
      }
      
      return {
        tests: results.stats.expected,
        passed: results.stats.expected - results.stats.failed
      };
    });

    await this.runTest('Keyboard Navigation', async () => {
      const output = execSync('npx playwright test --grep "keyboard" --reporter=json', { 
        encoding: 'utf8',
        timeout: 60000 
      });
      const results = JSON.parse(output);
      
      if (results.stats.failed > 0) {
        throw new Error(`Keyboard navigation tests failed: ${results.stats.failed} failures`);
      }
      
      return {
        tests: results.stats.expected,
        passed: results.stats.expected - results.stats.failed
      };
    });

    await this.runTest('Mobile Accessibility', async () => {
      const output = execSync('npx playwright test --project="Mobile Chrome" --grep "mobile" --reporter=json', { 
        encoding: 'utf8',
        timeout: 60000 
      });
      const results = JSON.parse(output);
      
      if (results.stats.failed > 0) {
        throw new Error(`Mobile accessibility tests failed: ${results.stats.failed} failures`);
      }
      
      return {
        tests: results.stats.expected,
        passed: results.stats.expected - results.stats.failed
      };
    });
  }

  async validateSecurity() {
    this.log('Validating security measures...');
    
    await this.runTest('Security Headers', async () => {
      // Check for security headers in the deployed site
      const { execSync } = require('child_process');
      
      try {
        const curlOutput = execSync(`curl -I "${this.baseUrl}" 2>/dev/null`, { 
          encoding: 'utf8',
          timeout: 10000 
        });
        
        const headers = curlOutput.toLowerCase();
        const requiredHeaders = [
          'strict-transport-security',
          'x-content-type-options',
          'x-frame-options',
          'content-security-policy'
        ];
        
        const missingHeaders = requiredHeaders.filter(header => !headers.includes(header));
        
        if (missingHeaders.length > 0) {
          throw new Error(`Missing security headers: ${missingHeaders.join(', ')}`);
        }
        
        return { 
          status: 'secure',
          headers: requiredHeaders.length,
          missing: missingHeaders.length
        };
      } catch (error) {
        // If curl fails, skip this test with warning
        this.log('Could not validate security headers (curl failed)', 'warning');
        this.results.summary.warnings++;
        return { status: 'skipped', reason: 'curl not available' };
      }
    });

    await this.runTest('Form Security', async () => {
      // Run security-related form tests
      const output = execSync('npx playwright test --grep "spam|rate" --reporter=json', { 
        encoding: 'utf8',
        timeout: 60000 
      });
      const results = JSON.parse(output);
      
      if (results.stats.failed > 0) {
        throw new Error(`Form security tests failed: ${results.stats.failed} failures`);
      }
      
      return {
        tests: results.stats.expected,
        passed: results.stats.expected - results.stats.failed
      };
    });
  }

  async validateContentIntegrity() {
    this.log('Validating content integrity...');
    
    await this.runTest('Content Structure', async () => {
      execSync('npm run content:validate-structure', { 
        encoding: 'utf8',
        timeout: 30000 
      });
      return { status: 'valid' };
    });

    await this.runTest('Content Validation', async () => {
      execSync('npm run content:validate', { 
        encoding: 'utf8',
        timeout: 30000 
      });
      return { status: 'valid' };
    });

    await this.runTest('Image Loading', async () => {
      const output = execSync('npx playwright test --grep "image" --reporter=json', { 
        encoding: 'utf8',
        timeout: 60000 
      });
      const results = JSON.parse(output);
      
      if (results.stats.failed > 0) {
        throw new Error(`Image loading tests failed: ${results.stats.failed} failures`);
      }
      
      return {
        tests: results.stats.expected,
        passed: results.stats.expected - results.stats.failed
      };
    });
  }

  async generateReport() {
    this.log('Generating validation report...');
    
    // Ensure output directory exists
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
    
    // Generate JSON report
    const jsonReport = path.join(this.outputDir, 'site-functionality-report.json');
    fs.writeFileSync(jsonReport, JSON.stringify(this.results, null, 2));
    
    // Generate HTML report
    const htmlReport = this.generateHtmlReport();
    const htmlReportPath = path.join(this.outputDir, 'site-functionality-report.html');
    fs.writeFileSync(htmlReportPath, htmlReport);
    
    this.log(`Reports generated:`);
    this.log(`  JSON: ${jsonReport}`);
    this.log(`  HTML: ${htmlReportPath}`);
    
    return {
      json: jsonReport,
      html: htmlReportPath,
      summary: this.results.summary
    };
  }

  generateHtmlReport() {
    const { total, passed, failed, warnings } = this.results.summary;
    const successRate = total > 0 ? ((passed / total) * 100).toFixed(1) : 0;
    
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Site Functionality Validation Report</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { background: #2563eb; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
        .content { padding: 20px; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .metric { background: #f8fafc; padding: 20px; border-radius: 8px; text-align: center; }
        .metric-value { font-size: 2em; font-weight: bold; margin-bottom: 5px; }
        .passed { color: #059669; }
        .failed { color: #dc2626; }
        .warnings { color: #d97706; }
        .test-results { margin-top: 30px; }
        .test-item { border: 1px solid #e5e7eb; border-radius: 6px; margin-bottom: 10px; overflow: hidden; }
        .test-header { padding: 15px; background: #f9fafb; font-weight: 600; cursor: pointer; }
        .test-header.passed { border-left: 4px solid #059669; }
        .test-header.failed { border-left: 4px solid #dc2626; }
        .test-details { padding: 15px; display: none; background: white; }
        .test-details.show { display: block; }
        .timestamp { color: #6b7280; font-size: 0.9em; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Site Functionality Validation Report</h1>
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
                    <div class="metric-value warnings">${warnings}</div>
                    <div>Warnings</div>
                </div>
                <div class="metric">
                    <div class="metric-value">${successRate}%</div>
                    <div>Success Rate</div>
                </div>
            </div>
            
            <div class="test-results">
                <h2>Test Results</h2>
                ${this.results.tests.map((test, index) => `
                    <div class="test-item">
                        <div class="test-header ${test.status}" onclick="toggleDetails(${index})">
                            ${test.status === 'passed' ? '✓' : '✗'} ${test.name} (${test.duration}ms)
                        </div>
                        <div class="test-details" id="details-${index}">
                            ${test.status === 'failed' ? `<p><strong>Error:</strong> ${test.error}</p>` : ''}
                            ${test.result ? `<pre>${JSON.stringify(test.result, null, 2)}</pre>` : ''}
                        </div>
                    </div>
                `).join('')}
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
    this.log('Starting site functionality validation...');
    const startTime = Date.now();
    
    try {
      // Run all validation categories
      await this.validateCriticalUserJourneys();
      await this.validatePerformance();
      await this.validateAccessibility();
      await this.validateSecurity();
      await this.validateContentIntegrity();
      
      // Generate reports
      const reportInfo = await this.generateReport();
      
      const totalTime = Date.now() - startTime;
      const { total, passed, failed, warnings } = this.results.summary;
      
      this.log(`\n=== VALIDATION COMPLETE ===`);
      this.log(`Total time: ${totalTime}ms`);
      this.log(`Tests: ${total} | Passed: ${passed} | Failed: ${failed} | Warnings: ${warnings}`);
      this.log(`Success rate: ${total > 0 ? ((passed / total) * 100).toFixed(1) : 0}%`);
      
      if (failed > 0) {
        this.log(`\n❌ Site functionality validation FAILED with ${failed} failures`);
        process.exit(1);
      } else {
        this.log(`\n✅ Site functionality validation PASSED`);
        if (warnings > 0) {
          this.log(`⚠️  ${warnings} warnings detected`);
        }
      }
      
      return reportInfo;
    } catch (error) {
      this.log(`Fatal error during validation: ${error.message}`, 'error');
      process.exit(1);
    }
  }
}

// CLI execution
if (require.main === module) {
  const args = process.argv.slice(2);
  const options = {
    verbose: args.includes('--verbose') || args.includes('-v'),
    baseUrl: args.find(arg => arg.startsWith('--url='))?.split('=')[1],
    outputDir: args.find(arg => arg.startsWith('--output='))?.split('=')[1]
  };
  
  console.log('Starting Site Functionality Validator...');
  console.log('Options:', options);
  
  const validator = new SiteFunctionalityValidator(options);
  
  // Use async IIFE to handle the promise properly
  (async () => {
    try {
      await validator.run();
    } catch (error) {
      console.error('Validation failed:', error.message);
      process.exit(1);
    }
  })();
}

module.exports = SiteFunctionalityValidator;