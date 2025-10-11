#!/usr/bin/env node

/**
 * Test HTTPS Redirect Validation
 *
 * This script tests the HTTPS redirect validation functionality
 * using various test scenarios and domains.
 */

const HttpsRedirectValidator = require('./https-redirect-validator');
const fs = require('fs').promises;
const path = require('path');

class HttpsRedirectValidationTester {
  constructor() {
    this.testResults = {
      timestamp: new Date().toISOString(),
      tests: [],
      summary: {
        totalTests: 0,
        passed: 0,
        failed: 0,
      },
    };
  }

  /**
   * Run all tests
   */
  async runAllTests() {
    console.log('🧪 Starting HTTPS Redirect Validation Tests...\n');

    try {
      // Test with known good domain (GitHub)
      await this.testKnownGoodDomain();

      // Test with CloudFront domain (if available)
      await this.testCloudfrontDomain();

      // Test validation functionality
      await this.testValidationFunctionality();

      // Generate summary
      this.generateSummary();

      return this.testResults;
    } catch (error) {
      console.error('❌ Test execution failed:', error.message);
      throw error;
    }
  }

  /**
   * Test with known good domain
   */
  async testKnownGoodDomain() {
    console.log('🌐 Testing with known good domain (github.com)...');

    try {
      const validator = new HttpsRedirectValidator({
        timeout: 15000,
      });

      const results = await validator.validateHttpsRedirect('github.com', {
        testHttpRedirect: true,
        testHstsHeader: true,
        testSecureCookies: false, // GitHub sets many cookies
        testRedirectChain: true,
      });

      this.addTestResult('Known Good Domain Test', 'PASSED', {
        domain: 'github.com',
        totalTests: results.summary.totalTests,
        passed: results.summary.passed,
        failed: results.summary.failed,
        successRate: results.summary.successRate,
      });

      console.log(
        `✅ GitHub test completed: ${results.summary.successRate} success rate`
      );
    } catch (error) {
      this.addTestResult('Known Good Domain Test', 'FAILED', {
        domain: 'github.com',
        error: error.message,
      });
      console.log('❌ GitHub test failed:', error.message);
    }
  }

  /**
   * Test with CloudFront domain
   */
  async testCloudfrontDomain() {
    console.log('☁️ Testing CloudFront domain functionality...');

    // Try to read CloudFront configuration
    try {
      const configPath = path.join(
        __dirname,
        '..',
        'config',
        'cloudfront-s3-config.json'
      );
      const configExists = await fs
        .access(configPath)
        .then(() => true)
        .catch(() => false);

      if (configExists) {
        const config = JSON.parse(await fs.readFile(configPath, 'utf8'));
        const domain = config.distributionDomain || config.customDomain;

        if (domain) {
          const validator = new HttpsRedirectValidator({
            timeout: 15000,
          });

          const results = await validator.validateHttpsRedirect(domain);

          this.addTestResult('CloudFront Domain Test', 'PASSED', {
            domain,
            totalTests: results.summary.totalTests,
            passed: results.summary.passed,
            failed: results.summary.failed,
            successRate: results.summary.successRate,
          });

          console.log(
            `✅ CloudFront test completed: ${results.summary.successRate} success rate`
          );
        } else {
          this.addTestResult('CloudFront Domain Test', 'SKIPPED', {
            reason: 'No domain found in configuration',
          });
          console.log('⏭️ CloudFront test skipped: No domain configured');
        }
      } else {
        this.addTestResult('CloudFront Domain Test', 'SKIPPED', {
          reason: 'CloudFront configuration not found',
        });
        console.log('⏭️ CloudFront test skipped: Configuration not found');
      }
    } catch (error) {
      this.addTestResult('CloudFront Domain Test', 'FAILED', {
        error: error.message,
      });
      console.log('❌ CloudFront test failed:', error.message);
    }
  }

  /**
   * Test validation functionality
   */
  async testValidationFunctionality() {
    console.log('🔧 Testing validation functionality...');

    try {
      const validator = new HttpsRedirectValidator();

      // Test HSTS header parsing
      const hstsTests = [
        {
          header: 'max-age=31536000; includeSubDomains; preload',
          expected: {
            maxAge: 31536000,
            includeSubDomains: true,
            preload: true,
          },
        },
        {
          header: 'max-age=86400',
          expected: { maxAge: 86400, includeSubDomains: false, preload: false },
        },
      ];

      for (const test of hstsTests) {
        const parsed = validator.parseHstsHeader(test.header);
        const isCorrect =
          JSON.stringify(parsed) === JSON.stringify(test.expected);

        this.addTestResult(
          'HSTS Header Parsing',
          isCorrect ? 'PASSED' : 'FAILED',
          {
            input: test.header,
            expected: test.expected,
            actual: parsed,
          }
        );
      }

      // Test cookie analysis
      const cookieTests = [
        {
          cookie: 'sessionId=abc123; Secure; HttpOnly; SameSite=Strict',
          expectedSecure: true,
          expectedHttpOnly: true,
        },
        {
          cookie: 'trackingId=xyz789',
          expectedSecure: false,
          expectedHttpOnly: false,
        },
      ];

      for (const test of cookieTests) {
        const analysis = validator.analyzeCookie(test.cookie);
        const isCorrect =
          analysis.secure === test.expectedSecure &&
          analysis.httpOnly === test.expectedHttpOnly;

        this.addTestResult('Cookie Analysis', isCorrect ? 'PASSED' : 'FAILED', {
          input: test.cookie,
          expected: {
            secure: test.expectedSecure,
            httpOnly: test.expectedHttpOnly,
          },
          actual: { secure: analysis.secure, httpOnly: analysis.httpOnly },
        });
      }

      // Test redirect type identification
      const redirectTests = [
        { statusCode: 301, expected: 'Permanent Redirect' },
        { statusCode: 302, expected: 'Temporary Redirect' },
        { statusCode: 307, expected: 'Temporary Redirect (Method Preserved)' },
        { statusCode: 308, expected: 'Permanent Redirect (Method Preserved)' },
      ];

      for (const test of redirectTests) {
        const redirectType = validator.getRedirectType(test.statusCode);
        const isCorrect = redirectType === test.expected;

        this.addTestResult(
          'Redirect Type Identification',
          isCorrect ? 'PASSED' : 'FAILED',
          {
            statusCode: test.statusCode,
            expected: test.expected,
            actual: redirectType,
          }
        );
      }

      console.log('✅ Validation functionality tests completed');
    } catch (error) {
      this.addTestResult('Validation Functionality Test', 'FAILED', {
        error: error.message,
      });
      console.log('❌ Validation functionality test failed:', error.message);
    }
  }

  /**
   * Add test result
   */
  addTestResult(testName, status, details = {}) {
    this.testResults.tests.push({
      test: testName,
      status,
      timestamp: new Date().toISOString(),
      details,
    });

    this.testResults.summary.totalTests++;

    if (status === 'PASSED') {
      this.testResults.summary.passed++;
    } else if (status === 'FAILED') {
      this.testResults.summary.failed++;
    }
  }

  /**
   * Generate summary
   */
  generateSummary() {
    const { summary } = this.testResults;
    const successRate =
      summary.totalTests > 0
        ? ((summary.passed / summary.totalTests) * 100).toFixed(1)
        : 0;

    summary.successRate = `${successRate}%`;
    summary.overallStatus = summary.failed === 0 ? 'PASSED' : 'FAILED';
  }

  /**
   * Save test results
   */
  async saveResults(outputPath) {
    try {
      await fs.writeFile(outputPath, JSON.stringify(this.testResults, null, 2));
      console.log(`📄 Test results saved to: ${outputPath}`);
    } catch (error) {
      console.error('❌ Failed to save test results:', error.message);
      throw error;
    }
  }
}

// Main execution
async function main() {
  const tester = new HttpsRedirectValidationTester();

  try {
    const results = await tester.runAllTests();

    // Save results
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const outputPath = path.join(
      __dirname,
      '..',
      'config',
      `https-redirect-test-results-${timestamp}.json`
    );
    await tester.saveResults(outputPath);

    // Print summary
    console.log('\n📊 Test Summary:');
    console.log(`Total Tests: ${results.summary.totalTests}`);
    console.log(`Passed: ${results.summary.passed}`);
    console.log(`Failed: ${results.summary.failed}`);
    console.log(`Success Rate: ${results.summary.successRate}`);
    console.log(`Overall Status: ${results.summary.overallStatus}`);

    process.exit(results.summary.failed > 0 ? 1 : 0);
  } catch (error) {
    console.error('❌ Test execution failed:', error.message);
    process.exit(1);
  }
}

// Export for use as module
module.exports = HttpsRedirectValidationTester;

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}
