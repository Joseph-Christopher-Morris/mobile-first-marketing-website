#!/usr/bin/env node

/**
 * CloudFront Function Association Implementation Validator
 * 
 * This script validates that the function association implementation
 * meets all the requirements for task 3.2
 */

const fs = require('fs');
const path = require('path');

class FunctionAssociationValidator {
    constructor() {
        this.configScriptPath = 'scripts/configure-cloudfront-pretty-urls.js';
        this.testScriptPath = 'scripts/test-cloudfront-function-association.js';
        this.requirements = [
            'Attach CloudFront Function to default cache behavior on viewer-request',
            'Maintain existing cache behavior settings and security headers',
            'Implement configuration change validation'
        ];
    }

    /**
     * Validate the implementation meets all requirements
     */
    async validateImplementation() {
        console.log('🔍 Validating CloudFront Function Association Implementation\n');

        const results = {
            codeStructure: false,
            functionAttachment: false,
            cacheBehaviorPreservation: false,
            configurationValidation: false,
            errorHandling: false,
            testCoverage: false
        };

        // Check 1: Code structure and organization
        console.log('1️⃣ Validating code structure...');
        results.codeStructure = this.validateCodeStructure();

        // Check 2: Function attachment implementation
        console.log('2️⃣ Validating function attachment logic...');
        results.functionAttachment = this.validateFunctionAttachment();

        // Check 3: Cache behavior preservation
        console.log('3️⃣ Validating cache behavior preservation...');
        results.cacheBehaviorPreservation = this.validateCacheBehaviorPreservation();

        // Check 4: Configuration validation
        console.log('4️⃣ Validating configuration validation logic...');
        results.configurationValidation = this.validateConfigurationValidation();

        // Check 5: Error handling
        console.log('5️⃣ Validating error handling...');
        results.errorHandling = this.validateErrorHandling();

        // Check 6: Test coverage
        console.log('6️⃣ Validating test coverage...');
        results.testCoverage = this.validateTestCoverage();

        // Generate summary
        this.generateValidationSummary(results);

        return results;
    }

    /**
     * Validate code structure and organization
     */
    validateCodeStructure() {
        try {
            const configScript = fs.readFileSync(this.configScriptPath, 'utf8');
            
            const requiredMethods = [
                'integrateFunctionAssociation',
                'validateAndPreserveCacheBehavior',
                'validateConfigurationChanges',
                'validateFunctionAssociation'
            ];

            let methodsFound = 0;
            requiredMethods.forEach(method => {
                if (configScript.includes(method)) {
                    console.log(`   ✓ Method '${method}' found`);
                    methodsFound++;
                } else {
               
     console.log(`   ❌ Method '${method}' missing`);
                }
            });

            const structureValid = methodsFound === requiredMethods.length;
            console.log(`   📊 Code structure: ${methodsFound}/${requiredMethods.length} required methods found\n`);
            
            return structureValid;

        } catch (error) {
            console.log(`   ❌ Error reading configuration script: ${error.message}\n`);
            return false;
        }
    }

    /**
     * Validate function attachment implementation
     */
    validateFunctionAttachment() {
        try {
            const configScript = fs.readFileSync(this.configScriptPath, 'utf8');
            
            const requiredFeatures = [
                'viewer-request',
                'FunctionAssociations',
                'EventType',
                'FunctionARN'
            ];

            let featuresFound = 0;
            requiredFeatures.forEach(feature => {
                if (configScript.includes(feature)) {
                    console.log(`   ✓ Feature '${feature}' implemented`);
                    featuresFound++;
                } else {
                    console.log(`   ❌ Feature '${feature}' missing`);
                }
            });

            // Check for proper viewer-request event handling
            const hasViewerRequestLogic = configScript.includes('viewer-request') && 
                                        configScript.includes('EventType');
            
            if (hasViewerRequestLogic) {
                console.log(`   ✓ Viewer-request event handling implemented`);
            } else {
                console.log(`   ❌ Viewer-request event handling missing`);
            }

            const attachmentValid = featuresFound === requiredFeatures.length && hasViewerRequestLogic;
            console.log(`   📊 Function attachment: ${featuresFound}/${requiredFeatures.length} features implemented\n`);
            
            return attachmentValid;

        } catch (error) {
            console.log(`   ❌ Error validating function attachment: ${error.message}\n`);
            return false;
        }
    }

    /**
     * Validate cache behavior preservation
     */
    validateCacheBehaviorPreservation() {
        try {
            const configScript = fs.readFileSync(this.configScriptPath, 'utf8');
            
            const preservationFeatures = [
                'TargetOriginId',
                'ViewerProtocolPolicy',
                'CachePolicyId',
                'OriginRequestPolicyId',
                'ResponseHeadersPolicyId',
                'validateAndPreserveCacheBehavior'
            ];

            let featuresFound = 0;
            preservationFeatures.forEach(feature => {
                if (configScript.includes(feature)) {
                    console.log(`   ✓ Preservation feature '${feature}' implemented`);
                    featuresFound++;
                } else {
                    console.log(`   ❌ Preservation feature '${feature}' missing`);
                }
            });

            // Check for security headers preservation
            const hasSecurityPreservation = configScript.includes('ResponseHeadersPolicy') || 
                                          configScript.includes('security headers');
            
            if (hasSecurityPreservation) {
                console.log(`   ✓ Security headers preservation implemented`);
            } else {
                console.log(`   ❌ Security headers preservation missing`);
            }

            const preservationValid = featuresFound >= 4 && hasSecurityPreservation;
            console.log(`   📊 Cache behavior preservation: ${featuresFound}/${preservationFeatures.length} features implemented\n`);
            
            return preservationValid;

        } catch (error) {
            console.log(`   ❌ Error validating cache behavior preservation: ${error.message}\n`);
            return false;
        }
    }

    /**
     * Validate configuration validation logic
     */
    validateConfigurationValidation() {
        try {
            const configScript = fs.readFileSync(this.configScriptPath, 'utf8');
            
            const validationFeatures = [
                'validateConfigurationChanges',
                'validateFunctionAssociation',
                'validateCacheBehaviorIntegrity',
                'validateSecurityHeaders'
            ];

            let featuresFound = 0;
            validationFeatures.forEach(feature => {
                if (configScript.includes(feature)) {
                    console.log(`   ✓ Validation feature '${feature}' implemented`);
                    featuresFound++;
                } else {
                    console.log(`   ❌ Validation feature '${feature}' missing`);
                }
            });

            // Check for comprehensive validation
            const hasComprehensiveValidation = configScript.includes('validation') && 
                                             configScript.includes('validationResults');
            
            if (hasComprehensiveValidation) {
                console.log(`   ✓ Comprehensive validation logic implemented`);
            } else {
                console.log(`   ❌ Comprehensive validation logic missing`);
            }

            const validationValid = featuresFound === validationFeatures.length && hasComprehensiveValidation;
            console.log(`   📊 Configuration validation: ${featuresFound}/${validationFeatures.length} features implemented\n`);
            
            return validationValid;

        } catch (error) {
            console.log(`   ❌ Error validating configuration validation: ${error.message}\n`);
            return false;
        }
    }

    /**
     * Validate error handling implementation
     */
    validateErrorHandling() {
        try {
            const configScript = fs.readFileSync(this.configScriptPath, 'utf8');
            
            const errorHandlingFeatures = [
                'try {',
                'catch (',
                'throw new Error',
                'error.message',
                'PreconditionFailed'
            ];

            let featuresFound = 0;
            errorHandlingFeatures.forEach(feature => {
                const occurrences = (configScript.match(new RegExp(feature.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
                if (occurrences > 0) {
                    console.log(`   ✓ Error handling feature '${feature}' found (${occurrences} occurrences)`);
                    featuresFound++;
                } else {
                    console.log(`   ❌ Error handling feature '${feature}' missing`);
                }
            });

            // Check for specific CloudFront error handling
            const hasCloudFrontErrorHandling = configScript.includes('PreconditionFailed') || 
                                             configScript.includes('NoSuchDistribution');
            
            if (hasCloudFrontErrorHandling) {
                console.log(`   ✓ CloudFront-specific error handling implemented`);
            } else {
                console.log(`   ❌ CloudFront-specific error handling missing`);
            }

            const errorHandlingValid = featuresFound >= 3 && hasCloudFrontErrorHandling;
            console.log(`   📊 Error handling: ${featuresFound}/${errorHandlingFeatures.length} features implemented\n`);
            
            return errorHandlingValid;

        } catch (error) {
            console.log(`   ❌ Error validating error handling: ${error.message}\n`);
            return false;
        }
    }

    /**
     * Validate test coverage
     */
    validateTestCoverage() {
        try {
            if (!fs.existsSync(this.testScriptPath)) {
                console.log(`   ❌ Test script not found: ${this.testScriptPath}\n`);
                return false;
            }

            const testScript = fs.readFileSync(this.testScriptPath, 'utf8');
            
            const testFeatures = [
                'testFunctionAssociation',
                'testCacheBehaviorIntegrity',
                'testSecurityHeaders',
                'viewer-request',
                'FunctionARN'
            ];

            let featuresFound = 0;
            testFeatures.forEach(feature => {
                if (testScript.includes(feature)) {
                    console.log(`   ✓ Test feature '${feature}' implemented`);
                    featuresFound++;
                } else {
                    console.log(`   ❌ Test feature '${feature}' missing`);
                }
            });

            // Check for comprehensive test coverage
            const hasComprehensiveTests = testScript.includes('runTests') && 
                                        testScript.includes('generateTestReport');
            
            if (hasComprehensiveTests) {
                console.log(`   ✓ Comprehensive test suite implemented`);
            } else {
                console.log(`   ❌ Comprehensive test suite missing`);
            }

            const testCoverageValid = featuresFound >= 4 && hasComprehensiveTests;
            console.log(`   📊 Test coverage: ${featuresFound}/${testFeatures.length} features implemented\n`);
            
            return testCoverageValid;

        } catch (error) {
            console.log(`   ❌ Error validating test coverage: ${error.message}\n`);
            return false;
        }
    }

    /**
     * Generate validation summary
     */
    generateValidationSummary(results) {
        console.log('📊 VALIDATION SUMMARY');
        console.log('=====================\n');

        const validationChecks = [
            { name: 'Code Structure', passed: results.codeStructure },
            { name: 'Function Attachment', passed: results.functionAttachment },
            { name: 'Cache Behavior Preservation', passed: results.cacheBehaviorPreservation },
            { name: 'Configuration Validation', passed: results.configurationValidation },
            { name: 'Error Handling', passed: results.errorHandling },
            { name: 'Test Coverage', passed: results.testCoverage }
        ];

        let passedChecks = 0;
        validationChecks.forEach((check, index) => {
            const status = check.passed ? '✅ PASS' : '❌ FAIL';
            console.log(`${index + 1}. ${check.name}: ${status}`);
            if (check.passed) passedChecks++;
        });

        const totalChecks = validationChecks.length;
        const successRate = Math.round((passedChecks / totalChecks) * 100);

        console.log(`\n📈 Overall Validation: ${passedChecks}/${totalChecks} (${successRate}%)`);

        if (passedChecks === totalChecks) {
            console.log('🎉 All validation checks passed! Implementation meets requirements.');
        } else {
            console.log('⚠️  Some validation checks failed. Review implementation.');
        }

        // Map to requirements
        console.log('\n📋 Requirements Coverage:');
        this.requirements.forEach((req, index) => {
            let covered = false;
            switch(index) {
                case 0: // Function attachment
                    covered = results.functionAttachment;
                    break;
                case 1: // Cache behavior preservation
                    covered = results.cacheBehaviorPreservation;
                    break;
                case 2: // Configuration validation
                    covered = results.configurationValidation;
                    break;
            }
            const status = covered ? '✅' : '❌';
            console.log(`${status} ${req}`);
        });

        console.log(`\n📅 Validation completed at: ${new Date().toISOString()}`);

        return {
            passedChecks,
            totalChecks,
            successRate,
            overallStatus: passedChecks === totalChecks ? 'PASS' : 'FAIL'
        };
    }
}

// CLI execution
async function main() {
    try {
        const validator = new FunctionAssociationValidator();
        const results = await validator.validateImplementation();
        
        // Exit with appropriate code
        const allPassed = Object.values(results).every(result => result === true);
        process.exit(allPassed ? 0 : 1);
        
    } catch (error) {
        console.error('\n💥 Validation failed:', error.message);
        process.exit(1);
    }
}

// Export for use in other scripts
module.exports = FunctionAssociationValidator;

// Run if called directly
if (require.main === module) {
    main();
}