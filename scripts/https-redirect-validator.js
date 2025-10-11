#!/usr/bin/env node

/**
 * HTTPS Redirect Functionality Validator
 *
 * This script validates HTTPS redirect behavior, status codes, headers,
 * HSTS implementation, and secure cookie settings for CloudFront distributions.
 *
 * Features:
 * - Test HTTP to HTTPS redirect behavior
 * - Validate redirect status codes and headers
 * - Check for HSTS header implementation
 * - Verify secure cookie settings
 * - Generate comprehensive validation reports
 */

const https = require('https');
const http = require('http');
const fs = require('fs').promises;
const path = require('path');

class HttpsRedirectValidator {
  constructor(options = {}) {
    this.options = {
      timeout: 10000,
      maxRedirects: 5,
      userAgent: 'HTTPS-Redirect-Validator/1.0',
      ...options,
    };
    this.results = {
      timestamp: new Date().toISOString(),
      testResults: [],
      summary: {
        totalTests: 0,
        passed: 0,
        failed: 0,
        warnings: 0,
      },
      recommendations: [],
    };
  }

  /**
   * Main validation method
   */
  async validateHttpsRedirect(domain, options = {}) {
    console.log(`🔍 Starting HTTPS redirect validation for: ${domain}`);

    const testConfig = {
      domain,
      testHttpRedirect: true,
      testHstsHeader: true,
      testSecureCookies: true,
      testRedirectChain: true,
      ...options,
    };

    try {
      // Test HTTP to HTTPS redirect
      if (testConfig.testHttpRedirect) {
        await this.testHttpToHttpsRedirect(domain);
      }

      // Test HSTS header implementation
      if (testConfig.testHstsHeader) {
        await this.testHstsHeader(domain);
      }

      // Test secure cookie settings
      if (testConfig.testSecureCookies) {
        await this.testSecureCookieSettings(domain);
      }

      // Test redirect chain behavior
      if (testConfig.testRedirectChain) {
        await this.testRedirectChain(domain);
      }

      // Additional security header checks
      await this.testSecurityHeaders(domain);

      // Generate summary and recommendations
      this.generateSummary();
      this.generateRecommendations();

      return this.results;
    } catch (error) {
      console.error('❌ Validation failed:', error.message);
      this.addTestResult('HTTPS Redirect Validation', 'FAILED', {
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }

  /**
   * Test HTTP to HTTPS redirect behavior
   */
  async testHttpToHttpsRedirect(domain) {
    console.log('🔄 Testing HTTP to HTTPS redirect...');

    const testUrls = [
      `http://${domain}`,
      `http://${domain}/`,
      `http://${domain}/index.html`,
      `http://www.${domain}`, // Test www redirect if applicable
    ];

    for (const url of testUrls) {
      try {
        const response = await this.makeHttpRequest(url, {
          followRedirects: false,
        });

        const testName = `HTTP to HTTPS Redirect - ${url}`;
        const isRedirect =
          response.statusCode >= 300 && response.statusCode < 400;
        const locationHeader = response.headers.location;

        if (
          isRedirect &&
          locationHeader &&
          locationHeader.startsWith('https://')
        ) {
          this.addTestResult(testName, 'PASSED', {
            statusCode: response.statusCode,
            location: locationHeader,
            redirectType: this.getRedirectType(response.statusCode),
          });
        } else {
          this.addTestResult(testName, 'FAILED', {
            statusCode: response.statusCode,
            location: locationHeader,
            issue: 'No HTTPS redirect found or invalid redirect',
          });
        }
      } catch (error) {
        this.addTestResult(`HTTP to HTTPS Redirect - ${url}`, 'FAILED', {
          error: error.message,
        });
      }
    }
  }

  /**
   * Test HSTS header implementation
   */
  async testHstsHeader(domain) {
    console.log('🔒 Testing HSTS header implementation...');

    try {
      const response = await this.makeHttpsRequest(`https://${domain}`);
      const hstsHeader = response.headers['strict-transport-security'];

      if (hstsHeader) {
        const hstsConfig = this.parseHstsHeader(hstsHeader);

        this.addTestResult('HSTS Header Present', 'PASSED', {
          header: hstsHeader,
          maxAge: hstsConfig.maxAge,
          includeSubDomains: hstsConfig.includeSubDomains,
          preload: hstsConfig.preload,
        });

        // Validate HSTS configuration
        this.validateHstsConfiguration(hstsConfig);
      } else {
        this.addTestResult('HSTS Header Present', 'FAILED', {
          issue: 'HSTS header not found',
          recommendation: 'Add Strict-Transport-Security header',
        });
      }
    } catch (error) {
      this.addTestResult('HSTS Header Test', 'FAILED', {
        error: error.message,
      });
    }
  }

  /**
   * Test secure cookie settings
   */
  async testSecureCookieSettings(domain) {
    console.log('🍪 Testing secure cookie settings...');

    try {
      const response = await this.makeHttpsRequest(`https://${domain}`);
      const setCookieHeaders = response.headers['set-cookie'] || [];

      if (setCookieHeaders.length === 0) {
        this.addTestResult('Secure Cookie Settings', 'INFO', {
          message: 'No cookies set by the server',
          note: 'This is acceptable for static sites',
        });
        return;
      }

      for (let i = 0; i < setCookieHeaders.length; i++) {
        const cookie = setCookieHeaders[i];
        const cookieAnalysis = this.analyzeCookie(cookie);

        const testName = `Cookie ${i + 1} Security`;

        if (cookieAnalysis.secure && cookieAnalysis.httpOnly) {
          this.addTestResult(testName, 'PASSED', cookieAnalysis);
        } else {
          this.addTestResult(testName, 'WARNING', {
            ...cookieAnalysis,
            issues: this.getCookieSecurityIssues(cookieAnalysis),
          });
        }
      }
    } catch (error) {
      this.addTestResult('Secure Cookie Settings', 'FAILED', {
        error: error.message,
      });
    }
  }

  /**
   * Test redirect chain behavior
   */
  async testRedirectChain(domain) {
    console.log('🔗 Testing redirect chain behavior...');

    const testUrls = [
      `http://${domain}`,
      `http://www.${domain}`,
      `https://www.${domain}`,
    ];

    for (const url of testUrls) {
      try {
        const redirectChain = await this.followRedirectChain(url);

        const testName = `Redirect Chain - ${url}`;
        const finalUrl = redirectChain[redirectChain.length - 1]?.url;

        if (
          finalUrl &&
          finalUrl.startsWith('https://') &&
          redirectChain.length <= this.options.maxRedirects
        ) {
          this.addTestResult(testName, 'PASSED', {
            redirectChain,
            finalUrl,
            redirectCount: redirectChain.length - 1,
          });
        } else {
          this.addTestResult(testName, 'FAILED', {
            redirectChain,
            finalUrl,
            issue: 'Invalid redirect chain or too many redirects',
          });
        }
      } catch (error) {
        this.addTestResult(`Redirect Chain - ${url}`, 'FAILED', {
          error: error.message,
        });
      }
    }
  }

  /**
   * Test additional security headers
   */
  async testSecurityHeaders(domain) {
    console.log('🛡️ Testing additional security headers...');

    try {
      const response = await this.makeHttpsRequest(`https://${domain}`);

      const securityHeaders = {
        'x-content-type-options': 'nosniff',
        'x-frame-options': ['DENY', 'SAMEORIGIN'],
        'x-xss-protection': '1; mode=block',
        'referrer-policy': [
          'strict-origin-when-cross-origin',
          'no-referrer',
          'same-origin',
        ],
        'content-security-policy': null, // Just check presence
      };

      for (const [headerName, expectedValues] of Object.entries(
        securityHeaders
      )) {
        const headerValue = response.headers[headerName];
        const testName = `Security Header - ${headerName}`;

        if (headerValue) {
          if (expectedValues === null) {
            // Just check presence
            this.addTestResult(testName, 'PASSED', {
              header: headerValue,
            });
          } else if (Array.isArray(expectedValues)) {
            // Check if value is in expected list
            const isValid = expectedValues.some(expected =>
              headerValue.toLowerCase().includes(expected.toLowerCase())
            );

            this.addTestResult(testName, isValid ? 'PASSED' : 'WARNING', {
              header: headerValue,
              expected: expectedValues,
              valid: isValid,
            });
          } else {
            // Check exact match
            const isValid =
              headerValue.toLowerCase() === expectedValues.toLowerCase();

            this.addTestResult(testName, isValid ? 'PASSED' : 'WARNING', {
              header: headerValue,
              expected: expectedValues,
              valid: isValid,
            });
          }
        } else {
          this.addTestResult(testName, 'WARNING', {
            issue: `${headerName} header not found`,
            recommendation: `Consider adding ${headerName} header`,
          });
        }
      }
    } catch (error) {
      this.addTestResult('Security Headers Test', 'FAILED', {
        error: error.message,
      });
    }
  }

  /**
   * Make HTTP request
   */
  makeHttpRequest(url, options = {}) {
    return new Promise((resolve, reject) => {
      const urlObj = new URL(url);
      const requestOptions = {
        hostname: urlObj.hostname,
        port: urlObj.port || 80,
        path: urlObj.pathname + urlObj.search,
        method: 'GET',
        headers: {
          'User-Agent': this.options.userAgent,
        },
        timeout: this.options.timeout,
      };

      const req = http.request(requestOptions, res => {
        let data = '';
        res.on('data', chunk => (data += chunk));
        res.on('end', () => {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data,
          });
        });
      });

      req.on('error', reject);
      req.on('timeout', () => {
        req.destroy();
        reject(new Error('Request timeout'));
      });

      req.end();
    });
  }

  /**
   * Make HTTPS request
   */
  makeHttpsRequest(url, options = {}) {
    return new Promise((resolve, reject) => {
      const urlObj = new URL(url);
      const requestOptions = {
        hostname: urlObj.hostname,
        port: urlObj.port || 443,
        path: urlObj.pathname + urlObj.search,
        method: 'GET',
        headers: {
          'User-Agent': this.options.userAgent,
        },
        timeout: this.options.timeout,
        rejectUnauthorized: true,
      };

      const req = https.request(requestOptions, res => {
        let data = '';
        res.on('data', chunk => (data += chunk));
        res.on('end', () => {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data,
          });
        });
      });

      req.on('error', reject);
      req.on('timeout', () => {
        req.destroy();
        reject(new Error('Request timeout'));
      });

      req.end();
    });
  }

  /**
   * Follow redirect chain
   */
  async followRedirectChain(url, visited = new Set()) {
    const chain = [];
    let currentUrl = url;
    let redirectCount = 0;

    while (redirectCount < this.options.maxRedirects) {
      if (visited.has(currentUrl)) {
        throw new Error('Redirect loop detected');
      }
      visited.add(currentUrl);

      const response = currentUrl.startsWith('https://')
        ? await this.makeHttpsRequest(currentUrl)
        : await this.makeHttpRequest(currentUrl);

      chain.push({
        url: currentUrl,
        statusCode: response.statusCode,
        headers: response.headers,
      });

      if (
        response.statusCode >= 300 &&
        response.statusCode < 400 &&
        response.headers.location
      ) {
        currentUrl = response.headers.location;
        redirectCount++;
      } else {
        break;
      }
    }

    return chain;
  }

  /**
   * Parse HSTS header
   */
  parseHstsHeader(hstsHeader) {
    const config = {
      maxAge: 0,
      includeSubDomains: false,
      preload: false,
    };

    const parts = hstsHeader.split(';').map(part => part.trim());

    for (const part of parts) {
      if (part.startsWith('max-age=')) {
        config.maxAge = parseInt(part.split('=')[1]);
      } else if (part === 'includeSubDomains') {
        config.includeSubDomains = true;
      } else if (part === 'preload') {
        config.preload = true;
      }
    }

    return config;
  }

  /**
   * Validate HSTS configuration
   */
  validateHstsConfiguration(hstsConfig) {
    const minMaxAge = 31536000; // 1 year

    if (hstsConfig.maxAge >= minMaxAge) {
      this.addTestResult('HSTS Max-Age', 'PASSED', {
        maxAge: hstsConfig.maxAge,
        minRequired: minMaxAge,
      });
    } else {
      this.addTestResult('HSTS Max-Age', 'WARNING', {
        maxAge: hstsConfig.maxAge,
        minRequired: minMaxAge,
        recommendation: 'Consider increasing max-age to at least 1 year',
      });
    }

    this.addTestResult(
      'HSTS Include Subdomains',
      hstsConfig.includeSubDomains ? 'PASSED' : 'INFO',
      {
        includeSubDomains: hstsConfig.includeSubDomains,
        recommendation: hstsConfig.includeSubDomains
          ? null
          : 'Consider adding includeSubDomains directive',
      }
    );
  }

  /**
   * Analyze cookie security
   */
  analyzeCookie(cookieHeader) {
    const analysis = {
      raw: cookieHeader,
      secure: cookieHeader.toLowerCase().includes('secure'),
      httpOnly: cookieHeader.toLowerCase().includes('httponly'),
      sameSite: null,
    };

    const sameSiteMatch = cookieHeader.match(/samesite=([^;]+)/i);
    if (sameSiteMatch) {
      analysis.sameSite = sameSiteMatch[1].trim();
    }

    return analysis;
  }

  /**
   * Get cookie security issues
   */
  getCookieSecurityIssues(cookieAnalysis) {
    const issues = [];

    if (!cookieAnalysis.secure) {
      issues.push('Missing Secure flag');
    }

    if (!cookieAnalysis.httpOnly) {
      issues.push('Missing HttpOnly flag');
    }

    if (!cookieAnalysis.sameSite) {
      issues.push('Missing SameSite attribute');
    }

    return issues;
  }

  /**
   * Get redirect type description
   */
  getRedirectType(statusCode) {
    const redirectTypes = {
      301: 'Permanent Redirect',
      302: 'Temporary Redirect',
      303: 'See Other',
      307: 'Temporary Redirect (Method Preserved)',
      308: 'Permanent Redirect (Method Preserved)',
    };

    return redirectTypes[statusCode] || 'Unknown Redirect';
  }

  /**
   * Add test result
   */
  addTestResult(testName, status, details = {}) {
    this.results.testResults.push({
      test: testName,
      status,
      timestamp: new Date().toISOString(),
      details,
    });

    this.results.summary.totalTests++;

    switch (status) {
      case 'PASSED':
        this.results.summary.passed++;
        console.log(`✅ ${testName}: PASSED`);
        break;
      case 'FAILED':
        this.results.summary.failed++;
        console.log(`❌ ${testName}: FAILED`);
        break;
      case 'WARNING':
      case 'INFO':
        this.results.summary.warnings++;
        console.log(`⚠️ ${testName}: ${status}`);
        break;
    }
  }

  /**
   * Generate summary
   */
  generateSummary() {
    const { summary } = this.results;
    const successRate =
      summary.totalTests > 0
        ? ((summary.passed / summary.totalTests) * 100).toFixed(1)
        : 0;

    this.results.summary.successRate = `${successRate}%`;
    this.results.summary.overallStatus =
      summary.failed === 0 ? 'PASSED' : 'FAILED';
  }

  /**
   * Generate recommendations
   */
  generateRecommendations() {
    const recommendations = [];

    // Analyze failed tests for recommendations
    const failedTests = this.results.testResults.filter(
      test => test.status === 'FAILED'
    );
    const warningTests = this.results.testResults.filter(
      test => test.status === 'WARNING'
    );

    if (
      failedTests.some(test => test.test.includes('HTTP to HTTPS Redirect'))
    ) {
      recommendations.push({
        priority: 'HIGH',
        category: 'Security',
        issue: 'HTTP to HTTPS redirect not properly configured',
        recommendation:
          'Configure CloudFront to redirect all HTTP requests to HTTPS',
        implementation:
          'Set up CloudFront behavior to redirect HTTP to HTTPS with 301 status',
      });
    }

    if (failedTests.some(test => test.test.includes('HSTS Header'))) {
      recommendations.push({
        priority: 'HIGH',
        category: 'Security',
        issue: 'HSTS header not implemented',
        recommendation:
          'Add Strict-Transport-Security header to all HTTPS responses',
        implementation:
          'Configure CloudFront to add HSTS header with appropriate max-age',
      });
    }

    if (warningTests.some(test => test.test.includes('Cookie'))) {
      recommendations.push({
        priority: 'MEDIUM',
        category: 'Security',
        issue: 'Insecure cookie configuration',
        recommendation: 'Ensure all cookies have Secure and HttpOnly flags',
        implementation: 'Update cookie settings to include security flags',
      });
    }

    if (warningTests.some(test => test.test.includes('Security Header'))) {
      recommendations.push({
        priority: 'MEDIUM',
        category: 'Security',
        issue: 'Missing security headers',
        recommendation: 'Implement comprehensive security headers',
        implementation:
          'Configure CloudFront to add security headers like CSP, X-Frame-Options, etc.',
      });
    }

    this.results.recommendations = recommendations;
  }

  /**
   * Save results to file
   */
  async saveResults(outputPath) {
    try {
      await fs.writeFile(outputPath, JSON.stringify(this.results, null, 2));
      console.log(`📄 Results saved to: ${outputPath}`);
    } catch (error) {
      console.error('❌ Failed to save results:', error.message);
      throw error;
    }
  }

  /**
   * Generate HTML report
   */
  async generateHtmlReport(outputPath) {
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>HTTPS Redirect Validation Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background-color: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 30px; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .summary-card { background: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center; }
        .summary-card h3 { margin: 0 0 10px 0; color: #333; }
        .summary-card .value { font-size: 2em; font-weight: bold; }
        .passed { color: #28a745; }
        .failed { color: #dc3545; }
        .warning { color: #ffc107; }
        .test-results { margin-bottom: 30px; }
        .test-item { background: white; border: 1px solid #dee2e6; border-radius: 4px; margin-bottom: 10px; padding: 15px; }
        .test-header { display: flex; justify-content: between; align-items: center; margin-bottom: 10px; }
        .test-name { font-weight: bold; flex-grow: 1; }
        .test-status { padding: 4px 8px; border-radius: 4px; color: white; font-size: 0.8em; }
        .status-passed { background-color: #28a745; }
        .status-failed { background-color: #dc3545; }
        .status-warning { background-color: #ffc107; color: #000; }
        .status-info { background-color: #17a2b8; }
        .test-details { background: #f8f9fa; padding: 10px; border-radius: 4px; margin-top: 10px; }
        .recommendations { margin-top: 30px; }
        .recommendation { background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 4px; padding: 15px; margin-bottom: 15px; }
        .recommendation h4 { margin: 0 0 10px 0; color: #856404; }
        .priority-high { border-left: 4px solid #dc3545; }
        .priority-medium { border-left: 4px solid #ffc107; }
        .priority-low { border-left: 4px solid #28a745; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>HTTPS Redirect Validation Report</h1>
            <p>Generated on ${new Date(this.results.timestamp).toLocaleString()}</p>
        </div>

        <div class="summary">
            <div class="summary-card">
                <h3>Total Tests</h3>
                <div class="value">${this.results.summary.totalTests}</div>
            </div>
            <div class="summary-card">
                <h3>Passed</h3>
                <div class="value passed">${this.results.summary.passed}</div>
            </div>
            <div class="summary-card">
                <h3>Failed</h3>
                <div class="value failed">${this.results.summary.failed}</div>
            </div>
            <div class="summary-card">
                <h3>Warnings</h3>
                <div class="value warning">${this.results.summary.warnings}</div>
            </div>
            <div class="summary-card">
                <h3>Success Rate</h3>
                <div class="value">${this.results.summary.successRate}</div>
            </div>
        </div>

        <div class="test-results">
            <h2>Test Results</h2>
            ${this.results.testResults
              .map(
                test => `
                <div class="test-item">
                    <div class="test-header">
                        <div class="test-name">${test.test}</div>
                        <div class="test-status status-${test.status.toLowerCase()}">${test.status}</div>
                    </div>
                    ${
                      Object.keys(test.details).length > 0
                        ? `
                        <div class="test-details">
                            <pre>${JSON.stringify(test.details, null, 2)}</pre>
                        </div>
                    `
                        : ''
                    }
                </div>
            `
              )
              .join('')}
        </div>

        ${
          this.results.recommendations.length > 0
            ? `
            <div class="recommendations">
                <h2>Recommendations</h2>
                ${this.results.recommendations
                  .map(
                    rec => `
                    <div class="recommendation priority-${rec.priority.toLowerCase()}">
                        <h4>${rec.category}: ${rec.issue}</h4>
                        <p><strong>Recommendation:</strong> ${rec.recommendation}</p>
                        <p><strong>Implementation:</strong> ${rec.implementation}</p>
                    </div>
                `
                  )
                  .join('')}
            </div>
        `
            : ''
        }
    </div>
</body>
</html>`;

    try {
      await fs.writeFile(outputPath, html);
      console.log(`📄 HTML report saved to: ${outputPath}`);
    } catch (error) {
      console.error('❌ Failed to save HTML report:', error.message);
      throw error;
    }
  }
}

// CLI functionality
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log(`
Usage: node https-redirect-validator.js <domain> [options]

Options:
  --output <path>     Output file for JSON results
  --html <path>       Output file for HTML report
  --timeout <ms>      Request timeout (default: 10000)
  --help              Show this help message

Examples:
  node https-redirect-validator.js example.com
  node https-redirect-validator.js example.com --output results.json --html report.html
        `);
    process.exit(1);
  }

  const domain = args[0];
  const options = {};
  let outputPath = null;
  let htmlPath = null;

  // Parse command line arguments
  for (let i = 1; i < args.length; i++) {
    switch (args[i]) {
      case '--output':
        outputPath = args[++i];
        break;
      case '--html':
        htmlPath = args[++i];
        break;
      case '--timeout':
        options.timeout = parseInt(args[++i]);
        break;
      case '--help':
        console.log('Help message shown above');
        process.exit(0);
        break;
    }
  }

  try {
    const validator = new HttpsRedirectValidator(options);
    const results = await validator.validateHttpsRedirect(domain);

    // Save results
    if (outputPath) {
      await validator.saveResults(outputPath);
    }

    if (htmlPath) {
      await validator.generateHtmlReport(htmlPath);
    }

    // Print summary
    console.log('\n📊 Validation Summary:');
    console.log(`Total Tests: ${results.summary.totalTests}`);
    console.log(`Passed: ${results.summary.passed}`);
    console.log(`Failed: ${results.summary.failed}`);
    console.log(`Warnings: ${results.summary.warnings}`);
    console.log(`Success Rate: ${results.summary.successRate}`);
    console.log(`Overall Status: ${results.summary.overallStatus}`);

    if (results.recommendations.length > 0) {
      console.log('\n💡 Recommendations:');
      results.recommendations.forEach((rec, index) => {
        console.log(`${index + 1}. [${rec.priority}] ${rec.issue}`);
        console.log(`   ${rec.recommendation}`);
      });
    }

    process.exit(results.summary.failed > 0 ? 1 : 0);
  } catch (error) {
    console.error('❌ Validation failed:', error.message);
    process.exit(1);
  }
}

// Export for use as module
module.exports = HttpsRedirectValidator;

// Run CLI if called directly
if (require.main === module) {
  main().catch(console.error);
}
