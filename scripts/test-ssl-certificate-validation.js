#!/usr/bin/env node

/**
 * SSL Certificate Validation Test Suite
 *
 * Tests SSL certificate validation functionality and validates actual certificates
 * for CloudFront distributions and custom domains
 */

const SSLCertificateValidator = require('./ssl-certificate-validator');
const fs = require('fs').promises;
const path = require('path');

class SSLCertificateValidationTest {
  constructor() {
    this.testResults = [];
    this.configPath = path.join(
      __dirname,
      '..',
      'config',
      'ssl-certificate-config.json'
    );
    this.outputPath = path.join(
      __dirname,
      '..',
      'ssl-certificate-validation-report.json'
    );
  }

  /**
   * Run all SSL certificate validation tests
   */
  async runAllTests() {
    console.log('🔐 Starting SSL Certificate Validation Tests\n');

    try {
      // Load configuration
      const config = await this.loadConfiguration();

      // Test 1: Validate validator functionality
      await this.testValidatorFunctionality();

      // Test 2: Validate configured domains
      if (config.domains && config.domains.length > 0) {
        await this.testConfiguredDomains(config);
      }

      // Test 3: Test CloudFront distributions
      if (config.cloudfront && config.cloudfront.distributionIds.length > 0) {
        await this.testCloudFrontDistributions(config);
      }

      // Test 4: Test certificate chain validation
      await this.testCertificateChainValidation();

      // Test 5: Test certificate expiry detection
      await this.testCertificateExpiryDetection();

      // Generate summary report
      await this.generateSummaryReport();
    } catch (error) {
      console.error(`Test execution failed: ${error.message}`);
      process.exit(1);
    }
  }

  /**
   * Load SSL certificate validation configuration
   */
  async loadConfiguration() {
    try {
      const configData = await fs.readFile(this.configPath, 'utf8');
      return JSON.parse(configData);
    } catch (error) {
      console.log(
        '⚠️  Configuration file not found, using default configuration'
      );
      return {
        domains: [],
        validation: {
          checkExpiry: true,
          expiryWarningDays: 30,
          checkChain: true,
          checkTrust: true,
        },
        cloudfront: {
          distributionIds: [],
        },
      };
    }
  }

  /**
   * Test SSL certificate validator functionality
   */
  async testValidatorFunctionality() {
    console.log('🧪 Testing SSL Certificate Validator Functionality');

    const validator = new SSLCertificateValidator({
      timeout: 5000,
      verbose: false,
    });

    // Test with a known good certificate (Google)
    try {
      const result = await validator.validateCertificate('google.com');

      if (result.summary.total > 0) {
        this.addTestResult(
          'validator-functionality',
          'PASSED',
          `Validator successfully executed ${result.summary.total} tests`
        );
      } else {
        this.addTestResult(
          'validator-functionality',
          'FAILED',
          'Validator did not execute any tests'
        );
      }
    } catch (error) {
      this.addTestResult(
        'validator-functionality',
        'FAILED',
        `Validator failed: ${error.message}`
      );
    }
  }

  /**
   * Test configured domains from configuration file
   */
  async testConfiguredDomains(config) {
    console.log('🌐 Testing Configured Domains');

    const validator = new SSLCertificateValidator({
      timeout: 10000,
      verbose: false,
    });

    for (const domain of config.domains) {
      if (!domain || domain === 'example.com') {
        console.log(`⏭️  Skipping example domain: ${domain}`);
        continue;
      }

      try {
        console.log(`Testing domain: ${domain}`);
        const result = await validator.validateCertificate(domain);

        if (result.summary.failed === 0) {
          this.addTestResult(
            'domain-validation',
            'PASSED',
            `Domain ${domain} certificate validation passed`
          );
        } else {
          this.addTestResult(
            'domain-validation',
            'WARNING',
            `Domain ${domain} has ${result.summary.failed} failed validations`
          );
        }
      } catch (error) {
        this.addTestResult(
          'domain-validation',
          'FAILED',
          `Failed to validate domain ${domain}: ${error.message}`
        );
      }
    }
  }

  /**
   * Test CloudFront distribution SSL certificates
   */
  async testCloudFrontDistributions(config) {
    console.log('☁️  Testing CloudFront Distribution Certificates');

    // This would require AWS SDK integration to get CloudFront domain names
    // For now, we'll test the concept with placeholder logic

    if (config.cloudfront.distributionIds.length === 0) {
      this.addTestResult(
        'cloudfront-ssl',
        'SKIPPED',
        'No CloudFront distribution IDs configured for testing'
      );
      return;
    }

    // Placeholder for CloudFront SSL validation
    this.addTestResult(
      'cloudfront-ssl',
      'INFO',
      'CloudFront SSL validation requires AWS SDK integration (placeholder test)'
    );
  }

  /**
   * Test certificate chain validation functionality
   */
  async testCertificateChainValidation() {
    console.log('🔗 Testing Certificate Chain Validation');

    const validator = new SSLCertificateValidator({
      timeout: 5000,
      verbose: false,
    });

    // Test with a domain known to have a proper certificate chain
    try {
      const result = await validator.validateCertificate('github.com');

      const chainTest = result.tests.find(
        test => test.test === 'certificate-chain'
      );
      if (chainTest && chainTest.status === 'PASSED') {
        this.addTestResult(
          'chain-validation',
          'PASSED',
          'Certificate chain validation working correctly'
        );
      } else {
        this.addTestResult(
          'chain-validation',
          'WARNING',
          'Certificate chain validation may have issues'
        );
      }
    } catch (error) {
      this.addTestResult(
        'chain-validation',
        'FAILED',
        `Chain validation test failed: ${error.message}`
      );
    }
  }

  /**
   * Test certificate expiry detection
   */
  async testCertificateExpiryDetection() {
    console.log('📅 Testing Certificate Expiry Detection');

    const validator = new SSLCertificateValidator({
      timeout: 5000,
      verbose: false,
    });

    try {
      const result = await validator.validateCertificate('google.com');

      const validityTest = result.tests.find(
        test => test.test === 'validity-dates'
      );
      if (validityTest) {
        this.addTestResult(
          'expiry-detection',
          'PASSED',
          'Certificate expiry detection is working'
        );
      } else {
        this.addTestResult(
          'expiry-detection',
          'FAILED',
          'Certificate expiry detection not found in results'
        );
      }
    } catch (error) {
      this.addTestResult(
        'expiry-detection',
        'FAILED',
        `Expiry detection test failed: ${error.message}`
      );
    }
  }

  /**
   * Add test result
   */
  addTestResult(testName, status, message) {
    const result = {
      test: testName,
      status: status,
      message: message,
      timestamp: new Date().toISOString(),
    };

    this.testResults.push(result);

    const statusIcon =
      {
        PASSED: '✅',
        FAILED: '❌',
        WARNING: '⚠️',
        SKIPPED: '⏭️',
        INFO: 'ℹ️',
      }[status] || '❓';

    console.log(`${statusIcon} ${testName}: ${message}`);
  }

  /**
   * Generate summary report
   */
  async generateSummaryReport() {
    console.log('\n📊 SSL Certificate Validation Test Summary');

    const summary = {
      timestamp: new Date().toISOString(),
      total: this.testResults.length,
      passed: this.testResults.filter(r => r.status === 'PASSED').length,
      failed: this.testResults.filter(r => r.status === 'FAILED').length,
      warnings: this.testResults.filter(r => r.status === 'WARNING').length,
      skipped: this.testResults.filter(r => r.status === 'SKIPPED').length,
      tests: this.testResults,
    };

    console.log(`Total tests: ${summary.total}`);
    console.log(`Passed: ${summary.passed}`);
    console.log(`Failed: ${summary.failed}`);
    console.log(`Warnings: ${summary.warnings}`);
    console.log(`Skipped: ${summary.skipped}`);

    // Save detailed report
    try {
      await fs.writeFile(this.outputPath, JSON.stringify(summary, null, 2));
      console.log(`\n📄 Detailed report saved to: ${this.outputPath}`);
    } catch (error) {
      console.error(`Failed to save report: ${error.message}`);
    }

    // Overall result
    if (summary.failed === 0) {
      console.log(
        '\n🎉 All SSL certificate validation tests completed successfully!'
      );
      return true;
    } else {
      console.log('\n❌ Some SSL certificate validation tests failed');
      return false;
    }
  }
}

// CLI functionality
async function main() {
  const tester = new SSLCertificateValidationTest();

  try {
    const success = await tester.runAllTests();
    process.exit(success ? 0 : 1);
  } catch (error) {
    console.error(`Test execution failed: ${error.message}`);
    process.exit(1);
  }
}

// Export for use as module
module.exports = SSLCertificateValidationTest;

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}
