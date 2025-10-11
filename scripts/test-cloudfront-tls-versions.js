#!/usr/bin/env node

/**
 * CloudFront TLS Version Test Runner - Task 7.5.1
 *
 * This script tests TLS version support for CloudFront distributions
 * and validates compliance with security requirements.
 */

const TLSVersionTester = require('./test-tls-version-support');
const fs = require('fs');
const path = require('path');

class CloudFrontTLSVersionTester {
  constructor(options = {}) {
    this.options = options;
    this.results = {
      timestamp: new Date().toISOString(),
      testResults: {},
      summary: {
        totalDomains: 0,
        compliantDomains: 0,
        nonCompliantDomains: 0,
        failedTests: 0,
      },
      overallStatus: 'UNKNOWN',
    };
  }

  /**
   * Test multiple domains/distributions
   */
  async testDomains(domains) {
    console.log(`🔍 Starting CloudFront TLS Version Testing`);
    console.log(`📋 Testing ${domains.length} domain(s)`);
    console.log(`⏰ Started: ${this.results.timestamp}`);

    for (const domain of domains) {
      console.log(`\n${'='.repeat(60)}`);
      console.log(`🌐 Testing domain: ${domain}`);
      console.log(`${'='.repeat(60)}`);

      try {
        const tester = new TLSVersionTester(domain, this.options);
        const result = await tester.runTest();

        this.results.testResults[domain] = result;
        this.results.summary.totalDomains++;

        if (result.complianceStatus === 'COMPLIANT') {
          this.results.summary.compliantDomains++;
        } else {
          this.results.summary.nonCompliantDomains++;
        }
      } catch (error) {
        console.error(`❌ Failed to test ${domain}: ${error.message}`);
        this.results.testResults[domain] = {
          error: error.message,
          complianceStatus: 'ERROR',
        };
        this.results.summary.failedTests++;
      }
    }

    this.generateOverallSummary();
    return this.results;
  }

  /**
   * Generate overall summary
   */
  generateOverallSummary() {
    console.log(`\n${'='.repeat(80)}`);
    console.log(`📊 OVERALL TLS VERSION TEST SUMMARY`);
    console.log(`${'='.repeat(80)}`);

    console.log(
      `⏰ Test Duration: ${Date.now() - new Date(this.results.timestamp).getTime()}ms`
    );
    console.log(
      `🌐 Total Domains Tested: ${this.results.summary.totalDomains}`
    );
    console.log(
      `✅ Compliant Domains: ${this.results.summary.compliantDomains}`
    );
    console.log(
      `⚠️  Non-Compliant Domains: ${this.results.summary.nonCompliantDomains}`
    );
    console.log(`❌ Failed Tests: ${this.results.summary.failedTests}`);

    // Determine overall status
    if (this.results.summary.failedTests > 0) {
      this.results.overallStatus = 'ERROR';
    } else if (this.results.summary.nonCompliantDomains > 0) {
      this.results.overallStatus = 'NON_COMPLIANT';
    } else if (this.results.summary.compliantDomains > 0) {
      this.results.overallStatus = 'COMPLIANT';
    } else {
      this.results.overallStatus = 'NO_TESTS';
    }

    console.log(`🎯 Overall Status: ${this.results.overallStatus}`);

    // Show detailed results per domain
    console.log(`\n📋 Detailed Results:`);
    Object.entries(this.results.testResults).forEach(([domain, result]) => {
      const status = result.complianceStatus || 'ERROR';
      const statusIcon =
        status === 'COMPLIANT'
          ? '✅'
          : status === 'PARTIALLY_COMPLIANT'
            ? '⚠️'
            : '❌';
      console.log(`  ${statusIcon} ${domain}: ${status}`);

      if (result.summary) {
        console.log(
          `    Tests: ${result.summary.passedTests}/${result.summary.totalTests} passed`
        );
      }

      if (result.recommendations && result.recommendations.length > 0) {
        const criticalIssues = result.recommendations.filter(r =>
          r.includes('CRITICAL')
        ).length;
        if (criticalIssues > 0) {
          console.log(`    🚨 ${criticalIssues} critical issue(s) found`);
        }
      }
    });

    // Show critical recommendations
    const allRecommendations = [];
    Object.values(this.results.testResults).forEach(result => {
      if (result.recommendations) {
        allRecommendations.push(...result.recommendations);
      }
    });

    const criticalRecommendations = allRecommendations.filter(r =>
      r.includes('CRITICAL')
    );
    if (criticalRecommendations.length > 0) {
      console.log(`\n🚨 CRITICAL SECURITY ISSUES FOUND:`);
      criticalRecommendations.forEach((rec, index) => {
        console.log(`  ${index + 1}. ${rec}`);
      });
    }
  }

  /**
   * Save consolidated results
   */
  saveResults(filename) {
    const outputFile =
      filename || `cloudfront-tls-version-test-results-${Date.now()}.json`;

    // Add metadata
    this.results.metadata = {
      taskId: '7.5.1',
      taskDescription: 'Test TLS version support for CloudFront distributions',
      testType: 'CloudFront TLS Version Validation',
      requirements: [
        'Verify TLS 1.2 support is enabled',
        'Confirm TLS 1.3 support is available',
        'Test that weak TLS versions (1.0, 1.1) are disabled',
        'Validate TLS version negotiation behavior',
      ],
    };

    fs.writeFileSync(outputFile, JSON.stringify(this.results, null, 2));
    console.log(`\n💾 Consolidated results saved to: ${outputFile}`);
    return outputFile;
  }
}

// CLI usage
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes('--help')) {
    console.log(`
CloudFront TLS Version Test Runner - Task 7.5.1

Tests TLS version support for CloudFront distributions and other domains.

Usage: node test-cloudfront-tls-versions.js <domain1> [domain2] [...] [options]

Options:
  --port <port>        Port to test (default: 443)
  --timeout <ms>       Connection timeout (default: 10000)
  --output <file>      Output file for consolidated results
  --help              Show this help message

Examples:
  node test-cloudfront-tls-versions.js d1234567890.cloudfront.net
  node test-cloudfront-tls-versions.js example.com mysite.com
  node test-cloudfront-tls-versions.js d1234567890.cloudfront.net --output results.json

Test Domains:
  You can test any domain, but this is specifically designed for:
  - CloudFront distribution domains (*.cloudfront.net)
  - Custom domains configured with CloudFront
  - Any HTTPS endpoint that needs TLS version validation
        `);
    process.exit(1);
  }

  // Parse arguments
  const domains = [];
  const options = {};
  let outputFile = null;

  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith('--')) {
      switch (args[i]) {
        case '--port':
          options.port = parseInt(args[i + 1]);
          i++;
          break;
        case '--timeout':
          options.timeout = parseInt(args[i + 1]);
          i++;
          break;
        case '--output':
          outputFile = args[i + 1];
          i++;
          break;
      }
    } else {
      domains.push(args[i]);
    }
  }

  if (domains.length === 0) {
    console.error('❌ No domains specified for testing');
    process.exit(1);
  }

  const tester = new CloudFrontTLSVersionTester(options);

  tester
    .testDomains(domains)
    .then(results => {
      tester.saveResults(outputFile);

      // Exit with appropriate code
      if (results.overallStatus === 'COMPLIANT') {
        console.log(`\n✅ All domains passed TLS version tests`);
        process.exit(0);
      } else if (results.overallStatus === 'NON_COMPLIANT') {
        console.log(
          `\n⚠️  Some domains have TLS version issues - review recommendations`
        );
        process.exit(1);
      } else if (results.overallStatus === 'ERROR') {
        console.log(
          `\n❌ Test errors occurred - check configuration and connectivity`
        );
        process.exit(2);
      } else {
        console.log(`\n❓ No tests completed successfully`);
        process.exit(3);
      }
    })
    .catch(error => {
      console.error(`\n💥 Testing failed: ${error.message}`);
      process.exit(4);
    });
}

module.exports = CloudFrontTLSVersionTester;
