#!/usr/bin/env node

/**
 * CloudFront SSL Certificate Validator
 * 
 * Validates SSL certificates for CloudFront distributions
 * Checks custom domain certificates and CloudFront default certificates
 */

const SSLCertificateValidator = require('./ssl-certificate-validator');
const fs = require('fs').promises;
const path = require('path');

class CloudFrontSSLValidator {
  constructor(options = {}) {
    this.options = {
      timeout: 15000,
      verbose: false,
      ...options
    };
    this.results = {
      timestamp: new Date().toISOString(),
      distributions: [],
      summary: {
        total: 0,
        passed: 0,
        failed: 0,
        warnings: 0
      }
    };
  }

  /**
   * Validate SSL certificates for CloudFront distributions
   */
  async validateCloudFrontSSL(distributionConfig) {
    console.log('☁️  Starting CloudFront SSL Certificate Validation\n');

    try {
      // Load distribution configuration
      const config = typeof distributionConfig === 'string' 
        ? await this.loadDistributionConfig(distributionConfig)
        : distributionConfig;

      // Validate each distribution
      for (const distribution of config.distributions || []) {
        await this.validateDistribution(distribution);
      }

      // Generate summary
      this.generateSummary();
      
      return this.results;

    } catch (error) {
      console.error(`CloudFront SSL validation failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Load distribution configuration from file
   */
  async loadDistributionConfig(configPath) {
    try {
      const configData = await fs.readFile(configPath, 'utf8');
      return JSON.parse(configData);
    } catch (error) {
      throw new Error(`Failed to load distribution config: ${error.message}`);
    }
  }

  /**
   * Validate SSL certificate for a single distribution
   */
  async validateDistribution(distribution) {
    console.log(`🔍 Validating distribution: ${distribution.id || distribution.domainName}`);
    
    const distributionResult = {
      id: distribution.id,
      domainName: distribution.domainName,
      customDomains: distribution.customDomains || [],
      tests: [],
      status: 'UNKNOWN'
    };

    try {
      const validator = new SSLCertificateValidator({
        timeout: this.options.timeout,
        verbose: this.options.verbose
      });

      // Validate CloudFront default domain
      if (distribution.domainName) {
        console.log(`  Testing CloudFront domain: ${distribution.domainName}`);
        const result = await validator.validateCertificate(distribution.domainName);
        distributionResult.tests.push({
          domain: distribution.domainName,
          type: 'cloudfront-default',
          result: result
        });
      }

      // Validate custom domains
      for (const customDomain of distribution.customDomains || []) {
        console.log(`  Testing custom domain: ${customDomain}`);
        try {
          const result = await validator.validateCertificate(customDomain);
          distributionResult.tests.push({
            domain: customDomain,
            type: 'custom-domain',
            result: result
          });
        } catch (error) {
          distributionResult.tests.push({
            domain: customDomain,
            type: 'custom-domain',
            error: error.message
          });
        }
      }

      // Determine overall status for this distribution
      distributionResult.status = this.determineDistributionStatus(distributionResult.tests);
      
      this.results.distributions.push(distributionResult);
      this.updateSummary(distributionResult.status);

    } catch (error) {
      distributionResult.error = error.message;
      distributionResult.status = 'FAILED';
      this.results.distributions.push(distributionResult);
      this.updateSummary('FAILED');
    }
  }

  /**
   * Determine overall status for a distribution based on test results
   */
  determineDistributionStatus(tests) {
    let hasFailures = false;
    let hasWarnings = false;

    for (const test of tests) {
      if (test.error) {
        hasFailures = true;
      } else if (test.result) {
        if (test.result.summary.failed > 0) {
          hasFailures = true;
        } else if (test.result.summary.warnings > 0) {
          hasWarnings = true;
        }
      }
    }

    if (hasFailures) return 'FAILED';
    if (hasWarnings) return 'WARNING';
    return 'PASSED';
  }

  /**
   * Update summary statistics
   */
  updateSummary(status) {
    this.results.summary.total++;
    
    switch (status) {
      case 'PASSED':
        this.results.summary.passed++;
        break;
      case 'WARNING':
        this.results.summary.warnings++;
        break;
      case 'FAILED':
        this.results.summary.failed++;
        break;
    }
  }

  /**
   * Generate validation summary
   */
  generateSummary() {
    const { total, passed, failed, warnings } = this.results.summary;
    
    console.log('\n📊 CloudFront SSL Validation Summary:');
    console.log(`Total distributions: ${total}`);
    console.log(`Passed: ${passed}`);
    console.log(`Failed: ${failed}`);
    console.log(`Warnings: ${warnings}`);
    
    if (failed === 0 && warnings === 0) {
      console.log('🎉 All CloudFront SSL certificates are valid!');
    } else if (failed === 0) {
      console.log('✅ CloudFront SSL certificates are valid with some warnings');
    } else {
      console.log('❌ Some CloudFront SSL certificates have issues');
    }
  }

  /**
   * Save results to file
   */
  async saveResults(outputPath) {
    try {
      await fs.writeFile(outputPath, JSON.stringify(this.results, null, 2));
      console.log(`\n📄 CloudFront SSL validation results saved to: ${outputPath}`);
    } catch (error) {
      console.error(`Failed to save results: ${error.message}`);
    }
  }

  /**
   * Generate CloudFront SSL validation report
   */
  generateDetailedReport() {
    const report = {
      summary: this.results.summary,
      timestamp: this.results.timestamp,
      distributions: this.results.distributions.map(dist => ({
        id: dist.id,
        domainName: dist.domainName,
        status: dist.status,
        customDomains: dist.customDomains,
        issues: this.extractIssues(dist.tests),
        recommendations: this.generateRecommendations(dist.tests)
      }))
    };

    return report;
  }

  /**
   * Extract issues from test results
   */
  extractIssues(tests) {
    const issues = [];

    for (const test of tests) {
      if (test.error) {
        issues.push({
          domain: test.domain,
          type: 'connection-error',
          message: test.error
        });
      } else if (test.result) {
        const failedTests = test.result.tests.filter(t => t.status === 'FAILED');
        const warningTests = test.result.tests.filter(t => t.status === 'WARNING');
        
        failedTests.forEach(t => issues.push({
          domain: test.domain,
          type: 'validation-failure',
          test: t.test,
          message: t.message
        }));
        
        warningTests.forEach(t => issues.push({
          domain: test.domain,
          type: 'validation-warning',
          test: t.test,
          message: t.message
        }));
      }
    }

    return issues;
  }

  /**
   * Generate recommendations based on test results
   */
  generateRecommendations(tests) {
    const recommendations = [];

    for (const test of tests) {
      if (test.result) {
        const failedTests = test.result.tests.filter(t => t.status === 'FAILED');
        
        failedTests.forEach(t => {
          switch (t.test) {
            case 'validity-dates':
              if (t.message.includes('expired')) {
                recommendations.push(`Renew SSL certificate for ${test.domain} immediately`);
              } else if (t.message.includes('not yet valid')) {
                recommendations.push(`Check certificate installation date for ${test.domain}`);
              }
              break;
            case 'subject-san-match':
              recommendations.push(`Update SSL certificate for ${test.domain} to include correct domain names`);
              break;
            case 'ca-trust':
              recommendations.push(`Install certificate from trusted CA for ${test.domain}`);
              break;
            case 'certificate-chain':
              recommendations.push(`Fix certificate chain configuration for ${test.domain}`);
              break;
          }
        });
      }
    }

    return [...new Set(recommendations)]; // Remove duplicates
  }
}

// CLI functionality
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('Usage: node cloudfront-ssl-validator.js <config-file> [options]');
    console.log('Options:');
    console.log('  --output <file>     Save results to JSON file');
    console.log('  --verbose          Enable verbose output');
    console.log('\nExample config file format:');
    console.log(JSON.stringify({
      distributions: [
        {
          id: "E1234567890123",
          domainName: "d1234567890123.cloudfront.net",
          customDomains: ["example.com", "www.example.com"]
        }
      ]
    }, null, 2));
    process.exit(1);
  }

  const configFile = args[0];
  let outputFile = null;
  let verbose = false;

  // Parse command line arguments
  for (let i = 1; i < args.length; i++) {
    switch (args[i]) {
      case '--output':
        outputFile = args[++i];
        break;
      case '--verbose':
        verbose = true;
        break;
    }
  }

  const validator = new CloudFrontSSLValidator({ verbose });

  try {
    const results = await validator.validateCloudFrontSSL(configFile);
    
    if (outputFile) {
      await validator.saveResults(outputFile);
    }

    // Generate detailed report
    const report = validator.generateDetailedReport();
    console.log('\n📋 Detailed Report:');
    console.log(JSON.stringify(report, null, 2));

    process.exit(results.summary.failed === 0 ? 0 : 1);
  } catch (error) {
    console.error(`Validation failed: ${error.message}`);
    process.exit(1);
  }
}

// Export for use as module
module.exports = CloudFrontSSLValidator;

// Run CLI if called directly
if (require.main === module) {
  main().catch(console.error);
}