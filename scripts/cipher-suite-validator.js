#!/usr/bin/env node

/**
 * Cipher Suite Configuration Validator
 * 
 * This script validates CloudFront cipher suite configuration to ensure:
 * - Strong cipher suites are supported
 * - Weak ciphers are disabled
 * - Proper cipher suite ordering and preference
 * - Strong encryption algorithms (AES-256, ChaCha20)
 */

const https = require('https');
const tls = require('tls');
const fs = require('fs');
const path = require('path');

class CipherSuiteValidator {
    constructor() {
        this.results = {
            timestamp: new Date().toISOString(),
            domain: null,
            strongCiphers: [],
            weakCiphers: [],
            supportedCiphers: [],
            cipherOrdering: [],
            encryptionStrength: {},
            recommendations: [],
            passed: false,
            score: 0
        };

        // Define strong cipher suites we expect to be supported (Node.js format)
        this.strongCipherSuites = [
            'ECDHE-RSA-AES256-GCM-SHA384',
            'ECDHE-RSA-AES128-GCM-SHA256',
            'ECDHE-RSA-CHACHA20-POLY1305',
            'ECDHE-ECDSA-AES256-GCM-SHA384',
            'ECDHE-ECDSA-AES128-GCM-SHA256',
            'ECDHE-ECDSA-CHACHA20-POLY1305',
            'DHE-RSA-AES256-GCM-SHA384',
            'DHE-RSA-AES128-GCM-SHA256',
            // Alternative Node.js cipher names
            'TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384',
            'TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256',
            'TLS_ECDHE_RSA_WITH_CHACHA20_POLY1305_SHA256',
            'TLS_ECDHE_ECDSA_WITH_AES_256_GCM_SHA384',
            'TLS_ECDHE_ECDSA_WITH_AES_128_GCM_SHA256',
            'TLS_ECDHE_ECDSA_WITH_CHACHA20_POLY1305_SHA256'
        ];

        // Define weak cipher suites that should be disabled
        this.weakCipherSuites = [
            'RC4',
            'DES',
            '3DES',
            'MD5',
            'SHA1',
            'NULL',
            'EXPORT',
            'ADH',
            'AECDH',
            'PSK',
            'SRP',
            'KRB5'
        ];

        // Define minimum encryption strengths
        this.minEncryptionStrength = {
            symmetric: 128, // minimum bits for symmetric encryption
            preferred: 256  // preferred bits for symmetric encryption
        };
    }

    /**
     * Main validation method
     */
    async validateCipherSuites(domain) {
        console.log('🔐 Starting Cipher Suite Configuration Validation...\n');
        
        this.results.domain = domain;

        try {
            // Test cipher suite support
            await this.testCipherSupport(domain);
            
            // Analyze cipher strength
            this.analyzeCipherStrength();
            
            // Check for weak ciphers
            this.checkWeakCiphers();
            
            // Validate cipher ordering
            await this.validateCipherOrdering(domain);
            
            // Generate recommendations
            this.generateRecommendations();
            
            // Calculate overall score
            this.calculateScore();
            
            // Generate report
            this.generateReport();
            
            return this.results;
            
        } catch (error) {
            console.error('❌ Cipher suite validation failed:', error.message);
            this.results.error = error.message;
            return this.results;
        }
    }

    /**
     * Test cipher suite support using Node.js TLS
     */
    async testCipherSupport(domain) {
        console.log('🔍 Testing cipher suite support...');
        
        try {
            // Get Node.js supported ciphers
            const nodeCiphers = tls.getCiphers();
            console.log(`📋 Node.js supports ${nodeCiphers.length} cipher suites`);

            // Test actual connection to get negotiated cipher
            const actualCipher = await this.getActualCipher(domain);
            if (actualCipher) {
                console.log(`🔗 Actual negotiated cipher: ${actualCipher.name}`);
                console.log(`   Version: ${actualCipher.version}`);
                console.log(`   Bits: ${actualCipher.bits}`);
                console.log(`   Protocol: ${actualCipher.protocol}`);
                
                // Check if the negotiated cipher is strong
                if (this.isStrongCipher(actualCipher.name)) {
                    this.results.strongCiphers.push(actualCipher.name);
                    console.log(`✅ Negotiated cipher is strong: ${actualCipher.name}`);
                } else {
                    console.log(`⚠️  Negotiated cipher may be weak: ${actualCipher.name}`);
                }
            } else {
                console.log(`⚠️  Could not establish connection to ${domain}`);
            }

            // Test specific strong ciphers by attempting connections
            await this.testStrongCipherSupport(domain);

            // Create cipher info from Node.js supported ciphers
            this.results.supportedCiphers = nodeCiphers.map(cipher => ({
                name: cipher.toUpperCase(),
                supported: true
            }));
            
        } catch (error) {
            console.error('Error testing cipher support:', error.message);
            throw error;
        }
    }

    /**
     * Get the actual negotiated cipher from a TLS connection
     */
    async getActualCipher(domain) {
        return new Promise((resolve, reject) => {
            console.log(`🔗 Connecting to ${domain}:443...`);
            
            const options = {
                hostname: domain,
                port: 443,
                rejectUnauthorized: false,
                timeout: 10000
            };

            const socket = tls.connect(options, () => {
                try {
                    const cipher = socket.getCipher();
                    const protocol = socket.getProtocol();
                    socket.destroy();
                    
                    if (cipher) {
                        resolve({
                            name: cipher.name,
                            version: cipher.version,
                            bits: cipher.bits,
                            protocol: protocol
                        });
                    } else {
                        resolve(null);
                    }
                } catch (error) {
                    console.log(`⚠️  Error getting cipher info: ${error.message}`);
                    socket.destroy();
                    resolve(null);
                }
            });

            socket.on('error', (error) => {
                console.log(`⚠️  Connection error: ${error.message}`);
                resolve(null); // Don't reject, just return null
            });

            socket.on('timeout', () => {
                console.log(`⚠️  Connection timeout to ${domain}`);
                socket.destroy();
                resolve(null);
            });

            socket.setTimeout(10000);
        });
    }

    /**
     * Test support for specific strong ciphers
     */
    async testStrongCipherSupport(domain) {
        console.log('🔍 Testing specific strong cipher support...');
        
        // Test with different cipher configurations
        const cipherConfigs = [
            'ECDHE+AESGCM',
            'ECDHE+CHACHA20',
            'ECDHE+AES256',
            'ECDHE+AES128',
            'DHE+AESGCM'
        ];

        for (const cipherConfig of cipherConfigs) {
            try {
                const result = await this.testCipherConfig(domain, cipherConfig);
                if (result) {
                    console.log(`✅ Cipher config supported: ${cipherConfig} -> ${result.name}`);
                    if (!this.results.strongCiphers.includes(result.name)) {
                        this.results.strongCiphers.push(result.name);
                    }
                }
            } catch (error) {
                console.log(`⚠️  Cipher config not supported: ${cipherConfig}`);
            }
        }
    }

    /**
     * Test a specific cipher configuration
     */
    async testCipherConfig(domain, cipherConfig) {
        return new Promise((resolve, reject) => {
            const options = {
                hostname: domain,
                port: 443,
                ciphers: cipherConfig,
                rejectUnauthorized: false,
                timeout: 5000
            };

            const socket = tls.connect(options, () => {
                const cipher = socket.getCipher();
                socket.destroy();
                resolve(cipher);
            });

            socket.on('error', () => {
                resolve(null);
            });

            socket.on('timeout', () => {
                socket.destroy();
                resolve(null);
            });
        });
    }

    /**
     * Check if a cipher is considered strong
     */
    isStrongCipher(cipherName) {
        const strongPatterns = [
            /ECDHE.*AES.*GCM/i,
            /ECDHE.*CHACHA20/i,
            /DHE.*AES.*GCM/i,
            /TLS_ECDHE.*AES.*GCM/i,
            /TLS_ECDHE.*CHACHA20/i
        ];

        return strongPatterns.some(pattern => pattern.test(cipherName));
    }

    /**
     * Test a single cipher suite against the domain
     */
    async testSingleCipher(domain, cipher) {
        return new Promise((resolve) => {
            const options = {
                hostname: domain,
                port: 443,
                ciphers: cipher,
                secureProtocol: 'TLSv1_2_method',
                rejectUnauthorized: false,
                timeout: 5000
            };

            const socket = tls.connect(options, () => {
                const actualCipher = socket.getCipher();
                socket.destroy();
                resolve(actualCipher && actualCipher.name === cipher);
            });

            socket.on('error', () => {
                resolve(false);
            });

            socket.on('timeout', () => {
                socket.destroy();
                resolve(false);
            });
        });
    }

    /**
     * Analyze cipher strength and encryption algorithms
     */
    analyzeCipherStrength() {
        console.log('\n🔬 Analyzing cipher strength...');
        
        const strengthAnalysis = {
            aes256: 0,
            aes128: 0,
            chacha20: 0,
            weakEncryption: 0,
            perfectForwardSecrecy: 0
        };

        this.results.strongCiphers.forEach(cipher => {
            if (cipher.includes('AES256')) {
                strengthAnalysis.aes256++;
                console.log(`✅ AES-256 cipher found: ${cipher}`);
            } else if (cipher.includes('AES128')) {
                strengthAnalysis.aes128++;
                console.log(`✅ AES-128 cipher found: ${cipher}`);
            } else if (cipher.includes('CHACHA20')) {
                strengthAnalysis.chacha20++;
                console.log(`✅ ChaCha20 cipher found: ${cipher}`);
            }

            if (cipher.includes('ECDHE') || cipher.includes('DHE')) {
                strengthAnalysis.perfectForwardSecrecy++;
                console.log(`✅ Perfect Forward Secrecy cipher: ${cipher}`);
            }
        });

        this.results.encryptionStrength = strengthAnalysis;

        // Validate minimum requirements
        if (strengthAnalysis.aes256 === 0) {
            this.results.recommendations.push('Add support for AES-256 encryption');
        }

        if (strengthAnalysis.chacha20 === 0) {
            this.results.recommendations.push('Consider adding ChaCha20-Poly1305 cipher suites');
        }

        if (strengthAnalysis.perfectForwardSecrecy === 0) {
            this.results.recommendations.push('Enable Perfect Forward Secrecy with ECDHE or DHE key exchange');
        }
    }

    /**
     * Check for weak cipher suites
     */
    checkWeakCiphers() {
        console.log('\n🚫 Checking for weak ciphers...');
        
        const foundWeakCiphers = [];
        
        this.results.supportedCiphers.forEach(cipher => {
            this.weakCipherSuites.forEach(weakPattern => {
                if (cipher.name.toUpperCase().includes(weakPattern.toUpperCase())) {
                    foundWeakCiphers.push({
                        cipher: cipher.name,
                        weakness: weakPattern,
                        details: cipher
                    });
                }
            });
        });

        this.results.weakCiphers = foundWeakCiphers;

        if (foundWeakCiphers.length > 0) {
            console.log(`❌ Found ${foundWeakCiphers.length} weak cipher(s):`);
            foundWeakCiphers.forEach(weak => {
                console.log(`   - ${weak.cipher} (${weak.weakness})`);
            });
            this.results.recommendations.push('Disable weak cipher suites found in the configuration');
        } else {
            console.log('✅ No weak ciphers detected in Node.js supported list');
        }
    }

    /**
     * Validate cipher ordering and preference
     */
    async validateCipherOrdering(domain) {
        console.log('\n📋 Validating cipher ordering...');
        
        try {
            // Test cipher preference by connecting with different cipher lists
            const cipherTests = [
                'ECDHE-RSA-AES256-GCM-SHA384:ECDHE-RSA-AES128-GCM-SHA256',
                'ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384',
                'ECDHE-RSA-CHACHA20-POLY1305:ECDHE-RSA-AES256-GCM-SHA384'
            ];

            const orderingResults = [];

            for (const cipherList of cipherTests) {
                try {
                    const selectedCipher = await this.testCipherPreference(domain, cipherList);
                    orderingResults.push({
                        cipherList,
                        selectedCipher
                    });
                    console.log(`🔍 Cipher list "${cipherList}" selected: ${selectedCipher}`);
                } catch (error) {
                    console.log(`⚠️  Could not test cipher list: ${cipherList}`);
                }
            }

            this.results.cipherOrdering = orderingResults;

            // Analyze if server honors client preference or has its own preference
            const uniqueSelections = [...new Set(orderingResults.map(r => r.selectedCipher))];
            if (uniqueSelections.length === 1) {
                console.log('✅ Server has consistent cipher preference');
            } else {
                console.log('⚠️  Server cipher selection varies - may honor client preference');
            }

        } catch (error) {
            console.error('Error validating cipher ordering:', error.message);
        }
    }

    /**
     * Test cipher preference with a specific cipher list
     */
    async testCipherPreference(domain, cipherList) {
        return new Promise((resolve, reject) => {
            const options = {
                hostname: domain,
                port: 443,
                ciphers: cipherList,
                secureProtocol: 'TLSv1_2_method',
                rejectUnauthorized: false,
                timeout: 5000
            };

            const socket = tls.connect(options, () => {
                const cipher = socket.getCipher();
                socket.destroy();
                resolve(cipher ? cipher.name : 'Unknown');
            });

            socket.on('error', (error) => {
                reject(error);
            });

            socket.on('timeout', () => {
                socket.destroy();
                reject(new Error('Connection timeout'));
            });
        });
    }

    /**
     * Generate security recommendations
     */
    generateRecommendations() {
        console.log('\n💡 Generating recommendations...');

        // Check cipher diversity
        if (this.results.strongCiphers.length < 4) {
            this.results.recommendations.push('Increase cipher suite diversity for better client compatibility');
        }

        // Check for modern ciphers
        const hasModernCiphers = this.results.strongCiphers.some(cipher => 
            cipher.includes('GCM') || cipher.includes('CHACHA20')
        );
        
        if (!hasModernCiphers) {
            this.results.recommendations.push('Add modern AEAD cipher suites (GCM, ChaCha20-Poly1305)');
        }

        // Check encryption strength distribution
        const { aes256, aes128, chacha20 } = this.results.encryptionStrength;
        if (aes256 === 0 && aes128 > 0) {
            this.results.recommendations.push('Consider adding AES-256 ciphers for enhanced security');
        }

        if (this.results.recommendations.length === 0) {
            this.results.recommendations.push('Cipher suite configuration appears to be well-configured');
        }
    }

    /**
     * Calculate overall security score
     */
    calculateScore() {
        let score = 0;
        const maxScore = 100;

        // Strong cipher support (40 points)
        const strongCipherRatio = this.results.strongCiphers.length / this.strongCipherSuites.length;
        score += Math.round(strongCipherRatio * 40);

        // No weak ciphers (30 points)
        if (this.results.weakCiphers.length === 0) {
            score += 30;
        } else {
            score += Math.max(0, 30 - (this.results.weakCiphers.length * 5));
        }

        // Encryption strength (20 points)
        const { aes256, chacha20, perfectForwardSecrecy } = this.results.encryptionStrength;
        if (aes256 > 0) score += 8;
        if (chacha20 > 0) score += 6;
        if (perfectForwardSecrecy > 0) score += 6;

        // Cipher diversity (10 points)
        if (this.results.strongCiphers.length >= 4) score += 10;
        else if (this.results.strongCiphers.length >= 2) score += 5;

        this.results.score = Math.min(score, maxScore);
        this.results.passed = score >= 80; // 80% threshold for passing

        console.log(`\n📊 Overall Security Score: ${this.results.score}/${maxScore}`);
        console.log(`Status: ${this.results.passed ? '✅ PASSED' : '❌ FAILED'}`);
    }

    /**
     * Generate comprehensive report
     */
    generateReport() {
        const reportPath = path.join(__dirname, '..', 'config', 'cipher-suite-validation-report.json');
        const summaryPath = path.join(__dirname, '..', 'config', 'cipher-suite-validation-summary.md');

        // Save detailed JSON report
        fs.writeFileSync(reportPath, JSON.stringify(this.results, null, 2));

        // Generate markdown summary
        const summary = this.generateMarkdownSummary();
        fs.writeFileSync(summaryPath, summary);

        console.log(`\n📄 Reports generated:`);
        console.log(`   - Detailed report: ${reportPath}`);
        console.log(`   - Summary report: ${summaryPath}`);
    }

    /**
     * Generate markdown summary report
     */
    generateMarkdownSummary() {
        const { score, passed, strongCiphers, weakCiphers, encryptionStrength, recommendations } = this.results;
        
        return `# Cipher Suite Validation Report

## Summary
- **Domain**: ${this.results.domain}
- **Validation Date**: ${this.results.timestamp}
- **Overall Score**: ${score}/100
- **Status**: ${passed ? '✅ PASSED' : '❌ FAILED'}

## Strong Cipher Suites Supported
${strongCiphers.length > 0 ? strongCiphers.map(cipher => `- ✅ ${cipher}`).join('\n') : '- ❌ No strong ciphers detected'}

## Encryption Strength Analysis
- **AES-256 Ciphers**: ${encryptionStrength.aes256}
- **AES-128 Ciphers**: ${encryptionStrength.aes128}
- **ChaCha20 Ciphers**: ${encryptionStrength.chacha20}
- **Perfect Forward Secrecy**: ${encryptionStrength.perfectForwardSecrecy}

## Weak Ciphers Found
${weakCiphers.length > 0 ? weakCiphers.map(weak => `- ❌ ${weak.cipher} (${weak.weakness})`).join('\n') : '- ✅ No weak ciphers detected'}

## Recommendations
${recommendations.map(rec => `- ${rec}`).join('\n')}

## Detailed Results
For complete technical details, see the JSON report: \`config/cipher-suite-validation-report.json\`
`;
    }
}

// CLI execution
async function main() {
    const domain = process.argv[2] || 'github.com'; // Default test domain
    
    console.log('🔐 Cipher Suite Configuration Validator');
    console.log('=====================================\n');
    
    const validator = new CipherSuiteValidator();
    
    try {
        const results = await validator.validateCipherSuites(domain);
        
        if (results.passed) {
            console.log('\n🎉 Cipher suite validation completed successfully!');
            process.exit(0);
        } else {
            console.log('\n⚠️  Cipher suite validation completed with issues.');
            console.log('Please review the recommendations and improve the configuration.');
            process.exit(1);
        }
        
    } catch (error) {
        console.error('\n❌ Cipher suite validation failed:', error.message);
        process.exit(1);
    }
}

// Export for use as module
module.exports = CipherSuiteValidator;

// Run if called directly
if (require.main === module) {
    main();
}