#!/usr/bin/env node

/**
 * HTTPS and SSL Configuration Validator
 *
 * This script validates HTTPS redirect configuration and SSL certificate
 * settings for AWS Amplify deployment.
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const { URL } = require('url');

class HttpsSslValidator {
  constructor() {
    this.results = {
      redirectConfig: { passed: 0, failed: 0, tests: [] },
      hstsConfig: { passed: 0, failed: 0, tests: [] },
      sslConfig: { passed: 0, failed: 0, tests: [] },
      securityConfig: { passed: 0, failed: 0, tests: [] },
      overall: { passed: 0, failed: 0 },
    };
  }

  /**
   * Validate HTTPS redirect configuration
   */
  validateHttpsRedirectConfig() {
    console.log('\n🔄 Validating HTTPS Redirect Configuration...');

    try {
      const amplifyPath = path.join(process.cwd(), 'amplify.yml');
      const amplifyContent = fs.readFileSync(amplifyPath, 'utf8');

      // Check for redirects section
      const hasRedirectsSection = amplifyContent.includes('redirects:');
      this.addTest(
        'redirectConfig',
        'Redirects section present',
        hasRedirectsSection
      );

      if (!hasRedirectsSection) {
        this.addTest(
          'redirectConfig',
          'HTTP to HTTPS redirect configured',
          false,
          'No redirects section found'
        );
        return;
      }

      // Check for HTTP to HTTPS redirect
      const httpToHttpsPattern =
        /source:\s*["']http:\/\/<\*>["']\s*\n\s*target:\s*["']https:\/\/<>["']\s*\n\s*status:\s*["']301["']/;
      const hasHttpToHttps = httpToHttpsPattern.test(amplifyContent);
      this.addTest(
        'redirectConfig',
        'HTTP to HTTPS redirect configured',
        hasHttpToHttps
      );

      // Check for www redirect
      const wwwRedirectPattern = /source:\s*["']https:\/\/www\.<\+>["']/;
      const hasWwwRedirect = wwwRedirectPattern.test(amplifyContent);
      this.addTest('redirectConfig', 'WWW redirect configured', hasWwwRedirect);

      // Check redirect status codes
      const redirectMatches = amplifyContent.match(/status:\s*["'](\d+)["']/g);
      if (redirectMatches) {
        const statusCodes = redirectMatches.map(match => match.match(/\d+/)[0]);
        const hasPermanentRedirects = statusCodes.some(code => code === '301');
        this.addTest(
          'redirectConfig',
          'Uses permanent redirects (301)',
          hasPermanentRedirects
        );

        const hasOnlyValidCodes = statusCodes.every(code =>
          ['301', '302', '307', '308'].includes(code)
        );
        this.addTest(
          'redirectConfig',
          'Uses valid redirect status codes',
          hasOnlyValidCodes
        );
      }

      // Check for conditional redirects
      const hasConditionalRedirect = amplifyContent.includes('condition:');
      if (hasConditionalRedirect) {
        this.addTest(
          'redirectConfig',
          'Conditional redirects configured',
          true
        );
      }
    } catch (error) {
      this.addTest(
        'redirectConfig',
        'HTTPS redirect validation',
        false,
        error.message
      );
    }
  }

  /**
   * Validate HSTS (HTTP Strict Transport Security) configuration
   */
  validateHSTSConfig() {
    console.log('\n🔒 Validating HSTS Configuration...');

    try {
      const amplifyPath = path.join(process.cwd(), 'amplify.yml');
      const amplifyContent = fs.readFileSync(amplifyPath, 'utf8');

      // Check for HSTS header using YAML format
      const hstsPattern =
        /-\s+key:\s*["']Strict-Transport-Security["']\s*\n\s*value:\s*["']([^"]+)["']/;
      const hstsMatch = amplifyContent.match(hstsPattern);

      if (!hstsMatch) {
        this.addTest(
          'hstsConfig',
          'HSTS header present',
          false,
          'HSTS header not found'
        );
        return;
      }

      const hstsValue = hstsMatch[1];
      this.addTest('hstsConfig', 'HSTS header present', true);

      // Validate max-age
      const maxAgeMatch = hstsValue.match(/max-age=(\d+)/);
      if (maxAgeMatch) {
        const maxAge = parseInt(maxAgeMatch[1]);
        const oneYear = 31536000; // seconds in a year
        const sixMonths = 15768000; // seconds in six months

        this.addTest('hstsConfig', 'HSTS max-age present', true);
        this.addTest(
          'hstsConfig',
          'HSTS max-age >= 6 months',
          maxAge >= sixMonths
        );
        this.addTest(
          'hstsConfig',
          'HSTS max-age >= 1 year (recommended)',
          maxAge >= oneYear
        );

        console.log(
          `    Max-age: ${maxAge} seconds (${Math.round(maxAge / 86400)} days)`
        );
      } else {
        this.addTest('hstsConfig', 'HSTS max-age present', false);
      }

      // Check for includeSubDomains
      const hasIncludeSubDomains = hstsValue.includes('includeSubDomains');
      this.addTest(
        'hstsConfig',
        'HSTS includeSubDomains',
        hasIncludeSubDomains
      );

      // Check for preload
      const hasPreload = hstsValue.includes('preload');
      this.addTest('hstsConfig', 'HSTS preload directive', hasPreload);

      if (hasPreload) {
        console.log(
          '    💡 HSTS preload is enabled - consider submitting to HSTS preload list'
        );
      }
    } catch (error) {
      this.addTest('hstsConfig', 'HSTS validation', false, error.message);
    }
  }

  /**
   * Validate SSL/TLS configuration
   */
  validateSSLConfig() {
    console.log('\n📜 Validating SSL/TLS Configuration...');

    try {
      const amplifyPath = path.join(process.cwd(), 'amplify.yml');
      const amplifyContent = fs.readFileSync(amplifyPath, 'utf8');

      // Check for HTTPS enforcement in redirects
      const hasHttpsEnforcement = amplifyContent.includes('https://');
      this.addTest(
        'sslConfig',
        'HTTPS enforcement configured',
        hasHttpsEnforcement
      );

      // Check for secure headers that complement SSL
      const secureHeaders = [
        'Strict-Transport-Security',
        'X-Frame-Options',
        'X-Content-Type-Options',
      ];

      secureHeaders.forEach(header => {
        const hasHeader = amplifyContent.includes(header);
        this.addTest('sslConfig', `${header} configured`, hasHeader);
      });

      // Validate that no insecure protocols are allowed
      const hasInsecureProtocols =
        amplifyContent.includes('http://') &&
        !amplifyContent.includes('source: "http://<*>"');
      this.addTest(
        'sslConfig',
        'No insecure HTTP protocols in config',
        !hasInsecureProtocols
      );

      // Check for secure cookie settings (if any cookie-related config exists)
      const hasCookieConfig =
        amplifyContent.includes('cookie') || amplifyContent.includes('Cookie');
      if (hasCookieConfig) {
        const hasSecureCookies =
          amplifyContent.includes('Secure') ||
          amplifyContent.includes('secure');
        this.addTest(
          'sslConfig',
          'Secure cookie configuration',
          hasSecureCookies
        );
      }
    } catch (error) {
      this.addTest(
        'sslConfig',
        'SSL configuration validation',
        false,
        error.message
      );
    }
  }

  /**
   * Validate additional security configurations
   */
  validateSecurityConfig() {
    console.log('\n🛡️ Validating Additional Security Configuration...');

    try {
      const amplifyPath = path.join(process.cwd(), 'amplify.yml');
      const amplifyContent = fs.readFileSync(amplifyPath, 'utf8');

      // Check for security-related headers
      const securityHeaders = {
        'X-Frame-Options': 'Clickjacking protection',
        'X-Content-Type-Options': 'MIME sniffing protection',
        'X-XSS-Protection': 'XSS protection',
        'Referrer-Policy': 'Referrer policy',
        'Permissions-Policy': 'Permissions policy',
      };

      Object.entries(securityHeaders).forEach(([header, description]) => {
        const hasHeader = amplifyContent.includes(header);
        this.addTest('securityConfig', `${header} (${description})`, hasHeader);
      });

      // Check for Content Security Policy
      const hasCSP = amplifyContent.includes('Content-Security-Policy');
      this.addTest(
        'securityConfig',
        'Content Security Policy configured',
        hasCSP
      );

      // Check for proper cache control on sensitive files
      const hasCacheControl = amplifyContent.includes('Cache-Control');
      this.addTest(
        'securityConfig',
        'Cache-Control headers configured',
        hasCacheControl
      );

      // Validate that API routes have no-cache headers
      const apiCachePattern =
        /pattern:\s*["']\/api\/\*\*["'][\s\S]*?Cache-Control["\s]*:\s*["']no-cache/;
      const hasApiNoCache = apiCachePattern.test(amplifyContent);
      this.addTest(
        'securityConfig',
        'API routes have no-cache headers',
        hasApiNoCache
      );
    } catch (error) {
      this.addTest(
        'securityConfig',
        'Security configuration validation',
        false,
        error.message
      );
    }
  }

  /**
   * Test SSL certificate (simulated for local testing)
   */
  async testSSLCertificate(domain = null) {
    console.log('\n🔍 Testing SSL Certificate Configuration...');

    if (!domain) {
      console.log('  ℹ️  No domain provided - skipping live SSL test');
      this.addTest(
        'sslConfig',
        'SSL certificate test (simulated)',
        true,
        'Local testing mode'
      );
      return;
    }

    try {
      const url = new URL(`https://${domain}`);

      return new Promise(resolve => {
        const req = https.request(
          {
            hostname: url.hostname,
            port: 443,
            path: '/',
            method: 'HEAD',
            timeout: 10000,
          },
          res => {
            const cert = res.socket.getPeerCertificate();

            if (cert && Object.keys(cert).length > 0) {
              this.addTest('sslConfig', 'SSL certificate valid', true);

              // Check certificate expiration
              const now = new Date();
              const validTo = new Date(cert.valid_to);
              const daysUntilExpiry = Math.ceil(
                (validTo - now) / (1000 * 60 * 60 * 24)
              );

              this.addTest(
                'sslConfig',
                'SSL certificate not expired',
                daysUntilExpiry > 0
              );
              this.addTest(
                'sslConfig',
                'SSL certificate valid for >30 days',
                daysUntilExpiry > 30
              );

              console.log(
                `    Certificate expires: ${cert.valid_to} (${daysUntilExpiry} days)`
              );
              console.log(`    Issuer: ${cert.issuer.CN || cert.issuer.O}`);
            } else {
              this.addTest(
                'sslConfig',
                'SSL certificate valid',
                false,
                'No certificate found'
              );
            }

            resolve();
          }
        );

        req.on('error', error => {
          this.addTest(
            'sslConfig',
            'SSL certificate accessible',
            false,
            error.message
          );
          resolve();
        });

        req.on('timeout', () => {
          this.addTest(
            'sslConfig',
            'SSL certificate accessible',
            false,
            'Connection timeout'
          );
          req.destroy();
          resolve();
        });

        req.end();
      });
    } catch (error) {
      this.addTest('sslConfig', 'SSL certificate test', false, error.message);
    }
  }

  /**
   * Generate security recommendations
   */
  generateRecommendations() {
    console.log('\n💡 HTTPS/SSL Recommendations:');

    const recommendations = [];

    // Check HSTS configuration
    if (this.results.hstsConfig.failed > 0) {
      recommendations.push(
        'Ensure HSTS is properly configured with max-age >= 1 year'
      );
      recommendations.push(
        'Consider adding includeSubDomains and preload to HSTS'
      );
    }

    // Check redirect configuration
    if (this.results.redirectConfig.failed > 0) {
      recommendations.push(
        'Ensure HTTP to HTTPS redirects use 301 status codes'
      );
      recommendations.push('Configure www to non-www redirects if applicable');
    }

    // Check security headers
    if (this.results.securityConfig.failed > 0) {
      recommendations.push(
        'Add missing security headers (X-Frame-Options, CSP, etc.)'
      );
      recommendations.push(
        'Ensure API routes have proper cache control headers'
      );
    }

    if (recommendations.length === 0) {
      console.log(
        '  ✅ HTTPS/SSL configuration looks excellent! No recommendations.'
      );
    } else {
      recommendations.forEach(rec => console.log(`  • ${rec}`));
    }

    // Additional best practices
    console.log('\n🎯 Best Practices:');
    console.log(
      '  • Consider submitting to HSTS preload list if preload is enabled'
    );
    console.log('  • Monitor SSL certificate expiration dates');
    console.log('  • Regularly audit security headers with online tools');
    console.log('  • Test HTTPS configuration after deployment');
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
    console.log('🔐 HTTPS/SSL CONFIGURATION VALIDATION REPORT');
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

    this.generateRecommendations();

    const overallTotal =
      this.results.overall.passed + this.results.overall.failed;
    const overallPercentage =
      overallTotal > 0
        ? Math.round((this.results.overall.passed / overallTotal) * 100)
        : 0;

    console.log('\n' + '='.repeat(60));
    console.log(
      `📈 OVERALL HTTPS/SSL SCORE: ${this.results.overall.passed}/${overallTotal} (${overallPercentage}%)`
    );

    if (overallPercentage >= 90) {
      console.log('🎉 Excellent! HTTPS/SSL configuration is properly secured.');
    } else if (overallPercentage >= 75) {
      console.log(
        '✅ Good HTTPS/SSL configuration with minor improvements possible.'
      );
    } else {
      console.log(
        '⚠️  HTTPS/SSL configuration needs attention for better security.'
      );
    }

    console.log('='.repeat(60));

    return overallPercentage >= 75;
  }

  /**
   * Run all validations
   */
  async run(domain = null) {
    console.log('🔐 Starting HTTPS/SSL Configuration Validation...');
    console.log(
      'This will validate HTTPS redirects, SSL settings, and security headers.'
    );

    this.validateHttpsRedirectConfig();
    this.validateHSTSConfig();
    this.validateSSLConfig();
    this.validateSecurityConfig();

    if (domain) {
      await this.testSSLCertificate(domain);
    }

    const success = this.generateReport();

    if (!success) {
      process.exit(1);
    }

    console.log('\n✅ HTTPS/SSL validation completed successfully!');
  }
}

// Run validation if called directly
if (require.main === module) {
  const domain = process.argv[2]; // Optional domain parameter
  const validator = new HttpsSslValidator();
  validator.run(domain).catch(error => {
    console.error('❌ HTTPS/SSL validation failed:', error);
    process.exit(1);
  });
}

module.exports = HttpsSslValidator;
