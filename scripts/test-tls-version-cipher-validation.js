#!/usr/bin/env node

/**
 * Test script for TLS Version and Cipher Suite Validator
 *
 * This script tests the TLS validator against known domains
 * and validates the results against expected security standards.
 */

const TLSValidator = require('./tls-version-cipher-validator');
const ComprehensiveTLSValidator = require('./comprehensive-tls-validator');
const fs = require('fs');
const path = require('path');

class TLSValidatorTest {
  constructor() {
    this.testResults = {
      timestamp: new Date().toISOString(),
      tests: [],
      summary: {
        total: 0,
        passed: 0,
        failed: 0,
        warnings: 0,
      },
    };

    // Load configuration
    this.loadConfig();
  }

  loadConfig() {
    try {
      const configPath = path.join(
        __dirname,
        '../config/tls-security-config.json'
      );
      this.config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    } catch (error) {
      console.warn(`⚠️  Could not load config: ${error.message}`);
      this.config = this.getDefaultConfig();
    }
  }

  getDefaultConfig() {
    return {
      tlsValidation: {
        requiredVersions: ['TLS 1.2', 'TLS 1.3'],
        prohibitedVersions: ['TLS 1.0', 'TLS 1.1'],
        requirePFS: true,
        strongEncryptionRequired: true,
      },
    };
  }

  /**
   * Test domains with known good/bad configurations
   */
  async runTests() {
    console.log('🧪 Starting TLS Validator Tests\n');

    const testCases = [
      {
        name: 'CloudFront Distribution Test',
        domain: 'd1234567890.cloudfront.net',
        expectedSecure: true,
        description: 'Test CloudFront default TLS configuration',
      },
      {
        name: 'Google Test (Known Good)',
        domain: 'google.com',
        expectedSecure: true,
        description: 'Test against known secure configuration',
      },
      {
        name: 'GitHub Test (Known Good)',
        domain: 'github.com',
        expectedSecure: true,
        description: 'Test against another known secure configuration',
      },
    ];

    for (const testCase of testCases) {
      await this.runSingleTest(testCase);
    }

    this.generateSummary();
    this.saveResults();
  }

  /**
   * Run a single test case
   */
  async runSingleTest(testCase) {
    console.log(`🔍 Testing: ${testCase.name}`);
    console.log(`   Domain: ${testCase.domain}`);
    console.log(`   Description: ${testCase.description}\n`);

    const testResult = {
      name: testCase.name,
      domain: testCase.domain,
      expectedSecure: testCase.expectedSecure,
      timestamp: new Date().toISOString(),
      status: 'RUNNING',
      validationResults: null,
      securityAnalysis: null,
      issues: [],
      recommendations: [],
    };

    try {
      // Use the comprehensive validator for better analysis
      const validator = new ComprehensiveTLSValidator(testCase.domain, {
        timeout: 20000,
      });
      const results = await validator.validate();

      testResult.validationResults = results;
      testResult.securityAnalysis = this.analyzeComprehensiveResults(
        results,
        testCase.expectedSecure
      );
      testResult.status =
        testResult.securityAnalysis.overall === 'PASS' ? 'PASSED' : 'FAILED';

      this.displayTestResults(testResult);
    } catch (error) {
      testResult.status = 'ERROR';
      testResult.error = error.message;
      testResult.issues.push(`Validation failed: ${error.message}`);

      console.log(`   ❌ Test failed: ${error.message}\n`);
    }

    this.testResults.tests.push(testResult);
    this.updateSummary(testResult);
  }

  /**
   * Analyze comprehensive validation results against security standards
   */
  analyzeComprehensiveResults(results, expectedSecure) {
    const analysis = {
      overall: 'PASS',
      tlsVersions: 'PASS',
      cipherSuites: 'PASS',
      perfectForwardSecrecy: 'PASS',
      issues: [],
      score: results.securityAssessment?.overall?.overallScore || 0,
    };

    // Check TLS versions
    const hasSecureTLS =
      results.tlsVersionSupport['TLS 1.2']?.supported ||
      results.tlsVersionSupport['TLS 1.3']?.supported;
    const hasInsecureTLS =
      results.tlsVersionSupport['TLS 1.0']?.supported ||
      results.tlsVersionSupport['TLS 1.1']?.supported;

    if (!hasSecureTLS) {
      analysis.tlsVersions = 'FAIL';
      analysis.issues.push('No secure TLS versions (1.2/1.3) supported');
      analysis.overall = 'FAIL';
    }

    if (hasInsecureTLS) {
      analysis.tlsVersions = 'WARN';
      analysis.issues.push('Insecure TLS versions (1.0/1.1) still supported');
      if (analysis.overall === 'PASS') analysis.overall = 'WARN';
    }

    // Check cipher suites
    if (results.cipherSuiteAnalysis) {
      if (!results.cipherSuiteAnalysis.pfsSupported) {
        analysis.perfectForwardSecrecy = 'FAIL';
        analysis.issues.push('Perfect Forward Secrecy not supported');
        analysis.overall = 'FAIL';
      }

      if (!results.cipherSuiteAnalysis.strongEncryption) {
        analysis.cipherSuites = 'WARN';
        analysis.issues.push('Weak encryption algorithms detected');
        if (analysis.overall === 'PASS') analysis.overall = 'WARN';
      }

      if (results.cipherSuiteAnalysis.securityLevel === 'LOW') {
        analysis.cipherSuites = 'FAIL';
        analysis.issues.push('Low security cipher configuration');
        analysis.overall = 'FAIL';
      }
    }

    // Use the comprehensive assessment
    if (results.securityAssessment?.overall) {
      const overallAssessment = results.securityAssessment.overall;
      if (
        overallAssessment.status === 'FAIL' ||
        overallAssessment.grade === 'F'
      ) {
        analysis.overall = 'FAIL';
      } else if (
        overallAssessment.status === 'POOR' ||
        overallAssessment.grade === 'D'
      ) {
        analysis.overall = 'WARN';
      }
    }

    // Validate against expected result
    if (expectedSecure && analysis.overall === 'FAIL') {
      analysis.issues.push(
        'Expected secure configuration but found security issues'
      );
    }

    return analysis;
  }

  /**
   * Analyze validation results against security standards (legacy method)
   */
  analyzeResults(results, expectedSecure) {
    // Fallback to legacy analysis if comprehensive results not available
    return this.analyzeComprehensiveResults(results, expectedSecure);
  }

  /**
   * Display test results
   */
  displayTestResults(testResult) {
    const status = testResult.status;
    const statusIcon =
      status === 'PASSED' ? '✅' : status === 'FAILED' ? '❌' : '⚠️';

    console.log(`   ${statusIcon} Status: ${status}`);

    if (testResult.securityAnalysis) {
      console.log(
        `   📊 Security Score: ${testResult.securityAnalysis.score}/100`
      );
      console.log(
        `   🔒 TLS Versions: ${testResult.securityAnalysis.tlsVersions}`
      );
      console.log(
        `   🔐 Cipher Suites: ${testResult.securityAnalysis.cipherSuites}`
      );
      console.log(
        `   🛡️  Perfect Forward Secrecy: ${testResult.securityAnalysis.perfectForwardSecrecy}`
      );

      if (testResult.securityAnalysis.issues.length > 0) {
        console.log(`   ⚠️  Issues:`);
        testResult.securityAnalysis.issues.forEach(issue => {
          console.log(`      - ${issue}`);
        });
      }
    }

    if (testResult.error) {
      console.log(`   ❌ Error: ${testResult.error}`);
    }

    console.log('');
  }

  /**
   * Update test summary
   */
  updateSummary(testResult) {
    this.testResults.summary.total++;

    switch (testResult.status) {
      case 'PASSED':
        this.testResults.summary.passed++;
        break;
      case 'FAILED':
        this.testResults.summary.failed++;
        break;
      case 'ERROR':
        this.testResults.summary.failed++;
        break;
      default:
        this.testResults.summary.warnings++;
    }
  }

  /**
   * Generate test summary
   */
  generateSummary() {
    console.log('📋 Test Summary');
    console.log('================');
    console.log(`Total Tests: ${this.testResults.summary.total}`);
    console.log(`Passed: ${this.testResults.summary.passed} ✅`);
    console.log(`Failed: ${this.testResults.summary.failed} ❌`);
    console.log(`Warnings: ${this.testResults.summary.warnings} ⚠️`);

    const successRate = (
      (this.testResults.summary.passed / this.testResults.summary.total) *
      100
    ).toFixed(1);
    console.log(`Success Rate: ${successRate}%`);

    if (this.testResults.summary.failed > 0) {
      console.log(
        '\n❌ Some tests failed. Review the results above for details.'
      );
    } else if (this.testResults.summary.warnings > 0) {
      console.log('\n⚠️  All tests passed but some warnings were found.');
    } else {
      console.log('\n✅ All tests passed successfully!');
    }
  }

  /**
   * Save test results
   */
  saveResults() {
    const filename = `tls-validator-test-results-${Date.now()}.json`;
    fs.writeFileSync(filename, JSON.stringify(this.testResults, null, 2));
    console.log(`\n💾 Test results saved to: ${filename}`);
  }

  /**
   * Test specific CloudFront distribution
   */
  async testCloudFrontDistribution(distributionDomain) {
    console.log(`🌐 Testing CloudFront Distribution: ${distributionDomain}\n`);

    const testCase = {
      name: 'CloudFront Distribution',
      domain: distributionDomain,
      expectedSecure: true,
      description: 'Test actual CloudFront distribution TLS configuration',
    };

    await this.runSingleTest(testCase);
    this.generateSummary();
    this.saveResults();
  }
}

// CLI usage
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.includes('--help')) {
    console.log(`
TLS Validator Test Suite

Usage:
  node test-tls-version-cipher-validation.js [options]

Options:
  --cloudfront <domain>    Test specific CloudFront distribution
  --help                   Show this help message

Examples:
  node test-tls-version-cipher-validation.js
  node test-tls-version-cipher-validation.js --cloudfront d1234567890.cloudfront.net
        `);
    process.exit(0);
  }

  const tester = new TLSValidatorTest();

  if (args.includes('--cloudfront')) {
    const cfIndex = args.indexOf('--cloudfront');
    const cfDomain = args[cfIndex + 1];

    if (!cfDomain) {
      console.error('❌ CloudFront domain required after --cloudfront flag');
      process.exit(1);
    }

    tester
      .testCloudFrontDistribution(cfDomain)
      .then(() => {
        const failedTests = tester.testResults.summary.failed;
        process.exit(failedTests > 0 ? 1 : 0);
      })
      .catch(error => {
        console.error(`💥 Test suite failed: ${error.message}`);
        process.exit(1);
      });
  } else {
    tester
      .runTests()
      .then(() => {
        const failedTests = tester.testResults.summary.failed;
        process.exit(failedTests > 0 ? 1 : 0);
      })
      .catch(error => {
        console.error(`💥 Test suite failed: ${error.message}`);
        process.exit(1);
      });
  }
}

module.exports = TLSValidatorTest;
