#!/usr/bin/env node

/**
 * Test Cipher Suite Validation
 *
 * This script tests the cipher suite validation functionality
 * against CloudFront distributions and other HTTPS endpoints
 */

const CipherSuiteValidator = require('./cipher-suite-validator');
const fs = require('fs');
const path = require('path');

class CipherSuiteValidationTester {
  constructor() {
    this.testResults = {
      timestamp: new Date().toISOString(),
      tests: [],
      summary: {
        total: 0,
        passed: 0,
        failed: 0,
      },
    };
  }

  /**
   * Run comprehensive cipher suite validation tests
   */
  async runTests() {
    console.log('🧪 Starting Cipher Suite Validation Tests...\n');

    // Test domains - including CloudFront examples
    const testDomains = [
      'github.com', // Known good configuration
      'cloudfront.net', // CloudFront domain
      'aws.amazon.com', // AWS domain
      'd111111abcdef8.cloudfront.net', // Example CloudFront distribution
    ];

    for (const domain of testDomains) {
      await this.testDomain(domain);
    }

    // Generate test summary
    this.generateTestSummary();

    return this.testResults;
  }

  /**
   * Test cipher suite validation for a specific domain
   */
  async testDomain(domain) {
    console.log(`🔍 Testing domain: ${domain}`);
    console.log('─'.repeat(50));

    const testStart = Date.now();
    const testResult = {
      domain,
      startTime: new Date().toISOString(),
      duration: 0,
      passed: false,
      error: null,
      validationResults: null,
    };

    try {
      const validator = new CipherSuiteValidator();
      const results = await validator.validateCipherSuites(domain);

      testResult.validationResults = results;
      testResult.passed = results.passed;
      testResult.duration = Date.now() - testStart;

      if (results.passed) {
        console.log(
          `✅ ${domain} - Cipher validation PASSED (Score: ${results.score}/100)`
        );
        this.testResults.summary.passed++;
      } else {
        console.log(
          `❌ ${domain} - Cipher validation FAILED (Score: ${results.score}/100)`
        );
        this.testResults.summary.failed++;
      }

      // Log key findings
      console.log(`   Strong ciphers: ${results.strongCiphers.length}`);
      console.log(`   Weak ciphers: ${results.weakCiphers.length}`);
      console.log(`   Recommendations: ${results.recommendations.length}`);
    } catch (error) {
      testResult.error = error.message;
      testResult.duration = Date.now() - testStart;
      console.log(`❌ ${domain} - Test failed: ${error.message}`);
      this.testResults.summary.failed++;
    }

    testResult.endTime = new Date().toISOString();
    this.testResults.tests.push(testResult);
    this.testResults.summary.total++;

    console.log(`   Duration: ${testResult.duration}ms\n`);
  }

  /**
   * Generate test summary and reports
   */
  generateTestSummary() {
    console.log('📊 Test Summary');
    console.log('═'.repeat(30));
    console.log(`Total tests: ${this.testResults.summary.total}`);
    console.log(`Passed: ${this.testResults.summary.passed}`);
    console.log(`Failed: ${this.testResults.summary.failed}`);
    console.log(
      `Success rate: ${((this.testResults.summary.passed / this.testResults.summary.total) * 100).toFixed(1)}%`
    );

    // Save test results
    const reportPath = path.join(
      __dirname,
      '..',
      'config',
      'cipher-suite-test-results.json'
    );
    fs.writeFileSync(reportPath, JSON.stringify(this.testResults, null, 2));
    console.log(`\n📄 Test results saved to: ${reportPath}`);

    // Generate recommendations based on test results
    this.generateTestRecommendations();
  }

  /**
   * Generate recommendations based on test results
   */
  generateTestRecommendations() {
    console.log('\n💡 Test-based Recommendations');
    console.log('─'.repeat(40));

    const allResults = this.testResults.tests
      .filter(test => test.validationResults)
      .map(test => test.validationResults);

    if (allResults.length === 0) {
      console.log('❌ No successful validations to analyze');
      return;
    }

    // Analyze common issues
    const commonWeakCiphers = {};
    const commonRecommendations = {};

    allResults.forEach(result => {
      // Count weak ciphers
      result.weakCiphers.forEach(weak => {
        commonWeakCiphers[weak.weakness] =
          (commonWeakCiphers[weak.weakness] || 0) + 1;
      });

      // Count recommendations
      result.recommendations.forEach(rec => {
        commonRecommendations[rec] = (commonRecommendations[rec] || 0) + 1;
      });
    });

    // Report common weak ciphers
    if (Object.keys(commonWeakCiphers).length > 0) {
      console.log('\n🚫 Most common weak cipher issues:');
      Object.entries(commonWeakCiphers)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .forEach(([weakness, count]) => {
          console.log(`   - ${weakness}: found in ${count} domain(s)`);
        });
    }

    // Report common recommendations
    if (Object.keys(commonRecommendations).length > 0) {
      console.log('\n💡 Most common recommendations:');
      Object.entries(commonRecommendations)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .forEach(([rec, count]) => {
          console.log(`   - ${rec} (${count} domain(s))`);
        });
    }

    // Calculate average scores
    const scores = allResults.map(r => r.score);
    const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
    console.log(`\n📊 Average security score: ${avgScore.toFixed(1)}/100`);

    if (avgScore < 80) {
      console.log('⚠️  Average score below recommended threshold (80)');
      console.log('   Consider implementing the common recommendations above');
    } else {
      console.log('✅ Average score meets security standards');
    }
  }

  /**
   * Test specific cipher suite scenarios
   */
  async testSpecificScenarios() {
    console.log('\n🎯 Testing Specific Cipher Suite Scenarios...\n');

    const scenarios = [
      {
        name: 'Strong AES-256 Support',
        test: results => results.encryptionStrength.aes256 > 0,
        description: 'Verify AES-256 cipher support',
      },
      {
        name: 'ChaCha20 Support',
        test: results => results.encryptionStrength.chacha20 > 0,
        description: 'Verify ChaCha20-Poly1305 cipher support',
      },
      {
        name: 'Perfect Forward Secrecy',
        test: results => results.encryptionStrength.perfectForwardSecrecy > 0,
        description: 'Verify PFS with ECDHE/DHE key exchange',
      },
      {
        name: 'No Weak Ciphers',
        test: results => results.weakCiphers.length === 0,
        description: 'Verify no weak ciphers are enabled',
      },
      {
        name: 'Minimum Strong Ciphers',
        test: results => results.strongCiphers.length >= 3,
        description: 'Verify at least 3 strong ciphers are supported',
      },
    ];

    const testDomain = 'github.com'; // Use a known good domain for scenario testing
    const validator = new CipherSuiteValidator();

    try {
      const results = await validator.validateCipherSuites(testDomain);

      console.log(`Testing scenarios against: ${testDomain}\n`);

      scenarios.forEach(scenario => {
        const passed = scenario.test(results);
        console.log(`${passed ? '✅' : '❌'} ${scenario.name}`);
        console.log(`   ${scenario.description}`);
        if (!passed) {
          console.log(
            `   ⚠️  This scenario failed - review cipher configuration`
          );
        }
        console.log();
      });
    } catch (error) {
      console.error(`❌ Scenario testing failed: ${error.message}`);
    }
  }
}

// CLI execution
async function main() {
  console.log('🧪 Cipher Suite Validation Test Suite');
  console.log('=====================================\n');

  const tester = new CipherSuiteValidationTester();

  try {
    // Run main validation tests
    await tester.runTests();

    // Run specific scenario tests
    await tester.testSpecificScenarios();

    console.log('\n🎉 All cipher suite validation tests completed!');
  } catch (error) {
    console.error('\n❌ Test suite failed:', error.message);
    process.exit(1);
  }
}

// Export for use as module
module.exports = CipherSuiteValidationTester;

// Run if called directly
if (require.main === module) {
  main();
}
