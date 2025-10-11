#!/usr/bin/env node

/**
 * TLS Version Support Task Validation - Task 7.5.1
 * 
 * This script validates that task 7.5.1 has been properly implemented
 * by testing all required functionality and generating a compliance report.
 */

const TLSVersionTester = require('./test-tls-version-support');
const fs = require('fs');
const path = require('path');

class TLSVersionSupportTaskValidator {
    constructor() {
        this.results = {
            taskId: '7.5.1',
            taskDescription: 'Test TLS version support',
            timestamp: new Date().toISOString(),
            requirements: [
                {
                    id: 'REQ-1',
                    description: 'Verify TLS 1.2 support is enabled',
                    status: 'PENDING',
                    testResults: null
                },
                {
                    id: 'REQ-2', 
                    description: 'Confirm TLS 1.3 support is available',
                    status: 'PENDING',
                    testResults: null
                },
                {
                    id: 'REQ-3',
                    description: 'Test that weak TLS versions (1.0, 1.1) are disabled',
                    status: 'PENDING',
                    testResults: null
                },
                {
                    id: 'REQ-4',
                    description: 'Validate TLS version negotiation behavior',
                    status: 'PENDING',
                    testResults: null
                }
            ],
            testDomains: [],
            overallStatus: 'PENDING',
            complianceScore: 0,
            recommendations: []
        };
    }

    /**
     * Validate task implementation with test domains
     */
    async validateTask(testDomains = ['github.com', 'cloudflare.com']) {
        console.log(`🔍 Validating TLS Version Support Task Implementation`);
        console.log(`📋 Task ID: ${this.results.taskId}`);
        console.log(`📝 Task: ${this.results.taskDescription}`);
        console.log(`⏰ Started: ${this.results.timestamp}`);
        console.log(`🌐 Test Domains: ${testDomains.join(', ')}`);

        this.results.testDomains = testDomains;

        // Test each domain to validate all requirements
        for (const domain of testDomains) {
            console.log(`\n${'='.repeat(60)}`);
            console.log(`🧪 Testing domain: ${domain}`);
            console.log(`${'='.repeat(60)}`);

            try {
                const tester = new TLSVersionTester(domain, { timeout: 15000 });
                const testResult = await tester.runTest();
                
                // Validate each requirement
                await this.validateRequirement1(testResult, domain);
                await this.validateRequirement2(testResult, domain);
                await this.validateRequirement3(testResult, domain);
                await this.validateRequirement4(testResult, domain);
                
            } catch (error) {
                console.error(`❌ Failed to test ${domain}: ${error.message}`);
                this.results.recommendations.push(`Unable to test ${domain}: ${error.message}`);
            }
        }

        this.calculateComplianceScore();
        this.generateFinalReport();
        
        return this.results;
    }

    /**
     * Validate Requirement 1: TLS 1.2 support
     */
    async validateRequirement1(testResult, domain) {
        const req = this.results.requirements[0];
        
        console.log(`\n📋 Validating REQ-1: ${req.description}`);
        
        const tls12Result = testResult.tlsVersionTests['TLS 1.2'];
        
        if (tls12Result && tls12Result.supported) {
            req.status = 'PASSED';
            req.testResults = {
                domain: domain,
                supported: true,
                negotiatedProtocol: tls12Result.negotiatedProtocol,
                cipher: tls12Result.cipher?.name,
                connectionTime: tls12Result.connectionTime
            };
            console.log(`  ✅ TLS 1.2 support verified for ${domain}`);
            console.log(`    Protocol: ${tls12Result.negotiatedProtocol}`);
            console.log(`    Cipher: ${tls12Result.cipher?.name || 'Unknown'}`);
        } else {
            req.status = 'FAILED';
            req.testResults = {
                domain: domain,
                supported: false,
                error: tls12Result?.error || 'TLS 1.2 not supported'
            };
            console.log(`  ❌ TLS 1.2 support NOT verified for ${domain}`);
            this.results.recommendations.push(`Enable TLS 1.2 support for ${domain}`);
        }
    }

    /**
     * Validate Requirement 2: TLS 1.3 support
     */
    async validateRequirement2(testResult, domain) {
        const req = this.results.requirements[1];
        
        console.log(`\n📋 Validating REQ-2: ${req.description}`);
        
        const tls13Result = testResult.tlsVersionTests['TLS 1.3'];
        
        if (tls13Result && tls13Result.supported) {
            req.status = 'PASSED';
            req.testResults = {
                domain: domain,
                supported: true,
                negotiatedProtocol: tls13Result.negotiatedProtocol,
                cipher: tls13Result.cipher?.name,
                connectionTime: tls13Result.connectionTime
            };
            console.log(`  ✅ TLS 1.3 support verified for ${domain}`);
            console.log(`    Protocol: ${tls13Result.negotiatedProtocol}`);
            console.log(`    Cipher: ${tls13Result.cipher?.name || 'Unknown'}`);
        } else {
            req.status = 'WARNING'; // TLS 1.3 is recommended but not strictly required
            req.testResults = {
                domain: domain,
                supported: false,
                error: tls13Result?.error || 'TLS 1.3 not supported'
            };
            console.log(`  ⚠️  TLS 1.3 support NOT available for ${domain}`);
            this.results.recommendations.push(`Consider enabling TLS 1.3 support for ${domain} for enhanced security`);
        }
    }

    /**
     * Validate Requirement 3: Weak TLS versions disabled
     */
    async validateRequirement3(testResult, domain) {
        const req = this.results.requirements[2];
        
        console.log(`\n📋 Validating REQ-3: ${req.description}`);
        
        const tls10Result = testResult.tlsVersionTests['TLS 1.0'];
        const tls11Result = testResult.tlsVersionTests['TLS 1.1'];
        
        const tls10Disabled = !tls10Result?.supported;
        const tls11Disabled = !tls11Result?.supported;
        
        if (tls10Disabled && tls11Disabled) {
            req.status = 'PASSED';
            req.testResults = {
                domain: domain,
                tls10Disabled: true,
                tls11Disabled: true,
                details: {
                    'TLS 1.0': tls10Result?.status || 'DISABLED',
                    'TLS 1.1': tls11Result?.status || 'DISABLED'
                }
            };
            console.log(`  ✅ Weak TLS versions properly disabled for ${domain}`);
            console.log(`    TLS 1.0: ${tls10Result?.status || 'DISABLED'}`);
            console.log(`    TLS 1.1: ${tls11Result?.status || 'DISABLED'}`);
        } else {
            req.status = 'FAILED';
            req.testResults = {
                domain: domain,
                tls10Disabled: tls10Disabled,
                tls11Disabled: tls11Disabled,
                issues: []
            };
            
            if (!tls10Disabled) {
                req.testResults.issues.push('TLS 1.0 is still enabled');
                console.log(`  ❌ TLS 1.0 is still enabled for ${domain}`);
                this.results.recommendations.push(`CRITICAL: Disable TLS 1.0 support for ${domain}`);
            }
            
            if (!tls11Disabled) {
                req.testResults.issues.push('TLS 1.1 is still enabled');
                console.log(`  ❌ TLS 1.1 is still enabled for ${domain}`);
                this.results.recommendations.push(`CRITICAL: Disable TLS 1.1 support for ${domain}`);
            }
        }
    }

    /**
     * Validate Requirement 4: TLS version negotiation
     */
    async validateRequirement4(testResult, domain) {
        const req = this.results.requirements[3];
        
        console.log(`\n📋 Validating REQ-4: ${req.description}`);
        
        const negotiationTests = testResult.negotiationTests || {};
        const negotiationTestCount = Object.keys(negotiationTests).length;
        const successfulNegotiations = Object.values(negotiationTests).filter(t => t.success).length;
        
        if (negotiationTestCount > 0 && successfulNegotiations === negotiationTestCount) {
            req.status = 'PASSED';
            req.testResults = {
                domain: domain,
                totalTests: negotiationTestCount,
                successfulTests: successfulNegotiations,
                details: negotiationTests
            };
            console.log(`  ✅ TLS version negotiation working correctly for ${domain}`);
            console.log(`    Successful negotiations: ${successfulNegotiations}/${negotiationTestCount}`);
        } else if (negotiationTestCount > 0) {
            req.status = 'WARNING';
            req.testResults = {
                domain: domain,
                totalTests: negotiationTestCount,
                successfulTests: successfulNegotiations,
                details: negotiationTests
            };
            console.log(`  ⚠️  Some TLS negotiation issues detected for ${domain}`);
            console.log(`    Successful negotiations: ${successfulNegotiations}/${negotiationTestCount}`);
            this.results.recommendations.push(`Review TLS version negotiation behavior for ${domain}`);
        } else {
            req.status = 'FAILED';
            req.testResults = {
                domain: domain,
                error: 'No negotiation tests performed'
            };
            console.log(`  ❌ TLS version negotiation tests failed for ${domain}`);
            this.results.recommendations.push(`TLS version negotiation testing failed for ${domain}`);
        }
    }

    /**
     * Calculate compliance score
     */
    calculateComplianceScore() {
        const totalRequirements = this.results.requirements.length;
        const passedRequirements = this.results.requirements.filter(r => r.status === 'PASSED').length;
        const warningRequirements = this.results.requirements.filter(r => r.status === 'WARNING').length;
        
        // Full points for passed, half points for warnings
        this.results.complianceScore = Math.round(
            ((passedRequirements + (warningRequirements * 0.5)) / totalRequirements) * 100
        );
        
        // Determine overall status
        if (passedRequirements === totalRequirements) {
            this.results.overallStatus = 'FULLY_COMPLIANT';
        } else if (passedRequirements + warningRequirements === totalRequirements) {
            this.results.overallStatus = 'MOSTLY_COMPLIANT';
        } else if (passedRequirements > 0) {
            this.results.overallStatus = 'PARTIALLY_COMPLIANT';
        } else {
            this.results.overallStatus = 'NON_COMPLIANT';
        }
    }

    /**
     * Generate final validation report
     */
    generateFinalReport() {
        console.log(`\n${'='.repeat(80)}`);
        console.log(`📊 TASK 7.5.1 VALIDATION REPORT`);
        console.log(`${'='.repeat(80)}`);
        
        console.log(`📋 Task: ${this.results.taskDescription}`);
        console.log(`⏰ Completed: ${new Date().toISOString()}`);
        console.log(`🌐 Test Domains: ${this.results.testDomains.join(', ')}`);
        console.log(`📊 Compliance Score: ${this.results.complianceScore}%`);
        console.log(`🎯 Overall Status: ${this.results.overallStatus}`);
        
        console.log(`\n📋 Requirement Validation Results:`);
        this.results.requirements.forEach((req, index) => {
            const statusIcon = req.status === 'PASSED' ? '✅' : 
                              req.status === 'WARNING' ? '⚠️' : '❌';
            console.log(`  ${index + 1}. ${statusIcon} ${req.description}`);
            console.log(`     Status: ${req.status}`);
        });
        
        if (this.results.recommendations.length > 0) {
            console.log(`\n📝 Recommendations:`);
            this.results.recommendations.forEach((rec, index) => {
                const priority = rec.includes('CRITICAL') ? '🚨' : '💡';
                console.log(`  ${index + 1}. ${priority} ${rec}`);
            });
        }
        
        // Task completion assessment
        console.log(`\n🎯 Task 7.5.1 Implementation Assessment:`);
        
        if (this.results.overallStatus === 'FULLY_COMPLIANT') {
            console.log(`  ✅ TASK COMPLETED SUCCESSFULLY`);
            console.log(`  All requirements have been implemented and validated.`);
        } else if (this.results.overallStatus === 'MOSTLY_COMPLIANT') {
            console.log(`  ⚠️  TASK MOSTLY COMPLETED`);
            console.log(`  Core requirements implemented with minor issues.`);
        } else if (this.results.overallStatus === 'PARTIALLY_COMPLIANT') {
            console.log(`  ⚠️  TASK PARTIALLY COMPLETED`);
            console.log(`  Some requirements implemented but issues remain.`);
        } else {
            console.log(`  ❌ TASK NOT COMPLETED`);
            console.log(`  Critical requirements not met.`);
        }
    }

    /**
     * Save validation report
     */
    saveReport(filename) {
        const outputFile = filename || `task-7-5-1-validation-report-${Date.now()}.json`;
        
        // Add metadata
        this.results.metadata = {
            validator: 'TLS Version Support Task Validator',
            version: '1.0.0',
            generatedAt: new Date().toISOString(),
            testDuration: Date.now() - new Date(this.results.timestamp).getTime()
        };
        
        fs.writeFileSync(outputFile, JSON.stringify(this.results, null, 2));
        console.log(`\n💾 Validation report saved to: ${outputFile}`);
        return outputFile;
    }
}

// CLI usage
if (require.main === module) {
    const args = process.argv.slice(2);
    
    if (args.includes('--help')) {
        console.log(`
TLS Version Support Task Validation - Task 7.5.1

Validates that task 7.5.1 has been properly implemented by testing
all required functionality against real domains.

Usage: node validate-tls-version-support-task.js [domains...] [options]

Options:
  --output <file>      Output file for validation report
  --help              Show this help message

Examples:
  node validate-tls-version-support-task.js
  node validate-tls-version-support-task.js github.com cloudflare.com
  node validate-tls-version-support-task.js --output validation-report.json

Default Test Domains:
  If no domains are specified, the validator will test against:
  - github.com (known to support TLS 1.2 and 1.3)
  - cloudflare.com (known to have strong TLS configuration)
        `);
        process.exit(0);
    }
    
    // Parse arguments
    const domains = [];
    let outputFile = null;
    
    for (let i = 0; i < args.length; i++) {
        if (args[i] === '--output') {
            outputFile = args[i + 1];
            i++;
        } else if (!args[i].startsWith('--')) {
            domains.push(args[i]);
        }
    }
    
    // Use default domains if none specified
    const testDomains = domains.length > 0 ? domains : ['github.com', 'cloudflare.com'];
    
    const validator = new TLSVersionSupportTaskValidator();
    
    validator.validateTask(testDomains)
        .then((results) => {
            validator.saveReport(outputFile);
            
            // Exit with appropriate code
            if (results.overallStatus === 'FULLY_COMPLIANT') {
                console.log(`\n✅ Task 7.5.1 validation completed successfully`);
                process.exit(0);
            } else if (results.overallStatus === 'MOSTLY_COMPLIANT') {
                console.log(`\n⚠️  Task 7.5.1 mostly completed - minor issues detected`);
                process.exit(1);
            } else {
                console.log(`\n❌ Task 7.5.1 validation failed - requirements not met`);
                process.exit(2);
            }
        })
        .catch((error) => {
            console.error(`\n💥 Validation failed: ${error.message}`);
            process.exit(3);
        });
}

module.exports = TLSVersionSupportTaskValidator;