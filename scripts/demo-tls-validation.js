#!/usr/bin/env node

/**
 * Demo script for TLS Version and Cipher Suite Validation
 *
 * This script demonstrates how to use the TLS validator
 * to check CloudFront distributions and other domains.
 */

const TLSValidator = require('./tls-version-cipher-validator');

async function demoTLSValidation() {
  console.log('🚀 TLS Validation Demo\n');

  // Example domains to test
  const testDomains = [
    {
      name: 'Example CloudFront Distribution',
      domain: 'd1234567890.cloudfront.net',
      description: 'Testing a CloudFront distribution',
    },
    {
      name: 'Google (Reference)',
      domain: 'google.com',
      description: 'Testing against a known secure site',
    },
  ];

  for (const test of testDomains) {
    console.log(`🔍 ${test.name}`);
    console.log(`   Domain: ${test.domain}`);
    console.log(`   ${test.description}\n`);

    try {
      const validator = new TLSValidator(test.domain, { timeout: 10000 });
      const results = await validator.validate();

      // Display key findings
      console.log(`   📊 Results Summary:`);
      console.log(
        `   - TLS 1.2 Support: ${results.tlsVersions['TLS 1.2']?.supported ? '✅' : '❌'}`
      );
      console.log(
        `   - TLS 1.3 Support: ${results.tlsVersions['TLS 1.3']?.supported ? '✅' : '❌'}`
      );
      console.log(
        `   - Perfect Forward Secrecy: ${results.securityAnalysis?.pfs ? '✅' : '❌'}`
      );
      console.log(
        `   - Strong Encryption: ${results.securityAnalysis?.strongEncryption ? '✅' : '❌'}`
      );
      console.log(
        `   - Security Level: ${results.securityAnalysis?.securityLevel || 'Unknown'}`
      );

      if (results.recommendations && results.recommendations.length > 0) {
        console.log(`   📝 Recommendations:`);
        results.recommendations.forEach((rec, index) => {
          console.log(`      ${index + 1}. ${rec}`);
        });
      }
    } catch (error) {
      console.log(`   ❌ Validation failed: ${error.message}`);
    }

    console.log('\n' + '='.repeat(60) + '\n');
  }

  console.log('✅ Demo completed!');
  console.log('\nTo test your own domain:');
  console.log('node tls-version-cipher-validator.js your-domain.com');
  console.log('\nTo test with custom options:');
  console.log(
    'node tls-version-cipher-validator.js your-domain.com --port 443 --output results.json'
  );
}

// Run the demo
if (require.main === module) {
  demoTLSValidation().catch(error => {
    console.error(`💥 Demo failed: ${error.message}`);
    process.exit(1);
  });
}

module.exports = { demoTLSValidation };
