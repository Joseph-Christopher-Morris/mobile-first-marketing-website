#!/usr/bin/env node

/**
 * Comprehensive Test Suite for S3 + CloudFront Deployment
 *
 * This script implements a complete testing framework for validating:
 * - End-to-end deployment pipeline functionality
 * - Performance validation against defined budgets
 * - Security configuration compliance
 * - Infrastructure integrity and reliability
 *
 * Requirements: 1.5, 2.5, 7.5
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
const { URL } = require('url');

class ComprehensiveTestSuite {
  constructor(options = {}) {
    this.baseUrl =
      options.baseUrl ||
      process.env.NEXT_PUBLIC_SITE_URL ||
      'http://localhost:3000';
    this.verbose = options.verbose || false;
    this.outputDir = options.outputDir || './test-results';
    this.skipServer = options.skipServer || false;
    this.environment = options.environment || 'development';

    this.results = {
      timestamp: new Date().toISOString(),
      environment: this.environment,
      baseUrl: this.baseUrl,
      testSuites: [],
      summary: {
        totalSuites: 0,
        totalTests: 0,
        passed: 0,
        failed: 0,
        skipped: 0,
        warnings: 0,
      },
    };

    // Performance budgets
    this.performanceBudgets = {
      lcp: 2500, // Largest Contentful Paint
      fid: 100, // First Input Delay
      cls: 0.1, // Cumulative Layout Shift
      fcp: 1800, // First Contentful Paint
      tti: 3800, // Time to Interactive
      tbt: 200, // Total Blocking Time
      pageLoadTime: 3000,
      timeToFirstByte: 600,
      jsBundle: 500 * 1024, // 500KB
      cssBundle: 100 * 1024, // 100KB
    };

    this.log('Comprehensive Test Suite initialized', 'info');
    this.log(`Environment: ${this.environment}`, 'info');
    this.log(`Base URL: ${this.baseUrl}`, 'info');
  }

  log(message, level = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`;

    if (this.verbose || level === 'error' || level === 'success') {
      console.log(`${prefix} ${message}`);
    }
  }

  async makeRequest(url, options = {}) {
    return new Promise((resolve, reject) => {
      const urlObj = new URL(url);
      const client = urlObj.protocol === 'https:' ? https : http;

      const req = client.request(
        url,
        {
          method: options.method || 'GET',
          headers: options.headers || {},
          timeout: options.timeout || 10000,
          ...options,
        },
        res => {
          let data = '';
          res.on('data', chunk => (data += chunk));
          res.on('end', () => {
            resolve({
              statusCode: res.statusCode,
              headers: res.headers,
              body: data,
              url: url,
            });
          });
        }
      );

      req.on('error', reject);
      req.on('timeout', () => reject(new Error('Request timeout')));

      if (options.body) {
        req.write(options.body);
      }

      req.end();
    });
  }

  async runTestSuite(suiteName, testFunction) {
    this.log(`Starting test suite: ${suiteName}`);
    const startTime = Date.now();

    const suite = {
      name: suiteName,
      startTime: new Date().toISOString(),
      tests: [],
      summary: {
        total: 0,
        passed: 0,
        failed: 0,
        skipped: 0,
        warnings: 0,
      },
    };

    try {
      await testFunction(suite);

      const duration = Date.now() - startTime;
      suite.duration = duration;
      suite.endTime = new Date().toISOString();
      suite.status = suite.summary.failed > 0 ? 'failed' : 'passed';

      this.results.testSuites.push(suite);
      this.results.summary.totalSuites++;
      this.results.summary.totalTests += suite.summary.total;
      this.results.summary.passed += suite.summary.passed;
      this.results.summary.failed += suite.summary.failed;
      this.results.summary.skipped += suite.summary.skipped;
      this.results.summary.warnings += suite.summary.warnings;

      this.log(
        `✓ Test suite completed: ${suiteName} (${duration}ms)`,
        'success'
      );
      return suite;
    } catch (error) {
      const duration = Date.now() - startTime;
      suite.duration = duration;
      suite.endTime = new Date().toISOString();
      suite.status = 'failed';
      suite.error = error.message;

      this.results.testSuites.push(suite);
      this.results.summary.totalSuites++;
      this.results.summary.failed++;

      this.log(
        `✗ Test suite failed: ${suiteName}: ${error.message} (${duration}ms)`,
        'error'
      );
      return suite;
    }
  }

  async runTest(suite, testName, testFunction) {
    this.log(`  Running test: ${testName}`);
    const startTime = Date.now();

    try {
      const result = await testFunction();
      const duration = Date.now() - startTime;

      suite.tests.push({
        name: testName,
        status: 'passed',
        duration,
        result,
      });

      suite.summary.passed++;
      this.log(`    ✓ ${testName} (${duration}ms)`, 'success');
      return true;
    } catch (error) {
      const duration = Date.now() - startTime;

      if (error.message.includes('SKIP')) {
        suite.tests.push({
          name: testName,
          status: 'skipped',
          duration,
          reason: error.message,
        });

        suite.summary.skipped++;
        this.log(
          `    ⊘ ${testName}: ${error.message} (${duration}ms)`,
          'warning'
        );
        return null;
      } else if (error.message.includes('WARN')) {
        suite.tests.push({
          name: testName,
          status: 'warning',
          duration,
          warning: error.message,
        });

        suite.summary.warnings++;
        this.log(
          `    ⚠ ${testName}: ${error.message} (${duration}ms)`,
          'warning'
        );
        return null;
      } else {
        suite.tests.push({
          name: testName,
          status: 'failed',
          duration,
          error: error.message,
        });

        suite.summary.failed++;
        this.log(
          `    ✗ ${testName}: ${error.message} (${duration}ms)`,
          'error'
        );
        return false;
      }
    } finally {
      suite.summary.total++;
    }
  }

  // End-to-End Deployment Testing
  async runEndToEndDeploymentTests(suite) {
    await this.runTest(suite, 'Build Process Validation', async () => {
      try {
        execSync('npm run build', {
          encoding: 'utf8',
          timeout: 120000,
          stdio: this.verbose ? 'inherit' : 'pipe',
        });

        // Verify build output exists
        const buildDir = path.join(process.cwd(), 'out');
        if (!fs.existsSync(buildDir)) {
          throw new Error('Build output directory not found');
        }

        // Check for essential files
        const essentialFiles = ['index.html', '_next'];
        for (const file of essentialFiles) {
          const filePath = path.join(buildDir, file);
          if (!fs.existsSync(filePath)) {
            throw new Error(`Essential build file missing: ${file}`);
          }
        }

        return { status: 'build_successful', outputDir: buildDir };
      } catch (error) {
        throw new Error(`Build process failed: ${error.message}`);
      }
    });

    await this.runTest(suite, 'Infrastructure Setup Validation', async () => {
      try {
        // Test infrastructure setup script
        const output = execSync(
          'node scripts/setup-infrastructure.js --dry-run',
          {
            encoding: 'utf8',
            timeout: 60000,
          }
        );

        return {
          status: 'infrastructure_valid',
          output: output.substring(0, 200),
        };
      } catch (error) {
        throw new Error(
          `Infrastructure setup validation failed: ${error.message}`
        );
      }
    });

    await this.runTest(suite, 'Deployment Script Validation', async () => {
      try {
        // Test deployment script in dry-run mode
        const output = execSync('node scripts/deploy.js --dry-run', {
          encoding: 'utf8',
          timeout: 60000,
        });

        return {
          status: 'deployment_script_valid',
          output: output.substring(0, 200),
        };
      } catch (error) {
        throw new Error(
          `Deployment script validation failed: ${error.message}`
        );
      }
    });

    await this.runTest(suite, 'Rollback Mechanism Validation', async () => {
      try {
        // Test rollback script
        const output = execSync('node scripts/rollback.js --dry-run', {
          encoding: 'utf8',
          timeout: 60000,
        });

        return { status: 'rollback_valid', output: output.substring(0, 200) };
      } catch (error) {
        throw new Error(
          `Rollback mechanism validation failed: ${error.message}`
        );
      }
    });

    if (!this.skipServer) {
      await this.runTest(
        suite,
        'Site Accessibility Post-Deployment',
        async () => {
          const response = await this.makeRequest(this.baseUrl);

          if (response.statusCode !== 200) {
            throw new Error(`Site not accessible: HTTP ${response.statusCode}`);
          }

          // Check for essential HTML structure
          const hasTitle = response.body.includes('<title>');
          const hasMainContent =
            response.body.includes('<main') ||
            response.body.includes('id="main"');

          if (!hasTitle || !hasMainContent) {
            throw new Error('Site missing essential HTML structure');
          }

          return {
            status: 'accessible',
            statusCode: response.statusCode,
            hasTitle,
            hasMainContent,
          };
        }
      );

      await this.runTest(suite, 'Critical User Journeys', async () => {
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
            passed:
              (results.stats?.expected || 0) - (results.stats?.failed || 0),
          };
        } catch (error) {
          if (error.message.includes('ECONNREFUSED')) {
            throw new Error('SKIP: Development server not running');
          }
          throw error;
        }
      });
    } else {
      await this.runTest(
        suite,
        'Site Accessibility Post-Deployment',
        async () => {
          throw new Error(
            'SKIP: Server not running, cannot test site accessibility'
          );
        }
      );

      await this.runTest(suite, 'Critical User Journeys', async () => {
        throw new Error('SKIP: Server not running, cannot test user journeys');
      });
    }
  }

  // Performance Validation Tests
  async runPerformanceValidationTests(suite) {
    if (this.skipServer) {
      await this.runTest(suite, 'Core Web Vitals Validation', async () => {
        throw new Error(
          'SKIP: Server not running, cannot test Core Web Vitals'
        );
      });

      await this.runTest(suite, 'Performance Budget Compliance', async () => {
        throw new Error(
          'SKIP: Server not running, cannot test performance budgets'
        );
      });

      await this.runTest(suite, 'Resource Loading Performance', async () => {
        throw new Error(
          'SKIP: Server not running, cannot test resource loading'
        );
      });

      return;
    }

    await this.runTest(suite, 'Core Web Vitals Validation', async () => {
      try {
        const output = execSync(
          'npx playwright test e2e/performance.spec.ts --grep "Core Web Vitals" --reporter=json',
          {
            encoding: 'utf8',
            timeout: 120000,
          }
        );

        const results = JSON.parse(output);

        if (results.stats && results.stats.failed > 0) {
          throw new Error(
            `Core Web Vitals tests failed: ${results.stats.failed} failures`
          );
        }

        return {
          tests: results.stats?.expected || 0,
          passed: (results.stats?.expected || 0) - (results.stats?.failed || 0),
        };
      } catch (error) {
        if (error.message.includes('ECONNREFUSED')) {
          throw new Error('SKIP: Development server not running');
        }
        throw error;
      }
    });

    await this.runTest(suite, 'Performance Budget Compliance', async () => {
      try {
        const output = execSync(
          'npx playwright test e2e/performance.spec.ts --grep "Performance Budget" --reporter=json',
          {
            encoding: 'utf8',
            timeout: 120000,
          }
        );

        const results = JSON.parse(output);

        if (results.stats && results.stats.failed > 0) {
          throw new Error(
            `Performance budget tests failed: ${results.stats.failed} failures`
          );
        }

        return {
          tests: results.stats?.expected || 0,
          passed: (results.stats?.expected || 0) - (results.stats?.failed || 0),
        };
      } catch (error) {
        if (error.message.includes('ECONNREFUSED')) {
          throw new Error('SKIP: Development server not running');
        }
        throw error;
      }
    });

    await this.runTest(suite, 'Resource Loading Performance', async () => {
      const startTime = Date.now();
      const response = await this.makeRequest(this.baseUrl);
      const loadTime = Date.now() - startTime;

      // Check performance metrics
      const contentLength =
        response.headers['content-length'] || response.body.length;
      const hasCompression =
        response.headers['content-encoding'] === 'gzip' ||
        response.headers['content-encoding'] === 'br';
      const hasCaching =
        response.headers['cache-control'] || response.headers['etag'];

      // Validate against budgets
      if (loadTime > this.performanceBudgets.pageLoadTime) {
        throw new Error(
          `Page load time ${loadTime}ms exceeds budget ${this.performanceBudgets.pageLoadTime}ms`
        );
      }

      if (!hasCompression) {
        throw new Error('WARN: Content compression not enabled');
      }

      if (!hasCaching) {
        throw new Error('WARN: Cache headers not configured');
      }

      return {
        loadTime,
        contentLength,
        hasCompression,
        hasCaching,
        budget: this.performanceBudgets.pageLoadTime,
      };
    });

    await this.runTest(suite, 'Bundle Size Analysis', async () => {
      // Check if build output exists
      const buildDir = path.join(process.cwd(), 'out');
      if (!fs.existsSync(buildDir)) {
        throw new Error('Build output not found. Run npm run build first.');
      }

      // Analyze bundle sizes
      const jsFiles = this.findFiles(buildDir, /\.js$/);
      const cssFiles = this.findFiles(buildDir, /\.css$/);

      const totalJSSize = jsFiles.reduce((total, file) => {
        const stats = fs.statSync(file);
        return total + stats.size;
      }, 0);

      const totalCSSSize = cssFiles.reduce((total, file) => {
        const stats = fs.statSync(file);
        return total + stats.size;
      }, 0);

      // Validate against budgets
      if (totalJSSize > this.performanceBudgets.jsBundle * 2) {
        // Allow 2x for total
        throw new Error(
          `Total JS bundle size ${totalJSSize} exceeds budget ${this.performanceBudgets.jsBundle * 2}`
        );
      }

      if (totalCSSSize > this.performanceBudgets.cssBundle) {
        throw new Error(
          `Total CSS bundle size ${totalCSSSize} exceeds budget ${this.performanceBudgets.cssBundle}`
        );
      }

      return {
        jsFiles: jsFiles.length,
        cssFiles: cssFiles.length,
        totalJSSize,
        totalCSSSize,
        jsBudget: this.performanceBudgets.jsBundle,
        cssBudget: this.performanceBudgets.cssBundle,
      };
    });
  }

  // Security Configuration Validation
  async runSecurityConfigurationTests(suite) {
    await this.runTest(suite, 'Security Headers Validation', async () => {
      try {
        const output = execSync('node scripts/security-headers-validator.js', {
          encoding: 'utf8',
          timeout: 60000,
        });

        return {
          status: 'security_headers_valid',
          output: output.substring(0, 200),
        };
      } catch (error) {
        throw new Error(`Security headers validation failed: ${error.message}`);
      }
    });

    await this.runTest(suite, 'SSL/TLS Configuration Validation', async () => {
      try {
        const output = execSync('node scripts/ssl-tls-validator.js', {
          encoding: 'utf8',
          timeout: 60000,
        });

        return { status: 'ssl_tls_valid', output: output.substring(0, 200) };
      } catch (error) {
        throw new Error(`SSL/TLS validation failed: ${error.message}`);
      }
    });

    await this.runTest(suite, 'Access Control Validation', async () => {
      try {
        const output = execSync(
          'node scripts/validate-access-control-audit.js',
          {
            encoding: 'utf8',
            timeout: 60000,
          }
        );

        return {
          status: 'access_control_valid',
          output: output.substring(0, 200),
        };
      } catch (error) {
        throw new Error(`Access control validation failed: ${error.message}`);
      }
    });

    await this.runTest(suite, 'Penetration Testing Suite', async () => {
      try {
        const output = execSync('node scripts/penetration-testing-suite.js', {
          encoding: 'utf8',
          timeout: 120000,
        });

        return {
          status: 'penetration_tests_passed',
          output: output.substring(0, 200),
        };
      } catch (error) {
        throw new Error(`Penetration testing failed: ${error.message}`);
      }
    });

    if (!this.skipServer) {
      await this.runTest(suite, 'Runtime Security Validation', async () => {
        const response = await this.makeRequest(this.baseUrl);

        // Check for security headers
        const securityHeaders = {
          'strict-transport-security':
            response.headers['strict-transport-security'],
          'content-security-policy':
            response.headers['content-security-policy'],
          'x-frame-options': response.headers['x-frame-options'],
          'x-content-type-options': response.headers['x-content-type-options'],
          'referrer-policy': response.headers['referrer-policy'],
        };

        const presentHeaders = Object.entries(securityHeaders)
          .filter(([name, value]) => value)
          .map(([name]) => name);

        if (presentHeaders.length < 3) {
          throw new Error(
            `Insufficient security headers: only ${presentHeaders.length} found`
          );
        }

        return {
          securityHeaders: presentHeaders,
          totalHeaders: presentHeaders.length,
        };
      });
    } else {
      await this.runTest(suite, 'Runtime Security Validation', async () => {
        throw new Error(
          'SKIP: Server not running, cannot test runtime security'
        );
      });
    }
  }

  // Infrastructure Integrity Tests
  async runInfrastructureIntegrityTests(suite) {
    await this.runTest(suite, 'AWS Configuration Validation', async () => {
      try {
        const output = execSync('node scripts/validate-s3-infrastructure.js', {
          encoding: 'utf8',
          timeout: 60000,
        });

        return { status: 'aws_config_valid', output: output.substring(0, 200) };
      } catch (error) {
        throw new Error(
          `AWS configuration validation failed: ${error.message}`
        );
      }
    });

    await this.runTest(
      suite,
      'CloudFront Distribution Validation',
      async () => {
        try {
          const output = execSync(
            'node scripts/cloudfront-security-validator.js',
            {
              encoding: 'utf8',
              timeout: 60000,
            }
          );

          return {
            status: 'cloudfront_valid',
            output: output.substring(0, 200),
          };
        } catch (error) {
          throw new Error(`CloudFront validation failed: ${error.message}`);
        }
      }
    );

    await this.runTest(
      suite,
      'Monitoring and Alerting Validation',
      async () => {
        try {
          const output = execSync('node scripts/test-monitoring-service.js', {
            encoding: 'utf8',
            timeout: 60000,
          });

          return {
            status: 'monitoring_valid',
            output: output.substring(0, 200),
          };
        } catch (error) {
          throw new Error(`Monitoring validation failed: ${error.message}`);
        }
      }
    );

    await this.runTest(suite, 'Backup and Recovery Validation', async () => {
      try {
        const output = execSync(
          'node scripts/backup-rollback-procedures.js --test',
          {
            encoding: 'utf8',
            timeout: 60000,
          }
        );

        return {
          status: 'backup_recovery_valid',
          output: output.substring(0, 200),
        };
      } catch (error) {
        throw new Error(
          `Backup and recovery validation failed: ${error.message}`
        );
      }
    });
  }

  // Accessibility and Compliance Tests
  async runAccessibilityComplianceTests(suite) {
    if (this.skipServer) {
      await this.runTest(suite, 'WCAG 2.1 AA Compliance', async () => {
        throw new Error('SKIP: Server not running, cannot test accessibility');
      });

      await this.runTest(suite, 'Keyboard Navigation', async () => {
        throw new Error(
          'SKIP: Server not running, cannot test keyboard navigation'
        );
      });

      await this.runTest(suite, 'Screen Reader Compatibility', async () => {
        throw new Error(
          'SKIP: Server not running, cannot test screen reader compatibility'
        );
      });

      return;
    }

    await this.runTest(suite, 'WCAG 2.1 AA Compliance', async () => {
      try {
        const output = execSync(
          'npx playwright test e2e/accessibility.spec.ts --grep "WCAG 2.1 AA" --reporter=json',
          {
            encoding: 'utf8',
            timeout: 120000,
          }
        );

        const results = JSON.parse(output);

        if (results.stats && results.stats.failed > 0) {
          throw new Error(
            `WCAG compliance tests failed: ${results.stats.failed} failures`
          );
        }

        return {
          tests: results.stats?.expected || 0,
          passed: (results.stats?.expected || 0) - (results.stats?.failed || 0),
        };
      } catch (error) {
        if (error.message.includes('ECONNREFUSED')) {
          throw new Error('SKIP: Development server not running');
        }
        throw error;
      }
    });

    await this.runTest(suite, 'Keyboard Navigation', async () => {
      try {
        const output = execSync(
          'npx playwright test e2e/accessibility.spec.ts --grep "Keyboard Navigation" --reporter=json',
          {
            encoding: 'utf8',
            timeout: 120000,
          }
        );

        const results = JSON.parse(output);

        if (results.stats && results.stats.failed > 0) {
          throw new Error(
            `Keyboard navigation tests failed: ${results.stats.failed} failures`
          );
        }

        return {
          tests: results.stats?.expected || 0,
          passed: (results.stats?.expected || 0) - (results.stats?.failed || 0),
        };
      } catch (error) {
        if (error.message.includes('ECONNREFUSED')) {
          throw new Error('SKIP: Development server not running');
        }
        throw error;
      }
    });

    await this.runTest(suite, 'Screen Reader Compatibility', async () => {
      try {
        const output = execSync(
          'npx playwright test e2e/accessibility.spec.ts --grep "Screen Reader" --reporter=json',
          {
            encoding: 'utf8',
            timeout: 120000,
          }
        );

        const results = JSON.parse(output);

        if (results.stats && results.stats.failed > 0) {
          throw new Error(
            `Screen reader tests failed: ${results.stats.failed} failures`
          );
        }

        return {
          tests: results.stats?.expected || 0,
          passed: (results.stats?.expected || 0) - (results.stats?.failed || 0),
        };
      } catch (error) {
        if (error.message.includes('ECONNREFUSED')) {
          throw new Error('SKIP: Development server not running');
        }
        throw error;
      }
    });
  }

  // Utility methods
  findFiles(dir, pattern) {
    const files = [];

    const scan = currentDir => {
      const items = fs.readdirSync(currentDir);

      for (const item of items) {
        const fullPath = path.join(currentDir, item);
        const stats = fs.statSync(fullPath);

        if (stats.isDirectory()) {
          scan(fullPath);
        } else if (pattern.test(item)) {
          files.push(fullPath);
        }
      }
    };

    scan(dir);
    return files;
  }

  async generateReport() {
    this.log('Generating comprehensive test report...');

    // Ensure output directory exists
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }

    // Generate JSON report
    const jsonReport = path.join(
      this.outputDir,
      'comprehensive-test-report.json'
    );
    fs.writeFileSync(jsonReport, JSON.stringify(this.results, null, 2));

    // Generate HTML report
    const htmlReport = this.generateHtmlReport();
    const htmlReportPath = path.join(
      this.outputDir,
      'comprehensive-test-report.html'
    );
    fs.writeFileSync(htmlReportPath, htmlReport);

    // Generate summary report
    const summaryReport = this.generateSummaryReport();
    const summaryReportPath = path.join(this.outputDir, 'test-summary.md');
    fs.writeFileSync(summaryReportPath, summaryReport);

    this.log(`Reports generated:`);
    this.log(`  JSON: ${jsonReport}`);
    this.log(`  HTML: ${htmlReportPath}`);
    this.log(`  Summary: ${summaryReportPath}`);

    return {
      json: jsonReport,
      html: htmlReportPath,
      summary: summaryReportPath,
      results: this.results.summary,
    };
  }

  generateHtmlReport() {
    const { totalSuites, totalTests, passed, failed, skipped, warnings } =
      this.results.summary;
    const successRate =
      totalTests > 0 ? ((passed / totalTests) * 100).toFixed(1) : 0;

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Comprehensive Test Report - S3 CloudFront Deployment</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
        .container { max-width: 1400px; margin: 0 auto; background: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; }
        .content { padding: 30px; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 20px; margin-bottom: 40px; }
        .metric { background: #f8fafc; padding: 25px; border-radius: 8px; text-align: center; border: 1px solid #e2e8f0; }
        .metric-value { font-size: 2.5em; font-weight: bold; margin-bottom: 8px; }
        .passed { color: #059669; }
        .failed { color: #dc2626; }
        .skipped { color: #d97706; }
        .warnings { color: #7c3aed; }
        .test-suites { margin-top: 40px; }
        .suite { border: 1px solid #e5e7eb; border-radius: 8px; margin-bottom: 20px; overflow: hidden; }
        .suite-header { padding: 20px; background: #f9fafb; font-weight: 600; cursor: pointer; display: flex; justify-content: space-between; align-items: center; }
        .suite-header.passed { border-left: 5px solid #059669; }
        .suite-header.failed { border-left: 5px solid #dc2626; }
        .suite-content { display: none; }
        .suite-content.show { display: block; }
        .test-item { padding: 15px 20px; border-bottom: 1px solid #f1f5f9; }
        .test-item:last-child { border-bottom: none; }
        .test-header { display: flex; justify-content: between; align-items: center; }
        .test-status { font-weight: 600; margin-right: 10px; }
        .test-duration { color: #6b7280; font-size: 0.9em; margin-left: auto; }
        .test-details { margin-top: 10px; padding: 10px; background: #f8fafc; border-radius: 4px; font-size: 0.9em; }
        .timestamp { color: #6b7280; font-size: 0.9em; }
        .badge { padding: 4px 8px; border-radius: 4px; font-size: 0.8em; font-weight: 600; }
        .badge-passed { background: #d1fae5; color: #065f46; }
        .badge-failed { background: #fee2e2; color: #991b1b; }
        .badge-skipped { background: #fef3c7; color: #92400e; }
        .badge-warning { background: #ede9fe; color: #5b21b6; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Comprehensive Test Report</h1>
            <h2>S3 + CloudFront Deployment Validation</h2>
            <p class="timestamp">Generated: ${this.results.timestamp}</p>
            <p>Environment: ${this.results.environment} | Base URL: ${this.results.baseUrl}</p>
        </div>
        
        <div class="content">
            <div class="summary">
                <div class="metric">
                    <div class="metric-value">${totalSuites}</div>
                    <div>Test Suites</div>
                </div>
                <div class="metric">
                    <div class="metric-value">${totalTests}</div>
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
                    <div class="metric-value warnings">${warnings}</div>
                    <div>Warnings</div>
                </div>
                <div class="metric">
                    <div class="metric-value">${successRate}%</div>
                    <div>Success Rate</div>
                </div>
            </div>
            
            <div class="test-suites">
                <h2>Test Suite Results</h2>
                ${this.results.testSuites
                  .map(
                    (suite, suiteIndex) => `
                    <div class="suite">
                        <div class="suite-header ${suite.status}" onclick="toggleSuite(${suiteIndex})">
                            <div>
                                <strong>${suite.name}</strong>
                                <span class="badge badge-${suite.status}">${suite.status.toUpperCase()}</span>
                            </div>
                            <div>
                                ${suite.summary.total} tests | ${suite.duration}ms
                            </div>
                        </div>
                        <div class="suite-content" id="suite-${suiteIndex}">
                            ${suite.tests
                              .map(
                                test => `
                                <div class="test-item">
                                    <div class="test-header">
                                        <div>
                                            <span class="test-status ${test.status}">
                                                ${
                                                  test.status === 'passed'
                                                    ? '✓'
                                                    : test.status === 'failed'
                                                      ? '✗'
                                                      : test.status ===
                                                          'skipped'
                                                        ? '⊘'
                                                        : '⚠'
                                                }
                                            </span>
                                            ${test.name}
                                        </div>
                                        <div class="test-duration">${test.duration}ms</div>
                                    </div>
                                    ${test.error ? `<div class="test-details"><strong>Error:</strong> ${test.error}</div>` : ''}
                                    ${test.warning ? `<div class="test-details"><strong>Warning:</strong> ${test.warning}</div>` : ''}
                                    ${test.reason ? `<div class="test-details"><strong>Skipped:</strong> ${test.reason}</div>` : ''}
                                    ${test.result ? `<div class="test-details"><pre>${JSON.stringify(test.result, null, 2)}</pre></div>` : ''}
                                </div>
                            `
                              )
                              .join('')}
                        </div>
                    </div>
                `
                  )
                  .join('')}
            </div>
        </div>
    </div>
    
    <script>
        function toggleSuite(index) {
            const content = document.getElementById('suite-' + index);
            content.classList.toggle('show');
        }
        
        // Auto-expand failed suites
        document.addEventListener('DOMContentLoaded', function() {
            const failedSuites = document.querySelectorAll('.suite-header.failed');
            failedSuites.forEach((header, index) => {
                const suiteIndex = Array.from(document.querySelectorAll('.suite-header')).indexOf(header);
                toggleSuite(suiteIndex);
            });
        });
    </script>
</body>
</html>`;
  }

  generateSummaryReport() {
    const { totalSuites, totalTests, passed, failed, skipped, warnings } =
      this.results.summary;
    const successRate =
      totalTests > 0 ? ((passed / totalTests) * 100).toFixed(1) : 0;

    let summary = `# Comprehensive Test Report Summary\n\n`;
    summary += `**Generated:** ${this.results.timestamp}\n`;
    summary += `**Environment:** ${this.results.environment}\n`;
    summary += `**Base URL:** ${this.results.baseUrl}\n\n`;

    summary += `## Overall Results\n\n`;
    summary += `| Metric | Count |\n`;
    summary += `|--------|-------|\n`;
    summary += `| Test Suites | ${totalSuites} |\n`;
    summary += `| Total Tests | ${totalTests} |\n`;
    summary += `| Passed | ${passed} |\n`;
    summary += `| Failed | ${failed} |\n`;
    summary += `| Skipped | ${skipped} |\n`;
    summary += `| Warnings | ${warnings} |\n`;
    summary += `| Success Rate | ${successRate}% |\n\n`;

    summary += `## Test Suite Results\n\n`;

    for (const suite of this.results.testSuites) {
      const suiteSuccessRate =
        suite.summary.total > 0
          ? ((suite.summary.passed / suite.summary.total) * 100).toFixed(1)
          : 0;

      summary += `### ${suite.name}\n\n`;
      summary += `- **Status:** ${suite.status.toUpperCase()}\n`;
      summary += `- **Duration:** ${suite.duration}ms\n`;
      summary += `- **Tests:** ${suite.summary.total} (${suite.summary.passed} passed, ${suite.summary.failed} failed, ${suite.summary.skipped} skipped)\n`;
      summary += `- **Success Rate:** ${suiteSuccessRate}%\n\n`;

      if (suite.summary.failed > 0) {
        summary += `**Failed Tests:**\n`;
        for (const test of suite.tests.filter(t => t.status === 'failed')) {
          summary += `- ${test.name}: ${test.error}\n`;
        }
        summary += `\n`;
      }

      if (suite.summary.warnings > 0) {
        summary += `**Warnings:**\n`;
        for (const test of suite.tests.filter(t => t.status === 'warning')) {
          summary += `- ${test.name}: ${test.warning}\n`;
        }
        summary += `\n`;
      }
    }

    return summary;
  }

  async run() {
    this.log('Starting comprehensive test suite execution...');
    const startTime = Date.now();

    try {
      // Run all test suites
      await this.runTestSuite('End-to-End Deployment Tests', suite =>
        this.runEndToEndDeploymentTests(suite)
      );

      await this.runTestSuite('Performance Validation Tests', suite =>
        this.runPerformanceValidationTests(suite)
      );

      await this.runTestSuite('Security Configuration Tests', suite =>
        this.runSecurityConfigurationTests(suite)
      );

      await this.runTestSuite('Infrastructure Integrity Tests', suite =>
        this.runInfrastructureIntegrityTests(suite)
      );

      await this.runTestSuite('Accessibility and Compliance Tests', suite =>
        this.runAccessibilityComplianceTests(suite)
      );

      // Generate comprehensive report
      const reportInfo = await this.generateReport();

      const totalTime = Date.now() - startTime;
      const { totalSuites, totalTests, passed, failed, skipped, warnings } =
        this.results.summary;

      this.log(`\n${'='.repeat(80)}`);
      this.log('COMPREHENSIVE TEST SUITE COMPLETE');
      this.log(`${'='.repeat(80)}`);
      this.log(`Total execution time: ${totalTime}ms`);
      this.log(`Test suites: ${totalSuites}`);
      this.log(`Total tests: ${totalTests}`);
      this.log(
        `Passed: ${passed} | Failed: ${failed} | Skipped: ${skipped} | Warnings: ${warnings}`
      );
      this.log(
        `Success rate: ${totalTests > 0 ? ((passed / totalTests) * 100).toFixed(1) : 0}%`
      );
      this.log(`${'='.repeat(80)}`);

      if (failed > 0) {
        this.log(
          `\n❌ COMPREHENSIVE TEST SUITE FAILED with ${failed} test failures`
        );
        this.log(
          `Review the detailed report for failure analysis: ${reportInfo.html}`
        );
        process.exit(1);
      } else {
        this.log(`\n✅ COMPREHENSIVE TEST SUITE PASSED`);
        if (warnings > 0) {
          this.log(`⚠️  ${warnings} warnings detected - review recommended`);
        }
        if (skipped > 0) {
          this.log(`⊘ ${skipped} tests skipped`);
        }
      }

      return reportInfo;
    } catch (error) {
      this.log(
        `Fatal error during comprehensive testing: ${error.message}`,
        'error'
      );
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
    environment:
      args.find(arg => arg.startsWith('--env='))?.split('=')[1] ||
      'development',
    baseUrl: args.find(arg => arg.startsWith('--url='))?.split('=')[1],
    outputDir: args.find(arg => arg.startsWith('--output='))?.split('=')[1],
  };

  console.log(
    '🚀 Starting Comprehensive Test Suite for S3 + CloudFront Deployment'
  );
  if (options.verbose) {
    console.log('Configuration:', options);
  }

  const testSuite = new ComprehensiveTestSuite(options);

  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n⚠️  Test suite interrupted by user');
    process.exit(1);
  });

  process.on('SIGTERM', () => {
    console.log('\n⚠️  Test suite terminated');
    process.exit(1);
  });

  // Execute test suite
  (async () => {
    try {
      await testSuite.run();
    } catch (error) {
      console.error(
        '❌ Comprehensive test suite execution failed:',
        error.message
      );
      process.exit(1);
    }
  })();
}

module.exports = ComprehensiveTestSuite;
