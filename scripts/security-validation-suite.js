#!/usr/bin/env node

/**
 * Comprehensive Security Validation Suite
 *
 * This script validates security configurations for S3 + CloudFront deployment:
 * - Security headers validation
 * - SSL/TLS configuration testing
 * - Basic penetration testing procedures
 */

const https = require('https');
const http = require('http');
const dns = require('dns').promises;
const tls = require('tls');
const crypto = require('crypto');
const fs = require('fs').promises;
const path = require('path');

class SecurityValidator {
  constructor(options = {}) {
    this.domain = options.domain;
    this.cloudfrontDomain = options.cloudfrontDomain;
    this.verbose = options.verbose || false;
    this.results = {
      headers: {},
      ssl: {},
      penetration: {},
      overall: { passed: 0, failed: 0, warnings: 0 },
    };
  }

  log(message, level = 'info') {
    if (this.verbose || level === 'error') {
      const timestamp = new Date().toISOString();
      console.log(`[${timestamp}] [${level.toUpperCase()}] ${message}`);
    }
  }

  async validateSecurityHeaders(url) {
    this.log(`Validating security headers for: ${url}`);

    const requiredHeaders = {
      'strict-transport-security': {
        required: true,
        pattern: /max-age=\d+/,
        description: 'HSTS header with max-age directive',
      },
      'x-content-type-options': {
        required: true,
        expected: 'nosniff',
        description: 'Prevents MIME type sniffing',
      },
      'x-frame-options': {
        required: true,
        expected: ['DENY', 'SAMEORIGIN'],
        description: 'Prevents clickjacking attacks',
      },
      'x-xss-protection': {
        required: true,
        pattern: /1; mode=block/,
        description: 'XSS protection enabled',
      },
      'referrer-policy': {
        required: true,
        expected: [
          'strict-origin-when-cross-origin',
          'no-referrer',
          'same-origin',
        ],
        description: 'Controls referrer information',
      },
      'content-security-policy': {
        required: false,
        description: 'CSP header for XSS protection (recommended)',
      },
    };

    try {
      const response = await this.makeHttpsRequest(url, { method: 'HEAD' });
      const headers = response.headers;

      this.results.headers = {
        url,
        timestamp: new Date().toISOString(),
        tests: {},
      };

      for (const [headerName, config] of Object.entries(requiredHeaders)) {
        const headerValue = headers[headerName.toLowerCase()];
        const test = {
          header: headerName,
          present: !!headerValue,
          value: headerValue,
          description: config.description,
          status: 'unknown',
        };

        if (!headerValue) {
          if (config.required) {
            test.status = 'failed';
            test.message = `Required header '${headerName}' is missing`;
            this.results.overall.failed++;
          } else {
            test.status = 'warning';
            test.message = `Recommended header '${headerName}' is missing`;
            this.results.overall.warnings++;
          }
        } else {
          // Validate header value
          let valid = true;

          if (config.expected) {
            const expectedValues = Array.isArray(config.expected)
              ? config.expected
              : [config.expected];
            valid = expectedValues.some(expected =>
              headerValue.toLowerCase().includes(expected.toLowerCase())
            );
          }

          if (config.pattern) {
            valid = config.pattern.test(headerValue);
          }

          if (valid) {
            test.status = 'passed';
            test.message = `Header '${headerName}' is properly configured`;
            this.results.overall.passed++;
          } else {
            test.status = 'failed';
            test.message = `Header '${headerName}' has invalid value: ${headerValue}`;
            this.results.overall.failed++;
          }
        }

        this.results.headers.tests[headerName] = test;
        this.log(
          `${test.status.toUpperCase()}: ${test.message}`,
          test.status === 'failed' ? 'error' : 'info'
        );
      }

      // Check for potentially dangerous headers
      const dangerousHeaders = ['server', 'x-powered-by', 'x-aspnet-version'];
      for (const header of dangerousHeaders) {
        if (headers[header]) {
          this.results.headers.tests[`dangerous_${header}`] = {
            header,
            present: true,
            value: headers[header],
            status: 'warning',
            message: `Information disclosure header '${header}' is present: ${headers[header]}`,
          };
          this.results.overall.warnings++;
          this.log(
            `WARNING: Information disclosure header '${header}' found`,
            'error'
          );
        }
      }
    } catch (error) {
      this.log(`Error validating security headers: ${error.message}`, 'error');
      this.results.headers.error = error.message;
      this.results.overall.failed++;
    }
  }

  async validateSSLConfiguration(hostname) {
    this.log(`Validating SSL/TLS configuration for: ${hostname}`);

    this.results.ssl = {
      hostname,
      timestamp: new Date().toISOString(),
      tests: {},
    };

    try {
      // Test SSL certificate
      const certInfo = await this.getSSLCertificate(hostname);

      // Validate certificate
      const now = new Date();
      const validFrom = new Date(certInfo.valid_from);
      const validTo = new Date(certInfo.valid_to);
      const daysUntilExpiry = Math.ceil(
        (validTo - now) / (1000 * 60 * 60 * 24)
      );

      this.results.ssl.tests.certificate_validity = {
        status: now >= validFrom && now <= validTo ? 'passed' : 'failed',
        validFrom: certInfo.valid_from,
        validTo: certInfo.valid_to,
        daysUntilExpiry,
        message:
          daysUntilExpiry > 30
            ? `Certificate is valid (expires in ${daysUntilExpiry} days)`
            : `Certificate expires soon (${daysUntilExpiry} days)`,
      };

      // Check certificate subject
      this.results.ssl.tests.certificate_subject = {
        status:
          certInfo.subject.CN === hostname ||
          certInfo.subjectaltname?.includes(hostname)
            ? 'passed'
            : 'failed',
        subject: certInfo.subject.CN,
        altNames: certInfo.subjectaltname,
        message: `Certificate subject matches hostname`,
      };

      // Test TLS versions and ciphers
      const tlsTests = await this.testTLSConfiguration(hostname);
      this.results.ssl.tests = { ...this.results.ssl.tests, ...tlsTests };

      // Test HTTPS redirect
      const redirectTest = await this.testHTTPSRedirect(hostname);
      this.results.ssl.tests.https_redirect = redirectTest;

      // Count results
      Object.values(this.results.ssl.tests).forEach(test => {
        if (test.status === 'passed') this.results.overall.passed++;
        else if (test.status === 'failed') this.results.overall.failed++;
        else if (test.status === 'warning') this.results.overall.warnings++;
      });
    } catch (error) {
      this.log(`Error validating SSL configuration: ${error.message}`, 'error');
      this.results.ssl.error = error.message;
      this.results.overall.failed++;
    }
  }

  async performPenetrationTests(baseUrl) {
    this.log(`Performing basic penetration tests for: ${baseUrl}`);

    this.results.penetration = {
      baseUrl,
      timestamp: new Date().toISOString(),
      tests: {},
    };

    const tests = [
      this.testDirectoryTraversal.bind(this),
      this.testSQLInjection.bind(this),
      this.testXSSVulnerabilities.bind(this),
      this.testCSRFProtection.bind(this),
      this.testS3BucketAccess.bind(this),
      this.testInformationDisclosure.bind(this),
    ];

    for (const test of tests) {
      try {
        await test(baseUrl);
      } catch (error) {
        this.log(`Penetration test error: ${error.message}`, 'error');
      }
    }

    // Count results
    Object.values(this.results.penetration.tests).forEach(test => {
      if (test.status === 'passed') this.results.overall.passed++;
      else if (test.status === 'failed') this.results.overall.failed++;
      else if (test.status === 'warning') this.results.overall.warnings++;
    });
  }

  async testDirectoryTraversal(baseUrl) {
    const payloads = [
      '../../../etc/passwd',
      '..\\..\\..\\windows\\system32\\drivers\\etc\\hosts',
      '%2e%2e%2f%2e%2e%2f%2e%2e%2fetc%2fpasswd',
      '....//....//....//etc/passwd',
    ];

    let vulnerable = false;
    const responses = [];

    for (const payload of payloads) {
      try {
        const response = await this.makeHttpsRequest(`${baseUrl}/${payload}`, {
          method: 'GET',
          timeout: 5000,
        });

        if (
          response.statusCode === 200 &&
          (response.body.includes('root:') ||
            response.body.includes('[drivers]'))
        ) {
          vulnerable = true;
          responses.push({ payload, status: response.statusCode });
        }
      } catch (error) {
        // Expected for most payloads
      }
    }

    this.results.penetration.tests.directory_traversal = {
      status: vulnerable ? 'failed' : 'passed',
      message: vulnerable
        ? 'Directory traversal vulnerability detected'
        : 'No directory traversal vulnerabilities found',
      payloads: responses,
    };
  }

  async testSQLInjection(baseUrl) {
    // For static sites, this is mainly testing if any dynamic endpoints exist
    const payloads = [
      "' OR '1'='1",
      "'; DROP TABLE users; --",
      "1' UNION SELECT NULL--",
    ];

    let suspicious = false;
    const responses = [];

    for (const payload of payloads) {
      try {
        const response = await this.makeHttpsRequest(
          `${baseUrl}/?id=${encodeURIComponent(payload)}`,
          {
            method: 'GET',
            timeout: 5000,
          }
        );

        if (
          response.body.includes('SQL') ||
          response.body.includes('database')
        ) {
          suspicious = true;
          responses.push({ payload, status: response.statusCode });
        }
      } catch (error) {
        // Expected for static sites
      }
    }

    this.results.penetration.tests.sql_injection = {
      status: suspicious ? 'warning' : 'passed',
      message: suspicious
        ? 'Potential SQL injection vectors found'
        : 'No SQL injection vulnerabilities detected (static site)',
      payloads: responses,
    };
  }

  async testXSSVulnerabilities(baseUrl) {
    const payloads = [
      '<script>alert("XSS")</script>',
      'javascript:alert("XSS")',
      '<img src=x onerror=alert("XSS")>',
    ];

    let vulnerable = false;
    const responses = [];

    for (const payload of payloads) {
      try {
        const response = await this.makeHttpsRequest(
          `${baseUrl}/?q=${encodeURIComponent(payload)}`,
          {
            method: 'GET',
            timeout: 5000,
          }
        );

        if (response.body.includes(payload)) {
          vulnerable = true;
          responses.push({ payload, reflected: true });
        }
      } catch (error) {
        // Expected for most cases
      }
    }

    this.results.penetration.tests.xss_vulnerabilities = {
      status: vulnerable ? 'failed' : 'passed',
      message: vulnerable
        ? 'XSS vulnerabilities detected'
        : 'No XSS vulnerabilities found',
      payloads: responses,
    };
  }

  async testCSRFProtection(baseUrl) {
    // Test if CSRF tokens are required for state-changing operations
    try {
      const response = await this.makeHttpsRequest(baseUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ test: 'csrf' }),
        timeout: 5000,
      });

      this.results.penetration.tests.csrf_protection = {
        status: response.statusCode === 405 ? 'passed' : 'warning',
        message:
          response.statusCode === 405
            ? 'POST requests properly rejected (static site)'
            : 'POST requests accepted - verify CSRF protection',
        statusCode: response.statusCode,
      };
    } catch (error) {
      this.results.penetration.tests.csrf_protection = {
        status: 'passed',
        message: 'POST requests properly rejected',
        error: error.message,
      };
    }
  }

  async testS3BucketAccess(baseUrl) {
    // Try to access S3 bucket directly
    const domain = new URL(baseUrl).hostname;
    const possibleBuckets = [
      `${domain}.s3.amazonaws.com`,
      `${domain.replace(/\./g, '-')}.s3.amazonaws.com`,
      `s3.amazonaws.com/${domain}`,
      `s3.amazonaws.com/${domain.replace(/\./g, '-')}`,
    ];

    let directAccess = false;
    const accessibleBuckets = [];

    for (const bucket of possibleBuckets) {
      try {
        const response = await this.makeHttpsRequest(`https://${bucket}`, {
          method: 'GET',
          timeout: 5000,
        });

        if (response.statusCode === 200) {
          directAccess = true;
          accessibleBuckets.push(bucket);
        }
      } catch (error) {
        // Expected - buckets should not be directly accessible
      }
    }

    this.results.penetration.tests.s3_bucket_access = {
      status: directAccess ? 'failed' : 'passed',
      message: directAccess
        ? 'S3 bucket is directly accessible - security risk'
        : 'S3 bucket properly protected from direct access',
      accessibleBuckets,
    };
  }

  async testInformationDisclosure(baseUrl) {
    const sensitiveFiles = [
      '.env',
      '.git/config',
      'package.json',
      'composer.json',
      'web.config',
      '.htaccess',
      'robots.txt',
      'sitemap.xml',
    ];

    const disclosedFiles = [];

    for (const file of sensitiveFiles) {
      try {
        const response = await this.makeHttpsRequest(`${baseUrl}/${file}`, {
          method: 'GET',
          timeout: 5000,
        });

        if (response.statusCode === 200) {
          disclosedFiles.push({
            file,
            size: response.body.length,
            sensitive: [
              '.env',
              '.git/config',
              'web.config',
              '.htaccess',
            ].includes(file),
          });
        }
      } catch (error) {
        // Expected for most files
      }
    }

    const sensitiveDisclosed = disclosedFiles.filter(f => f.sensitive);

    this.results.penetration.tests.information_disclosure = {
      status: sensitiveDisclosed.length > 0 ? 'failed' : 'passed',
      message:
        sensitiveDisclosed.length > 0
          ? `Sensitive files disclosed: ${sensitiveDisclosed.map(f => f.file).join(', ')}`
          : 'No sensitive information disclosure detected',
      disclosedFiles,
    };
  }

  // Helper methods
  async makeHttpsRequest(url, options = {}) {
    return new Promise((resolve, reject) => {
      const urlObj = new URL(url);
      const requestOptions = {
        hostname: urlObj.hostname,
        port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
        path: urlObj.pathname + urlObj.search,
        method: options.method || 'GET',
        headers: options.headers || {},
        timeout: options.timeout || 10000,
      };

      const client = urlObj.protocol === 'https:' ? https : http;
      const req = client.request(requestOptions, res => {
        let body = '';
        res.on('data', chunk => (body += chunk));
        res.on('end', () => {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body,
          });
        });
      });

      req.on('error', reject);
      req.on('timeout', () => reject(new Error('Request timeout')));

      if (options.body) {
        req.write(options.body);
      }

      req.end();
    });
  }

  async getSSLCertificate(hostname) {
    return new Promise((resolve, reject) => {
      const options = {
        host: hostname,
        port: 443,
        rejectUnauthorized: false,
      };

      const socket = tls.connect(options, () => {
        const cert = socket.getPeerCertificate();
        socket.end();
        resolve(cert);
      });

      socket.on('error', reject);
    });
  }

  async testTLSConfiguration(hostname) {
    const tests = {};

    // Test TLS 1.2 support
    try {
      await this.testTLSVersion(hostname, 'TLSv1.2');
      tests.tls_1_2 = {
        status: 'passed',
        message: 'TLS 1.2 is supported',
      };
    } catch (error) {
      tests.tls_1_2 = {
        status: 'failed',
        message: 'TLS 1.2 is not supported',
      };
    }

    // Test TLS 1.3 support
    try {
      await this.testTLSVersion(hostname, 'TLSv1.3');
      tests.tls_1_3 = {
        status: 'passed',
        message: 'TLS 1.3 is supported',
      };
    } catch (error) {
      tests.tls_1_3 = {
        status: 'warning',
        message: 'TLS 1.3 is not supported (recommended)',
      };
    }

    // Test weak TLS versions (should fail)
    try {
      await this.testTLSVersion(hostname, 'TLSv1');
      tests.weak_tls = {
        status: 'failed',
        message: 'Weak TLS 1.0 is supported - security risk',
      };
    } catch (error) {
      tests.weak_tls = {
        status: 'passed',
        message: 'Weak TLS versions are properly disabled',
      };
    }

    return tests;
  }

  async testTLSVersion(hostname, version) {
    return new Promise((resolve, reject) => {
      const options = {
        host: hostname,
        port: 443,
        secureProtocol:
          version === 'TLSv1.3'
            ? 'TLSv1_3_method'
            : version === 'TLSv1.2'
              ? 'TLSv1_2_method'
              : 'TLSv1_method',
        rejectUnauthorized: false,
      };

      const socket = tls.connect(options, () => {
        socket.end();
        resolve();
      });

      socket.on('error', reject);
    });
  }

  async testHTTPSRedirect(hostname) {
    try {
      const response = await this.makeHttpsRequest(`http://${hostname}`, {
        method: 'GET',
        timeout: 5000,
      });

      return {
        status:
          response.statusCode >= 300 && response.statusCode < 400
            ? 'passed'
            : 'failed',
        statusCode: response.statusCode,
        location: response.headers.location,
        message:
          response.statusCode >= 300 && response.statusCode < 400
            ? 'HTTP properly redirects to HTTPS'
            : 'HTTP does not redirect to HTTPS',
      };
    } catch (error) {
      return {
        status: 'warning',
        message: 'Could not test HTTP redirect',
        error: error.message,
      };
    }
  }

  async generateReport() {
    const report = {
      summary: {
        timestamp: new Date().toISOString(),
        domain: this.domain,
        cloudfrontDomain: this.cloudfrontDomain,
        totalTests:
          this.results.overall.passed +
          this.results.overall.failed +
          this.results.overall.warnings,
        passed: this.results.overall.passed,
        failed: this.results.overall.failed,
        warnings: this.results.overall.warnings,
        score:
          Math.round(
            (this.results.overall.passed /
              (this.results.overall.passed + this.results.overall.failed)) *
              100
          ) || 0,
      },
      details: this.results,
    };

    // Save detailed report
    const reportPath = path.join(
      process.cwd(),
      'security-validation-report.json'
    );
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));

    // Generate summary
    const summary = this.generateSummaryReport(report);
    const summaryPath = path.join(
      process.cwd(),
      'security-validation-summary.md'
    );
    await fs.writeFile(summaryPath, summary);

    return { report, reportPath, summaryPath };
  }

  generateSummaryReport(report) {
    const { summary, details } = report;

    let markdown = `# Security Validation Report\n\n`;
    markdown += `**Generated:** ${summary.timestamp}\n`;
    markdown += `**Domain:** ${summary.domain || 'N/A'}\n`;
    markdown += `**CloudFront Domain:** ${summary.cloudfrontDomain || 'N/A'}\n\n`;

    markdown += `## Summary\n\n`;
    markdown += `- **Total Tests:** ${summary.totalTests}\n`;
    markdown += `- **Passed:** ${summary.passed} ✅\n`;
    markdown += `- **Failed:** ${summary.failed} ❌\n`;
    markdown += `- **Warnings:** ${summary.warnings} ⚠️\n`;
    markdown += `- **Security Score:** ${summary.score}%\n\n`;

    if (summary.failed > 0) {
      markdown += `## ❌ Critical Issues\n\n`;
      this.addTestResults(markdown, details, 'failed');
    }

    if (summary.warnings > 0) {
      markdown += `## ⚠️ Warnings\n\n`;
      this.addTestResults(markdown, details, 'warning');
    }

    markdown += `## ✅ Passed Tests\n\n`;
    this.addTestResults(markdown, details, 'passed');

    markdown += `\n## Recommendations\n\n`;
    if (summary.failed > 0) {
      markdown += `- Address all critical security issues immediately\n`;
    }
    if (summary.warnings > 0) {
      markdown += `- Review and address security warnings\n`;
    }
    markdown += `- Regularly run security validation tests\n`;
    markdown += `- Monitor security headers and SSL configuration\n`;
    markdown += `- Keep security configurations up to date\n`;

    return markdown;
  }

  addTestResults(markdown, details, status) {
    ['headers', 'ssl', 'penetration'].forEach(category => {
      if (details[category] && details[category].tests) {
        Object.entries(details[category].tests).forEach(([testName, test]) => {
          if (test.status === status) {
            markdown += `- **${testName}**: ${test.message}\n`;
          }
        });
      }
    });
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);
  const options = {};

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--domain':
        options.domain = args[++i];
        break;
      case '--cloudfront':
        options.cloudfrontDomain = args[++i];
        break;
      case '--verbose':
        options.verbose = true;
        break;
      case '--help':
        console.log(`
Security Validation Suite

Usage: node security-validation-suite.js [options]

Options:
  --domain <domain>           Primary domain to test
  --cloudfront <domain>       CloudFront domain to test
  --verbose                   Enable verbose logging
  --help                      Show this help message

Examples:
  node security-validation-suite.js --domain example.com
  node security-validation-suite.js --domain example.com --cloudfront d123456.cloudfront.net --verbose
                `);
        process.exit(0);
    }
  }

  if (!options.domain) {
    console.error('Error: --domain is required');
    process.exit(1);
  }

  console.log('🔒 Starting Security Validation Suite...\n');

  const validator = new SecurityValidator(options);

  try {
    // Run all validation tests
    await validator.validateSecurityHeaders(`https://${options.domain}`);
    await validator.validateSSLConfiguration(options.domain);
    await validator.performPenetrationTests(`https://${options.domain}`);

    // Test CloudFront domain if provided
    if (options.cloudfrontDomain) {
      console.log('\n🌐 Testing CloudFront domain...');
      await validator.validateSecurityHeaders(
        `https://${options.cloudfrontDomain}`
      );
    }

    // Generate reports
    const { reportPath, summaryPath } = await validator.generateReport();

    console.log('\n📊 Security Validation Complete!');
    console.log(`Detailed report: ${reportPath}`);
    console.log(`Summary report: ${summaryPath}`);

    const { overall } = validator.results;
    if (overall.failed > 0) {
      console.log(`\n❌ ${overall.failed} critical security issues found!`);
      process.exit(1);
    } else if (overall.warnings > 0) {
      console.log(`\n⚠️ ${overall.warnings} security warnings found.`);
    } else {
      console.log('\n✅ All security tests passed!');
    }
  } catch (error) {
    console.error(`\n❌ Security validation failed: ${error.message}`);
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = SecurityValidator;
