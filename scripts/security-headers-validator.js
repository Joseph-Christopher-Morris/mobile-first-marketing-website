#!/usr/bin/env node

/**
 * Security Headers Validator
 *
 * This script validates security headers and policies configuration
 * for the AWS Amplify deployment. It checks:
 * - Security headers compliance
 * - Content Security Policy implementation
 * - HTTPS redirect configuration
 * - SSL certificate validation
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

class SecurityHeadersValidator {
  constructor() {
    this.results = {
      amplifyConfig: { passed: 0, failed: 0, tests: [] },
      securityHeaders: { passed: 0, failed: 0, tests: [] },
      cspPolicy: { passed: 0, failed: 0, tests: [] },
      httpsRedirect: { passed: 0, failed: 0, tests: [] },
      overall: { passed: 0, failed: 0 },
    };
  }

  /**
   * Validate amplify.yml security configuration
   */
  validateAmplifyConfig() {
    console.log('\n🔍 Validating Amplify Security Configuration...');

    try {
      const amplifyPath = path.join(process.cwd(), 'amplify.yml');
      if (!fs.existsSync(amplifyPath)) {
        this.addTest(
          'amplifyConfig',
          'Amplify config file exists',
          false,
          'amplify.yml not found'
        );
        return;
      }

      const amplifyContent = fs.readFileSync(amplifyPath, 'utf8');
      this.addTest('amplifyConfig', 'Amplify config file exists', true);

      // Check for custom headers section
      const hasCustomHeaders = amplifyContent.includes('customHeaders:');
      this.addTest(
        'amplifyConfig',
        'Custom headers section configured',
        hasCustomHeaders
      );

      // Check for security headers
      const securityHeaders = [
        'Strict-Transport-Security',
        'X-Frame-Options',
        'X-Content-Type-Options',
        'X-XSS-Protection',
        'Referrer-Policy',
        'Permissions-Policy',
        'Content-Security-Policy',
      ];

      securityHeaders.forEach(header => {
        const hasHeader = amplifyContent.includes(header);
        this.addTest('amplifyConfig', `${header} configured`, hasHeader);
      });

      // Check for HTTPS redirects
      const hasHttpsRedirect =
        amplifyContent.includes('http://<*>') &&
        amplifyContent.includes('https://<>');
      this.addTest(
        'amplifyConfig',
        'HTTPS redirect configured',
        hasHttpsRedirect
      );

      // Check for caching headers
      const hasCacheControl = amplifyContent.includes('Cache-Control');
      this.addTest(
        'amplifyConfig',
        'Cache-Control headers configured',
        hasCacheControl
      );
    } catch (error) {
      this.addTest(
        'amplifyConfig',
        'Amplify config validation',
        false,
        error.message
      );
    }
  }

  /**
   * Validate Content Security Policy
   */
  validateCSP() {
    console.log('\n🛡️ Validating Content Security Policy...');

    try {
      const amplifyPath = path.join(process.cwd(), 'amplify.yml');
      const amplifyContent = fs.readFileSync(amplifyPath, 'utf8');

      // Extract CSP from amplify.yml using improved regex
      const cspRegex =
        /-\s+key:\s*["']Content-Security-Policy["']\s*\n\s*value:\s*["']([^"]*(?:\\.[^"]*)*)["']/s;
      let cspMatch = amplifyContent.match(cspRegex);

      if (!cspMatch) {
        // Fallback: try simpler pattern
        cspMatch = amplifyContent.match(
          /Content-Security-Policy[\s\S]*?value:\s*["']([^"]+)["']/
        );
        if (!cspMatch) {
          this.addTest(
            'cspPolicy',
            'CSP header present',
            false,
            'CSP not found in amplify.yml'
          );
          return;
        }
      }

      const csp = cspMatch[1];
      this.addTest('cspPolicy', 'CSP header present', true);

      // Validate CSP directives
      const requiredDirectives = [
        'default-src',
        'script-src',
        'style-src',
        'img-src',
        'font-src',
        'connect-src',
        'frame-ancestors',
      ];

      requiredDirectives.forEach(directive => {
        const hasDirective = csp.includes(directive);
        this.addTest(
          'cspPolicy',
          `${directive} directive present`,
          hasDirective
        );
      });

      // Check for secure defaults
      const hasSecureDefaults = csp.includes("default-src 'self'");
      this.addTest('cspPolicy', "Secure default-src 'self'", hasSecureDefaults);

      const hasFrameAncestorsNone = csp.includes("frame-ancestors 'none'");
      this.addTest(
        'cspPolicy',
        'Frame ancestors protection',
        hasFrameAncestorsNone
      );

      // Check for analytics integration
      const hasAnalytics =
        csp.includes('google-analytics.com') ||
        csp.includes('googletagmanager.com');
      this.addTest('cspPolicy', 'Analytics domains whitelisted', hasAnalytics);
    } catch (error) {
      this.addTest('cspPolicy', 'CSP validation', false, error.message);
    }
  }

  /**
   * Validate security headers compliance
   */
  validateSecurityHeaders() {
    console.log('\n🔒 Validating Security Headers Compliance...');

    const expectedHeaders = {
      'Strict-Transport-Security': {
        required: true,
        pattern: /max-age=\d+/,
        description: 'HSTS with proper max-age',
      },
      'X-Frame-Options': {
        required: true,
        pattern: /(DENY|SAMEORIGIN)/,
        description: 'Clickjacking protection',
      },
      'X-Content-Type-Options': {
        required: true,
        pattern: /nosniff/,
        description: 'MIME type sniffing protection',
      },
      'X-XSS-Protection': {
        required: true,
        pattern: /1; mode=block/,
        description: 'XSS protection enabled',
      },
      'Referrer-Policy': {
        required: true,
        pattern: /(strict-origin|strict-origin-when-cross-origin|no-referrer)/,
        description: 'Referrer policy configured',
      },
      'Permissions-Policy': {
        required: true,
        pattern: /camera=\(\)/,
        description: 'Permissions policy configured',
      },
    };

    try {
      const amplifyPath = path.join(process.cwd(), 'amplify.yml');
      const amplifyContent = fs.readFileSync(amplifyPath, 'utf8');

      Object.entries(expectedHeaders).forEach(([header, config]) => {
        // Updated regex to handle YAML format with proper key-value parsing
        const headerRegex = new RegExp(
          `-\\s+key:\\s*["']${header}["']\\s*\\n\\s*value:\\s*["']([^"']+)["']`,
          'i'
        );
        const match = amplifyContent.match(headerRegex);

        if (!match) {
          this.addTest(
            'securityHeaders',
            `${header} present`,
            false,
            'Header not found'
          );
          return;
        }

        const value = match[1].trim();
        this.addTest('securityHeaders', `${header} present`, true);

        if (config.pattern && !config.pattern.test(value)) {
          this.addTest(
            'securityHeaders',
            `${header} valid format`,
            false,
            `Value: ${value}`
          );
        } else {
          this.addTest('securityHeaders', `${header} valid format`, true);
        }
      });
    } catch (error) {
      this.addTest(
        'securityHeaders',
        'Security headers validation',
        false,
        error.message
      );
    }
  }

  /**
   * Test HTTPS redirect configuration
   */
  validateHttpsRedirect() {
    console.log('\n🔐 Validating HTTPS Redirect Configuration...');

    try {
      const amplifyPath = path.join(process.cwd(), 'amplify.yml');
      const amplifyContent = fs.readFileSync(amplifyPath, 'utf8');

      // Check for HTTP to HTTPS redirect
      const hasHttpRedirect =
        amplifyContent.includes('source: "http://<*>"') &&
        amplifyContent.includes('target: "https://<>"') &&
        amplifyContent.includes('status: "301"');

      this.addTest(
        'httpsRedirect',
        'HTTP to HTTPS redirect configured',
        hasHttpRedirect
      );

      // Check for www redirect (if applicable)
      const hasWwwRedirect = amplifyContent.includes(
        'source: "https://www.<+>"'
      );
      this.addTest('httpsRedirect', 'WWW redirect configured', hasWwwRedirect);

      // Check for HSTS header
      const hasHSTS = amplifyContent.includes('Strict-Transport-Security');
      this.addTest('httpsRedirect', 'HSTS header configured', hasHSTS);

      // Validate redirect status codes
      const redirectMatches = amplifyContent.match(/status:\s*["'](\d+)["']/g);
      if (redirectMatches) {
        const has301Redirects = redirectMatches.some(match =>
          match.includes('301')
        );
        this.addTest(
          'httpsRedirect',
          'Permanent redirects (301) used',
          has301Redirects
        );
      }
    } catch (error) {
      this.addTest(
        'httpsRedirect',
        'HTTPS redirect validation',
        false,
        error.message
      );
    }
  }

  /**
   * Test SSL certificate configuration (simulated)
   */
  validateSSLCertificate() {
    console.log('\n📜 Validating SSL Certificate Configuration...');

    // Since we can't test actual SSL without a deployed site,
    // we'll validate the configuration that enables SSL

    try {
      const amplifyPath = path.join(process.cwd(), 'amplify.yml');
      const amplifyContent = fs.readFileSync(amplifyPath, 'utf8');

      // Check for HTTPS enforcement
      const hasHttpsEnforcement = amplifyContent.includes('https://');
      this.addTest(
        'httpsRedirect',
        'HTTPS enforcement configured',
        hasHttpsEnforcement
      );

      // Check for HSTS preload
      const hasHSTSPreload = amplifyContent.includes('preload');
      this.addTest('httpsRedirect', 'HSTS preload configured', hasHSTSPreload);

      // Validate HSTS max-age (should be at least 1 year)
      const hstsMatch = amplifyContent.match(/max-age=(\d+)/);
      if (hstsMatch) {
        const maxAge = parseInt(hstsMatch[1]);
        const oneYear = 31536000; // seconds in a year
        const hasLongMaxAge = maxAge >= oneYear;
        this.addTest(
          'httpsRedirect',
          'HSTS max-age >= 1 year',
          hasLongMaxAge,
          `max-age: ${maxAge}`
        );
      }
    } catch (error) {
      this.addTest(
        'httpsRedirect',
        'SSL certificate validation',
        false,
        error.message
      );
    }
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
    console.log('\n' + '='.repeat(60));
    console.log('🔒 SECURITY HEADERS VALIDATION REPORT');
    console.log('='.repeat(60));

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

    const overallTotal =
      this.results.overall.passed + this.results.overall.failed;
    const overallPercentage =
      overallTotal > 0
        ? Math.round((this.results.overall.passed / overallTotal) * 100)
        : 0;

    console.log('\n' + '='.repeat(60));
    console.log(
      `📈 OVERALL SCORE: ${this.results.overall.passed}/${overallTotal} (${overallPercentage}%)`
    );

    if (overallPercentage >= 90) {
      console.log('🎉 Excellent! Security configuration is well implemented.');
    } else if (overallPercentage >= 75) {
      console.log('✅ Good security configuration with room for improvement.');
    } else {
      console.log('⚠️  Security configuration needs attention.');
    }

    console.log('='.repeat(60));

    return overallPercentage >= 75;
  }

  /**
   * Run all validations
   */
  async run() {
    console.log('🔒 Starting Security Headers Validation...');
    console.log(
      'This will validate security headers and policies configuration.'
    );

    this.validateAmplifyConfig();
    this.validateSecurityHeaders();
    this.validateCSP();
    this.validateHttpsRedirect();
    this.validateSSLCertificate();

    const success = this.generateReport();

    if (!success) {
      process.exit(1);
    }

    console.log('\n✅ Security headers validation completed successfully!');
  }
}

// Run validation if called directly
if (require.main === module) {
  const validator = new SecurityHeadersValidator();
  validator.run().catch(error => {
    console.error('❌ Security validation failed:', error);
    process.exit(1);
  });
}

module.exports = SecurityHeadersValidator;
