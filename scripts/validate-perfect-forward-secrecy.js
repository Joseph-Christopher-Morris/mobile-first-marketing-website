#!/usr/bin/env node

/**
 * Perfect Forward Secrecy Validation Script
 * 
 * This script validates Perfect Forward Secrecy implementation for CloudFront distributions
 * and integrates with the existing TLS validation suite.
 * 
 * Requirements: 7.5
 */

const PerfectForwardSecrecyTester = require('./test-perfect-forward-secrecy');
const fs = require('fs').promises;
const path = require('path');

class PFSValidator {
    constructor() {
        this.configPath = path.join(__dirname, '..', 'config', 'pfs-test-config.json');
        this.config = null;
        this.results = {
            timestamp: new Date().toISOString(),
            validationResults: {},
            overallStatus: 'UNKNOWN',
            recommendations: []
        };
    }

    /**
     * Load configuration
     */
    async loadConfig() {
        try {
            const configData = await fs.readFile(this.configPath, 'utf8');
            this.config = JSON.parse(configData);
            console.log('✅ Configuration loaded successfully');
        } catch (error) {
            console.error(`❌ Failed to load configuration: ${error.message}`);
            throw error;
        }
    }

    /**
     * Validate PFS for multiple domains
     */
    async validateMultipleDomains(domains = null) {
        const testDomains = domains || this.config.testDomains;
        console.log(`🌐 Validating PFS for ${testDomains.length} domains...`);

        const results = {};
        
        for (const domain of testDomains) {
            console.log(`\n🔍 Testing domain: ${domain}`);
            console.log('-'.repeat(50));
            
            try {
                const tester = new PerfectForwardSecrecyTester();
                const domainResults = await tester.runAllTests(domain);
                
                results[domain] = {
                    status: domainResults.pfsCompliance.overallCompliance ? 'PASS' : 'FAIL',
                    securityLevel: domainResults.securityLevel,
                    details: domainResults,
                    timestamp: new Date().toISOString()
                };
                
                console.log(`✅ ${domain}: ${results[domain].status} (${results[domain].securityLevel})`);
                
            } catch (error) {
                results[domain] = {
                    status: 'ERROR',
                    error: error.message,
                    timestamp: new Date().toISOString()
                };
                console.error(`❌ ${domain}: ERROR - ${error.message}`);
            }
        }

        return results;
    }

    /**
     * Validate CloudFront-specific PFS requirements
     */
    async validateCloudFrontPFS(distributionDomain) {
        console.log('\n☁️ Validating CloudFront-specific PFS requirements...');
        
        const tester = new PerfectForwardSecrecyTester();
        const results = await tester.runAllTests(distributionDomain);
        
        const cloudFrontValidation = {
            pfsCompliance: results.pfsCompliance.overallCompliance,
            expectedCiphersSupported: false,
            minimumTlsVersion: false,
            recommendations: []
        };

        // Check if expected CloudFront PFS ciphers are supported
        const expectedCiphers = this.config.cloudFrontSpecific.expectedPfsCiphers;
        const supportedCiphers = results.testResults.ecdheSupport.supportedCiphers.map(c => c.cipher);
        
        cloudFrontValidation.expectedCiphersSupported = expectedCiphers.some(cipher => 
            supportedCiphers.includes(cipher)
        );

        if (!cloudFrontValidation.expectedCiphersSupported) {
            cloudFrontValidation.recommendations.push({
                priority: 'HIGH',
                category: 'CloudFront Configuration',
                issue: 'Expected PFS ciphers not found',
                recommendation: `Ensure CloudFront distribution supports: ${expectedCiphers.join(', ')}`
            });
        }

        // Validate minimum TLS version
        const minTlsVersion = this.config.cloudFrontSpecific.minimumTlsVersion;
        // This would need to be checked against actual connection info
        cloudFrontValidation.minimumTlsVersion = true; // Placeholder

        return cloudFrontValidation;
    }

    /**
     * Generate comprehensive validation report
     */
    generateValidationReport(domainResults, cloudFrontResults = null) {
        const report = {
            ...this.results,
            domainResults: domainResults,
            cloudFrontResults: cloudFrontResults,
            summary: {
                totalDomains: Object.keys(domainResults).length,
                passedDomains: 0,
                failedDomains: 0,
                errorDomains: 0
            }
        };

        // Calculate summary statistics
        Object.values(domainResults).forEach(result => {
            switch (result.status) {
                case 'PASS':
                    report.summary.passedDomains++;
                    break;
                case 'FAIL':
                    report.summary.failedDomains++;
                    break;
                case 'ERROR':
                    report.summary.errorDomains++;
                    break;
            }
        });

        // Determine overall status
        if (report.summary.errorDomains > 0) {
            report.overallStatus = 'ERROR';
        } else if (report.summary.failedDomains > 0) {
            report.overallStatus = 'FAIL';
        } else {
            report.overallStatus = 'PASS';
        }

        // Generate recommendations
        if (report.summary.failedDomains > 0) {
            report.recommendations.push({
                priority: 'HIGH',
                category: 'PFS Compliance',
                issue: `${report.summary.failedDomains} domains failed PFS validation`,
                recommendation: 'Review and update TLS configuration to support Perfect Forward Secrecy'
            });
        }

        if (cloudFrontResults && !cloudFrontResults.pfsCompliance) {
            report.recommendations.push({
                priority: 'HIGH',
                category: 'CloudFront Security',
                issue: 'CloudFront distribution does not meet PFS requirements',
                recommendation: 'Update CloudFront security policy to enforce PFS-enabled cipher suites'
            });
        }

        return report;
    }

    /**
     * Save validation results
     */
    async saveValidationResults(report, filename = null) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const defaultFilename = `pfs-validation-report-${timestamp}.json`;
        const outputFile = filename || defaultFilename;
        
        try {
            await fs.writeFile(outputFile, JSON.stringify(report, null, 2));
            console.log(`\n💾 Validation report saved to: ${outputFile}`);
            return outputFile;
        } catch (error) {
            console.error(`❌ Failed to save validation report: ${error.message}`);
            throw error;
        }
    }

    /**
     * Run complete PFS validation
     */
    async runValidation(domains = null, cloudFrontDomain = null) {
        console.log('🚀 Starting Perfect Forward Secrecy Validation...');
        console.log('=' .repeat(60));

        try {
            // Load configuration
            await this.loadConfig();

            // Validate multiple domains
            const domainResults = await this.validateMultipleDomains(domains);

            // Validate CloudFront-specific requirements if domain provided
            let cloudFrontResults = null;
            if (cloudFrontDomain) {
                cloudFrontResults = await this.validateCloudFrontPFS(cloudFrontDomain);
            }

            // Generate comprehensive report
            const report = this.generateValidationReport(domainResults, cloudFrontResults);

            // Display summary
            console.log('\n' + '=' .repeat(60));
            console.log('📋 PFS VALIDATION SUMMARY');
            console.log('=' .repeat(60));
            console.log(`🌐 Total Domains: ${report.summary.totalDomains}`);
            console.log(`✅ Passed: ${report.summary.passedDomains}`);
            console.log(`❌ Failed: ${report.summary.failedDomains}`);
            console.log(`⚠️ Errors: ${report.summary.errorDomains}`);
            console.log(`🛡️ Overall Status: ${report.overallStatus}`);

            if (report.recommendations.length > 0) {
                console.log('\n📝 RECOMMENDATIONS:');
                report.recommendations.forEach((rec, index) => {
                    console.log(`${index + 1}. [${rec.priority}] ${rec.issue}`);
                    console.log(`   → ${rec.recommendation}`);
                });
            }

            // Save results
            await this.saveValidationResults(report);

            return report;

        } catch (error) {
            console.error(`❌ PFS Validation Failed: ${error.message}`);
            throw error;
        }
    }
}

// CLI execution
async function main() {
    const args = process.argv.slice(2);
    const domains = args.length > 0 ? args : null;
    const cloudFrontDomain = process.env.CLOUDFRONT_DOMAIN;

    const validator = new PFSValidator();
    
    try {
        const report = await validator.runValidation(domains, cloudFrontDomain);
        
        // Exit with appropriate code
        process.exit(report.overallStatus === 'PASS' ? 0 : 1);
        
    } catch (error) {
        console.error(`❌ Validation execution failed: ${error.message}`);
        process.exit(1);
    }
}

// Export for use as module
module.exports = PFSValidator;

// Run if called directly
if (require.main === module) {
    main();
}