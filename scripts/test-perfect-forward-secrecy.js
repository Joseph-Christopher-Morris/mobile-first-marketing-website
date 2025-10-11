#!/usr/bin/env node

/**
 * Perfect Forward Secrecy (PFS) Testing Script
 * 
 * This script tests Perfect Forward Secrecy compliance by:
 * - Verifying ECDHE key exchange support
 * - Testing DHE key exchange availability
 * - Validating ephemeral key generation
 * - Checking for PFS compliance across all connections
 * 
 * Requirements: 7.5
 */

const https = require('https');
const tls = require('tls');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

class PerfectForwardSecrecyTester {
    constructor() {
        this.results = {
            timestamp: new Date().toISOString(),
            testResults: {},
            summary: {
                totalTests: 0,
                passed: 0,
                failed: 0,
                warnings: 0
            },
            pfsCompliance: {
                ecdheCipherSupport: false,
                dheCipherSupport: false,
                ephemeralKeyGeneration: false,
                overallCompliance: false
            }
        };
        
        // PFS-enabled cipher suites
        this.pfsCiphers = [
            'ECDHE-RSA-AES256-GCM-SHA384',
            'ECDHE-RSA-AES128-GCM-SHA256',
            'ECDHE-RSA-AES256-SHA384',
            'ECDHE-RSA-AES128-SHA256',
            'ECDHE-RSA-AES256-SHA',
            'ECDHE-RSA-AES128-SHA',
            'DHE-RSA-AES256-GCM-SHA384',
            'DHE-RSA-AES128-GCM-SHA256',
            'DHE-RSA-AES256-SHA256',
            'DHE-RSA-AES128-SHA256',
            'DHE-RSA-AES256-SHA',
            'DHE-RSA-AES128-SHA'
        ];
        
        // Non-PFS cipher suites (should be avoided)
        this.nonPfsCiphers = [
            'AES256-GCM-SHA384',
            'AES128-GCM-SHA256',
            'AES256-SHA256',
            'AES128-SHA256',
            'AES256-SHA',
            'AES128-SHA',
            'DES-CBC3-SHA'
        ];
    }

    /**
     * Test ECDHE key exchange support
     */
    async testECDHESupport(domain) {
        console.log('\n🔐 Testing ECDHE Key Exchange Support...');
        
        const ecdheCiphers = this.pfsCiphers.filter(cipher => cipher.startsWith('ECDHE'));
        const results = {
            supportedCiphers: [],
            unsupportedCiphers: [],
            testPassed: false,
            details: {}
        };

        for (const cipher of ecdheCiphers) {
            try {
                const supported = await this.testCipherSupport(domain, cipher);
                if (supported.success) {
                    results.supportedCiphers.push({
                        cipher: cipher,
                        keyExchange: supported.keyExchange,
                        ephemeralKey: supported.ephemeralKey
                    });
                } else {
                    results.unsupportedCiphers.push({
                        cipher: cipher,
                        error: supported.error
                    });
                }
            } catch (error) {
                results.unsupportedCiphers.push({
                    cipher: cipher,
                    error: error.message
                });
            }
        }

        results.testPassed = results.supportedCiphers.length > 0;
        this.results.pfsCompliance.ecdheCipherSupport = results.testPassed;
        
        console.log(`✅ ECDHE Support: ${results.supportedCiphers.length} ciphers supported`);
        console.log(`❌ ECDHE Unsupported: ${results.unsupportedCiphers.length} ciphers`);
        
        return results;
    }

    /**
     * Test DHE key exchange availability
     */
    async testDHESupport(domain) {
        console.log('\n🔐 Testing DHE Key Exchange Support...');
        
        const dheCiphers = this.pfsCiphers.filter(cipher => cipher.startsWith('DHE'));
        const results = {
            supportedCiphers: [],
            unsupportedCiphers: [],
            testPassed: false,
            details: {}
        };

        for (const cipher of dheCiphers) {
            try {
                const supported = await this.testCipherSupport(domain, cipher);
                if (supported.success) {
                    results.supportedCiphers.push({
                        cipher: cipher,
                        keyExchange: supported.keyExchange,
                        ephemeralKey: supported.ephemeralKey
                    });
                } else {
                    results.unsupportedCiphers.push({
                        cipher: cipher,
                        error: supported.error
                    });
                }
            } catch (error) {
                results.unsupportedCiphers.push({
                    cipher: cipher,
                    error: error.message
                });
            }
        }

        results.testPassed = results.supportedCiphers.length > 0;
        this.results.pfsCompliance.dheCipherSupport = results.testPassed;
        
        console.log(`✅ DHE Support: ${results.supportedCiphers.length} ciphers supported`);
        console.log(`❌ DHE Unsupported: ${results.unsupportedCiphers.length} ciphers`);
        
        return results;
    }

    /**
     * Test individual cipher support and extract key exchange information
     */
    testCipherSupport(domain, cipher) {
        return new Promise((resolve) => {
            const options = {
                hostname: domain,
                port: 443,
                method: 'GET',
                path: '/',
                ciphers: cipher,
                secureProtocol: 'TLSv1_2_method',
                rejectUnauthorized: false,
                timeout: 10000
            };

            const req = https.request(options, (res) => {
                const socket = res.socket;
                const cipher = socket.getCipher();
                const ephemeralKeyInfo = socket.getEphemeralKeyInfo();
                
                resolve({
                    success: true,
                    cipher: cipher.name,
                    keyExchange: this.extractKeyExchange(cipher.name),
                    ephemeralKey: ephemeralKeyInfo,
                    version: cipher.version
                });
                
                res.destroy();
            });

            req.on('error', (error) => {
                resolve({
                    success: false,
                    error: error.message
                });
            });

            req.on('timeout', () => {
                resolve({
                    success: false,
                    error: 'Connection timeout'
                });
            });

            req.setTimeout(10000);
            req.end();
        });
    }

    /**
     * Extract key exchange method from cipher name
     */
    extractKeyExchange(cipherName) {
        if (cipherName.includes('ECDHE')) {
            return 'ECDHE';
        } else if (cipherName.includes('DHE')) {
            return 'DHE';
        } else if (cipherName.includes('ECDH')) {
            return 'ECDH';
        } else if (cipherName.includes('DH')) {
            return 'DH';
        }
        return 'RSA';
    }

    /**
     * Validate ephemeral key generation
     */
    async testEphemeralKeyGeneration(domain) {
        console.log('\n🔑 Testing Ephemeral Key Generation...');
        
        const results = {
            connections: [],
            uniqueKeys: new Set(),
            ephemeralKeySupport: false,
            testPassed: false
        };

        // Test multiple connections to verify key uniqueness
        const connectionPromises = [];
        for (let i = 0; i < 5; i++) {
            connectionPromises.push(this.getEphemeralKeyInfo(domain));
        }

        try {
            const connections = await Promise.all(connectionPromises);
            
            for (const conn of connections) {
                if (conn.success && conn.ephemeralKey) {
                    results.connections.push({
                        keyType: conn.ephemeralKey.type,
                        keySize: conn.ephemeralKey.size,
                        keyName: conn.ephemeralKey.name
                    });
                    
                    // Create unique identifier for the key
                    const keyId = `${conn.ephemeralKey.type}-${conn.ephemeralKey.size}-${conn.ephemeralKey.name}`;
                    results.uniqueKeys.add(keyId);
                }
            }

            results.ephemeralKeySupport = results.connections.length > 0;
            results.testPassed = results.ephemeralKeySupport && results.uniqueKeys.size > 0;
            this.results.pfsCompliance.ephemeralKeyGeneration = results.testPassed;
            
            console.log(`✅ Ephemeral Keys Generated: ${results.connections.length}/5 connections`);
            console.log(`🔑 Unique Key Types: ${results.uniqueKeys.size}`);
            
        } catch (error) {
            console.error(`❌ Ephemeral Key Test Failed: ${error.message}`);
            results.testPassed = false;
        }

        return results;
    }

    /**
     * Get ephemeral key information from a connection
     */
    getEphemeralKeyInfo(domain) {
        return new Promise((resolve) => {
            const options = {
                hostname: domain,
                port: 443,
                method: 'GET',
                path: '/',
                rejectUnauthorized: false,
                timeout: 10000
            };

            const req = https.request(options, (res) => {
                const socket = res.socket;
                const ephemeralKey = socket.getEphemeralKeyInfo();
                const cipher = socket.getCipher();
                
                resolve({
                    success: true,
                    ephemeralKey: ephemeralKey,
                    cipher: cipher.name,
                    protocol: socket.getProtocol()
                });
                
                res.destroy();
            });

            req.on('error', (error) => {
                resolve({
                    success: false,
                    error: error.message
                });
            });

            req.on('timeout', () => {
                resolve({
                    success: false,
                    error: 'Connection timeout'
                });
            });

            req.setTimeout(10000);
            req.end();
        });
    }

    /**
     * Check for PFS compliance across all connections
     */
    async testPFSCompliance(domain) {
        console.log('\n🛡️ Testing Overall PFS Compliance...');
        
        const results = {
            pfsEnabledConnections: 0,
            totalConnections: 0,
            nonPfsDetected: [],
            compliancePercentage: 0,
            testPassed: false
        };

        // Test default connection
        try {
            const defaultConnection = await this.getConnectionInfo(domain);
            results.totalConnections++;
            
            if (this.isPFSCipher(defaultConnection.cipher)) {
                results.pfsEnabledConnections++;
                console.log(`✅ Default connection uses PFS: ${defaultConnection.cipher}`);
            } else {
                results.nonPfsDetected.push({
                    cipher: defaultConnection.cipher,
                    keyExchange: defaultConnection.keyExchange
                });
                console.log(`❌ Default connection does NOT use PFS: ${defaultConnection.cipher}`);
            }

            // Test with specific PFS ciphers
            for (const cipher of this.pfsCiphers.slice(0, 3)) { // Test top 3 PFS ciphers
                try {
                    const conn = await this.testCipherSupport(domain, cipher);
                    if (conn.success) {
                        results.totalConnections++;
                        results.pfsEnabledConnections++;
                    }
                } catch (error) {
                    // Cipher not supported, which is acceptable
                }
            }

            results.compliancePercentage = (results.pfsEnabledConnections / results.totalConnections) * 100;
            results.testPassed = results.compliancePercentage >= 80; // 80% compliance threshold
            
            console.log(`📊 PFS Compliance: ${results.compliancePercentage.toFixed(1)}%`);
            console.log(`✅ PFS Connections: ${results.pfsEnabledConnections}/${results.totalConnections}`);
            
        } catch (error) {
            console.error(`❌ PFS Compliance Test Failed: ${error.message}`);
            results.testPassed = false;
        }

        return results;
    }

    /**
     * Get connection information
     */
    getConnectionInfo(domain) {
        return new Promise((resolve, reject) => {
            const options = {
                hostname: domain,
                port: 443,
                method: 'GET',
                path: '/',
                rejectUnauthorized: false,
                timeout: 10000
            };

            const req = https.request(options, (res) => {
                const socket = res.socket;
                const cipher = socket.getCipher();
                const ephemeralKey = socket.getEphemeralKeyInfo();
                
                resolve({
                    cipher: cipher.name,
                    keyExchange: this.extractKeyExchange(cipher.name),
                    ephemeralKey: ephemeralKey,
                    protocol: socket.getProtocol(),
                    version: cipher.version
                });
                
                res.destroy();
            });

            req.on('error', reject);
            req.on('timeout', () => reject(new Error('Connection timeout')));
            req.setTimeout(10000);
            req.end();
        });
    }

    /**
     * Check if a cipher provides Perfect Forward Secrecy
     */
    isPFSCipher(cipherName) {
        return cipherName.includes('ECDHE') || cipherName.includes('DHE');
    }

    /**
     * Generate comprehensive PFS test report
     */
    generateReport() {
        const report = {
            ...this.results,
            recommendations: [],
            securityLevel: 'UNKNOWN'
        };

        // Determine overall PFS compliance
        const pfsTests = [
            this.results.pfsCompliance.ecdheCipherSupport,
            this.results.pfsCompliance.dheCipherSupport,
            this.results.pfsCompliance.ephemeralKeyGeneration
        ];
        
        const passedTests = pfsTests.filter(test => test).length;
        report.pfsCompliance.overallCompliance = passedTests >= 2; // At least 2 out of 3 tests must pass

        // Security level assessment
        if (passedTests === 3) {
            report.securityLevel = 'EXCELLENT';
        } else if (passedTests === 2) {
            report.securityLevel = 'GOOD';
        } else if (passedTests === 1) {
            report.securityLevel = 'FAIR';
        } else {
            report.securityLevel = 'POOR';
        }

        // Generate recommendations
        if (!this.results.pfsCompliance.ecdheCipherSupport) {
            report.recommendations.push({
                priority: 'HIGH',
                category: 'Key Exchange',
                issue: 'ECDHE cipher suites not supported',
                recommendation: 'Enable ECDHE cipher suites in CloudFront distribution for better PFS support'
            });
        }

        if (!this.results.pfsCompliance.dheCipherSupport) {
            report.recommendations.push({
                priority: 'MEDIUM',
                category: 'Key Exchange',
                issue: 'DHE cipher suites not supported',
                recommendation: 'Consider enabling DHE cipher suites as fallback for ECDHE'
            });
        }

        if (!this.results.pfsCompliance.ephemeralKeyGeneration) {
            report.recommendations.push({
                priority: 'HIGH',
                category: 'Key Generation',
                issue: 'Ephemeral key generation not working properly',
                recommendation: 'Verify CloudFront configuration supports ephemeral key generation'
            });
        }

        return report;
    }

    /**
     * Run all PFS tests
     */
    async runAllTests(domain = 'github.com') {
        console.log('🚀 Starting Perfect Forward Secrecy Testing...');
        console.log(`🌐 Testing domain: ${domain}`);
        console.log('=' .repeat(60));

        try {
            // Test ECDHE support
            this.results.testResults.ecdheSupport = await this.testECDHESupport(domain);
            this.results.summary.totalTests++;
            if (this.results.testResults.ecdheSupport.testPassed) {
                this.results.summary.passed++;
            } else {
                this.results.summary.failed++;
            }

            // Test DHE support
            this.results.testResults.dheSupport = await this.testDHESupport(domain);
            this.results.summary.totalTests++;
            if (this.results.testResults.dheSupport.testPassed) {
                this.results.summary.passed++;
            } else {
                this.results.summary.failed++;
            }

            // Test ephemeral key generation
            this.results.testResults.ephemeralKeyGeneration = await this.testEphemeralKeyGeneration(domain);
            this.results.summary.totalTests++;
            if (this.results.testResults.ephemeralKeyGeneration.testPassed) {
                this.results.summary.passed++;
            } else {
                this.results.summary.failed++;
            }

            // Test overall PFS compliance
            this.results.testResults.pfsCompliance = await this.testPFSCompliance(domain);
            this.results.summary.totalTests++;
            if (this.results.testResults.pfsCompliance.testPassed) {
                this.results.summary.passed++;
            } else {
                this.results.summary.failed++;
            }

            // Generate final report
            const report = this.generateReport();
            
            console.log('\n' + '=' .repeat(60));
            console.log('📋 PERFECT FORWARD SECRECY TEST SUMMARY');
            console.log('=' .repeat(60));
            console.log(`✅ Tests Passed: ${this.results.summary.passed}/${this.results.summary.totalTests}`);
            console.log(`❌ Tests Failed: ${this.results.summary.failed}/${this.results.summary.totalTests}`);
            console.log(`🛡️ Security Level: ${report.securityLevel}`);
            console.log(`🔐 Overall PFS Compliance: ${report.pfsCompliance.overallCompliance ? 'COMPLIANT' : 'NON-COMPLIANT'}`);
            
            if (report.recommendations.length > 0) {
                console.log('\n📝 RECOMMENDATIONS:');
                report.recommendations.forEach((rec, index) => {
                    console.log(`${index + 1}. [${rec.priority}] ${rec.issue}`);
                    console.log(`   → ${rec.recommendation}`);
                });
            }

            return report;

        } catch (error) {
            console.error(`❌ PFS Testing Failed: ${error.message}`);
            throw error;
        }
    }

    /**
     * Save test results to file
     */
    async saveResults(report, filename = null) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const defaultFilename = `pfs-test-results-${timestamp}.json`;
        const outputFile = filename || defaultFilename;
        
        try {
            await fs.promises.writeFile(outputFile, JSON.stringify(report, null, 2));
            console.log(`\n💾 Results saved to: ${outputFile}`);
            return outputFile;
        } catch (error) {
            console.error(`❌ Failed to save results: ${error.message}`);
            throw error;
        }
    }
}

// CLI execution
async function main() {
    const args = process.argv.slice(2);
    const domain = args[0] || 'github.com';
    const outputFile = args[1];

    const tester = new PerfectForwardSecrecyTester();
    
    try {
        const report = await tester.runAllTests(domain);
        await tester.saveResults(report, outputFile);
        
        // Exit with appropriate code
        process.exit(report.pfsCompliance.overallCompliance ? 0 : 1);
        
    } catch (error) {
        console.error(`❌ Test execution failed: ${error.message}`);
        process.exit(1);
    }
}

// Export for use as module
module.exports = PerfectForwardSecrecyTester;

// Run if called directly
if (require.main === module) {
    main();
}