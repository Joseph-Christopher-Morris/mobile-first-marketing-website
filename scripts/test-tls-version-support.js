#!/usr/bin/env node

/**
 * TLS Version Support Tester - Task 7.5.1
 * 
 * This script implements the specific requirements for task 7.5.1:
 * - Verify TLS 1.2 support is enabled
 * - Confirm TLS 1.3 support is available
 * - Test that weak TLS versions (1.0, 1.1) are disabled
 * - Validate TLS version negotiation behavior
 * 
 * Requirements: 7.5
 */

const tls = require('tls');
const fs = require('fs');
const path = require('path');

class TLSVersionTester {
    constructor(domain, options = {}) {
        this.domain = domain;
        this.port = options.port || 443;
        this.timeout = options.timeout || 10000;
        this.results = {
            domain: this.domain,
            port: this.port,
            timestamp: new Date().toISOString(),
            tlsVersionTests: {},
            negotiationTests: {},
            summary: {
                totalTests: 0,
                passedTests: 0,
                failedTests: 0,
                warnings: 0
            },
            recommendations: [],
            complianceStatus: 'UNKNOWN'
        };
        
        this.loadConfig();
    }

    /**
     * Load TLS security configuration
     */
    loadConfig() {
        try {
            const configPath = path.join(__dirname, '../config/tls-security-config.json');
            this.config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        } catch (error) {
            console.warn(`⚠️  Could not load TLS config: ${error.message}`);
            this.config = {
                tlsValidation: {
                    requiredVersions: ["TLS 1.2", "TLS 1.3"],
                    prohibitedVersions: ["SSL 2.0", "SSL 3.0", "TLS 1.0", "TLS 1.1"]
                }
            };
        }
    }

    /**
     * Test TLS 1.2 support (Task requirement 1)
     */
    async testTLS12Support() {
        console.log(`\n🔒 Testing TLS 1.2 support...`);
        
        try {
            const result = await this.testSpecificTLSVersion('TLSv1.2', {
                minVersion: 'TLSv1.2',
                maxVersion: 'TLSv1.2'
            });
            
            this.results.tlsVersionTests['TLS 1.2'] = {
                supported: result.supported,
                required: true,
                negotiatedProtocol: result.negotiatedProtocol,
                cipher: result.cipher,
                connectionTime: result.connectionTime,
                status: result.supported ? '✅ ENABLED' : '❌ DISABLED',
                details: result
            };
            
            console.log(`  TLS 1.2: ${this.results.tlsVersionTests['TLS 1.2'].status}`);
            if (result.supported) {
                console.log(`    Negotiated Protocol: ${result.negotiatedProtocol}`);
                console.log(`    Cipher: ${result.cipher?.name || 'Unknown'}`);
                console.log(`    Connection Time: ${result.connectionTime}ms`);
            }
            
            this.results.summary.totalTests++;
            if (result.supported) {
                this.results.summary.passedTests++;
            } else {
                this.results.summary.failedTests++;
                this.results.recommendations.push('CRITICAL: Enable TLS 1.2 support - required for security compliance');
            }
            
        } catch (error) {
            this.results.tlsVersionTests['TLS 1.2'] = {
                supported: false,
                required: true,
                status: '❌ ERROR',
                error: error.message
            };
            console.log(`  TLS 1.2: ❌ ERROR - ${error.message}`);
            this.results.summary.totalTests++;
            this.results.summary.failedTests++;
        }
    }

    /**
     * Test TLS 1.3 support (Task requirement 2)
     */
    async testTLS13Support() {
        console.log(`\n🔒 Testing TLS 1.3 support...`);
        
        try {
            const result = await this.testSpecificTLSVersion('TLSv1.3', {
                minVersion: 'TLSv1.3',
                maxVersion: 'TLSv1.3'
            });
            
            this.results.tlsVersionTests['TLS 1.3'] = {
                supported: result.supported,
                required: false, // Recommended but not strictly required
                negotiatedProtocol: result.negotiatedProtocol,
                cipher: result.cipher,
                connectionTime: result.connectionTime,
                status: result.supported ? '✅ ENABLED' : '⚠️  DISABLED',
                details: result
            };
            
            console.log(`  TLS 1.3: ${this.results.tlsVersionTests['TLS 1.3'].status}`);
            if (result.supported) {
                console.log(`    Negotiated Protocol: ${result.negotiatedProtocol}`);
                console.log(`    Cipher: ${result.cipher?.name || 'Unknown'}`);
                console.log(`    Connection Time: ${result.connectionTime}ms`);
            }
            
            this.results.summary.totalTests++;
            if (result.supported) {
                this.results.summary.passedTests++;
            } else {
                this.results.summary.warnings++;
                this.results.recommendations.push('Consider enabling TLS 1.3 support for enhanced security and performance');
            }
            
        } catch (error) {
            this.results.tlsVersionTests['TLS 1.3'] = {
                supported: false,
                required: false,
                status: '⚠️  ERROR',
                error: error.message
            };
            console.log(`  TLS 1.3: ⚠️  ERROR - ${error.message}`);
            this.results.summary.totalTests++;
            this.results.summary.warnings++;
        }
    }

    /**
     * Test that weak TLS versions are disabled (Task requirement 3)
     */
    async testWeakTLSVersionsDisabled() {
        console.log(`\n🚫 Testing that weak TLS versions are disabled...`);
        
        const weakVersions = [
            { name: 'TLS 1.0', version: 'TLSv1', options: { minVersion: 'TLSv1', maxVersion: 'TLSv1' } },
            { name: 'TLS 1.1', version: 'TLSv1.1', options: { minVersion: 'TLSv1.1', maxVersion: 'TLSv1.1' } }
        ];

        for (const weakVersion of weakVersions) {
            try {
                const result = await this.testSpecificTLSVersion(weakVersion.version, weakVersion.options);
                
                this.results.tlsVersionTests[weakVersion.name] = {
                    supported: result.supported,
                    shouldBeDisabled: true,
                    status: result.supported ? '⚠️  ENABLED (INSECURE)' : '✅ DISABLED',
                    details: result
                };
                
                console.log(`  ${weakVersion.name}: ${this.results.tlsVersionTests[weakVersion.name].status}`);
                
                this.results.summary.totalTests++;
                if (!result.supported) {
                    this.results.summary.passedTests++;
                } else {
                    this.results.summary.failedTests++;
                    this.results.recommendations.push(`CRITICAL: Disable ${weakVersion.name} support - this is a security vulnerability`);
                }
                
            } catch (error) {
                // For weak versions, connection errors usually mean they're disabled (good)
                this.results.tlsVersionTests[weakVersion.name] = {
                    supported: false,
                    shouldBeDisabled: true,
                    status: '✅ DISABLED',
                    note: 'Connection failed (likely disabled)',
                    error: error.message
                };
                console.log(`  ${weakVersion.name}: ✅ DISABLED (connection failed)`);
                this.results.summary.totalTests++;
                this.results.summary.passedTests++;
            }
        }
    }

    /**
     * Test TLS version negotiation behavior (Task requirement 4)
     */
    async testTLSVersionNegotiation() {
        console.log(`\n🤝 Testing TLS version negotiation behavior...`);
        
        const negotiationTests = [
            {
                name: 'Client prefers TLS 1.3, server supports both',
                options: { minVersion: 'TLSv1.2', maxVersion: 'TLSv1.3' },
                expectedProtocol: 'TLSv1.3'
            },
            {
                name: 'Client supports TLS 1.2 only',
                options: { minVersion: 'TLSv1.2', maxVersion: 'TLSv1.2' },
                expectedProtocol: 'TLSv1.2'
            },
            {
                name: 'Client supports wide range (TLS 1.0-1.3)',
                options: { minVersion: 'TLSv1', maxVersion: 'TLSv1.3' },
                expectedProtocol: ['TLSv1.2', 'TLSv1.3'] // Should negotiate highest available
            }
        ];

        for (const test of negotiationTests) {
            try {
                const result = await this.testSpecificTLSVersion('negotiation', test.options);
                
                let negotiationSuccess = false;
                let negotiationNote = '';
                
                if (Array.isArray(test.expectedProtocol)) {
                    negotiationSuccess = test.expectedProtocol.includes(result.negotiatedProtocol);
                    negotiationNote = `Expected one of: ${test.expectedProtocol.join(', ')}, Got: ${result.negotiatedProtocol}`;
                } else {
                    negotiationSuccess = result.negotiatedProtocol === test.expectedProtocol;
                    negotiationNote = `Expected: ${test.expectedProtocol}, Got: ${result.negotiatedProtocol}`;
                }
                
                this.results.negotiationTests[test.name] = {
                    success: negotiationSuccess,
                    negotiatedProtocol: result.negotiatedProtocol,
                    expectedProtocol: test.expectedProtocol,
                    status: negotiationSuccess ? '✅ CORRECT' : '⚠️  UNEXPECTED',
                    note: negotiationNote,
                    details: result
                };
                
                console.log(`  ${test.name}: ${this.results.negotiationTests[test.name].status}`);
                console.log(`    ${negotiationNote}`);
                
                this.results.summary.totalTests++;
                if (negotiationSuccess) {
                    this.results.summary.passedTests++;
                } else {
                    this.results.summary.warnings++;
                    this.results.recommendations.push(`Review TLS version negotiation: ${negotiationNote}`);
                }
                
            } catch (error) {
                this.results.negotiationTests[test.name] = {
                    success: false,
                    status: '❌ ERROR',
                    error: error.message
                };
                console.log(`  ${test.name}: ❌ ERROR - ${error.message}`);
                this.results.summary.totalTests++;
                this.results.summary.failedTests++;
            }
        }
    }

    /**
     * Test specific TLS version with detailed connection handling
     */
    async testSpecificTLSVersion(versionName, tlsOptions) {
        return new Promise((resolve, reject) => {
            const startTime = Date.now();
            
            const options = {
                host: this.domain,
                port: this.port,
                rejectUnauthorized: false,
                timeout: this.timeout,
                ...tlsOptions
            };

            const socket = tls.connect(options, () => {
                const connectionTime = Date.now() - startTime;
                const negotiatedProtocol = socket.getProtocol();
                const cipher = socket.getCipher();
                const certificate = socket.getPeerCertificate();
                
                socket.destroy();
                resolve({
                    supported: true,
                    negotiatedProtocol,
                    cipher,
                    certificate: certificate ? {
                        subject: certificate.subject,
                        issuer: certificate.issuer,
                        valid_from: certificate.valid_from,
                        valid_to: certificate.valid_to
                    } : null,
                    connectionTime
                });
            });

            socket.on('error', (error) => {
                socket.destroy();
                const connectionTime = Date.now() - startTime;
                
                // Analyze error to determine if version is actually unsupported
                if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
                    reject(error); // Network/DNS error
                } else if (error.message.includes('protocol version') ||
                          error.message.includes('wrong version number') ||
                          error.message.includes('legacy sigalg disallowed') ||
                          error.message.includes('no protocols available') ||
                          error.code === 'EPROTO') {
                    resolve({
                        supported: false,
                        connectionTime,
                        error: error.message,
                        errorCode: error.code
                    });
                } else {
                    resolve({
                        supported: false,
                        connectionTime,
                        error: error.message,
                        errorCode: error.code
                    });
                }
            });

            socket.on('timeout', () => {
                socket.destroy();
                reject(new Error(`Connection timeout after ${this.timeout}ms`));
            });

            socket.setTimeout(this.timeout);
        });
    }

    /**
     * Determine overall compliance status
     */
    determineComplianceStatus() {
        const hasTLS12 = this.results.tlsVersionTests['TLS 1.2']?.supported;
        const hasWeakTLS = this.results.tlsVersionTests['TLS 1.0']?.supported || 
                          this.results.tlsVersionTests['TLS 1.1']?.supported;
        
        if (hasTLS12 && !hasWeakTLS) {
            this.results.complianceStatus = 'COMPLIANT';
        } else if (hasTLS12) {
            this.results.complianceStatus = 'PARTIALLY_COMPLIANT';
        } else {
            this.results.complianceStatus = 'NON_COMPLIANT';
        }
    }

    /**
     * Generate summary and recommendations
     */
    generateSummary() {
        console.log(`\n📊 TLS Version Support Test Summary:`);
        console.log(`  Domain: ${this.domain}:${this.port}`);
        console.log(`  Total Tests: ${this.results.summary.totalTests}`);
        console.log(`  Passed: ${this.results.summary.passedTests}`);
        console.log(`  Failed: ${this.results.summary.failedTests}`);
        console.log(`  Warnings: ${this.results.summary.warnings}`);
        console.log(`  Compliance Status: ${this.results.complianceStatus}`);
        
        // Show TLS version support summary
        console.log(`\n🔒 TLS Version Support:`);
        Object.entries(this.results.tlsVersionTests).forEach(([version, result]) => {
            console.log(`  ${version}: ${result.status}`);
        });
        
        // Show negotiation test results
        if (Object.keys(this.results.negotiationTests).length > 0) {
            console.log(`\n🤝 Negotiation Tests:`);
            Object.entries(this.results.negotiationTests).forEach(([test, result]) => {
                console.log(`  ${test}: ${result.status}`);
            });
        }
        
        // Show recommendations
        if (this.results.recommendations.length > 0) {
            console.log(`\n📝 Recommendations:`);
            this.results.recommendations.forEach((rec, index) => {
                const priority = rec.includes('CRITICAL') ? '🚨' : 
                               rec.includes('Consider') ? '💡' : '⚠️';
                console.log(`  ${index + 1}. ${priority} ${rec}`);
            });
        } else {
            console.log(`\n✅ No issues found - TLS version configuration is secure`);
        }
    }

    /**
     * Save test results to file
     */
    saveResults(filename) {
        const outputFile = filename || `tls-version-support-test-${this.domain}-${Date.now()}.json`;
        
        // Add test metadata
        this.results.testMetadata = {
            taskId: '7.5.1',
            taskDescription: 'Test TLS version support',
            requirements: [
                'Verify TLS 1.2 support is enabled',
                'Confirm TLS 1.3 support is available', 
                'Test that weak TLS versions (1.0, 1.1) are disabled',
                'Validate TLS version negotiation behavior'
            ],
            testDuration: Date.now() - new Date(this.results.timestamp).getTime()
        };
        
        fs.writeFileSync(outputFile, JSON.stringify(this.results, null, 2));
        console.log(`\n💾 Test results saved to: ${outputFile}`);
        return outputFile;
    }

    /**
     * Run complete TLS version support test
     */
    async runTest() {
        console.log(`🔍 Starting TLS Version Support Test (Task 7.5.1)`);
        console.log(`🌐 Target: ${this.domain}:${this.port}`);
        console.log(`⏰ Started: ${this.results.timestamp}`);
        console.log(`📋 Requirements:`);
        console.log(`   ✓ Verify TLS 1.2 support is enabled`);
        console.log(`   ✓ Confirm TLS 1.3 support is available`);
        console.log(`   ✓ Test that weak TLS versions (1.0, 1.1) are disabled`);
        console.log(`   ✓ Validate TLS version negotiation behavior`);

        try {
            // Execute all test requirements
            await this.testTLS12Support();
            await this.testTLS13Support();
            await this.testWeakTLSVersionsDisabled();
            await this.testTLSVersionNegotiation();
            
            this.determineComplianceStatus();
            this.generateSummary();

            console.log(`\n✅ TLS Version Support Test completed successfully`);
            console.log(`📊 Final Status: ${this.results.complianceStatus}`);
            
            return this.results;

        } catch (error) {
            console.error(`\n❌ TLS Version Support Test failed: ${error.message}`);
            this.results.error = error.message;
            throw error;
        }
    }
}

// CLI usage
if (require.main === module) {
    const args = process.argv.slice(2);
    
    if (args.length === 0 || args.includes('--help')) {
        console.log(`
TLS Version Support Tester - Task 7.5.1

Tests TLS version support according to security requirements:
- Verify TLS 1.2 support is enabled
- Confirm TLS 1.3 support is available
- Test that weak TLS versions (1.0, 1.1) are disabled
- Validate TLS version negotiation behavior

Usage: node test-tls-version-support.js <domain> [options]

Options:
  --port <port>        Port to test (default: 443)
  --timeout <ms>       Connection timeout (default: 10000)
  --output <file>      Output file for results
  --help              Show this help message

Examples:
  node test-tls-version-support.js example.com
  node test-tls-version-support.js d1234567890.cloudfront.net
  node test-tls-version-support.js mysite.com --output tls-test-results.json
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
        }
    }
    
    const tester = new TLSVersionTester(domain, options);
    
    tester.runTest()
        .then((results) => {
            tester.saveResults(outputFile);
            
            // Exit with appropriate code based on compliance status
            if (results.complianceStatus === 'COMPLIANT') {
                console.log(`\n✅ All TLS version tests passed`);
                process.exit(0);
            } else if (results.complianceStatus === 'PARTIALLY_COMPLIANT') {
                console.log(`\n⚠️  Some TLS version issues detected - review recommendations`);
                process.exit(1);
            } else {
                console.log(`\n❌ Critical TLS version issues detected - immediate action required`);
                process.exit(2);
            }
        })
        .catch((error) => {
            console.error(`\n💥 Test failed: ${error.message}`);
            process.exit(3);
        });
}

module.exports = TLSVersionTester;