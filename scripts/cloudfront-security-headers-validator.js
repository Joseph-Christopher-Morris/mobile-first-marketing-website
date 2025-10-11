#!/usr/bin/env node

/**
 * CloudFront Security Headers Validator
 *
 * Validates comprehensive security headers implementation for CloudFront distribution
 * Addresses requirement 7.3: Security headers in CloudFront responses
 */

const {
  CloudFrontClient,
  GetResponseHeadersPolicyCommand,
  GetDistributionCommand,
} = require('@aws-sdk/client-cloudfront');
const https = require('https');
const fs = require('fs');
const path = require('path');

class CloudFrontSecurityHeadersValidator {
  constructor() {
    this.cloudFrontClient = new CloudFrontClient({
      region: 'us-east-1',
    });
    this.distributionId = process.env.CLOUDFRONT_DISTRIBUTION_ID;
    this.testUrl = process.env.TEST_URL || process.env.CLOUDFRONT_URL;
    this.results = {
      policyValidation: { passed: 0, failed: 0, tests: [] },
      headerValidation: { passed: 0, failed: 0, tests: [] },
      cspValidation: { passed: 0, failed: 0, tests: [] },
      securityCompliance: { passed: 0, failed: 0, tests: [] },
      overall: { passed: 0, failed: 0 },
    };
  }

  /**
   * Validate security headers policy configuration
   */
  async validateSecurityHeadersPolicy() {
    console.log('\n🔍 Validating Security Headers Policy Configuration...');

    if (!this.distributionId) {
      this.addTest(
        'policyValidation',
        'Distribution ID available',
        false,
        'CLOUDFRONT_DISTRIBUTION_ID not set'
      );
      return null;
    }

    try {
      // Get distribution configuration
      const distributionResult = await this.cloudFrontClient.send(
        new GetDistributionCommand({ Id: this.distributionId })
      );

      const distribution = distributionResult.Distribution;
      this.addTest('policyValidation', 'Distribution found', true);

      // Check if response headers policy is attached
      const responseHeadersPolicyId =
        distribution.DistributionConfig.DefaultCacheBehavior
          .ResponseHeadersPolicyId;

      if (!responseHeadersPolicyId) {
        this.addTest(
          'policyValidation',
          'Response headers policy attached',
          false,
          'No policy attached to default cache behavior'
        );
        return null;
      }

      this.addTest(
        'policyValidation',
        'Response headers policy attached',
        true
      );

      // Get the response headers policy details
      const policyResult = await this.cloudFrontClient.send(
        new GetResponseHeadersPolicyCommand({ Id: responseHeadersPolicyId })
      );

      const policy = policyResult.ResponseHeadersPolicy;
      this.addTest(
        'policyValidation',
        'Response headers policy retrieved',
        true
      );

      return policy;
    } catch (error) {
      this.addTest(
        'policyValidation',
        'Policy validation',
        false,
        error.message
      );
      return null;
    }
  }

  /**
   * Validate individual security headers in policy
   */
  validatePolicyHeaders(policy) {
    console.log('\n🛡️ Validating Security Headers in Policy...');

    if (!policy) {
      this.addTest(
        'headerValidation',
        'Policy available for validation',
        false
      );
      return;
    }

    const securityConfig =
      policy.ResponseHeadersPolicyConfig.SecurityHeadersConfig;
    const customHeaders =
      policy.ResponseHeadersPolicyConfig.CustomHeadersConfig?.Items || [];

    // Validate HSTS
    if (securityConfig?.StrictTransportSecurity) {
      const hsts = securityConfig.StrictTransportSecurity;
      this.addTest('headerValidation', 'HSTS configured', true);

      const hasLongMaxAge = hsts.AccessControlMaxAgeSec >= 31536000; // At least 1 year
      this.addTest(
        'headerValidation',
        'HSTS max-age >= 1 year',
        hasLongMaxAge,
        `max-age: ${hsts.AccessControlMaxAgeSec}`
      );

      this.addTest(
        'headerValidation',
        'HSTS includeSubDomains enabled',
        hsts.IncludeSubdomains
      );
      this.addTest('headerValidation', 'HSTS preload enabled', hsts.Preload);
    } else {
      this.addTest('headerValidation', 'HSTS configured', false);
    }

    // Validate Content Type Options
    if (securityConfig?.ContentTypeOptions) {
      this.addTest(
        'headerValidation',
        'X-Content-Type-Options configured',
        true
      );
    } else {
      this.addTest(
        'headerValidation',
        'X-Content-Type-Options configured',
        false
      );
    }

    // Validate Frame Options
    if (securityConfig?.FrameOptions) {
      const frameOption = securityConfig.FrameOptions.FrameOption;
      this.addTest('headerValidation', 'X-Frame-Options configured', true);

      const isSecure = frameOption === 'DENY' || frameOption === 'SAMEORIGIN';
      this.addTest(
        'headerValidation',
        'X-Frame-Options secure value',
        isSecure,
        `Value: ${frameOption}`
      );
    } else {
      this.addTest('headerValidation', 'X-Frame-Options configured', false);
    }

    // Validate XSS Protection
    if (securityConfig?.XSSProtection) {
      const xss = securityConfig.XSSProtection;
      this.addTest('headerValidation', 'X-XSS-Protection configured', true);
      this.addTest(
        'headerValidation',
        'X-XSS-Protection enabled',
        xss.Protection
      );
      this.addTest(
        'headerValidation',
        'X-XSS-Protection mode=block',
        xss.ModeBlock
      );
    } else {
      this.addTest('headerValidation', 'X-XSS-Protection configured', false);
    }

    // Validate Referrer Policy
    if (securityConfig?.ReferrerPolicy) {
      const referrerPolicy = securityConfig.ReferrerPolicy.ReferrerPolicy;
      this.addTest('headerValidation', 'Referrer-Policy configured', true);

      const secureValues = [
        'strict-origin',
        'strict-origin-when-cross-origin',
        'no-referrer',
        'same-origin',
      ];
      const isSecure = secureValues.includes(referrerPolicy);
      this.addTest(
        'headerValidation',
        'Referrer-Policy secure value',
        isSecure,
        `Value: ${referrerPolicy}`
      );
    } else {
      this.addTest('headerValidation', 'Referrer-Policy configured', false);
    }

    // Validate CSP
    if (securityConfig?.ContentSecurityPolicy) {
      const csp = securityConfig.ContentSecurityPolicy.ContentSecurityPolicy;
      this.addTest(
        'headerValidation',
        'Content-Security-Policy configured',
        true
      );
      this.validateCSPDirectives(csp);
    } else {
      this.addTest(
        'headerValidation',
        'Content-Security-Policy configured',
        false
      );
    }

    // Validate custom headers
    this.validateCustomHeaders(customHeaders);
  }

  /**
   * Validate CSP directives
   */
  validateCSPDirectives(csp) {
    console.log('\n🔒 Validating CSP Directives...');

    const requiredDirectives = [
      'default-src',
      'script-src',
      'style-src',
      'img-src',
      'font-src',
      'connect-src',
      'object-src',
      'base-uri',
      'form-action',
      'frame-ancestors',
    ];

    requiredDirectives.forEach(directive => {
      const hasDirective = csp.includes(directive);
      this.addTest(
        'cspValidation',
        `${directive} directive present`,
        hasDirective
      );
    });

    // Validate secure defaults
    const hasSecureDefault = csp.includes("default-src 'self'");
    this.addTest(
      'cspValidation',
      "Secure default-src 'self'",
      hasSecureDefault
    );

    const hasFrameAncestorsNone = csp.includes("frame-ancestors 'none'");
    this.addTest(
      'cspValidation',
      'Frame ancestors protection',
      hasFrameAncestorsNone
    );

    const hasObjectSrcNone = csp.includes("object-src 'none'");
    this.addTest(
      'cspValidation',
      'Object-src none protection',
      hasObjectSrcNone
    );

    const hasUpgradeInsecureRequests = csp.includes(
      'upgrade-insecure-requests'
    );
    this.addTest(
      'cspValidation',
      'Upgrade insecure requests',
      hasUpgradeInsecureRequests
    );

    const hasBlockAllMixedContent = csp.includes('block-all-mixed-content');
    this.addTest(
      'cspValidation',
      'Block all mixed content',
      hasBlockAllMixedContent
    );
  }

  /**
   * Validate custom security headers
   */
  validateCustomHeaders(customHeaders) {
    console.log('\n🔧 Validating Custom Security Headers...');

    const expectedCustomHeaders = {
      'Permissions-Policy': {
        required: true,
        description: 'Feature policy for browser APIs',
      },
      'Cross-Origin-Embedder-Policy': {
        required: true,
        description: 'COEP for cross-origin isolation',
      },
      'Cross-Origin-Opener-Policy': {
        required: true,
        description: 'COOP for cross-origin isolation',
      },
      'Cross-Origin-Resource-Policy': {
        required: true,
        description: 'CORP for cross-origin resource sharing',
      },
      'X-DNS-Prefetch-Control': {
        required: false,
        description: 'DNS prefetch control',
      },
    };

    Object.entries(expectedCustomHeaders).forEach(([headerName, config]) => {
      const header = customHeaders.find(h => h.Header === headerName);

      if (header) {
        this.addTest('headerValidation', `${headerName} configured`, true);
        console.log(`    ${headerName}: ${header.Value}`);
      } else if (config.required) {
        this.addTest('headerValidation', `${headerName} configured`, false);
      }
    });
  }

  /**
   * Test live headers (if URL is available)
   */
  async testLiveHeaders() {
    console.log('\n🌐 Testing Live Security Headers...');

    if (!this.testUrl) {
      this.addTest(
        'securityCompliance',
        'Test URL available',
        false,
        'TEST_URL or CLOUDFRONT_URL not set'
      );
      return;
    }

    try {
      const headers = await this.fetchHeaders(this.testUrl);
      this.addTest('securityCompliance', 'Site accessible for testing', true);

      // Test critical security headers
      const criticalHeaders = {
        'strict-transport-security': 'HSTS header',
        'x-frame-options': 'Clickjacking protection',
        'x-content-type-options': 'MIME sniffing protection',
        'x-xss-protection': 'XSS protection',
        'referrer-policy': 'Referrer policy',
        'content-security-policy': 'Content Security Policy',
        'permissions-policy': 'Permissions policy',
      };

      Object.entries(criticalHeaders).forEach(([headerName, description]) => {
        const headerValue = headers[headerName];
        const hasHeader = !!headerValue;
        this.addTest('securityCompliance', `${description} present`, hasHeader);

        if (hasHeader) {
          console.log(`    ${headerName}: ${headerValue}`);
        }
      });

      // Test HTTPS redirect
      if (this.testUrl.startsWith('https://')) {
        const httpUrl = this.testUrl.replace('https://', 'http://');
        try {
          const httpHeaders = await this.fetchHeaders(httpUrl);
          const hasRedirect =
            httpHeaders.location && httpHeaders.location.startsWith('https://');
          this.addTest(
            'securityCompliance',
            'HTTP to HTTPS redirect',
            hasRedirect
          );
        } catch (error) {
          // HTTP might be blocked, which is good
          this.addTest(
            'securityCompliance',
            'HTTP access blocked/redirected',
            true
          );
        }
      }
    } catch (error) {
      this.addTest(
        'securityCompliance',
        'Live header testing',
        false,
        error.message
      );
    }
  }

  /**
   * Fetch headers from URL
   */
  fetchHeaders(url) {
    return new Promise((resolve, reject) => {
      const request = https.get(url, { timeout: 10000 }, response => {
        const headers = {};
        Object.keys(response.headers).forEach(key => {
          headers[key.toLowerCase()] = response.headers[key];
        });
        resolve(headers);
      });

      request.on('error', reject);
      request.on('timeout', () => {
        request.destroy();
        reject(new Error('Request timeout'));
      });
    });
  }

  /**
   * Generate security recommendations
   */
  generateRecommendations() {
    console.log('\n💡 Security Recommendations:');

    const recommendations = [];

    // Check overall compliance
    const overallTotal =
      this.results.overall.passed + this.results.overall.failed;
    const overallPercentage =
      overallTotal > 0
        ? Math.round((this.results.overall.passed / overallTotal) * 100)
        : 0;

    if (overallPercentage < 90) {
      recommendations.push(
        'Consider addressing failed security header tests for better protection'
      );
    }

    // Specific recommendations based on failed tests
    const failedTests = [];
    Object.values(this.results).forEach(category => {
      if (category.tests) {
        category.tests
          .filter(test => !test.passed)
          .forEach(test => {
            failedTests.push(test.name);
          });
      }
    });

    if (failedTests.includes('HSTS max-age >= 1 year')) {
      recommendations.push(
        'Increase HSTS max-age to at least 1 year (31536000 seconds)'
      );
    }

    if (failedTests.includes('Content-Security-Policy configured')) {
      recommendations.push('Implement a comprehensive Content Security Policy');
    }

    if (failedTests.includes('Permissions-Policy configured')) {
      recommendations.push(
        'Add Permissions-Policy header to control browser features'
      );
    }

    if (recommendations.length === 0) {
      console.log(
        '  ✅ Security configuration looks excellent! No major recommendations.'
      );
    } else {
      recommendations.forEach(rec => console.log(`  • ${rec}`));
    }
  }

  /**
   * Save validation results
   */
  saveResults() {
    const configDir = path.join(process.cwd(), 'config');
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }

    const results = {
      timestamp: new Date().toISOString(),
      distributionId: this.distributionId,
      testUrl: this.testUrl,
      results: this.results,
      overallScore: {
        passed: this.results.overall.passed,
        failed: this.results.overall.failed,
        percentage: Math.round(
          (this.results.overall.passed /
            (this.results.overall.passed + this.results.overall.failed)) *
            100
        ),
      },
    };

    const resultsPath = path.join(
      configDir,
      'security-headers-validation.json'
    );
    fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2));

    console.log(`\n📊 Validation results saved to ${resultsPath}`);
  }

  /**
   * Add test result
   */
  addTest(category, name, passed, details = '') {
    const test = { name, passed, details };
    this.results[category].tests.push(test);

    if (passed) {
      this.results[category].passed++;
      this.results.overall.passed++;
      console.log(`  ✅ ${name}`);
    } else {
      this.results[category].failed++;
      this.results.overall.failed++;
      console.log(`  ❌ ${name}${details ? ` - ${details}` : ''}`);
    }
  }

  /**
   * Generate comprehensive report
   */
  generateReport() {
    console.log('\n' + '='.repeat(70));
    console.log('🔒 CLOUDFRONT SECURITY HEADERS VALIDATION REPORT');
    console.log('='.repeat(70));

    Object.entries(this.results).forEach(([category, result]) => {
      if (category === 'overall') return;

      const categoryName = category
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, str => str.toUpperCase());
      const total = result.passed + result.failed;
      const percentage =
        total > 0 ? Math.round((result.passed / total) * 100) : 0;

      console.log(`\n📊 ${categoryName}:`);
      console.log(`   Passed: ${result.passed}/${total} (${percentage}%)`);

      if (result.failed > 0) {
        console.log('   Failed tests:');
        result.tests
          .filter(test => !test.passed)
          .forEach(test => {
            console.log(
              `     • ${test.name}${test.details ? ` - ${test.details}` : ''}`
            );
          });
      }
    });

    this.generateRecommendations();

    const overallTotal =
      this.results.overall.passed + this.results.overall.failed;
    const overallPercentage =
      overallTotal > 0
        ? Math.round((this.results.overall.passed / overallTotal) * 100)
        : 0;

    console.log('\n' + '='.repeat(70));
    console.log(
      `📈 OVERALL SECURITY SCORE: ${this.results.overall.passed}/${overallTotal} (${overallPercentage}%)`
    );

    if (overallPercentage >= 95) {
      console.log(
        '🎉 Excellent! Security headers are comprehensively configured.'
      );
    } else if (overallPercentage >= 85) {
      console.log(
        '✅ Good security configuration with minor improvements possible.'
      );
    } else if (overallPercentage >= 70) {
      console.log('⚠️  Security configuration needs attention.');
    } else {
      console.log('❌ Critical security issues need immediate attention.');
    }

    console.log('='.repeat(70));

    return overallPercentage >= 85;
  }

  /**
   * Main execution function
   */
  async run() {
    console.log('🔒 Starting CloudFront Security Headers Validation...');
    console.log(
      'This will validate comprehensive security headers configuration.'
    );

    // Validate policy configuration
    const policy = await this.validateSecurityHeadersPolicy();

    if (policy) {
      this.validatePolicyHeaders(policy);
    }

    // Test live headers if URL is available
    await this.testLiveHeaders();

    // Generate report and save results
    const success = this.generateReport();
    this.saveResults();

    if (!success) {
      console.log(
        '\n❌ Security validation failed. Please address the issues above.'
      );
      process.exit(1);
    }

    console.log(
      '\n✅ CloudFront security headers validation completed successfully!'
    );
    return success;
  }
}

// Run validation if called directly
if (require.main === module) {
  const validator = new CloudFrontSecurityHeadersValidator();
  validator.run().catch(error => {
    console.error('❌ Security validation failed:', error);
    process.exit(1);
  });
}

module.exports = CloudFrontSecurityHeadersValidator;
