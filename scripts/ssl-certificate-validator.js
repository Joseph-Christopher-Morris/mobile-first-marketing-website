#!/usr/bin/env node

/**
 * SSL Certificate Validator
 *
 * Validates SSL certificate validity and configuration for CloudFront distributions
 * Tests certificate validity dates, subject/SAN matches, chain integrity, and CA trust
 */

const https = require('https');
const tls = require('tls');
const crypto = require('crypto');
const fs = require('fs').promises;
const path = require('path');

class SSLCertificateValidator {
  constructor(options = {}) {
    this.options = {
      timeout: 10000,
      verbose: false,
      outputFile: null,
      ...options,
    };
    this.results = {
      timestamp: new Date().toISOString(),
      tests: [],
      summary: {
        total: 0,
        passed: 0,
        failed: 0,
        warnings: 0,
      },
    };
  }

  /**
   * Main validation method
   */
  async validateCertificate(hostname, port = 443) {
    console.log(
      `🔍 Starting SSL certificate validation for ${hostname}:${port}`
    );

    try {
      // Get certificate information
      const certInfo = await this.getCertificateInfo(hostname, port);

      // Run all validation tests
      await this.validateCertificateValidity(certInfo, hostname);
      await this.validateSubjectAndSAN(certInfo, hostname);
      await this.validateCertificateChain(certInfo, hostname);
      await this.validateCertificateAuthority(certInfo, hostname);

      // Generate summary
      this.generateSummary();

      // Save results if output file specified
      if (this.options.outputFile) {
        await this.saveResults();
      }

      return this.results;
    } catch (error) {
      this.addTestResult(
        'certificate-retrieval',
        'FAILED',
        `Failed to retrieve certificate: ${error.message}`,
        hostname
      );
      throw error;
    }
  }

  /**
   * Get certificate information from the server
   */
  async getCertificateInfo(hostname, port) {
    return new Promise((resolve, reject) => {
      const options = {
        host: hostname,
        port: port,
        servername: hostname,
        rejectUnauthorized: false, // We want to analyze even invalid certs
        timeout: this.options.timeout,
      };

      const socket = tls.connect(options, () => {
        try {
          const cert = socket.getPeerCertificate(true);
          const protocol = socket.getProtocol();
          const cipher = socket.getCipher();

          socket.end();

          resolve({
            certificate: cert,
            protocol: protocol,
            cipher: cipher,
            authorized: socket.authorized,
            authorizationError: socket.authorizationError,
          });
        } catch (error) {
          socket.end();
          reject(error);
        }
      });

      socket.on('error', error => {
        reject(new Error(`TLS connection failed: ${error.message}`));
      });

      socket.on('timeout', () => {
        socket.destroy();
        reject(new Error('Connection timeout'));
      });

      socket.setTimeout(this.options.timeout);
    });
  }

  /**
   * Validate certificate validity dates
   */
  async validateCertificateValidity(certInfo, hostname) {
    const cert = certInfo.certificate;
    const now = new Date();
    const validFrom = new Date(cert.valid_from);
    const validTo = new Date(cert.valid_to);

    // Check if certificate is currently valid
    if (now < validFrom) {
      this.addTestResult(
        'validity-dates',
        'FAILED',
        `Certificate is not yet valid. Valid from: ${validFrom.toISOString()}`,
        hostname
      );
    } else if (now > validTo) {
      this.addTestResult(
        'validity-dates',
        'FAILED',
        `Certificate has expired. Valid until: ${validTo.toISOString()}`,
        hostname
      );
    } else {
      // Check for upcoming expiration (within 30 days)
      const daysUntilExpiry = Math.floor(
        (validTo - now) / (1000 * 60 * 60 * 24)
      );

      if (daysUntilExpiry <= 30) {
        this.addTestResult(
          'validity-dates',
          'WARNING',
          `Certificate expires in ${daysUntilExpiry} days (${validTo.toISOString()})`,
          hostname
        );
      } else {
        this.addTestResult(
          'validity-dates',
          'PASSED',
          `Certificate is valid until ${validTo.toISOString()} (${daysUntilExpiry} days remaining)`,
          hostname
        );
      }
    }

    // Validate certificate lifetime (not too long)
    const lifetimeDays = Math.floor(
      (validTo - validFrom) / (1000 * 60 * 60 * 24)
    );
    if (lifetimeDays > 825) {
      // Current CA/Browser Forum baseline
      this.addTestResult(
        'certificate-lifetime',
        'WARNING',
        `Certificate lifetime is ${lifetimeDays} days, which exceeds recommended 825 days`,
        hostname
      );
    } else {
      this.addTestResult(
        'certificate-lifetime',
        'PASSED',
        `Certificate lifetime is ${lifetimeDays} days (within recommended limits)`,
        hostname
      );
    }
  }

  /**
   * Validate certificate subject and Subject Alternative Names (SAN)
   */
  async validateSubjectAndSAN(certInfo, hostname) {
    const cert = certInfo.certificate;

    // Extract subject information
    const subject = cert.subject;
    const subjectCN = subject.CN;

    // Extract SAN information
    const san = cert.subjectaltname
      ? cert.subjectaltname.split(', ').map(name => name.replace('DNS:', ''))
      : [];

    // Check if hostname matches subject CN
    const cnMatches = this.matchesHostname(subjectCN, hostname);

    // Check if hostname matches any SAN entry
    const sanMatches = san.some(name => this.matchesHostname(name, hostname));

    if (cnMatches || sanMatches) {
      this.addTestResult(
        'subject-san-match',
        'PASSED',
        `Hostname ${hostname} matches certificate (CN: ${subjectCN}, SAN: ${san.join(', ')})`,
        hostname
      );
    } else {
      this.addTestResult(
        'subject-san-match',
        'FAILED',
        `Hostname ${hostname} does not match certificate (CN: ${subjectCN}, SAN: ${san.join(', ')})`,
        hostname
      );
    }

    // Validate subject information completeness
    const requiredFields = ['C', 'ST', 'L', 'O', 'CN'];
    const missingFields = requiredFields.filter(field => !subject[field]);

    if (missingFields.length === 0) {
      this.addTestResult(
        'subject-completeness',
        'PASSED',
        'Certificate subject contains all recommended fields',
        hostname
      );
    } else {
      this.addTestResult(
        'subject-completeness',
        'WARNING',
        `Certificate subject missing recommended fields: ${missingFields.join(', ')}`,
        hostname
      );
    }
  }

  /**
   * Validate certificate chain integrity
   */
  async validateCertificateChain(certInfo, hostname) {
    const cert = certInfo.certificate;

    // Check if we have a complete chain
    if (!cert.issuerCertificate || cert.issuerCertificate === cert) {
      this.addTestResult(
        'certificate-chain',
        'WARNING',
        'Certificate chain appears incomplete or self-signed',
        hostname
      );
      return;
    }

    // Validate chain length (should not be too long)
    let chainLength = 0;
    let currentCert = cert;
    const seenCerts = new Set();

    while (
      currentCert &&
      currentCert.issuerCertificate &&
      currentCert.issuerCertificate !== currentCert
    ) {
      chainLength++;

      // Check for circular references
      const certFingerprint = currentCert.fingerprint;
      if (seenCerts.has(certFingerprint)) {
        this.addTestResult(
          'certificate-chain',
          'FAILED',
          'Certificate chain contains circular reference',
          hostname
        );
        return;
      }
      seenCerts.add(certFingerprint);

      currentCert = currentCert.issuerCertificate;

      // Prevent infinite loops
      if (chainLength > 10) {
        this.addTestResult(
          'certificate-chain',
          'FAILED',
          'Certificate chain is too long (>10 certificates)',
          hostname
        );
        return;
      }
    }

    if (chainLength >= 2 && chainLength <= 4) {
      this.addTestResult(
        'certificate-chain',
        'PASSED',
        `Certificate chain length is appropriate (${chainLength} certificates)`,
        hostname
      );
    } else if (chainLength === 1) {
      this.addTestResult(
        'certificate-chain',
        'WARNING',
        'Certificate chain is very short (may be missing intermediate certificates)',
        hostname
      );
    } else {
      this.addTestResult(
        'certificate-chain',
        'WARNING',
        `Certificate chain length is unusual (${chainLength} certificates)`,
        hostname
      );
    }

    // Validate signature algorithms in chain
    this.validateChainSignatureAlgorithms(cert, hostname);
  }

  /**
   * Validate signature algorithms in certificate chain
   */
  validateChainSignatureAlgorithms(cert, hostname) {
    const weakAlgorithms = ['md5', 'sha1'];
    const issues = [];

    let currentCert = cert;
    let certIndex = 0;

    while (currentCert && certIndex < 10) {
      const sigAlg = currentCert.signatureAlgorithm?.toLowerCase() || '';

      if (weakAlgorithms.some(weak => sigAlg.includes(weak))) {
        issues.push(
          `Certificate ${certIndex} uses weak signature algorithm: ${currentCert.signatureAlgorithm}`
        );
      }

      currentCert = currentCert.issuerCertificate;
      if (currentCert === cert) break; // Avoid infinite loop
      certIndex++;
    }

    if (issues.length === 0) {
      this.addTestResult(
        'signature-algorithms',
        'PASSED',
        'All certificates in chain use strong signature algorithms',
        hostname
      );
    } else {
      this.addTestResult(
        'signature-algorithms',
        'FAILED',
        `Weak signature algorithms detected: ${issues.join(', ')}`,
        hostname
      );
    }
  }

  /**
   * Validate certificate authority trust
   */
  async validateCertificateAuthority(certInfo, hostname) {
    const cert = certInfo.certificate;

    // Check if certificate is authorized by the TLS connection
    if (certInfo.authorized) {
      this.addTestResult(
        'ca-trust',
        'PASSED',
        'Certificate is trusted by system CA store',
        hostname
      );
    } else {
      const error =
        certInfo.authorizationError || 'Unknown authorization error';
      this.addTestResult(
        'ca-trust',
        'FAILED',
        `Certificate is not trusted: ${error}`,
        hostname
      );
    }

    // Validate root CA information
    let rootCert = cert;
    while (
      rootCert.issuerCertificate &&
      rootCert.issuerCertificate !== rootCert
    ) {
      rootCert = rootCert.issuerCertificate;
    }

    // Check if root is self-signed (expected for root CAs)
    if (rootCert.subject.CN === rootCert.issuer.CN) {
      this.addTestResult(
        'root-ca-validation',
        'PASSED',
        `Root CA: ${rootCert.subject.CN}`,
        hostname
      );
    } else {
      this.addTestResult(
        'root-ca-validation',
        'WARNING',
        'Root certificate does not appear to be self-signed',
        hostname
      );
    }

    // Validate key usage extensions
    this.validateKeyUsage(cert, hostname);
  }

  /**
   * Validate certificate key usage extensions
   */
  validateKeyUsage(cert, hostname) {
    // Check for required extensions for SSL/TLS certificates
    const extensions = cert.ext_key_usage || [];
    const requiredUsages = ['TLS Web Server Authentication'];

    const hasServerAuth = extensions.some(
      usage =>
        usage.includes('TLS Web Server Authentication') ||
        usage.includes('serverAuth')
    );

    if (hasServerAuth) {
      this.addTestResult(
        'key-usage',
        'PASSED',
        'Certificate has appropriate key usage for TLS server authentication',
        hostname
      );
    } else {
      this.addTestResult(
        'key-usage',
        'WARNING',
        'Certificate may not have appropriate key usage extensions for TLS server authentication',
        hostname
      );
    }
  }

  /**
   * Check if hostname matches certificate name (supports wildcards)
   */
  matchesHostname(certName, hostname) {
    if (!certName) return false;

    // Exact match
    if (certName === hostname) return true;

    // Wildcard match
    if (certName.startsWith('*.')) {
      const domain = certName.substring(2);
      const hostParts = hostname.split('.');

      if (hostParts.length > 1) {
        const hostDomain = hostParts.slice(1).join('.');
        return hostDomain === domain;
      }
    }

    return false;
  }

  /**
   * Add test result to results array
   */
  addTestResult(testName, status, message, hostname) {
    const result = {
      test: testName,
      status: status,
      message: message,
      hostname: hostname,
      timestamp: new Date().toISOString(),
    };

    this.results.tests.push(result);
    this.results.summary.total++;

    if (status === 'PASSED') {
      this.results.summary.passed++;
      console.log(`✅ ${testName}: ${message}`);
    } else if (status === 'WARNING') {
      this.results.summary.warnings++;
      console.log(`⚠️  ${testName}: ${message}`);
    } else {
      this.results.summary.failed++;
      console.log(`❌ ${testName}: ${message}`);
    }
  }

  /**
   * Generate validation summary
   */
  generateSummary() {
    const { total, passed, failed, warnings } = this.results.summary;

    console.log('\n📊 SSL Certificate Validation Summary:');
    console.log(`Total tests: ${total}`);
    console.log(`Passed: ${passed}`);
    console.log(`Failed: ${failed}`);
    console.log(`Warnings: ${warnings}`);

    if (failed === 0 && warnings === 0) {
      console.log('🎉 All SSL certificate validations passed!');
    } else if (failed === 0) {
      console.log('✅ SSL certificate is valid with some warnings');
    } else {
      console.log('❌ SSL certificate validation failed');
    }
  }

  /**
   * Save results to file
   */
  async saveResults() {
    try {
      const outputPath = path.resolve(this.options.outputFile);
      await fs.writeFile(outputPath, JSON.stringify(this.results, null, 2));
      console.log(`\n📄 Results saved to: ${outputPath}`);
    } catch (error) {
      console.error(`Failed to save results: ${error.message}`);
    }
  }

  /**
   * Validate multiple domains
   */
  async validateMultipleDomains(domains) {
    const allResults = [];

    for (const domain of domains) {
      console.log(`\n🔍 Validating ${domain}...`);
      try {
        const result = await this.validateCertificate(domain);
        allResults.push({ domain, result });
      } catch (error) {
        console.error(`Failed to validate ${domain}: ${error.message}`);
        allResults.push({ domain, error: error.message });
      }
    }

    return allResults;
  }
}

// CLI functionality
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log(
      'Usage: node ssl-certificate-validator.js <hostname> [options]'
    );
    console.log('Options:');
    console.log('  --port <port>        Port to connect to (default: 443)');
    console.log('  --output <file>      Save results to JSON file');
    console.log('  --verbose           Enable verbose output');
    console.log(
      '  --multiple <file>   Validate multiple domains from JSON file'
    );
    console.log('\nExample:');
    console.log('  node ssl-certificate-validator.js example.com');
    console.log(
      '  node ssl-certificate-validator.js example.com --port 8443 --output results.json'
    );
    process.exit(1);
  }

  const hostname = args[0];
  let port = 443;
  let outputFile = null;
  let verbose = false;
  let multipleFile = null;

  // Parse command line arguments
  for (let i = 1; i < args.length; i++) {
    switch (args[i]) {
      case '--port':
        port = parseInt(args[++i]);
        break;
      case '--output':
        outputFile = args[++i];
        break;
      case '--verbose':
        verbose = true;
        break;
      case '--multiple':
        multipleFile = args[++i];
        break;
    }
  }

  const validator = new SSLCertificateValidator({
    verbose,
    outputFile,
  });

  try {
    if (multipleFile) {
      const domainsData = JSON.parse(await fs.readFile(multipleFile, 'utf8'));
      const domains = Array.isArray(domainsData)
        ? domainsData
        : domainsData.domains;
      await validator.validateMultipleDomains(domains);
    } else {
      await validator.validateCertificate(hostname, port);
    }
  } catch (error) {
    console.error(`Validation failed: ${error.message}`);
    process.exit(1);
  }
}

// Export for use as module
module.exports = SSLCertificateValidator;

// Run CLI if called directly
if (require.main === module) {
  main().catch(console.error);
}
