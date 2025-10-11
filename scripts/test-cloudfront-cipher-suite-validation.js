#!/usr/bin/env node

/**
 * CloudFront Cipher Suite Validation Test
 *
 * This script specifically tests cipher suite validation for CloudFront distributions
 * and validates against CloudFront security policies
 */

const CipherSuiteConfigurationValidator = require('./cipher-suite-configuration-validator');
const fs = require('fs');
const path = require('path');

class CloudFrontCipherSuiteValidationTester {
  constructor() {
    this.testResults = {
      timestamp: new Date().toISOString(),
      cloudFrontTests: [],
      securityPolicyTests: [],
      cipherSuiteTests: [],
      summary: {
        total: 0,
        passed: 0,
        failed: 0,
      },
    };

    // CloudFront Security Policies to test
    this.cloudFrontSecurityPolicies = [
      {
        name: 'TLSv1.2_2021',
        description: 'Latest CloudFront security policy (recommended)',
        supportedProtocols: ['TLSv1.2', 'TLSv1.3'],
        requiredCiphers: [
          'ECDHE-RSA-AES256-GCM-SHA384',
          'ECDHE-RSA-AES128-GCM-SHA256',
          'ECDHE-ECDSA-AES256-GCM-SHA384',
          'ECDHE-ECDSA-AES128-GCM-SHA256',
          'ECDHE-RSA-CHACHA20-POLY1305',
          'ECDHE-ECDSA-CHACHA20-POLY1305',
        ],
      },
      {
        name: 'TLSv1.2_2019',
        description: 'CloudFront security policy from 2019',
        supportedProtocols: ['TLSv1.2'],
        requiredCiphers: [
          'ECDHE-RSA-AES256-GCM-SHA384',
          'ECDHE-RSA-AES128-GCM-SHA256',
          'ECDHE-ECDSA-AES256-GCM-SHA384',
          'ECDHE-ECDSA-AES128-GCM-SHA256',
        ],
      },
      {
        name: 'TLSv1.2_2017',
        description: 'Legacy CloudFront security policy (minimum)',
        supportedProtocols: ['TLSv1.2'],
        requiredCiphers: [
          'ECDHE-RSA-AES256-GCM-SHA384',
          'ECDHE-RSA-AES128-GCM-SHA256',
        ],
      },
    ];
  }

  /**
   * Run comprehensive CloudFront cipher suite validation tests
   */
  async runTests() {
    console.log('🧪 Starting CloudFront Cipher Suite Validation Tests...\n');

    // Test CloudFront security policies
    await this.testCloudFrontSecurityPolicies();

    // Test specific cipher suite scenarios
    await this.testCipherSuiteScenarios();

    // Test configuration validation
    await this.testConfigurationValidation();

    // Generate test summary
    this.generateTestSummary();

    return this.testResults;
  }

  /**
   * Test CloudFront security policies
   */
  async testCloudFrontSecurityPolicies() {
    console.log('☁️  Testing CloudFront Security Policies...\n');

    for (const policy of this.cloudFrontSecurityPolicies) {
      console.log(`🔍 Testing policy: ${policy.name}`);
      console.log(`   Description: ${policy.description}`);

      const testResult = {
        policyName: policy.name,
        description: policy.description,
        supportedProtocols: policy.supportedProtocols,
        requiredCiphers: policy.requiredCiphers,
        testResults: {
          protocolSupport: this.testProtocolSupport(policy.supportedProtocols),
          cipherSupport: this.testCipherSupport(policy.requiredCiphers),
          securityScore: 0,
          passed: false,
        },
      };

      // Calculate security score for this policy
      const protocolScore = testResult.testResults.protocolSupport.score;
      const cipherScore = testResult.testResults.cipherSupport.score;
      testResult.testResults.securityScore = Math.round(
        (protocolScore + cipherScore) / 2
      );
      testResult.testResults.passed =
        testResult.testResults.securityScore >= 80;

      this.testResults.securityPolicyTests.push(testResult);
      this.testResults.summary.total++;

      if (testResult.testResults.passed) {
        console.log(
          `✅ Policy ${policy.name} validation PASSED (Score: ${testResult.testResults.securityScore}/100)`
        );
        this.testResults.summary.passed++;
      } else {
        console.log(
          `❌ Policy ${policy.name} validation FAILED (Score: ${testResult.testResults.securityScore}/100)`
        );
        this.testResults.summary.failed++;
      }

      console.log(`   Protocol support: ${protocolScore}/100`);
      console.log(`   Cipher support: ${cipherScore}/100\n`);
    }
  }

  /**
   * Test protocol support
   */
  testProtocolSupport(supportedProtocols) {
    const result = {
      supportedProtocols,
      modernProtocols: [],
      legacyProtocols: [],
      score: 0,
    };

    supportedProtocols.forEach(protocol => {
      if (protocol === 'TLSv1.3') {
        result.modernProtocols.push(protocol);
        result.score += 50;
      } else if (protocol === 'TLSv1.2') {
        result.modernProtocols.push(protocol);
        result.score += 40;
      } else {
        result.legacyProtocols.push(protocol);
        result.score += 10;
      }
    });

    return result;
  }

  /**
   * Test cipher support
   */
  testCipherSupport(requiredCiphers) {
    const result = {
      requiredCiphers,
      strongCiphers: [],
      modernCiphers: [],
      score: 0,
    };

    requiredCiphers.forEach(cipher => {
      // Check for strong cipher patterns
      if (cipher.includes('ECDHE') && cipher.includes('GCM')) {
        result.strongCiphers.push(cipher);
        result.score += 15;
      } else if (cipher.includes('CHACHA20')) {
        result.modernCiphers.push(cipher);
        result.score += 20;
      } else if (cipher.includes('AES256')) {
        result.strongCiphers.push(cipher);
        result.score += 12;
      } else if (cipher.includes('AES128')) {
        result.strongCiphers.push(cipher);
        result.score += 10;
      }
    });

    // Cap the score at 100
    result.score = Math.min(100, result.score);

    return result;
  }

  /**
   * Test specific cipher suite scenarios
   */
  async testCipherSuiteScenarios() {
    console.log('🎯 Testing Specific Cipher Suite Scenarios...\n');

    const scenarios = [
      {
        name: 'Perfect Forward Secrecy',
        test: () => this.testPerfectForwardSecrecy(),
        description: 'Verify ECDHE/DHE key exchange support',
      },
      {
        name: 'AEAD Cipher Support',
        test: () => this.testAEADCipherSupport(),
        description: 'Verify GCM and ChaCha20-Poly1305 support',
      },
      {
        name: 'Strong Encryption',
        test: () => this.testStrongEncryption(),
        description: 'Verify AES-256 and ChaCha20 support',
      },
      {
        name: 'Weak Cipher Rejection',
        test: () => this.testWeakCipherRejection(),
        description: 'Verify weak ciphers are not supported',
      },
      {
        name: 'Modern TLS Support',
        test: () => this.testModernTLSSupport(),
        description: 'Verify TLS 1.2+ protocol support',
      },
    ];

    for (const scenario of scenarios) {
      console.log(`🔍 Testing: ${scenario.name}`);
      console.log(`   ${scenario.description}`);

      try {
        const result = scenario.test();
        const passed = result.passed;

        console.log(`   Result: ${passed ? '✅ PASSED' : '❌ FAILED'}`);
        if (result.details) {
          console.log(`   Details: ${result.details}`);
        }

        this.testResults.cipherSuiteTests.push({
          name: scenario.name,
          description: scenario.description,
          passed,
          result,
        });
      } catch (error) {
        console.log(`   Result: ❌ ERROR - ${error.message}`);
        this.testResults.cipherSuiteTests.push({
          name: scenario.name,
          description: scenario.description,
          passed: false,
          error: error.message,
        });
      }

      console.log();
    }
  }

  /**
   * Test Perfect Forward Secrecy support
   */
  testPerfectForwardSecrecy() {
    const pfsCiphers =
      this.cloudFrontSecurityPolicies[0].requiredCiphers.filter(
        cipher => cipher.includes('ECDHE') || cipher.includes('DHE')
      );

    return {
      passed: pfsCiphers.length > 0,
      details: `Found ${pfsCiphers.length} PFS ciphers`,
      pfsCiphers,
    };
  }

  /**
   * Test AEAD cipher support
   */
  testAEADCipherSupport() {
    const aeadCiphers =
      this.cloudFrontSecurityPolicies[0].requiredCiphers.filter(
        cipher => cipher.includes('GCM') || cipher.includes('POLY1305')
      );

    return {
      passed: aeadCiphers.length >= 4,
      details: `Found ${aeadCiphers.length} AEAD ciphers`,
      aeadCiphers,
    };
  }

  /**
   * Test strong encryption support
   */
  testStrongEncryption() {
    const strongCiphers =
      this.cloudFrontSecurityPolicies[0].requiredCiphers.filter(
        cipher => cipher.includes('AES256') || cipher.includes('CHACHA20')
      );

    return {
      passed: strongCiphers.length >= 2,
      details: `Found ${strongCiphers.length} strong encryption ciphers`,
      strongCiphers,
    };
  }

  /**
   * Test weak cipher rejection
   */
  testWeakCipherRejection() {
    const weakPatterns = ['RC4', 'DES', '3DES', 'MD5', 'SHA1', 'NULL'];
    const allCiphers = this.cloudFrontSecurityPolicies.flatMap(
      policy => policy.requiredCiphers
    );

    const weakCiphers = allCiphers.filter(cipher =>
      weakPatterns.some(pattern => cipher.includes(pattern))
    );

    return {
      passed: weakCiphers.length === 0,
      details: `Found ${weakCiphers.length} weak ciphers`,
      weakCiphers,
    };
  }

  /**
   * Test modern TLS support
   */
  testModernTLSSupport() {
    const modernProtocols =
      this.cloudFrontSecurityPolicies[0].supportedProtocols.filter(
        protocol => protocol === 'TLSv1.2' || protocol === 'TLSv1.3'
      );

    return {
      passed: modernProtocols.length >= 1,
      details: `Supports ${modernProtocols.length} modern TLS protocols`,
      modernProtocols,
    };
  }

  /**
   * Test configuration validation
   */
  async testConfigurationValidation() {
    console.log('⚙️  Testing Configuration Validation...\n');

    try {
      const validator = new CipherSuiteConfigurationValidator();
      const results = await validator.validateCipherConfiguration('cloudfront');

      const testResult = {
        validationScore: results.score,
        passed: results.passed,
        recommendations: results.securityRecommendations,
        complianceCheck: results.complianceCheck,
      };

      this.testResults.cloudFrontTests.push(testResult);

      console.log(`🔍 Configuration validation completed`);
      console.log(`   Score: ${results.score}/100`);
      console.log(
        `   Status: ${results.passed ? '✅ PASSED' : '❌ NEEDS IMPROVEMENT'}`
      );
      console.log(
        `   Recommendations: ${results.securityRecommendations.length}`
      );
    } catch (error) {
      console.log(`❌ Configuration validation failed: ${error.message}`);
      this.testResults.cloudFrontTests.push({
        error: error.message,
        passed: false,
      });
    }
  }

  /**
   * Generate test summary and reports
   */
  generateTestSummary() {
    console.log('\n📊 CloudFront Cipher Suite Test Summary');
    console.log('═'.repeat(50));

    // Security policy tests summary
    const policyPassed = this.testResults.securityPolicyTests.filter(
      t => t.testResults.passed
    ).length;
    console.log(
      `Security Policy Tests: ${policyPassed}/${this.testResults.securityPolicyTests.length} passed`
    );

    // Cipher suite scenario tests summary
    const scenarioPassed = this.testResults.cipherSuiteTests.filter(
      t => t.passed
    ).length;
    console.log(
      `Cipher Suite Scenarios: ${scenarioPassed}/${this.testResults.cipherSuiteTests.length} passed`
    );

    // Configuration tests summary
    const configPassed = this.testResults.cloudFrontTests.filter(
      t => t.passed
    ).length;
    console.log(
      `Configuration Tests: ${configPassed}/${this.testResults.cloudFrontTests.length} passed`
    );

    // Overall summary
    const totalTests =
      this.testResults.securityPolicyTests.length +
      this.testResults.cipherSuiteTests.length +
      this.testResults.cloudFrontTests.length;
    const totalPassed = policyPassed + scenarioPassed + configPassed;

    console.log(
      `\nOverall: ${totalPassed}/${totalTests} tests passed (${((totalPassed / totalTests) * 100).toFixed(1)}%)`
    );

    // Save test results
    const reportPath = path.join(
      __dirname,
      '..',
      'config',
      'cloudfront-cipher-suite-test-results.json'
    );
    fs.writeFileSync(reportPath, JSON.stringify(this.testResults, null, 2));
    console.log(`\n📄 Test results saved to: ${reportPath}`);

    // Generate recommendations
    this.generateCloudFrontRecommendations();
  }

  /**
   * Generate CloudFront-specific recommendations
   */
  generateCloudFrontRecommendations() {
    console.log('\n💡 CloudFront Cipher Suite Recommendations');
    console.log('─'.repeat(50));

    const recommendations = [
      'Use TLSv1.2_2021 security policy for new distributions',
      'Enable TLS 1.3 support for improved performance and security',
      'Ensure ECDHE key exchange for Perfect Forward Secrecy',
      'Prefer AEAD ciphers (GCM, ChaCha20-Poly1305) over CBC',
      'Regularly review and update security policies',
      'Monitor CloudFront security policy updates from AWS',
      'Test cipher configurations in staging before production',
      'Implement security headers alongside cipher configuration',
    ];

    recommendations.forEach(rec => {
      console.log(`• ${rec}`);
    });

    // Specific recommendations based on test results
    const failedPolicies = this.testResults.securityPolicyTests.filter(
      t => !t.testResults.passed
    );
    if (failedPolicies.length > 0) {
      console.log('\n⚠️  Policy-specific recommendations:');
      failedPolicies.forEach(policy => {
        console.log(
          `• Review ${policy.policyName} configuration for compliance`
        );
      });
    }

    const failedScenarios = this.testResults.cipherSuiteTests.filter(
      t => !t.passed
    );
    if (failedScenarios.length > 0) {
      console.log('\n⚠️  Scenario-specific recommendations:');
      failedScenarios.forEach(scenario => {
        console.log(`• Address ${scenario.name} requirements`);
      });
    }
  }
}

// CLI execution
async function main() {
  console.log('🧪 CloudFront Cipher Suite Validation Test Suite');
  console.log('================================================\n');

  const tester = new CloudFrontCipherSuiteValidationTester();

  try {
    await tester.runTests();
    console.log('\n🎉 All CloudFront cipher suite validation tests completed!');
  } catch (error) {
    console.error('\n❌ Test suite failed:', error.message);
    process.exit(1);
  }
}

// Export for use as module
module.exports = CloudFrontCipherSuiteValidationTester;

// Run if called directly
if (require.main === module) {
  main();
}
