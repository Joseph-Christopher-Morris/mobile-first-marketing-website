#!/usr/bin/env node

/**
 * TLS Version and Cipher Suite Validator
 *
 * This script validates TLS configuration for CloudFront distributions:
 * - Tests TLS 1.2 and 1.3 support
 * - Verifies weak TLS versions are disabled
 * - Checks cipher suite strength and configuration
 * - Validates perfect forward secrecy
 */

const https = require('https');
const tls = require('tls');
const { execSync } = require('child_process');
const fs = require('fs');

class TLSValidator {
  constructor(domain, options = {}) {
    this.domain = domain;
    this.port = options.port || 443;
    this.timeout = options.timeout || 10000;
    this.results = {
      domain: this.domain,
      timestamp: new Date().toISOString(),
      tlsVersions: {},
      cipherSuites: [],
      securityAnalysis: {},
      recommendations: [],
    };
  }

  /**
   * Test TLS version support
   */
  async testTLSVersions() {
    console.log(`\n🔒 Testing TLS version support for ${this.domain}...`);

    const tlsVersions = [
      { name: 'TLS 1.0', version: 'TLSv1', secure: false },
      { name: 'TLS 1.1', version: 'TLSv1_1', secure: false },
      { name: 'TLS 1.2', version: 'TLSv1_2', secure: true },
      { name: 'TLS 1.3', version: 'TLSv1_3', secure: true },
    ];

    for (const tlsVersion of tlsVersions) {
      try {
        const supported = await this.testTLSVersion(tlsVersion.version);
        this.results.tlsVersions[tlsVersion.name] = {
          supported,
          secure: tlsVersion.secure,
          status: supported
            ? tlsVersion.secure
              ? '✅ GOOD'
              : '⚠️  INSECURE'
            : '❌ NOT SUPPORTED',
        };

        console.log(
          `  ${tlsVersion.name}: ${this.results.tlsVersions[tlsVersion.name].status}`
        );

        if (supported && !tlsVersion.secure) {
          this.results.recommendations.push(
            `Disable ${tlsVersion.name} support for better security`
          );
        }
      } catch (error) {
        this.results.tlsVersions[tlsVersion.name] = {
          supported: false,
          secure: tlsVersion.secure,
          status: '❌ ERROR',
          error: error.message,
        };
        console.log(`  ${tlsVersion.name}: ❌ ERROR - ${error.message}`);
      }
    }
  }

  /**
   * Test specific TLS version
   */
  testTLSVersion(tlsVersion) {
    return new Promise((resolve, reject) => {
      // Handle TLS 1.3 differently as Node.js uses different method names
      let secureProtocol;
      if (tlsVersion === 'TLSv1_3') {
        // For TLS 1.3, we'll use the default and check the negotiated protocol
        secureProtocol = 'TLS_method';
      } else {
        secureProtocol = tlsVersion + '_method';
      }

      const options = {
        host: this.domain,
        port: this.port,
        secureProtocol: secureProtocol,
        rejectUnauthorized: false,
        timeout: this.timeout,
      };

      // For TLS 1.3 testing, we need to set specific options
      if (tlsVersion === 'TLSv1_3') {
        options.minVersion = 'TLSv1.3';
        options.maxVersion = 'TLSv1.3';
      }

      const socket = tls.connect(options, () => {
        const negotiatedProtocol = socket.getProtocol();
        socket.destroy();

        // For TLS 1.3, check if the negotiated protocol matches
        if (tlsVersion === 'TLSv1_3') {
          resolve(negotiatedProtocol === 'TLSv1.3');
        } else {
          resolve(true);
        }
      });

      socket.on('error', error => {
        socket.destroy();
        if (
          error.code === 'EPROTO' ||
          error.message.includes('wrong version number') ||
          error.message.includes('protocol version') ||
          error.message.includes('legacy sigalg disallowed')
        ) {
          resolve(false);
        } else if (error.code === 'ENOTFOUND') {
          reject(error);
        } else {
          resolve(false);
        }
      });

      socket.on('timeout', () => {
        socket.destroy();
        reject(new Error('Connection timeout'));
      });

      socket.setTimeout(this.timeout);
    });
  }

  /**
   * Analyze cipher suites
   */
  async analyzeCipherSuites() {
    console.log(`\n🔐 Analyzing cipher suites for ${this.domain}...`);

    try {
      // Get cipher suite information using OpenSSL
      const cipherInfo = await this.getCipherSuiteInfo();
      this.results.cipherSuites = cipherInfo.ciphers;
      this.results.securityAnalysis = cipherInfo.analysis;

      console.log(`  Negotiated cipher: ${cipherInfo.negotiatedCipher}`);
      console.log(
        `  Perfect Forward Secrecy: ${cipherInfo.analysis.pfs ? '✅ YES' : '❌ NO'}`
      );
      console.log(
        `  Strong encryption: ${cipherInfo.analysis.strongEncryption ? '✅ YES' : '❌ NO'}`
      );

      if (!cipherInfo.analysis.pfs) {
        this.results.recommendations.push(
          'Enable Perfect Forward Secrecy (PFS) cipher suites'
        );
      }

      if (!cipherInfo.analysis.strongEncryption) {
        this.results.recommendations.push(
          'Use stronger encryption algorithms (AES-256, ChaCha20)'
        );
      }
    } catch (error) {
      console.error(`  ❌ Error analyzing cipher suites: ${error.message}`);
      this.results.securityAnalysis.error = error.message;
    }
  }

  /**
   * Get cipher suite information
   */
  async getCipherSuiteInfo() {
    return new Promise((resolve, reject) => {
      const options = {
        host: this.domain,
        port: this.port,
        rejectUnauthorized: false,
      };

      const socket = tls.connect(options, () => {
        const cipher = socket.getCipher();
        const protocol = socket.getProtocol();

        const analysis = this.analyzeCipherSecurity(cipher);

        socket.destroy();
        resolve({
          negotiatedCipher: cipher.name,
          protocol: protocol,
          ciphers: [cipher],
          analysis: analysis,
        });
      });

      socket.on('error', error => {
        socket.destroy();
        reject(error);
      });

      socket.setTimeout(this.timeout, () => {
        socket.destroy();
        reject(new Error('Connection timeout'));
      });
    });
  }

  /**
   * Analyze cipher security properties
   */
  analyzeCipherSecurity(cipher) {
    const analysis = {
      pfs: false,
      strongEncryption: false,
      keyExchange: '',
      encryption: '',
      mac: '',
      securityLevel: 'UNKNOWN',
    };

    if (cipher.name) {
      const cipherName = cipher.name.toUpperCase();

      // Check for Perfect Forward Secrecy - improved detection
      analysis.pfs =
        cipherName.includes('ECDHE') ||
        cipherName.includes('DHE') ||
        cipherName.includes('TLS_AES') || // TLS 1.3 ciphers have PFS by default
        cipherName.includes('TLS_CHACHA20');

      // Check encryption strength - improved detection
      analysis.strongEncryption =
        cipherName.includes('AES256') ||
        cipherName.includes('AES_256') ||
        cipherName.includes('CHACHA20') ||
        cipherName.includes('AES-256') ||
        // TLS 1.3 ciphers are considered strong
        cipherName.includes('TLS_AES_256') ||
        cipherName.includes('TLS_CHACHA20');

      // TLS 1.3 ciphers are always considered to have both PFS and strong encryption
      if (cipherName.startsWith('TLS_')) {
        analysis.pfs = true;
        if (cipherName.includes('256') || cipherName.includes('CHACHA20')) {
          analysis.strongEncryption = true;
        }
      }

      // Determine security level
      if (analysis.pfs && analysis.strongEncryption) {
        analysis.securityLevel = 'HIGH';
      } else if (analysis.pfs || analysis.strongEncryption) {
        analysis.securityLevel = 'MEDIUM';
      } else {
        analysis.securityLevel = 'LOW';
      }

      // Extract components - improved parsing
      if (cipherName.includes('ECDHE')) {
        analysis.keyExchange = 'ECDHE';
      } else if (cipherName.includes('DHE')) {
        analysis.keyExchange = 'DHE';
      } else if (cipherName.includes('RSA')) {
        analysis.keyExchange = 'RSA';
      } else if (cipherName.startsWith('TLS_')) {
        analysis.keyExchange = 'ECDHE'; // TLS 1.3 uses ECDHE by default
      }

      if (
        cipherName.includes('AES256') ||
        cipherName.includes('AES_256') ||
        cipherName.includes('AES-256')
      ) {
        analysis.encryption = 'AES-256';
      } else if (
        cipherName.includes('AES128') ||
        cipherName.includes('AES_128') ||
        cipherName.includes('AES-128')
      ) {
        analysis.encryption = 'AES-128';
      } else if (cipherName.includes('CHACHA20')) {
        analysis.encryption = 'ChaCha20';
      }

      if (cipherName.includes('SHA384')) {
        analysis.mac = 'SHA384';
      } else if (cipherName.includes('SHA256')) {
        analysis.mac = 'SHA256';
      } else if (cipherName.includes('SHA')) {
        analysis.mac = 'SHA1';
      } else if (cipherName.includes('GCM')) {
        analysis.mac = 'AEAD'; // GCM provides authenticated encryption
      }
    }

    return analysis;
  }

  /**
   * Test using external tools if available
   */
  async testWithExternalTools() {
    console.log(`\n🛠️  Running additional security tests...`);

    try {
      // Test with nmap if available
      await this.testWithNmap();
    } catch (error) {
      console.log(`  ℹ️  nmap not available: ${error.message}`);
    }

    try {
      // Test with testssl.sh if available
      await this.testWithTestSSL();
    } catch (error) {
      console.log(`  ℹ️  testssl.sh not available: ${error.message}`);
    }
  }

  /**
   * Test with nmap
   */
  async testWithNmap() {
    try {
      const nmapOutput = execSync(
        `nmap --script ssl-enum-ciphers -p ${this.port} ${this.domain}`,
        { timeout: 30000, encoding: 'utf8' }
      );

      console.log(`  ✅ nmap scan completed`);
      this.results.externalTools = this.results.externalTools || {};
      this.results.externalTools.nmap = nmapOutput;
    } catch (error) {
      throw new Error('nmap command failed or not installed');
    }
  }

  /**
   * Test with testssl.sh
   */
  async testWithTestSSL() {
    try {
      const testsslOutput = execSync(
        `testssl.sh --protocols --ciphers ${this.domain}:${this.port}`,
        { timeout: 60000, encoding: 'utf8' }
      );

      console.log(`  ✅ testssl.sh scan completed`);
      this.results.externalTools = this.results.externalTools || {};
      this.results.externalTools.testssl = testsslOutput;
    } catch (error) {
      throw new Error('testssl.sh command failed or not installed');
    }
  }

  /**
   * Generate security recommendations
   */
  generateRecommendations() {
    console.log(`\n📋 Security Analysis Summary:`);

    const tlsSecure =
      this.results.tlsVersions['TLS 1.2']?.supported ||
      this.results.tlsVersions['TLS 1.3']?.supported;
    const tlsInsecure =
      this.results.tlsVersions['TLS 1.0']?.supported ||
      this.results.tlsVersions['TLS 1.1']?.supported;

    if (!tlsSecure) {
      this.results.recommendations.push(
        'Enable TLS 1.2 and/or TLS 1.3 support'
      );
      console.log(`  ❌ No secure TLS versions supported`);
    } else {
      console.log(`  ✅ Secure TLS versions supported`);
    }

    if (tlsInsecure) {
      this.results.recommendations.push('Disable TLS 1.0 and TLS 1.1 support');
      console.log(`  ⚠️  Insecure TLS versions still supported`);
    } else {
      console.log(`  ✅ Insecure TLS versions disabled`);
    }

    if (this.results.securityAnalysis.securityLevel === 'HIGH') {
      console.log(`  ✅ High security cipher configuration`);
    } else if (this.results.securityAnalysis.securityLevel === 'MEDIUM') {
      console.log(`  ⚠️  Medium security cipher configuration`);
    } else {
      console.log(`  ❌ Low security cipher configuration`);
    }

    if (this.results.recommendations.length === 0) {
      this.results.recommendations.push('TLS configuration appears secure');
      console.log(`  ✅ No security issues found`);
    } else {
      console.log(`\n📝 Recommendations:`);
      this.results.recommendations.forEach((rec, index) => {
        console.log(`  ${index + 1}. ${rec}`);
      });
    }
  }

  /**
   * Save results to file
   */
  saveResults(filename) {
    const outputFile =
      filename || `tls-validation-${this.domain}-${Date.now()}.json`;
    fs.writeFileSync(outputFile, JSON.stringify(this.results, null, 2));
    console.log(`\n💾 Results saved to: ${outputFile}`);
    return outputFile;
  }

  /**
   * Run complete TLS validation
   */
  async validate() {
    console.log(`🔍 Starting TLS validation for ${this.domain}:${this.port}`);
    console.log(`⏰ Timestamp: ${this.results.timestamp}`);

    try {
      await this.testTLSVersions();
      await this.analyzeCipherSuites();
      await this.testWithExternalTools();
      this.generateRecommendations();

      console.log(`\n✅ TLS validation completed successfully`);
      return this.results;
    } catch (error) {
      console.error(`\n❌ TLS validation failed: ${error.message}`);
      this.results.error = error.message;
      throw error;
    }
  }
}

// CLI usage
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log(`
Usage: node tls-version-cipher-validator.js <domain> [options]

Options:
  --port <port>        Port to test (default: 443)
  --timeout <ms>       Connection timeout (default: 10000)
  --output <file>      Output file for results
  --help              Show this help message

Examples:
  node tls-version-cipher-validator.js example.com
  node tls-version-cipher-validator.js d1234567890.cloudfront.net --port 443
  node tls-version-cipher-validator.js mysite.com --output tls-results.json
        `);
    process.exit(1);
  }

  const domain = args[0];
  const options = {};
  let outputFile = null;

  for (let i = 1; i < args.length; i += 2) {
    switch (args[i]) {
      case '--port':
        options.port = parseInt(args[i + 1]);
        break;
      case '--timeout':
        options.timeout = parseInt(args[i + 1]);
        break;
      case '--output':
        outputFile = args[i + 1];
        break;
      case '--help':
        console.log('Help message already shown above');
        process.exit(0);
        break;
    }
  }

  const validator = new TLSValidator(domain, options);

  validator
    .validate()
    .then(results => {
      validator.saveResults(outputFile);

      // Exit with appropriate code
      const hasInsecureTLS =
        results.tlsVersions['TLS 1.0']?.supported ||
        results.tlsVersions['TLS 1.1']?.supported;
      const hasSecureTLS =
        results.tlsVersions['TLS 1.2']?.supported ||
        results.tlsVersions['TLS 1.3']?.supported;
      const hasWeakCiphers = results.securityAnalysis.securityLevel === 'LOW';

      if (!hasSecureTLS || hasInsecureTLS || hasWeakCiphers) {
        console.log(`\n⚠️  Security issues detected - review recommendations`);
        process.exit(1);
      } else {
        console.log(`\n✅ TLS configuration is secure`);
        process.exit(0);
      }
    })
    .catch(error => {
      console.error(`\n💥 Validation failed: ${error.message}`);
      process.exit(1);
    });
}

module.exports = TLSValidator;
